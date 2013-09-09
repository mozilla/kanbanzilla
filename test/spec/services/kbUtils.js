'use strict';

describe('Service: kbUtils', function () {

  // load the service's module
  beforeEach(module('kanbanzillaApp'));

  // instantiate service
  var kbUtils;
  beforeEach(inject(function (_kbUtils_) {
    kbUtils = _kbUtils_;
  }));

  it('should do something', function () {
    expect(!!kbUtils).toBe(true);
  });

});
