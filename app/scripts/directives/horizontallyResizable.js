'use strict';

angular.module('kanbanzillaApp')
  .directive('horizontallyResizable', ['$document', function ($document) {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {
        var resizing = false;
        var resizeHandle = angular.element(document.createElement('div'));
        var mouseX;
        var cachedOffsetLeft;
        var resizeEvent = new CustomEvent("resizableResize", {
          bubbles: false,
          cancellable: true,
        });

        function horizontalResizeHandler (e) {
          if(resizing){
            mouseX = e.clientX;
            // element.css('width', e.clientX - element.offset().left + 'px');
          }
        }

        function horizontalMouseupHandler (e) {
          if(resizing){
            element.parent().removeClass('unselectable');
            window.dispatchEvent(resizeEvent);
          }
          cachedOffsetLeft = undefined;
          resizing = false;
        }

        setInterval(function () {
          if(resizing){
            if(cachedOffsetLeft === undefined){
              cachedOffsetLeft = element.offset().left;
            }
            // console.log(element.offset().left);
            element.css('width', mouseX - cachedOffsetLeft + 'px');
          }
        }, 16);

        resizeHandle.addClass('resizable-handle');
        element[0].appendChild(resizeHandle[0]);

        resizeHandle.bind('mousedown', function () {
          resizing = true;
          cachedOffsetLeft = element.offset().left;
          element.parent().addClass('unselectable');
        });

        $document.bind('mousemove', horizontalResizeHandler);
        $document.bind('mouseup', horizontalMouseupHandler);

        scope.$on('destroy', function () {
          resizeHandle.unbind('mousedown');
          $document.unbind('mousemove', horizontalResizeHandler);
          $document.unbind('mouseup', horizontalMouseupHandler);
        });
      }
    };
  }]);
