import collections
import datetime
import json
import logging
import os
import re
import urllib
import uuid

from flask import Flask, request, make_response, abort, jsonify, send_file
from flask.views import MethodView
from flask.ext.sqlalchemy import SQLAlchemy

import pytz

from werkzeug.contrib.cache import MemcachedCache
from werkzeug.routing import BaseConverter

import requests

try:
    # A place to store local stuff.
    import local
except ImportError:
    local = None

MEMCACHE_URL = os.environ.get('MEMCACHE_URL', '127.0.0.1:11211').split(',')
DEBUG = os.environ.get('DEBUG', False) in ('true', '1')
SQLALCHEMY_DATABASE_URI = os.environ.get(
    'POSTGRESQL_URL',
    'sqlite:////tmp/kanbanzilla.db'
)

DAY = 60 * 60 * 24
MONTH = DAY * 30

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_BINDS'] = {'__all__': SQLALCHEMY_DATABASE_URI}
db = SQLAlchemy(app)

login_url = 'https://bugzilla.mozilla.org/index.cgi'
bugzilla_url = 'https://api-dev.bugzilla.mozilla.org/latest'

cache = MemcachedCache(MEMCACHE_URL)

# The higher priorities get processed first.
COLUMNS = [
    {"name": "Backlog",
     "statuses": ["NEW", "UNCONFIRMED"],
     "priority": 0},
    {"name": "Working on",
     "statuses": ["ASSIGNED"],
     "priority": 0},
    {"name": "Review",
     "statuses": [],
     "priority": 0},
    {"name": "Testing",
     "statuses": ["RESOLVED"],
     "priority": 1},
]

whiteboard_regexes = dict(
    (each['name'], re.compile('kanbanzilla\[(%s)\]' % re.escape(each['name'])))
    for each in COLUMNS
)
any_whiteboard_tag = re.compile('kanbanzilla\[[^]]+\]')


# Add some logging in.
log_dir = os.path.join(os.path.dirname(__file__), '..', 'logs')
file_handler = logging.FileHandler(os.path.join(log_dir, 'kanbanzilla.log'))
file_handler.setLevel(logging.DEBUG)
app.logger.addHandler(file_handler)


class RegexConverter(BaseConverter):
    def __init__(self, url_map, *items):
        super(RegexConverter, self).__init__(url_map)
        self.regex = items[0]

app.url_map.converters['regex'] = RegexConverter


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
        backref=db.backref('productcomponents', lazy='dynamic',
                           cascade='all,delete')
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
            abort(403, "Not logged in any more")
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

        user_info = {'username': 'amckay@mozilla.com'}

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


def sort_bugs(bugs):
    bugs_by_column = collections.defaultdict(list)
    latest_change_time = datetime.datetime.min

    _COLUMNS = list(reversed(sorted(COLUMNS, key=lambda k: k['priority'])))

    def keep(column_name, bug):
        bug_info = {
            'id': bug['id'],
            'summary': bug['summary'],
            'component': bug['component'],
            'assigned_to': bug['assigned_to'],
            'target_milestone': bug['target_milestone']
        }
        bugs_by_column[column_name].append(bug_info)


    for bug in bugs:
        last_change_time = datetime.datetime.strptime(
            bug.pop('last_change_time'),
            '%Y-%m-%dT%H:%M:%SZ'
        )

        status = bug['status']
        # We are too lazy to assign bugs
        if status in ['NEW', 'UNCONFIRMED']:
            if (bug['assigned_to'] and
                bug['target_milestone'] not in ['', '---']):
                status = 'ASSIGNED'

        if last_change_time > latest_change_time:
            latest_change_time = last_change_time

        whiteboard_column = None
        for name, regex in whiteboard_regexes.items():
            try:
                whiteboard_column = regex.findall(bug['whiteboard'])[0]
            except IndexError:
                pass

        for col in _COLUMNS:
            if (whiteboard_column == col['name']
                or status in col['statuses']):
                keep(col['name'], bug)
                break

    columns = []
    for each in COLUMNS:
        columns.append({
            'name': each['name'],
            'bugs': bugs_by_column[each['name']],
            'statuses': each['statuses'],
        })

    return columns, latest_change_time


