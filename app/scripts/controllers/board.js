'use strict';

angular.module('kanbanzillaApp')
  .controller('BoardCtrl', ['$scope', 'Bugzilla', '$routeParams',
  function ($scope, Bugzilla, $routeParams) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    console.log('Board Controller');

    $scope.stuff = [];
    $scope.product = $routeParams.id;

    // Bugzilla.getBug(35)
    //   .success(function (data) {
    //     $scope.stuff.push(data);
    //     console.log(data);
    //   })
    //   .error(function (data) {
    //     console.log(data);
    //   });


    Bugzilla.getBugsForProduct($routeParams.id)
      .success(function(data) {
        $scope.stuff = data.bugs;
      })
      .error(function (data) {
        console.log(data);
      });

    Bugzilla.getCommentsForBug(35)
      .success(function(data) {
        console.log(data);
      });

    $scope.goToBugzilla = function (bug) {
      window.location = Bugzilla.getLink(bug.id);
    };

    $scope.complete = function (bug) {
      alert(bug.id);
    };

  }]);
