'use strict';

angular.module('kanbanzillaApp')
  .controller('BoardCtrl', ['$scope', 'Bugzilla', 'Boards', '$routeParams', '$window',
  function ($scope, Bugzilla, Boards, $routeParams, $window) {

    //////////////////////////////////////////
    // This whole controller is hideous     //
    // TODO: Clean up doit and customloader //
    //////////////////////////////////////////
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

    var columns = ['UNCONFIRMED', 'NEW', 'ASSIGNED', 'RESOLVED'];

    // for every component send off a request for all the bugs of varying statuses
    // then we have to join the results for the same status and different component
    function customLoader () {
      var board = Boards.get($routeParams.id);
      angular.forEach(board.components, function (component) {
        angular.forEach(columns, function (column) {

          Bugzilla.getBugs({
            product: component.product,
            component: component.component,
            status: column
          }).success(function(data) {
            var listName = column.toLowerCase() + 'Bugs';
            console.log(component, listName);
            $scope.loading[listName] = false;
            $scope[listName].push.apply($scope[listName], data.bugs);
            console.log($scope[listName]);
          });

        });
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
      customLoader();
    }
    else {
      doit();
    }


    $scope.goToBugzilla = function (bug) {
      window.location = Bugzilla.getLink(bug.id);
    };

    $scope.openComment = function () {
      $window.alert('opening comment');
    };

  }]);
