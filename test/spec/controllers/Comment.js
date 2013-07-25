'use strict';

describe('Controller: CommentCtrl', function () {

  // load the controller's module
  beforeEach(module('kanbanzillaApp'));

  var CommentCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CommentCtrl = $controller('CommentCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
