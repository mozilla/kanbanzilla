'use strict';

describe('Directive: autofillheight', function () {
  beforeEach(module('kanbanzillaApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<autofillheight></autofillheight>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the autofillheight directive');
  }));
});
