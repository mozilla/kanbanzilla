'use strict';

angular.module('kanbanzillaApp')
  .controller('NewboardCtrl', ['$scope', 'Bugzilla', '$location', 'Boards', '$timeout', 'config', '$notification',
    function ($scope, Bugzilla, $location, Boards, $timeout, config, $notification) {
    $scope.select2Options = {
      'multiple': true,
      'simple_tags': true,
      'minimumInputLength': 3,
      'maximumSelectionSize': 20
    };
    $scope.products = config.data.product;

    function resetCreate () {
      $scope.creating = false;
      $scope.createText = 'Create';
      $scope.board = {
        name: '',
        description: '',
        components: [],
        columns: []
      };
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

    $scope.createBoard = function () {
      makeCreating();
      processComponents($scope.board.components);
      Boards.create($scope.board)
        .success(function (data) {
          $notification.success('Board Created', 'Your board has been successfully created');
          resetCreate();
          console.log(data);
          $location.path('/board/' + data.board);
        })
        .error(function (data) {
          resetCreate();
        });
    };

    resetCreate();

  }]);
