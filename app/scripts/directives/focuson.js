'use strict';

angular.module('kanbanzillaApp')
  .directive('drFocusOn', [function () {
      // will focus the element its applied to when the condition passed
      // to it is true. Value is interpolated at the moment, {{value}}
      // and so is equal to a string.
      //
      // When trying to use an actual true/false expression with binding '='
      // it was causing scope issues with the rest of module.
      return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
          attrs.$observe('drFocusOn', function (newValue) {
            if(newValue === 'true'){
              setTimeout(function () {
                elem[0].focus();
              }, 100);
            }
          });
        }
      };
    }]);