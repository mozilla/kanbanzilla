## Kanabanzilla
A kanban board integrated with bugzilla

### Dependencies

 - Yeoman
  - Node / NPM
  - Grunt
  - Bower
  - Compass
  - Generator-Angular
  - Karma
 - Python virtualenv
 - Memcached

- - - - - - -

### Installation
I'll assume you've already got node and ruby installed.

#### Tools
If you don't have any of these front-end tools installed do so
  `npm install -g grunt-cli`
  `npm install -g bower`
  `gem install compass`
  `npm install -g yo`
  `npm install -g generator-angular`
  `npm install -g grunt-karma`

#### Project
Then go ahead and pull down the repo and run `npm install` and `bower install` in the project directory.

Now your project should be set up.
  `grunt proxy server` to start running the server
  `. venv/bin/activate` followed by `python api.py` in the server folder
  and start a memcached server running on port 8989
