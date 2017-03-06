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
        workInProcess: '=',
        ngModel: '='
      },
      controller: ['$scope', 'Bugzilla', 'bugzillaAuth','$dialog', '$window', '$filter', 'ColumnMap',
          function ($scope,   Bugzilla,   bugzillaAuth,  $dialog,   $window,   $filter,   ColumnMap) {

        ColumnMap.registerColumn($scope.ngModel.name, $scope);
        $scope.bugDescription = 'Loading...';
        $scope.lastComment = 'Loading...';
        $scope.archiveable = $scope.ngModel.statuses.indexOf('RESOLVED') !== -1;
        // Using a separate model for the filtered version in order to properly update
        // the model when cards are dragged with a filter applied.
        $scope.filteredBugs = $scope.ngModel.bugs;
        $scope.$watch('query', function () {
          $scope.filterBugs();
        });

        $scope.archiveBug = function (bug) {
          // archive an individual bug.
          if(!$window.confirm('Archiving a Bug will mark it as VERIFIED with the resolution it currently has. Are you sure you want to archive this bug?')){
            return;
          }
          var index = $scope.removeBug(bug);
          Bugzilla.updateBug(bug.id, {status: 'VERIFIED'})
            .success(function (data) {
              if(data.ok !== 1) {
                $scope.insertBug(bug, index);
              }
            })
            .error(function () {
              $scope.insertBug(bug, index);
            });
        };

        $scope.getDescription = function (bug) {
          Bugzilla.getCommentsForBug(bug.id)
            .success(function (data) {
              $scope.bugDescription = data.comments[0].text.replace(/\n/g,'<br/>');
            });
        };

        $scope.resetDescription = function () {
          $scope.bugDescription = 'Loading';
        };

        $scope.filterBugs = function () {
          $scope.filteredBugs = $filter('filter')($scope.ngModel.bugs, $scope.query);
        };

        $scope.getLastComment = function (bug) {
          Bugzilla.getCommentsForBug(bug.id)
            .success(function (data) {
              console.log(data);
              $scope.lastComment = data.comments[data.comments.length - 1].text.replace(/\n/g,'<br/>');
            });
        };

        $scope.resetLastComment = function () {
          $scope.lastComment = 'Loading...';
        };

        $scope.goToBug = function (bug) {
          window.open('https://bugzilla.mozilla.org/show_bug.cgi?id=' + bug.id, '_blank');
        };

        $scope.openComment = function (bug) {
          if(!bugzillaAuth.isUserLoggedIn()){
            console.log('user is not logged in');
            return;
          }
          var dialog = $dialog.dialog({
            backdrop: true,
            keyboard: true,
            backdropClick: true,
            templateUrl: 'views/postcomment.html',
            controller: 'CommentCtrl'
          });
          dialog.open().then(function (result) {
            if(result.action === 'submit'){
              Bugzilla.postComment(bug.id, {text: result.text})
              .success(function (data) {
                console.log(data);
              });
            }
          });
        };

        $scope.removeBug = function (bug) {
          var index = $scope.ngModel.bugs.indexOf(bug);
          $scope.ngModel.bugs.splice(index, 1);
          if($scope.query !== undefined) {
            index = $scope.filteredBugs.indexOf(bug);
            $scope.filteredBugs.splice(index, 1);
          }
          return index;
        };

        $scope.insertBug = function (bug, index) {
          $scope.ngModel.bugs.splice(index, 0, bug);
          if($scope.query !== undefined) {
            $scope.filteredBugs.splice(index, 0, bug);
          }
        };

      }]
    };
  });
