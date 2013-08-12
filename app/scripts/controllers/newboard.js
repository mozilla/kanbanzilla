'use strict';

angular.module('kanbanzillaApp')
  .controller('NewboardCtrl', ['$scope', 'Bugzilla', '$location', 'Boards', '$timeout',
    function ($scope, Bugzilla, $location, Boards, $timeout) {
    $scope.select2Options = {
      'multiple': true,
      'simple_tags': true,
      'minimumInputLength': 4
    };
    $scope.products = {};
    $scope.board = {
      name: '',
      description: '',
      components: [],
      columns: []
    };

    function resetCreate () {
      $scope.creating = false;
      $scope.createText = 'Create';
    }

    function makeCreating () {
      $scope.creating = true;
      $scope.createText = 'Creating...';
    }

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

    Bugzilla.getConfig()
       .success(function (data) {
          $scope.products = data.product;
        });

    $scope.createBoard = function () {
      makeCreating();
      processComponents($scope.board.components);
      Boards.create($scope.board)
        .success(function (data) {
          resetCreate();
          console.log(data);
          $location.path('/board/' + data.board);
        })
        .error(function (data) {
          resetCreate();
          console.log('error on the server', data);
        });
    };

    resetCreate();

  }]);
