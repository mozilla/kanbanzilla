.. index:: compiling

.. _compiling-chapter:

Compiling (making a distribution)
=================================

When running Kanbanzilla in production, all the client side files are
in the `./server/dist/` directory. This directory is never manually
maintained. Instead it's generated with ``grunt build`` or alternatively ``grunt``. The instructions for building a distribution of Kanbanzilla are contained in ``Gruntfile.js`` under::

    grunt.registerTask('build', [
      // tasks
    ]);

The distribution is included with the git repository as a convenience feature, to deploy without having to have all of the proper project dependencies installed.
