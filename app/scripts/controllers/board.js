'use strict';

angular.module('kanbanzillaApp')
  .controller('BoardCtrl', ['$scope', 'Bugzilla', '$routeParams', '$filter',
  function ($scope, Bugzilla, $routeParams, $filter) {

    $scope.bugs = [];
    $scope.unconfirmedBugs = [];
    $scope.resolvedBugs = [];
    $scope.assignedBugs = [];
    $scope.newBugs = [];
    $scope.product = $routeParams.id;

    var requestParams = {};
    requestParams[$routeParams.type] = $routeParams.id;

    $scope.loading = {
      unconfirmedBugs: true,
      resolvedBugs: true,
      newBugs: true,
      assignedBugs: true
    };

    // Bugzilla.getBugs(requestParams)
    //   .success(function(data) {
    //     $scope.resolvedBugs = $filter('filter')(data.bugs, 'resolved');
    //     $scope.unconfirmedBugs = $filter('filter')(data.bugs, 'unconfirmed');
    //     $scope.newBugs = $filter('filter')(data.bugs, 'new');
    //     $scope.assignedBugs = $filter('filter')(data.bugs, 'assigned');
    //   })
    //   .error(function(data) {
    //     console.log(data);
    //   });

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

    $scope.goToBugzilla = function (bug) {
      window.location = Bugzilla.getLink(bug.id);
    };

  }]);
