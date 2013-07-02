'use strict';

angular.module('kanbanzillaApp')
  .filter('truncateByCharsAndEndWith', [function () {
    return function (text, length, suffix) {
      if(isNaN(length) || text.length <= length) {
        return text;
      }
      else {
        if(typeof suffix === 'undefined') {
          suffix = '';
        }
        return text.substring(0, length) + suffix;
      }
    };
  }]);