class BoardView(MethodView):

    def get(self, id):
        token = request.cookies.get('token')
        data = {}
        changed_after = request.args.get('since')

        if not changed_after:
            changed_after = '2013-10-01'

        try:
            board, = Board.query.filter_by(identifier=id)
        except ValueError:
            abort(404, 'Board not found')
            return

        assert board
        data['board'] = {
            'name': board.name,
            'description': board.description,
            'creator': board.creator,
            'id': board.identifier
        }
        components = []
        for pc in ProductComponent.query.filter_by(board=board):
            components.append({
                'component': pc.component,
                'product': pc.product,
            })
        data['board']['components'] = components

        bug_data = fetch_bugs(
            components,
            ('id', 'summary', 'status', 'whiteboard', 'last_change_time',
             'component', 'assigned_to', 'target_milestone'),
            token=token,
            changed_after=changed_after,
        )

        data['columns'], latest_change_time = sort_bugs(bug_data['bugs'])
        if latest_change_time:
            data['latest_change_time'] = latest_change_time

        return make_response(jsonify(data))

    def delete(self, id):
        token = request.cookies.get('token')
        if not token:
            abort(403)
            return
        user_info = cache_get('auth:%s' % token)
        try:
            board, = Board.query.filter_by(identifier=id,
                                           creator=user_info['username'])
        except ValueError:
            abort(404)
            return
        db.session.delete(board)
        db.session.commit()
        return 'should delete %s' % id

    def put(self, id):
        token = request.cookies.get('token')
        if not token:
            abort(403)
            return
        user_info = cache_get('auth:%s' % token)
        try:
            board, = Board.query.filter_by(identifier=id,
                                           creator=user_info['username'])
        except ValueError:
            abort(404)
            return
        # print board.name
        # need to go through and change the components in the PC child rows
        # to the new components and if necessary remove or add rows.
        board.name = request.json.get('name', board.name)
        board.description = request.json.get('description', board.description)
        db.session.commit()
        return make_response(jsonify(request.json))


class BoardComponentsView(MethodView):
# /board/<id>/component

    def post(self, id):
        token = request.cookies.get('token')
        if not token:
            abort(403)
            return
        user_info = cache_get('auth:%s' % token)
        try:
            board, = Board.query.filter_by(identifier=id)
        except ValueError:
            abort(404)
            return
        if board.creator != user_info['username']:
            abort(403)
            return
        comp = request.json.get('component',  '')
        prod = request.json.get('product', '')
        pc = ProductComponent(prod, comp, board)
        db.session.add(pc)
        db.session.commit()
        print 'Should add a new component to this board'
        print ('Component: {0}, Product: {1} - should be added to board {2}'
               .format(comp, prod, id))
        return make_response(jsonify(request.json))

    def delete(self, id):
        token = request.cookies.get('token')
        if not token:
            abort(403)
            return
        user_info = cache_get('auth:%s' % token)
        try:
            board, = Board.query.filter_by(identifier=id)
        except ValueError:
            abort(404)
            return
        if board.creator != user_info['username']:
            abort(403)
            return
        comp = request.json.get('component',  '')
        prod = request.json.get('product', '')

        (db.session.query(ProductComponent)
           .filter_by(product=prod, component=comp, board=board)
           .delete())
        db.session.commit()
        return make_response(jsonify({'status': 'success'}))


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
            abort(401, "Either your username or password was incorrect")
            login_response['result'] = 'failed'
            response = make_response(jsonify(login_response))
            return response


