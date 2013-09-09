'use strict';

describe('Directive: debounceModelUpdate', function () {
  beforeEach(module('kanbanzillaApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<debounce-model-update></debounce-model-update>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the debounceModelUpdate directive');
  }));
});
