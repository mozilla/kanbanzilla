'use strict';

angular.module('kanbanzillaApp')
  .controller('BoardCtrl', ['$scope', '$location', '$q','Bugzilla', 'Boards', '$routeParams', '$window',
  function ($scope, $location, $q, Bugzilla, Boards, $routeParams, $window) {
    var columns = ['UNCONFIRMED', 'NEW', 'ASSIGNED', 'RESOLVED'];

    // for every component send off a request for all the bugs of varying statuses
    // then we have to join the results for the same status and different component
    function customLoader () {
      var loadingPromises = [];
      var board = Boards.get($routeParams.id);
      if(board === undefined) {
        $location.path('/');
      }
      else {
        angular.forEach(board.components, function (component) {
          angular.forEach(columns, function (column) {

            var p = Bugzilla.getBugs({
              product: component.product,
              component: component.component,
              status: column
            });
            p.success(function(data) {
              var listName = column.toLowerCase() + 'Bugs';
              $scope.loading[listName] = false;
              $scope[listName].push.apply($scope[listName], data.bugs);
            });

            loadingPromises.push(p);

          });
        });
        $q.all(loadingPromises).then(function (data) {
          // when all requests are done
        });
      }
    }

    Boards.get($routeParams.id).
      success(function (data) {
        $scope.board = data;
        console.log($scope.board);
      });

    function init () {
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
    }
    // ui-sortable options, placeholder is a class, and helper clone disables
    // the click event from firing when dropping cards.
    $scope.sortableOptions = {
      placeholder: 'proxy-card',
      connectWith: '[ui-sortable]',
      helper: 'clone'
    };

    init();
    // customLoader();

    $scope.goToBugzilla = function (bug) {
      window.location = Bugzilla.getLink(bug.id);
    };

    $scope.openComment = function () {
      $window.alert('opening comment');
    };

    $scope.$on('$destroy', function () {
      console.log('board destroyed');
      init();
    });

  }]);
