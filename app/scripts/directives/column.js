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
        query: '=',
        ngModel: '='
      },
      controller: ['$scope', 'Bugzilla', function ($scope, Bugzilla) {

        $scope.getDescription = function (bug) {
          Bugzilla.getCommentsForBug(bug.id)
            .success(function (data) {
              console.log(data.comments[0].text);
            });
        };

      }]
    };
  });
