'use strict';

describe('Directive: fancyScrollHorizontally', function () {
  beforeEach(module('kanbanzillaApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<fancy-scroll-horizontally></fancy-scroll-horizontally>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the fancyScrollHorizontally directive');
  }));
});
