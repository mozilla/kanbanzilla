'use strict';

angular.module('kanbanzillaApp')
  .controller('LoginCtrl', ['$scope', 'bugzillaAuth', 'Bugzilla', 'dialog', function ($scope, bugzillaAuth, Bugzilla, dialog) {

    $scope.login = {};
    $scope.loggingIn = false;
    $scope.loginText = 'Login';
    $scope.login.username = '';
    $scope.login.password = '';
    $scope.open = dialog._open;
    $scope.$watch(dialog._open, function () {
      $scope.open = dialog._open;
    });

    $scope.closeDialog = function () {
      var response = {};
      response.result = 'close';
      dialog.close(response);
    };

    $scope.attemptLogin = function () {
      if($scope.login.username !== '' && $scope.login.password !== ''){
        $scope.loggingIn = true;
        $scope.loginText = 'Logging In...';
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
