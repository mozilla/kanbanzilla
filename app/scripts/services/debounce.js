'use strict';

/**
 * The point of this module is to provide an easy to use service to wrap existing calls
 * in a debounce function to limit the total number of calls.
 *
 * Also to provide a declarative approach in the form of a directive to handle
 * debouncing updates to ng-model, something that is very useful when filtering
 * is handled directly off an ng-model hooked up to an input field. When filtering
 * over fairly large data sets, the filtering and rendering can slow down the speed
 * at which you can type characters, and the experience feels sluggish in general.
 */

angular.module('kanbanzillaApp')
  .factory('debounce', ['$timeout', '$q', function debounceService ($timeout, $q) {
    return function debounce(func, wait, immediate) {
      var timeout;
      // Create a deferred object that will be resolved when we need to
      // actually call the func
      var deferred = $q.defer();
      return function() {
        var context = this, args = arguments;
        var later = function() {
          timeout = null;
          if(!immediate) {
            deferred.resolve(func.apply(context, args));
            deferred = $q.defer();
          }
        };
        var callNow = immediate && !timeout;
        if ( timeout ) {
          $timeout.cancel(timeout);
        }
        timeout = $timeout(later, wait);
        if (callNow) {
          deferred.resolve(func.apply(context,args));
          deferred = $q.defer();
        }
        return deferred.promise;
      };
    };
  }]);

