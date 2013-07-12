'use strict';

angular.module('kanbanzillaApp')
  .controller('MainCtrl', ['$scope', 'Bugzilla',
  function ($scope, Bugzilla) {
    $scope.products = {};

    Bugzilla.getConfig()
       .success(function (data) {
          $scope.products = data.product;
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
  }]);
