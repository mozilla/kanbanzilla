'use strict';

angular.module('kanbanzillaApp')
  .controller('HeaderCtrl', ['$scope', 'bugzillaAuth', function ($scope, bugzillaAuth) {
    $scope.loggedIn = false;
    $scope.appName = 'Kanbanzilla';
  }]);
