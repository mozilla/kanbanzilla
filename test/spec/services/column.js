'use strict';

describe('Service: column', function () {

  // load the service's module
  beforeEach(module('kanbanzillaApp'));

  // instantiate service
  var column;
  beforeEach(inject(function (_column_) {
    column = _column_;
  }));

  it('should do something', function () {
    expect(!!column).toBe(true);
  });

});
