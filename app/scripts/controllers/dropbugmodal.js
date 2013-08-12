'use strict';

angular.module('kanbanzillaApp')
  .controller('DropBugModalCtrl', ['$scope', 'dialog', function ($scope, dialog) {

    $scope.statuses = dialog.options.statuses;
    $scope.resolutions = ['FIXED', 'INVALID', 'WONTFIX', 'DUPLICATE', 'WORKSFORME', 'INCOMPLETE'];
    $scope.status = $scope.statuses[0];
    $scope.bugResolution = $scope.resolutions[0];
    $scope.title = dialog.options.title;

    $scope.closeDialog = function () {
      var response = {};
      response.action = 'close';
      dialog.close(response);
    };

    $scope.attemptCommentPost = function () {
      var response = {};
      response.action = 'submit';
      response.data = {};
      response.data.status = $scope.status;
      if($scope.status === 'RESOLVED'){
        response.data.resolution = $scope.bugResolution;
      }
      dialog.close(response);
    };

  }]);
