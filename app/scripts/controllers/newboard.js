'use strict';

angular.module('kanbanzillaApp')
  .controller('NewboardCtrl', ['$scope', 'Bugzilla', '$location', 'Boards',
    function ($scope, Bugzilla, $location, Boards) {
    $scope.select2Options = {
      'multiple': true,
      'simple_tags': true
    }
    $scope.products = {};
    $scope.board = {
      name: '',
      description: '',
      components: [],
      columns: []
    };

    Bugzilla.getConfig()
       .success(function (data) {
          $scope.products = data.product;
        });

    function componentStringToObject (component) {
      var compObject = {};
      component = component.split('@&:');
      compObject.product = component[0];
      compObject.component = component[1];
      return compObject;
    }

    function processComponents (components) {
      for(var i = 0; i < components.length; i++){
        components[i] = componentStringToObject(components[i]);
      }
    }

    $scope.createBoard = function () {
      processComponents($scope.board.components);
      console.log($scope.board);
      Boards.create($scope.board);
      $location.path('/board/custom/' + $scope.board.name);
    };

  }]);
