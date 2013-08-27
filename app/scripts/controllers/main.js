'use strict';

angular.module('kanbanzillaApp')
  .controller('MainCtrl', ['$scope', 'Bugzilla', 'Boards', '$window', '$http', 'boardsResolve',
  function ($scope, Bugzilla, Boards, $window, $http, boardsResolve) {
    $scope.products = {};
    $scope.myBoards = boardsResolve.data.boards; // the resolve from the router

    $scope.deleteBoard = function (board) {
      if($window.confirm('Are you sure you want to delete this board?')){
        $scope.myBoards.splice($scope.myBoards.indexOf(board), 1);
        Boards.remove(board.id)
          .success(function (data) {
            console.log(data);
          });
      }
    };

  }]);
