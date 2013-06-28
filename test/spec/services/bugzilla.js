'use strict';

describe('Service: bugzilla', function () {

  // load the service's module
  beforeEach(module('kanbanzillaApp'));

  // instantiate service
  var bugzilla;
  beforeEach(inject(function(_bugzilla_) {
    bugzilla = _bugzilla_;
  }));

  it('should do something', function () {
    expect(!!bugzilla).toBe(true);
  });

});
