'use strict';

angular.module('kanbanzillaApp')
  .directive('maxRemainingHeight', [function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {

        var padding = attrs.maxRemainingHeight !== '' ? parseInt(attrs.maxRemainingHeight, 10) : 0;

        function positionFromTopOfPage (elem) {
          var total = elem.offsetTop;
          if(typeof elem.offsetParent !== 'undefined' && elem.offsetParent !== null) {
            total += positionFromTopOfPage(elem.offsetParent);
          }
          return total;
        }

        function resize () {
          var remainingHeight = window.innerHeight - positionFromTopOfPage(element[0]) - padding;
          element.css('max-height', remainingHeight + 'px');
        }

        function maxHeightResizeHandler () {
          resize();
        }

        resize();
        window.addEventListener('resize', maxHeightResizeHandler);

        scope.$on('$destroy', function () {
          window.removeEventListener('resize', maxHeightResizeHandler);
        });

      }
    };
  }]);
