'use strict';

angular.module('kanbanzillaApp')
  .controller('BoardCtrl', ['$scope', 'Bugzilla', 'Boards', '$routeParams',
  function ($scope, Bugzilla, Boards, $routeParams) {

    function doit () {
      Bugzilla.getBugsWithType({status: 'UNCONFIRMED'}, $routeParams.type, $routeParams.id)
        .success(function(data) {
          $scope.unconfirmedBugs = data.bugs;
          $scope.loading.unconfirmedBugs = false;
        })
        .error(function(data){
          $scope.loading.unconfirmedBugs = 'wtf';
        });

      Bugzilla.getBugsWithType({status: 'RESOLVED'}, $routeParams.type, $routeParams.id)
        .success(function(data) {
          $scope.resolvedBugs = data.bugs;
          $scope.loading.resolvedBugs = false;
        })
        .error(function(data){
          $scope.loading.resolvedBugs = 'wtf';
        });

      Bugzilla.getBugsWithType({status: 'NEW'}, $routeParams.type, $routeParams.id)
        .success(function(data) {
          $scope.newBugs = data.bugs;
          $scope.loading.newBugs = false;
        })
        .error(function(data){
          $scope.loading.newBugs = 'wtf';
        });

      Bugzilla.getBugsWithType({status: 'ASSIGNED'}, $routeParams.type, $routeParams.id)
        .success(function(data) {
          $scope.assignedBugs = data.bugs;
          $scope.loading.assignedBugs = false;
        })
        .error(function(data){
          $scope.loading.assignedBugs = 'wtf';
        });
    }

    var columns = ['UNCONFIRMED', 'NEW', 'ASSIGNED', 'RESOLVED'];

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
      // for every component send off a request for all the bugs of varying statuses
      // then we have to join the results for the same status and different component
    }
    else {
      doit();
    }



    $scope.goToBugzilla = function (bug) {
      window.location = Bugzilla.getLink(bug.id);
    };

    $scope.openComment = function () {
      alert('opening comment');
    };

  }]);
