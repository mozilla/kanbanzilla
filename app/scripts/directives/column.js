'use strict';

angular.module('kanbanzillaApp')
  .directive('kbcolumn', function () {
    return {
      templateUrl: 'views/column.tpl.html',
      restrict: 'A',
      replace: true,
      require: 'ngModel',
      scope: {
        displayTitle: '@',
        loading: '=',
        ngModel: '='
      },
      link: function postLink(scope, element, attrs, ngModelController) {
        // element.text('this is the column directive');
      },
      controller: ['$scope', function ($scope) {

        $scope.openComment = function () {
          alert('from inside the directive');
        };

      }]
    };
  });
