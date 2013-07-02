'use strict';

describe('Directive: growwhenclicked', function () {
  beforeEach(module('kanbanzillaApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<growwhenclicked></growwhenclicked>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the growwhenclicked directive');
  }));
});
