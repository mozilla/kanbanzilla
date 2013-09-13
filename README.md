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
 - Python
 - Python database drivers optional

- - - - - - -

### Installation
We'll assume you've already got node and ruby installed.

For the server side install the requirements with:

    cd server
    pip install -r requirements.txt

If you intend to use, for example PostgreSQL instead of SQLite (which is default) then additionally install psycopg2:

    pip install psycopg2

#### Tools
You will need several front end tools, which you can install from npm and gem:
```shell
$ npm install -g grunt-cli bower yo generator-angular grunt-karma
$ gem install compass
```

#### Project
Then go ahead and pull down the repo and run `npm install` and `bower install` in the project directory.

Now your project should be set up.
  `grunt proxy server` to start running the server
  `. venv/bin/activate` followed by `python api.py` in the server folder
  and start a memcached server running on port 8989


### The Server

To start the server run:

    cd server
    python api.py

To override the memcache URL use:

    MEMCACHE_URL=128.0.0.2:8989 python api.py

To override what database to use, set `DATABASE_URI` like this:

    DATABASE_URI="postgresql://localhost:5432/kanbanzilla" python api.py

General notation for connection strings apply as per the [SQLAlchemy documentation](http://docs.sqlalchemy.org/en/rel_0_8/core/engines.html).

To run in debug mode (with fancy reloading):

    DEBUG=true python api.py


### Writing Documentation

You need to install `sphinx`:

    cd docs
    pip install sphinx
    make html
    open _build/html/index.html
