from flask import Flask, request
from flask.ext import restful

import requests
import json

import bugzilla

app = Flask(__name__)
# api = restful.Api(app)

# username = 'dries@mozilla.com'
# password = 'asdas'
# login_url = 'https://bugzilla.mozilla.org/index.cgi'
# login_payload = {
#   'Bugzilla_login': username,
#   'Bugzilla_password': password,
#   'Bugzilla_remember': 'on',
#   'GoAheadAndLogIn': 'Log in'
# }

# class Board(restful.Resource):
#   def get(self, board_id):
#     return 'Hello board {0}'.format(board_id)

# class BoardList(restful.Resource):
#   def get(self):
#     r = requestslib.post(login_url, data=login_payload)
#     # print(r.headers['set-cookie'])
#     # store these two cookies and the username in a session if successful
#     print(r.cookies.has_key('Bugzilla_login'))
#     print(r.cookies['Bugzilla_login'])
#     print(r.cookies['Bugzilla_logincookie'])
#     # return 'kay'
#     # return r.headers['set-cookie'].split(",")
#     return {'Bugzilla_login': r.cookies['Bugzilla_login'], 'Bugzilla_logincookie': r.cookies['Bugzilla_logincookie']}
#     # return r.headers
#     # return 'oka'

# anything that isn't to /api reroute to index.html
# anything that isn't to /api/board, proxy through to Bugzilla with Auth info.

# api.add_resource(BoardList, 'api/board')
# api.add_resource(Board, 'api/board/<int:board_id>')


bugzilla_url = 'https://api-dev.bugzilla.mozilla.org/latest'

@app.route('/api/board', defaults={'board_id':''})
@app.route('/api/board/<board_id>')
def board_endpoint(board_id):
  return 'this is the board endpoint'

@app.route('/api/<path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def api_proxy(path):
  # requests.send(method=request.method, url=bugzilla_url + path, data=request.form)
  print(request.args)
  print(request.form)
  print(path)
  r = requests.request(request.method, bugzilla_url + '/{0}'.format(path), params=request.args, data=request.form)
  print(r.status_code)
  return r.text

@app.route('/', defaults={'path':''})
@app.route('/<path:path>')
def catch_all(path):
  return 'should be the index.html file let angular handle the route - {0}'.format(path)

if __name__ == '__main__':
  app.debug = True
  app.run()