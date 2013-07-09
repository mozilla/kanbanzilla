'use strict';

describe('Service: bugzillaAuth', function () {

  // load the service's module
  beforeEach(module('kanbanzillaApp'));

  // instantiate service
  var bugzillaAuth;
  beforeEach(inject(function (_bugzillaAuth_) {
    bugzillaAuth = _bugzillaAuth_;
  }));

  it('should do something', function () {
    expect(!!bugzillaAuth).toBe(true);
  });

});
