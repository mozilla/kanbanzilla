'use strict';
angular.module('kanbanzillaApp')
  .directive('debounceModelUpdate', ['kbUtils', function(kbUtils) {
    /**
     * debounceModelUpdate is a directive that can be applied to input fields
     * with the 'ng-model' directive. It will debounce the events that cause
     * the ng-model to update. A common use case is for when you are applying
     * a filter based on the model of an input to a large amount of data. Without
     * debouncing, the model will update too frequently causing too many filters
     * too happen and lag the application (specifically typing)
     *
     * Example Usage:
     * <input type="text" ng-model="query" debounce-model-update="500ms">
     *      or
     * <input type="text" ng-model="query" debounce-model-update="0.5s">
     */
      return {
        restrict: 'A',
        link: function( scope, element, attrs) {
          var options = { timeout : 300, leading: false };
          if(attrs.debounceModelUpdate){
            options.timeout = kbUtils.parseTimeExpression(attrs.debounceModelUpdate);
          }

          var map = $._data(element[0], 'events');
          var events = _.each(['input'], function (eventName, index) {
            if(eventName.charAt(0) !== '$') { // only real dom events
              var handlerObj,
              debounced = _.debounce(function (event) {
                for(var i = _.indexOf(map[eventName], debounceHandlerObj) + 1 ; i<map[eventName].length ; i++) {
                  handlerObj = map[eventName][i];
                  // call original event handler
                  handlerObj.handler.apply(this, arguments);
                  // emulate regular event propagation
                  // dont propagate any further if it has immediatePropagationStopped
                  if(event.isImmediatePropagationStopped()) {
                    break;
                  }
                }
              }, options.timeout);
              element.on( eventName, function (event) {
                debounced.apply(this, arguments);
                // tell jquery to suppress further propagation of this event
                event.stopImmediatePropagation();
              });
              // move our debounce handler to first position to make sure its called first
              var debounceHandlerObj = map.input.pop();
              map.input.unshift( debounceHandlerObj);
            }
          });
        }
      };
  }]);
