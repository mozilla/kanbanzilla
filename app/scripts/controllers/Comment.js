'use strict';

angular.module('kanbanzillaApp')
  .controller('CommentCtrl', ['$scope', 'dialog', function ($scope, dialog) {

    $scope.something = [];
    $scope.open = dialog._open;
    $scope.$watch(dialog._open, function () {
      $scope.open = dialog._open;
    });

    $scope.closeDialog = function () {
      var response = {};
      response.action = 'close';
      dialog.close(response);
    };

    $scope.attemptCommentPost = function () {
      var response = {};
      response.action = 'submit';
      response.text = $scope.commentText;
      $scope.commentText = '';
      dialog.close(response);
    };

  }]);
