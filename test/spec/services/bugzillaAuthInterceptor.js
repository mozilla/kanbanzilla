'use strict';

describe('Service: bugzillaAuthInterceptor', function () {

  // load the service's module
  beforeEach(module('kanbanzillaApp'));

  // instantiate service
  var bugzillaAuthInterceptor;
  beforeEach(inject(function (_bugzillaAuthInterceptor_) {
    bugzillaAuthInterceptor = _bugzillaAuthInterceptor_;
  }));

  it('should do something', function () {
    expect(!!bugzillaAuthInterceptor).toBe(true);
  });

});
