'use strict';

angular.module('kanbanzillaApp')
  .controller('MainCtrl', ['$scope', 'Bugzilla',
  function ($scope, Bugzilla) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    $scope.stuff = [];

    // Bugzilla.getBug(35)
    //   .success(function (data) {
    //     $scope.stuff.push(data);
    //     console.log(data);
    //   })
    //   .error(function (data) {
    //     console.log(data);
    //   });

  }]);
