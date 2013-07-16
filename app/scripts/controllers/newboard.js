'use strict';

angular.module('kanbanzillaApp')
  .controller('NewboardCtrl', function ($scope) {
    $scope.select2Options = {
      'multiple': true,
      'simple_tags': true
    }
  });
