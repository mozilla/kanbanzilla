'use strict';

describe('Controller: NewboardCtrl', function () {

  // load the controller's module
  beforeEach(module('kanbanzillaApp'));

  var NewboardCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    NewboardCtrl = $controller('NewboardCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
