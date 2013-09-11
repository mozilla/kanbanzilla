'use strict';
angular.module('kanbanzillaApp')
  .directive('debounceModelUpdate', ['kbUtils', function(kbUtils) {

      return {
        restrict: 'A',
        link: function( scope, element, attrs) {
          var options = { timeout : 300, leading: false };
          if(attrs.debounceModelUpdate){
            options.timeout = kbUtils.parseTimeExpression(attrs.debounceModelUpdate);
          }

          var map = $._data(element[0], 'events');
          console.log(map);
          var map2 = angular.element(element[0]).data('events');
          console.log(map2);
          var events = _.each(['input'], function (eventName, index) {
            // only real dom events
            if(eventName.charAt(0) !== '$') {
              var handlerObj,
              debounced = _.debounce(function (event) {
                for(var i = _.indexOf(map[eventName], debounceHandlerObj) + 1 ; i<map[eventName].length ; i++) {
                  handlerObj = map[eventName][i];
                  // call original event handler
                  handlerObj.handler.apply(this, arguments);
                  // emulate regular event dispatching by
                  // aborting further propagation when event
                  // has state immediatePropagationStopped
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

              // move our debounce handler at first position
              // to be called before any other
              var debounceHandlerObj = map.input.pop();
              map.input.unshift( debounceHandlerObj);
            }
          });
        }
      };
  }]);
