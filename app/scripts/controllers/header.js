'use strict';

angular.module('kanbanzillaApp')
  .controller('HeaderCtrl', ['$scope', 'bugzillaAuth', '$dialog', function ($scope, bugzillaAuth, $dialog) {

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


  }]);
