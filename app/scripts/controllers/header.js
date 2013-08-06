'use strict';

angular.module('kanbanzillaApp')
  .controller('HeaderCtrl', ['$scope', 'bugzillaAuth', '$window', '$dialog', function ($scope, bugzillaAuth, $window, $dialog) {

    $scope.appName = 'Kanbanzilla';

    $scope.user = bugzillaAuth.getUser();

    $scope.loginDialogOpts = {
      backdrop: true,
      keyboard: true,
      backdropClick: true,
      templateUrl: 'views/loginmodal.html',
      controller: 'LoginCtrl'
    };

    $scope.openLoginDialog = function () {
      var dialog = $dialog.dialog($scope.loginDialogOpts);
      dialog.open().then(function (result) {
        console.log(result);
      });
    };

    $scope.logout = function () {
      var userConfirmedLogout = $window.confirm('Are you sure you want to logout');
      if(userConfirmedLogout){
        bugzillaAuth.logout();
      }
    };


  }]);
