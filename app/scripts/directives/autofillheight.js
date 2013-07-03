'use strict';

angular.module('kanbanzillaApp')
  .directive('autoFillHeight', [function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {

        function resize () {
          var remainingHeight = window.innerHeight - element[0].offsetTop;
          element.css('height', remainingHeight + 'px');
        }

        function fillHeightResizeHandler () {
          resize();
        }

        resize();
        window.addEventListener('resize', fillHeightResizeHandler);

        scope.$on('$destroy', function () {
          window.removeEventListener('resize', fillHeightResizeHandler);
        });


      }
    };
  }]);
