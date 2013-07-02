'use strict';

angular.module('kanbanzillaApp')
  .controller('MainCtrl', ['$scope', 'BugzillaMock',
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

  Bugzilla.getAllBugs()
    .success(function (resp) {
      $scope.stuff = resp.data;
      // console.log(data);
    });

    $scope.goToBugzilla = function (bug) {
      window.location = Bugzilla.getLink(bug.id);
    };

    $scope.complete = function (bug) {
      alert(bug.id);
    };

  }]);
