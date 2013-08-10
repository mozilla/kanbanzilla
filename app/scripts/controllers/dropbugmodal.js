'use strict';

angular.module('kanbanzillaApp')
  .controller('DropBugModalCtrl', ['$scope', 'dialog', function ($scope, dialog) {

    console.log(dialog.options.selectables);
    $scope.selectables = dialog.options.selectables;
    $scope.status = $scope.selectables[0];

    $scope.closeDialog = function () {
      var response = {};
      response.action = 'close';
      dialog.close(response);
    };

    $scope.attemptCommentPost = function () {
      var response = {};
      response.action = 'submit';
      response.text = $scope.commentText;
      response.status = $scope.status;
      $scope.commentText = '';
      dialog.close(response);
    };

  }]);
