'use strict';

angular.module('kanbanzillaApp')
  .directive('fancyScrollHorizontally', ['$document', function ($document) {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {

        var speed = 20;
        var position = 0;

        function cssPrefix (key, value) {
          var prefixes = ['-webkit-', '-moz-', '-o-'];
          var prefixedRule = {};

          for(var i = 0, l = prefixes.length; i < l ; i++){
            prefixedRule[prefixes[i] + key] = value;
          }

          return prefixedRule;
        }

        function moveElement (distance) {
          position += distance;
          if(position > 0) {
            position = 0;
          }
          // element.css('left', position + 'px');
          // element.css('-moz-transform', 'translate3d(' + position + 'px, 0, 0)');
          element.css(cssPrefix('transform', 'translate3d(' + position + 'px, 0, 0)'));
        }

        function fancyScrollWheelHandler (e) {
          console.log('scrolling');
          if(e.target === e.currentTarget){
            moveElement(e.originalEvent.wheelDelta / 5);
          }
        }

        function fancyKeyHandler (e) {
          if(e.keyCode === 37) {
            moveElement(speed);
          }
          else if(e.keyCode === 39) {
            moveElement(-speed);
          }
        }

        element.bind('mousewheel', fancyScrollWheelHandler);
        $document.bind('keydown', fancyKeyHandler);
        scope.$on('$destroy', function () {
          element.unbind('mousewheel');
          $document.unbind('keydown');
        });

      }
    };
  }]);
