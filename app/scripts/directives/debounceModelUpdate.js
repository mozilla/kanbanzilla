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

          var events = $.each( ['input'], function( index, eventName) {
              // ensure only real events are handled
              if(eventName.charAt(0) !== '$') {
                // install debounce mechanism
                var handlerObj,
                debounced = $.debounce( options.timeout, options.leading, function (event) {
                  // iterate over all event handlers registered before ourself
                  // (remember : we moved ourself at first position while installing)
                  for( var i = $.inArray( debounceHandlerObj, map[eventName])+1 ; i<map[eventName].length ; i++) {
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
                });

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
