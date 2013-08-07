import json
import os

from flask import Flask, request, make_response, abort, jsonify
from flask.views import MethodView

from werkzeug.contrib.cache import MemcachedCache
import requests
import uuid

MEMCACHE_URL = os.environ.get('MEMCACHE_URL', '127.0.0.1:11211').split(',')
DEBUG = os.environ.get('DEBUG', False) in ('true', '1')

app = Flask(__name__)

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



def cache_set(key, value, *args, **options):
    if isinstance(value, (dict, list, bool)):
        value = json.dumps(value)
    cache.set(key, value, *args, **options)


def cache_get(key, default=None):
    value = cache.get(key)
    if value is None:
        value = default
    if not isinstance(value, (dict, list, bool)):
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
        cache_key = 'board:%s' % board_id
        data = {
            'name': name,
            'components': components,
            'description': description,
            'creator': user_info['username'],
        }
        cache_set(cache_key, data)  # indefinite

        boards_key = 'boards:%s' % token
        previous = cache_get(boards_key, [])
        previous.append(board_id)
        cache_set(boards_key, previous)

        response = make_response(jsonify({'board': board_id}))
        return response

    def get(self):
        token = request.cookies.get('token')
        if not token:
            return make_response(jsonify({'boards': []}))

        boards_key = 'boards:%s' % token
        board_ids = cache_get(boards_key, [])
        boards = []
        for board_id in board_ids:
            board_key = 'board:%s' % board_id
            data = cache_get(board_key)
            if data:
                boards.append(data)
        response = make_response(jsonify({'boards': boards}))
        return response


class BoardView(MethodView):

    def get(self, board_id):
        token = request.cookies.get('token')
        if not token:
            abort(403)
            return

        data = {}

        board_cache_key = 'board:%s' % board_id
        board = cache_get(board_cache_key)
        data['board'] = board

        components = board['components']
        #bug_data = fetch_bugs(components=components, fields=('id', 'summary', 'status', 'whiteboard'))

        columns = [
            {"name": "Backlog",
             "statuses": ["NEW", "UNCONFIRMED"],
             "bugs": [
               {"id": "91823", "summary": "PIEJTOIE"},
               {"id": "91824", "summary": "DPIGJZGE"},
             ]},
            {"name": "Ready to work on",
             "statuses": [],
             "bugs": [
               {"id": "1230905", "summary": "Fourth summary"},
               {"id": "1230906", "summary": "Fifth summary"},
             ]}
        ]

        data['columns'] = columns

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
            })
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


def augment_with_auth(request_arguments, token):
    if token is not None:
        user_cache_key = 'auth:%s' % token
        user_info = cache_get(user_cache_key)
        if user_info:
            request_arguments['userid'] = user_info['Bugzilla_login']
            request_arguments['cookie'] = user_info['Bugzilla_logincookie']
    return request_arguments


@app.route('/api/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def api_proxy(path):
    path = str(path)
    cached_response = cache.get(request.url)
    if cached_response is None:
        request_arguments = dict(request.args)
        cookie_token = str(request.cookies.get('token'))
        augment_with_auth(request_arguments, cookie_token)
        r = requests.request(request.method, bugzilla_url + '/{0}'.format(path), params=request_arguments, data=request.form)
        cache.set(request.url, r.text)
        cached_response = r.text
    return cached_response


@app.route('/', defaults={'path':''})
@app.route('/<path:path>')
def catch_all(path):
    # when returning the index file if there is a cookie set that doesn't match a
    # key in the users dict then the response should remove all cookies so that
    # in the app users don't see they are logged in, if they aren't.
    return 'should be the index.html file, let angular handle the route - {0}'.format(path)


app.add_url_rule('/api/board/<int:id>', view_func=BoardView.as_view('board'))
app.add_url_rule('/api/board', view_func=BoardsView.as_view('boards'))
app.add_url_rule('/api/logout', view_func=LogoutView.as_view('logout'))
app.add_url_rule('/api/login', view_func=LoginView.as_view('login'))


if __name__ == '__main__':
    app.debug = DEBUG
    app.run()
