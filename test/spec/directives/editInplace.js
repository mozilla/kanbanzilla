'use strict';

describe('Directive: editInplace', function () {
  beforeEach(module('kanbanzillaApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<edit-inplace></edit-inplace>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the editInplace directive');
  }));
});
