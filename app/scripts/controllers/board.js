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
    Bugzilla.getBugs(requestParams)
      .success(function(data) {
        $scope.resolvedBugs = $filter('filter')(data.bugs, 'resolved');
        $scope.unconfirmedBugs = $filter('filter')(data.bugs, 'unconfirmed');
        $scope.newBugs = $filter('filter')(data.bugs, 'new');
        $scope.assignedBugs = $filter('filter')(data.bugs, 'assigned');
      })
      .error(function(data) {
        console.log(data);
      });

    $scope.goToBugzilla = function (bug) {
      window.location = Bugzilla.getLink(bug.id);
    };

    $scope.complete = function (bug) {
      alert(bug.id);
    };

  }]);
