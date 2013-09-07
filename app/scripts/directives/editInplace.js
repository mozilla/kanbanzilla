'use strict';

angular.module('kanbanzillaApp')
  .directive('editInplace', function () {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'views/editInplace.html',
      scope: {
        value: '=editInplace',
        type: '@editType',
        disabled: '=editDisable'
      },
      controller: ['$scope', function ($scope) {

        function setEditMode (bool) {
          console.log($scope.disabled);
          if (!$scope.disabled){
            $scope.editing = bool;
          }
        }

        $scope.editValue = $scope.value;
        $scope.switchToEditMode = function () {
          // $scope.editing = true;
          setEditMode(true);
        };
        $scope.disableEditMode = function () {
          // $scope.editing = false;
          setEditMode(false);
        };
        $scope.saveEdits = function () {
          $scope.value = $scope.editValue;
          $scope.disableEditMode();
        };
        $scope.cancelEdits = function () {
          $scope.editValue = $scope.value;
          $scope.disableEditMode();
        };
        $scope.setEditMode = function (bool) {
          $scope.editing = bool;
        };

      }]
    };
  });
