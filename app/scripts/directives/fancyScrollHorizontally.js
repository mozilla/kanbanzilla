'use strict';

angular.module('kanbanzillaApp')
  .directive('fancyScrollHorizontally', ['$document', '$window', function ($document, $window) {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {

        var speed = 20;
        var position = 0;

        function moveElement (distance) {
          if(position + distance <= 0) {
            position += distance;
            element.css('-webkit-transform', 'translate3d(' + position + 'px, 0, 0)');
          }
        }

        // angular.element(window).scroll(function () {
        //   console.log('scrolling');
        // });

        angular.element(window).bind('scroll', function () {
          console.log('scrolling');
        });


        $document.bind('keydown', function (e) {
          if(e.keyCode == 37) {
            moveElement(speed);
          }
          else if(e.keyCode == '39') {
            moveElement(-speed);
          }
        });

        scope.$on('$destroy', function () {
          element.unbind('keydown');
        });
      }
    };
  }]);
