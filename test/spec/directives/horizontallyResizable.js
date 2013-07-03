'use strict';

describe('Directive: horizontallyResizable', function () {
  beforeEach(module('kanbanzillaApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<horizontally-resizable></horizontally-resizable>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the horizontallyResizable directive');
  }));
});
