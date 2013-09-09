'use strict';

angular.module('kanbanzillaApp')
  .factory('kbUtils', [function kbUtils() {
    // AngularJS will instantiate a singleton by calling "new" on this function
    return {

      // takes a string of some duration of time and converts it to milliseconds
      // ex:      0.5s -> 500     500ms -> 500     500 -> 500
      parseTimeExpression: function (timeExpression) {
        var timeInMs,
            re = new RegExp(/[0-9]s/),
            s = timeExpression.search(re);
        if(s !== -1) {
          timeInMs = parseFloat(timeExpression, 10) * 1000;
        }
        else {
          timeInMs = parseInt(timeExpression, 10);
        }
        return timeInMs;
      }
    };
  }]);
