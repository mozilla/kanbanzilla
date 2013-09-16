.. index:: writingcode

.. _writingcode-chapter:


Writing code
============

Getting started
---------------

To get started developing on Kanbanzilla you will need to install all of the application dependencies to run it locally. This can be accomplished by running::

  bower install
  npm install

  cd server
  pip install -r requirements.txt

Now you should have everything you need to run it locally. Kanbanzilla was built using Yeoman which includes many nice features, but is not without it's own problems. Yeoman and grunt use a node server to do live-reloading, compass compilation, and cleaning of directories, but the Kanbanzilla backend uses Python and Flask. For this reason you will need to run both servers::

    grunt proxy server

and from the server directory::

    DEBUG=true python api.py

there are several other options you can override when starting the flask server as well. To override the memcache URL use::

    MEMCACHE_URL=128.0.0.2:8989 python api.py

To override what database to use, set ``DATABASE_URI`` like this::

    DATABASE_URI="postgresql://localhost:5432/kanbanzilla" python api.py


Actually Writing
----------------

Every angular component has its' own sub-directory under the ``app/scripts/`` path.

If you installed yeoman and generator-angular, you can use the CLI to create new components. Their documentation is here: https://github.com/yeoman/generator-angular
