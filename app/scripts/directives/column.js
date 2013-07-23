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
        sortOptions: '=',
        ngModel: '='
      },
      controller: ['$scope', 'Bugzilla', function ($scope, Bugzilla) {

        $scope.bugDescription = 'Loading...';
        $scope.lastComment = 'Loading...';

        $scope.getDescription = function (bug) {
          Bugzilla.getCommentsForBug(bug.id)
            .success(function (data) {
              $scope.bugDescription = data.comments[0].text.replace(/\n/g,'<br/>');
            });
        };

        $scope.resetDescription = function () {
          $scope.bugDescription = 'Loading';
        };

        $scope.getLastComment = function (bug) {
          Bugzilla.getCommentsForBug(bug.id)
            .success(function (data) {
              $scope.lastComment = data.comments[data.comments.length - 1].text.replace(/\n/g,'<br/>');
            });
        };

        $scope.resetLastComment = function () {
          $scope.lastComment = 'Loading...';
        };

        $scope.goToBug = function (bug) {
          window.open('https://bugzilla.mozilla.org/show_bug.cgi?id=' + bug.id, '_blank');
        };

        $scope.openComment = function (test) {
          console.log(test);
        };

      }]
    };
  })
  .directive('h5drop', function () {

    return {
      restrict: 'A',
      link: function (scope, elem, attrs) {
        elem.bind('drop', function (e) {
          console.log(e);
        });
      }
    };

  });
