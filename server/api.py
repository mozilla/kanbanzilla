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
boards = [
    {
        "id": 1,
        "name": "Kanbanzilla",
        "description": "Just a small board for showing my kanbanzilla component",
        "owner": "dries@mozilla.com",
        "components": [{"product": "WebTools", "component": "kanbanzilla"}],
        "columns": [
            {
                "id": 1,
                "title": "Backlog",
                "status": ["UNCONFIRMED", "NEW"]
            },
            {
                "id": 2,
                "title": "Ready",
                "status": None
            },
            {
                "id": 3,
                "title": "Working On",
                "status": ["ASSIGNED"]
            },
            {
                "id": 4,
                "title": "Resolved",
                "status": ["RESOLVED"]
            }
        ]
    }
]

class BoardView(MethodView):

    def post(self):
        token = request.cookies.get('token')
        if not token:
            abort(403)
            return
        token_cache_key = 'auth:%s' % token
        user_info = cache.get(token_cache_key)
        if not user_info:
            abort(400, "You have never logged in")
            return
        else:
            user_info = json.loads(user_info)

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
        cache.set(cache_key, json.dumps(data))  # infinite

        boards_key = 'boards:%s' % token
        previous = cache.get(boards_key)
        if previous:
            previous = json.loads(previous)
        else:
            previous = []
        previous.append(board_id)
        cache.set(boards_key, json.dumps(previous))

        response = make_response(jsonify({'board': board_id}))
        return response

    def get(self, board_id=None):
        token = request.cookies.get('token')
        if not token:
            return make_response(jsonify({'boards': []}))

        boards_key = 'boards:%s' % token
        board_ids = cache.get(boards_key)
        if board_ids:
            board_ids = json.loads(board_ids)
        else:
            board_ids = []
        boards = []
        for board_id in board_ids:
            board_key = 'board:%s' % board_id
            data = cache.get(board_key)
            if data:
                data = json.loads(data)
                boards.append(data)
        response = make_response(jsonify({'boards': boards}))
        return response


app.add_url_rule('/api/board', view_func=BoardView.as_view('board'))



@app.route('/api/logintest', methods=['GET'])
def logintest():
    cached_item = cache.get('test')
    if cached_item is not None:
        cache.inc('test')
        return str(cached_item)
    else:
        cache.set('test', 0)
        return 'okay then'


@app.route('/api/logout', methods=['POST'])
def logout():
    cookie_token = str(request.cookies.get('token'))
    response = make_response('logout')
    response.set_cookie('token', '', expires=0)
    response.set_cookie('username', '', expires=0)
    # delete from memcache too
    token_cache_key = 'token:%s' % cookie_token
    cache.delete(token_cache_key)
    return response


@app.route('/api/login', methods=['POST'])
def login():
    login_payload = {
        'Bugzilla_login': request.json['login'],
        'Bugzilla_password': request.json['password'],
        'Bugzilla_remember': 'on',
        'GoAheadAndLogIn': 'Log in'
    }
    login_response = {}
    r = requests.post(login_url, data=login_payload)
    cookies = requests.utils.dict_from_cookiejar(r.cookies)
    if cookies.has_key('Bugzilla_login'):
        token = str(uuid.uuid4())
        token_cache_key = 'auth:%s' % token
        print "SETTING", token_cache_key
        cache.set(token_cache_key, json.dumps({
            'Bugzilla_login': cookies['Bugzilla_login'],
            'Bugzilla_logincookie': cookies['Bugzilla_logincookie'],
            'username': request.json['login']
        }))
        login_response['result'] = 'success'
        login_response['token'] = token
        response = make_response(jsonify(login_response))
        response.set_cookie('token', token)
        response.set_cookie('username', request.json['login'])
        return response
    else:
        abort(401)
        print('login failed')
        login_response['result'] = 'failed'
        response = make_response(json.dumps(login_response))
        return response


def augment_with_auth(request_arguments, token):
    if token is not None:
        user_cache_key = 'auth:%s' % token
        user_info = cache.get(user_cache_key)
        if user_info:
            user_info = json.loads(user_info)
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

if __name__ == '__main__':
    app.debug = DEBUG
    app.run()
