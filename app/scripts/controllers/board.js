'use strict';

angular.module('kanbanzillaApp')
  .controller('BoardCtrl', ['$scope', 'Bugzilla', 'Boards', '$routeParams',
  function ($scope, Bugzilla, Boards, $routeParams) {

    function doit () {
      Bugzilla.getBugsWithType({status: 'UNCONFIRMED'}, $routeParams.type, $routeParams.id)
        .success(function(data) {
          $scope.unconfirmedBugs = data.bugs;
          $scope.loading.unconfirmedBugs = false;
        });

      Bugzilla.getBugsWithType({status: 'RESOLVED'}, $routeParams.type, $routeParams.id)
        .success(function(data) {
          $scope.resolvedBugs = data.bugs;
          $scope.loading.resolvedBugs = false;
        });

      Bugzilla.getBugsWithType({status: 'NEW'}, $routeParams.type, $routeParams.id)
        .success(function(data) {
          $scope.newBugs = data.bugs;
          $scope.loading.newBugs = false;
        });

      Bugzilla.getBugsWithType({status: 'ASSIGNED'}, $routeParams.type, $routeParams.id)
        .success(function(data) {
          $scope.assignedBugs = data.bugs;
          $scope.loading.assignedBugs = false;
        });
    }

    $scope.unconfirmedBugs = [];
    $scope.resolvedBugs = [];
    $scope.assignedBugs = [];
    $scope.newBugs = [];
    $scope.product = $routeParams.id;

    $scope.loading = {
      unconfirmedBugs: true,
      resolvedBugs: true,
      newBugs: true,
      assignedBugs: true
    };

    if($routeParams.type === 'custom') {
      console.log(Boards.get($routeParams.id));
      // for every component send off a request for all the bugs of varying statuses
      // then we have to join the results for the same status and different component
    }
    else {
      doit();
    }



    $scope.goToBugzilla = function (bug) {
      window.location = Bugzilla.getLink(bug.id);
    };

  }]);
