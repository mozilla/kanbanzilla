'use strict';

angular.module('kanbanzillaApp')
  .directive('editInplace', function () {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'views/editInplace.html',
      scope: {
        value: '=editInplace',
        type: '@type'
      },
      controller: ['$scope', function ($scope) {

        $scope.editValue = $scope.value;
        $scope.switchToEditMode = function () {
          $scope.editing = true;
        };
        $scope.disableEditMode = function () {
          $scope.editing = false;
        };
        $scope.saveEdits = function () {
          $scope.value = $scope.editValue;
          $scope.disableEditMode();
        };
        $scope.cancelEdits = function () {
          $scope.editValue = $scope.value;
          $scope.disableEditMode();
        };

      }]
    };
  });
