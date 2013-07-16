'use strict';

angular.module('kanbanzillaApp')
  .controller('MainCtrl', ['$scope', 'Bugzilla', 'Boards',
  function ($scope, Bugzilla, Boards) {
    $scope.products = {};

    Bugzilla.getConfig()
       .success(function (data) {
          $scope.products = data.product;
        });

    $scope.myBoards = Boards.getAllBoards();

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
      Boards.remove(board);
    };

  }]);
