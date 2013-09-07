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
      controller: ['$scope', 'Bugzilla', 'bugzillaAuth','$dialog', '$window', function ($scope, Bugzilla, bugzillaAuth, $dialog, $window) {

        $scope.bugDescription = 'Loading...';
        $scope.lastComment = 'Loading...';
        $scope.archiveable = $scope.ngModel.statuses.indexOf('RESOLVED') !== -1;


        $scope.archiveAll = function () {
          // should only apply to the done column. Take all cards and archive
          // them, thus cleaning up the done column.
        };

        $scope.archiveBug = function (bug) {
          // archive an individual bug.
          if(!$window.confirm('Archiving a Bug will mark it as VERIFIED with the resolution it currently has. Are you sure you want to do archive this bug?')){
            return;
          }
          var index = $scope.ngModel.bugs.indexOf(bug);
          $scope.ngModel.bugs.splice(index, 1);
          Bugzilla.updateBug(bug.id, {status: 'VERIFIED'})
            .success(function (data) {
              if(data.ok !== 1) {
                $scope.ngModel.bugs.splice(index, 0, bug);
              }
            })
            .error(function () {
              $scope.ngModel.bugs.splice(index, 0, bug);
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

      }]
    };
  });
