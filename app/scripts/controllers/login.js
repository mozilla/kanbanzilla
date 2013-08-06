'use strict';

angular.module('kanbanzillaApp')
  .controller('LoginCtrl', ['$scope', 'bugzillaAuth', 'Bugzilla', 'dialog', function ($scope, bugzillaAuth, Bugzilla, dialog) {

    $scope.login = {};
    $scope.login.username = '';
    $scope.login.password = '';
    $scope.open = dialog._open;
    $scope.$watch(dialog._open, function () {
      $scope.open = dialog._open;
    });

    $scope.closeDialog = function () {
      var response = {};
      response.action = 'close';
      dialog.close(response);
      console.log($scope.login.password === '');
    };

    $scope.attemptLogin = function () {
      if($scope.login.username !== '' && $scope.login.password !== ''){
        Bugzilla.attemptLogin($scope.login.username, $scope.login.password)
          .success(function (data) {
            bugzillaAuth.login($scope.login.username);
            dialog.close(data);
          })
          .error(function () {
            dialog.close({result: 'failed'});
          });
      }
    };

  }]);
