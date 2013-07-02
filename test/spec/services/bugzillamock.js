'use strict';

describe('Service: bugzillamock', function () {

  // load the service's module
  beforeEach(module('kanbanzillaApp'));

  // instantiate service
  var bugzillamock;
  beforeEach(inject(function(_bugzillamock_) {
    bugzillamock = _bugzillamock_;
  }));

  it('should do something', function () {
    expect(!!bugzillamock).toBe(true);
  });

});
