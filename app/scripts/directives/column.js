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

        $scope.bugDescription = 'Loading...';

        $scope.getDescription = function (bug) {
          Bugzilla.getCommentsForBug(bug.id)
            .success(function (data) {
              $scope.bugDescription = data.comments[0].text.replace(/\n/g,'<br/>');
            });
        };

        $scope.resetDescription = function () {
          $scope.bugDescription = 'Loading';
        };

        $scope.goToBug = function (bug) {
          window.open('https://bugzilla.mozilla.org/show_bug.cgi?id=' + bug.id, '_blank');
        };

        $scope.openComment = function (test) {
          console.log(test);
        };

      }]
    };
  });
