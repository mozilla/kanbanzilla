'use strict';

angular.module('kanbanzillaApp')
  .controller('MainCtrl', ['$scope', 'Bugzilla', 'Boards', '$window', '$http',
  function ($scope, Bugzilla, Boards, $window, $http) {
    $scope.products = {};

    // Bugzilla.getConfig()
    //    .success(function (data) {
    //       $scope.products = data.product;
    //     });

    Boards.getAllBoards().
      success(function (data) {
        $scope.myBoards = data.boards;
        console.log($scope.myBoards);
      });

    $scope.toggle = function (product) {
      console.log(product);
      if(typeof product.visible === 'undefined'){
        product.visible = true;
      }
      else{
        product.visible = !product.visible;
      }
    };

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
