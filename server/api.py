import datetime
import re
import json
import os
import collections

import pytz
from flask import Flask, request, make_response, abort, jsonify
from flask.views import MethodView
from flask.ext.sqlalchemy import SQLAlchemy

from werkzeug.contrib.cache import MemcachedCache
import requests
import uuid

MEMCACHE_URL = os.environ.get('MEMCACHE_URL', '127.0.0.1:11211').split(',')
DEBUG = os.environ.get('DEBUG', False) in ('true', '1')
SQLALCHEMY_DATABASE_URI = os.environ.get(
    'DATABASE_URI',
    'sqlite:////tmp/kanbanzilla.db'
)

DAY = 60 * 60 * 24
MONTH = DAY * 30

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
db = SQLAlchemy(app)

login_url = 'https://bugzilla.mozilla.org/index.cgi'
bugzilla_url = 'https://api-dev.bugzilla.mozilla.org/latest'


cache = MemcachedCache(MEMCACHE_URL)

COLUMNS = [
    {"name": "Backlog",
     "statuses": ["NEW", "UNCONFIRMED"]},
    {"name": "Ready to work on",
     "statuses": []},
    {"name": "Working on",
     "statuses": ["ASSIGNED"]},
    {"name": "Done",
     "statuses": ["RESOLVED"]},
]

whiteboard_regexes = dict(
    (each['name'], re.compile('kanbanzilla\[%s\]' % re.escape(each['name'])))
    for each in COLUMNS
)
#any_whiteboard_tag = re.compile('kanbanzilla\[[^]]+\]')


class Board(db.Model):
    __tablename__ = 'boards'

    id = db.Column(db.Integer, primary_key=True)
    identifier = db.Column(db.String(32), index=True, unique=True)
    name = db.Column(db.String(100))
    description = db.Column(db.Text)
    creator = db.Column(db.String(100), index=True)
    date = db.Column(db.DateTime(timezone=True))

    def __init__(self, identifier, name, description='', creator='',
                 date=None):
        self.identifier = identifier
        self.name = name
        self.description = description
        self.creator = creator
        if not date:
            date = datetime.datetime.utcnow().replace(tzinfo=pytz.utc)
        self.date = date


class ProductComponent(db.Model):
    __tablename__ = 'productcomponents'

    id = db.Column(db.Integer, primary_key=True)
    product = db.Column(db.String(50))
    component = db.Column(db.String(50))
    board_id = db.Column(db.Integer, db.ForeignKey('boards.id'))
    board = db.relationship(
        'Board',
        backref=db.backref('productcomponents', lazy='dynamic')
    )

    def __init__(self, product, component, board):
        self.product = product
        self.component = component
        self.board = board


def cache_set(key, value, *args, **options):
    if isinstance(value, (dict, list, bool)):
        value = json.dumps(value)
    cache.set(key, value, *args, **options)


def cache_get(key, default=None):
    value = cache.get(key)
    if value is None:
        value = default
    if value is not None and not isinstance(value, (dict, list, bool)):
        value = json.loads(value)
    return value


class BoardsView(MethodView):

    def post(self):
        token = request.cookies.get('token')
        if not token:
            abort(403)
            return
        token_cache_key = 'auth:%s' % token
        user_info = cache_get(token_cache_key)
        if not user_info:
            abort(400, "You have never logged in")
            return

        name = request.json['name']
        components = request.json['components']
        description = request.json['description']
        board_id = uuid.uuid4().hex

        board = Board(
            board_id,
            name,
            description,
            user_info['username'],
        )
        db.session.add(board)
        for each in components:
            cp = ProductComponent(
                each['product'],
                each['component'],
                board
            )
            db.session.add(cp)
        db.session.commit()

        response = make_response(jsonify({'board': board_id}))
        return response

    def get(self):
        token = request.cookies.get('token')
        if not token:
            return make_response(jsonify({'boards': []}))
        user_info = cache_get('auth:%s' % token)
        if not user_info:
            return make_response(jsonify({'boards': []}))

        boards = (
            Board.query
            .filter_by(creator=user_info['username'])
            .order_by(Board.date)
        )

        all_boards = []
        for board in boards:
            data = {
                'id': board.identifier,
                'name': board.name,
                'creator': board.creator,
                'description': board.description,
                'components': [],
            }
            components = []
            for pc in ProductComponent.query.filter_by(board=board):
                components.append({
                    'component': pc.component,
                    'product': pc.product,
                })
            data['components'] = components
            all_boards.append(data)
        response = make_response(jsonify({'boards': all_boards}))
        return response


class BoardView(MethodView):

    def get(self, id):
        token = request.cookies.get('token')
        data = {}
        changed_after = request.args.get('since')

        try:
            board, = Board.query.filter_by(identifier=id)
        except ValueError:
            abort(404)
            return

        assert board
        data['board'] = {
            'name': board.name,
            'description': board.description,
            'creator': board.creator,
        }
        components = []
        for pc in ProductComponent.query.filter_by(board=board):
            components.append({
                'component': pc.component,
                'product': pc.product,
            })

        bug_data = fetch_bugs(
            components,
            ('id', 'summary', 'status', 'whiteboard', 'last_change_time'),
            token=token,
            changed_after=changed_after,
        )

        bugs_by_column = collections.defaultdict(list)
        latest_change_time = None

        def keep(column_name, bug):
            bug_info = {
                'id': bug['id'],
                'summary': bug['summary'],
            }
            bugs_by_column[column_name].append(bug_info)

        for bug in bug_data['bugs']:
            last_change_time = bug.pop('last_change_time')
            if changed_after and last_change_time == changed_after:
                # bugzilla is silly in that if you pass
                # changed_after=2013-08-08T20:26:27Z to the query
                # it will return bugs that have that last_change_time
                # or greater rather than just greater
                continue
            if last_change_time > latest_change_time:
                latest_change_time = last_change_time
            # which named column should this go into?
            whiteboard_found = False
            for name, regex in whiteboard_regexes.items():
                if regex.findall(bug['whiteboard']):
                    keep(name, bug)
                    whiteboard_found = True

            if whiteboard_found:
                continue

            for col in COLUMNS:
                if bug['status'] in col['statuses']:
                    keep(col['name'], bug)
                    break

        columns = []
        for each in COLUMNS:
            columns.append({
                'name': each['name'],
                'bugs': bugs_by_column[each['name']],
                'statuses': each['statuses'],
            })

        data['columns'] = columns
        if latest_change_time:
            data['latest_change_time'] = latest_change_time

        return make_response(jsonify(data))


