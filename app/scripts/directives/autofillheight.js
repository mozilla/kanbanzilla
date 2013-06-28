'use strict';

angular.module('kanbanzillaApp')
  .directive('autoFillHeight', [function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {

        function resize () {
          var remainingHeight = window.innerHeight - element[0].offsetTop;
          element.css('height', remainingHeight + 'px');
        }

        window.addEventListener('resize', function (e) {
          resize();
        });

        resize();

      }
    };
  }]);
