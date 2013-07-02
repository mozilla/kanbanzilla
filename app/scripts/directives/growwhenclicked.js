'use strict';

angular.module('kanbanzillaApp')
  .directive('growWhenClicked', [function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        var size = attrs.growWhenClicked;
        element.bind('focus', function () {
          element.css('width', size + 'px');
        })
        .bind('blur', function () {
          element.css('width', '');
        });

        scope.$on('$destroy', function () {
          element.unbind('blur')
            .unbind('focus');
        });
      }
    };
  }]);
