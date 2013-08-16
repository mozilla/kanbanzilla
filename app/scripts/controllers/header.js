'use strict';

angular.module('kanbanzillaApp')
  .controller('HeaderCtrl', ['$scope', 'bugzillaAuth', '$window', '$dialog', '$route',
    function ($scope, bugzillaAuth, $window, $dialog, $route) {

    $scope.appName = 'Kanbanzilla';

    $scope.user = bugzillaAuth.getUser();
    console.log($scope.user);

    $scope.loginDialogOpts = {
      backdrop: true,
      keyboard: true,
      backdropClick: true,
      templateUrl: 'views/loginmodal.html',
      controller: 'LoginCtrl'
    };

    $scope.openLoginDialog = function () {
      var dialog = $dialog.dialog($scope.loginDialogOpts);
      dialog.open().then(function (data) {
        if(data.result === 'success'){
          $route.reload();
        }
      });
    };

    $scope.logout = function () {
      var userConfirmedLogout = $window.confirm('Are you sure you want to logout');
      if(userConfirmedLogout){
        bugzillaAuth.logout();
        $route.reload();
      }
    };


  }]);