class LogoutView(MethodView):

    def post(self):
        cookie_token = str(request.cookies.get('token'))
        response = make_response('logout')
        response.set_cookie('token', '', expires=0)
        response.set_cookie('username', '', expires=0)
        # delete from memcache too
        token_cache_key = 'token:%s' % cookie_token
        cache.delete(token_cache_key)
        return response


class LoginView(MethodView):
    def post(self):
        login_payload = {
            'Bugzilla_login': request.json['login'],
            'Bugzilla_password': request.json['password'],
            'Bugzilla_remember': 'on',
            'GoAheadAndLogIn': 'Log in'
        }
        login_response = {}
        r = requests.post(login_url, data=login_payload)
        cookies = requests.utils.dict_from_cookiejar(r.cookies)
        if 'Bugzilla_login' in cookies:
            token = str(uuid.uuid4())
            token_cache_key = 'auth:%s' % token
            cache_set(token_cache_key, {
                'Bugzilla_login': cookies['Bugzilla_login'],
                'Bugzilla_logincookie': cookies['Bugzilla_logincookie'],
                'username': request.json['login']
            }, MONTH)
            login_response['result'] = 'success'
            login_response['token'] = token
            response = make_response(jsonify(login_response))
            response.set_cookie('token', token)
            response.set_cookie('username', request.json['login'])
            return response
        else:
            abort(401)
            login_response['result'] = 'failed'
            response = make_response(jsonify(login_response))
            return response

# Commented out until we decide we need a dedicated endpoint here
# for updating bugs
#class BugView(MethodView):
#
#    def put(self, id):
#        bug_id = id
#        status = request.json.get('status')
#        whiteboard = request.json.get('whiteboard')
#        sub_select = request.json.get('sub_select')
#        comment = request.json.get('comment')
#
#        assert status or whiteboard, "Must have a new status or a new whiteboard"
#        if status == 'RESOLVED':
#            assert sub_select, "Must have chosen a sub select"
#
#        #bug_data = fetch_bug(bug_id, refresh=True)
#        #wiped_whiteboard = any_whiteboard_tag.sub('', bug_data['whiteboard'])
#
#        #params = {}
#        #if status:
#        #    params['status'] = status
#        #elif whiteboard:
#        #    params['whiteboard'] = new_whiteboard
         # Update the bug meta data
#        put_bug(bug_id, *.....)
#

def augment_with_auth(request_arguments, token):
    user_cache_key = 'auth:%s' % token
    user_info = cache_get(user_cache_key)
    if user_info:
        request_arguments['userid'] = user_info['Bugzilla_login']
        request_arguments['cookie'] = user_info['Bugzilla_logincookie']


def fetch_bugs(components, fields, token=None, bucket_requests=3,
               changed_after=None):
    combined = collections.defaultdict(list)
    for i in range(0, len(components), bucket_requests):
        some_components = components[i:i + bucket_requests]
        bug_data = _fetch_bugs(
            some_components,
            fields,
            token=token,
            changed_after=changed_after,
        )
        for key in bug_data:
            combined[key].extend(bug_data[key])

    return combined


def _fetch_bugs(components, fields, token=None, changed_after=None):
    params = {
        'include_fields': ','.join(fields),
    }
    for each in components:
        p = params.get('product', [])
        p.append(each['product'])
        params['product'] = p
        c = params.get('component', [])
        c.append(each['component'])
        params['component'] = c

    if token:
        augment_with_auth(params, token)
    if changed_after:
        params['changed_after'] = changed_after

    url = bugzilla_url
    url += '/bug'

    r = requests.request(
        'GET',
        url,
        params=params,
    )
    response_text = r.text
    return json.loads(response_text)


@app.route('/api/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def api_proxy(path):
    path = str(path)
    request_arguments = dict(request.args)
    # str() because it's a Cookie Morsel
    token = str(request.cookies.get('token'))
    augment_with_auth(request_arguments, token)
    r = requests.request(
        request.method,
        bugzilla_url + '/{0}'.format(path),
        params=request_arguments,
        data=request.form
    )
    return r.text


@app.route('/', defaults={'path':''})
@app.route('/<path:path>')
def catch_all(path):
    # when returning the index file if there is a cookie set that doesn't match a
    # key in the users dict then the response should remove all cookies so that
    # in the app users don't see they are logged in, if they aren't.
    return 'should be the index.html file, let angular handle the route - {0}'.format(path)


app.add_url_rule('/api/board/<id>', view_func=BoardView.as_view('board'))
app.add_url_rule('/api/board', view_func=BoardsView.as_view('boards'))
app.add_url_rule('/api/logout', view_func=LogoutView.as_view('logout'))
app.add_url_rule('/api/login', view_func=LoginView.as_view('login'))


if __name__ == '__main__':
    db.create_all()
    app.debug = DEBUG
    app.run()
