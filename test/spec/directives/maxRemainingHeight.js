'use strict';

describe('Directive: maxRemainingHeight', function () {
  beforeEach(module('kanbanzillaApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<max-remaining-height></max-remaining-height>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the maxRemainingHeight directive');
  }));
});
