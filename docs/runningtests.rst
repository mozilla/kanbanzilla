.. index:: runningtests

.. _runningtests-chapter:

Running (and writing) tests
===========================

Tests are written in Jasmine and run through the Karma test-runner.

From the kanbanzilla directory, run the command::

    grunt test

If you want to setup tests to run on save, from the kanbanzilla directory you can run the command::

    karma start karma.conf.js

Configuration for the Karma task runner is handled in ``karma.conf.js``

To start writing tests, place them in the appropriate architectural directory in ``/test/spec/:type``

When writing tests in angular there's a few things to include. First you must load the module that you are running tests for, which can be accomplished with the function ``module``. Also you will need to inject the appropriate services in whatever component you are testing with the ``inject`` function.

Example testing a controller::

    beforeEach(module('kanbanzillaApp'));
    var MyCtrl, scope;
    beforeEach(inject(function ($controller, $rootScope) {
      scope = $rootScope.$new();
      MyCtrl = $controller('MyCtrl', {
        $scope: scope
      })
    }));

    // write your tests here
    it('should do something', function () {
      expect(scope.something).toBe('something');
    })