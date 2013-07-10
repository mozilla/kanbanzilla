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

    $scope.closeDialog = function (result) {
      var response = {};
      response.action = 'close';
      dialog.close(response);
    };

    $scope.attemptLogin = function () {
      var response = {};
      if($scope.login.username !== '' && $scope.login.password !== ''){
        console.log('attempt login');
        Bugzilla.attemptLogin($scope.login.username, $scope.login.password)
          .success(function (data) {
            response.action = 'login';
            bugzillaAuth.login($scope.login.username, $scope.login.password);
            dialog.close(response);
          })
          .error(function (data) {
            response.action = 'badlogin';
            dialog.close(response);
          });
      }
      else{
        console.log('stuff is bad');
        response.action = 'badlogin';
        dialog.close(response);
      }
    };

  }]);
