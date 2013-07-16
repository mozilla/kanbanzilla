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

    $scope.newBoard = function () {
      var name = prompt('What would you like to name your board?');
      var board = Boards.create(name)
      console.log(board);
    };

  }]);
