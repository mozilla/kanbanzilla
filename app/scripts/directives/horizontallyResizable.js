'use strict';

angular.module('kanbanzillaApp')
  .directive('horizontallyResizable', ['$document', function ($document) {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {
        var resizing = false;
        var resizeHandle = angular.element(document.createElement('div'));

        function horizontalResizeHandler (e) {
          if(resizing){
            // console.log(e);
            // console.log(e.clientX, element.context.offsetLeft, e.clientX - element.context.offsetLeft);
            console.log(e.clientX - element.offset().left);
            element.css('width', e.clientX - element.offset().left + 'px');
          }
        }

        resizeHandle.addClass('resizable-handle');
        element[0].appendChild(resizeHandle[0]);

        resizeHandle.bind('mousedown', function () {
          resizing = true;
          console.log('resizing');
          console.log(element.parent().addClass('unselectable'));
        });

        $document.bind('mousemove', horizontalResizeHandler);

        $document.bind('mouseup', function () {
          if(resizing){
            element.parent().removeClass('unselectable');
          }
          resizing = false;
          console.log('not resizing');
        });
      }
    };
  }]);
