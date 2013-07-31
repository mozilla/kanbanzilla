from flask import Flask, request
import requests
import json

app = Flask(__name__)

# username = 'dries@mozilla.com'
# password = 'asdas'
# login_url = 'https://bugzilla.mozilla.org/index.cgi'
# login_payload = {
#   'Bugzilla_login': username,
#   'Bugzilla_password': password,
#   'Bugzilla_remember': 'on',
#   'GoAheadAndLogIn': 'Log in'
# }

# class BoardList(restful.Resource):
#   def get(self):
#     r = requests.post(login_url, data=login_payload)
#     # store these two cookies and the username in a session if successful
#     print(r.cookies.has_key('Bugzilla_login'))
#     print(r.cookies['Bugzilla_login'])
#     print(r.cookies['Bugzilla_logincookie'])
#     return {'Bugzilla_login': r.cookies['Bugzilla_login'], 'Bugzilla_logincookie': r.cookies['Bugzilla_logincookie']}



bugzilla_url = 'https://api-dev.bugzilla.mozilla.org/latest'

@app.route('/api/board', defaults={'board_id':''})
@app.route('/api/board/<board_id>')
def board_endpoint(board_id):
  return 'this is the board endpoint'

@app.route('/api/<path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def api_proxy(path):
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