'use strict';

angular.module('kanbanzillaApp')
  .controller('BoardCtrl', ['$scope', '$location', '$q','Bugzilla', 'Boards', '$routeParams', '$window',
  function ($scope, $location, $q, Bugzilla, Boards, $routeParams, $window) {
    // ui-sortable options, placeholder is a class, and helper clone disables
    // the click event from firing when dropping cards.
    $scope.sortableOptions = {
      placeholder: 'proxy-card',
      connectWith: '[ui-sortable]',
      helper: 'clone'
    };

    Boards.get($routeParams.id).
      success(function (data) {
        $scope.board = data;
        console.log($scope.board);
      });

    $scope.goToBugzilla = function (bug) {
      window.location = Bugzilla.getLink(bug.id);
    };

    $scope.openComment = function () {
      $window.alert('opening comment');
    };

    $scope.$on('$destroy', function () {
      console.log('board destroyed');
    });

  }]);