class BugView(MethodView):

    def put(self, id):
        status = request.json.get('status')
        whiteboard = request.json.get('whiteboard')
        resolution = request.json.get('resolution')
        assign = request.json.get('assign') or status == 'ASSIGNED'
        assignee = request.json.get('assignee')

        assert status or whiteboard
        if status == 'RESOLVED':
            assert resolution, "Must have chosen a sub select"

        token = request.cookies.get('token')
        if not token:
            abort(403, "You are not logged in")
            return

        bug_data = fetch_bug(
            id,
            refresh=True,
            token=token,
            fields=(
                'status',
                'whiteboard',
                'resolution',
                'update_token',
                'assigned_to',
            )
        )
        wiped_whiteboard = (any_whiteboard_tag.sub('',
                            bug_data.get('whiteboard', '')))

        if bug_data['status'] == 'RESOLVED' and status == 'ASSIGNED':
            # if you really want to do this, perhaps we can do two updates;
            # one to REOPENED and *then* one to ASSIGNED
            abort(400, "Can't move from RESOLVED to ASSIGNED")
            return

        params = {
            'update_token': bug_data['update_token'],
        }

        if wiped_whiteboard:
            # something's left
            wiped_whiteboard = '%s ' % wiped_whiteboard.rstrip()
        if whiteboard:
            params['whiteboard'] = (wiped_whiteboard +
                                    'kanbanzilla[%s]' % whiteboard)
            if whiteboard == 'Review':
                if local:
                    local.notify(id)

        elif status:
            params['status'] = status
            resolution = resolution or bug_data.get('resolution')
            params['resolution'] = resolution
            if wiped_whiteboard != bug_data.get('whiteboard', ''):
                # it has changed!
                params['whiteboard'] = wiped_whiteboard.strip()

        if assign and not assignee:
            user_info = cache_get('auth:%s' % token)
            if not user_info:
                abort(403, "You are not logged in")
            assignee = user_info['username']

        if assignee:
            #params['assigned_to'] = assignee
            params['assigned_to'] = {
                'name': assignee,
            }

        # Update the bug meta data
        result = update_bug(id, params, token)
        return make_response(jsonify(result))


class ConfigView(MethodView):
    def get(self):
        config = cache_get('config')
        if config is None:
            print 'cache miss'
            r = requests.get(bugzilla_url + '/configuration')
            config = json.loads(r.text)
            cache_set('config', config, DAY)
        return make_response(jsonify(config))


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
            components=some_components,
            fields=fields,
            token=token,
            changed_after=changed_after,
        )
        for key in bug_data:
            if key == 'bugs' and changed_after:
                # For some ungodly reason, even if you pass `changed_after`
                # into the bugzilla API you sometimes get bugs that were last
                # updated BEFORE the `changed_after` parameter specifies.
                # We suspect this is due to certain changes not incrementing
                # the `last_change_time` on the bug. E.g. whiteboard changes.
                # Also, the `changed_after` parameter does a:
                # `last_change_time >= :changed_after` operation but we only
                # want those that are greater than `:changed_after`.
                bugs = [
                    bug for bug in bug_data[key]
                    if bug['last_change_time'] > changed_after
                ]
                combined[key].extend(bugs)
            else:
                combined[key].extend(bug_data[key])

    return combined


def fetch_bug(id, token=None, refresh=False, fields=None):
    # @refresh is currently not implemented
    return _fetch_bugs(id=id, token=token, fields=fields)


def _fetch_bugs(id=None, components=None, fields=None, token=None,
                changed_after=None):
    params = {}

    if fields:
        params['include_fields'] = ','.join(fields)

    if components:
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

    if id:
        url += '/%s' % id

    r = requests.request(
        'GET',
        url,
        params=params,
    )
    response_text = r.text
    return json.loads(response_text)


def update_bug(id, params, token):
    augment_with_auth(params, token)
    url = bugzilla_url
    url += '/bug/%s' % id
    url += '?' + urllib.urlencode({'cookie': params.pop('cookie'),
                                   'userid': params.pop('userid')})

    r = requests.put(
        url,
        data=json.dumps(params)
    )
    response_text = r.text
    try:
        return json.loads(response_text)
    except ValueError:
        return response_text


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


@app.route('/<regex("styles|scripts|views|images|font"):start>/<path:path>')
def static_stuff(start, path):
    """
    Workaround for grunt/yeoman being very non-friendly towards a single
    static-folder. Will try to fix this issue at some point in the future.
    """
    return send_file('dist/%s/%s' % (start, path))


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    # path = path or 'index.html'
    # return send_file('../dist/%s' % path)
    return send_file('dist/index.html')


app.add_url_rule('/api/board/<id>', view_func=BoardView.as_view('board'))
app.add_url_rule('/api/board/<id>/component',
                 view_func=BoardComponentsView.as_view('components'))
app.add_url_rule('/api/board', view_func=BoardsView.as_view('boards'))
app.add_url_rule('/api/configuration', view_func=ConfigView.as_view('config'))
app.add_url_rule('/api/bug/<int:id>', view_func=BugView.as_view('bug'))
app.add_url_rule('/api/logout', view_func=LogoutView.as_view('logout'))
app.add_url_rule('/api/login', view_func=LoginView.as_view('login'))


if __name__ == '__main__':
    db.create_all()
    app.debug = DEBUG
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    app.run(host=host, port=port)
