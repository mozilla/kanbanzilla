'use strict';

angular.module('kanbanzillaApp')
  .directive('fancyScrollHorizontally', ['$document', function ($document) {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {

        var speed = 20;
        var position = 0;
        var width = element[0].children[element[0].children.length - 1].offsetLeft + element[0].children[0].offsetWidth;
        var windowWidth = window.innerWidth;
        var scrollbarInnerWidthPercent = 0;
        var scrollbar = document.createElement('div');
        var scrollbarInner = document.createElement('div');
        var jScrollbarInner = angular.element(scrollbarInner);

        function init () {
          element.css('width', width + 'px');
          addScrollbar();
          element.bind('mousewheel', fancyScrollWheelHandler);
          $document.bind('keydown', fancyKeyHandler);
          window.addEventListener('resize', sizeScrollbar);
        }

        function addScrollbar () {
          scrollbar.appendChild(scrollbarInner);
          scrollbarInner.className = 'fancy-scroll-inner';
          scrollbar.className = 'fancy-scroll-background hidden';
          element[0].parentElement.appendChild(scrollbar);
          sizeScrollbar();
        }

        function sizeScrollbar () {
          windowWidth = window.innerWidth;
          scrollbarInnerWidthPercent = windowWidth / width;
          scrollbarInner.style.width = scrollbarInnerWidthPercent * 100 + '%';
          if(scrollbarInnerWidthPercent < 1){
            scrollbar.className = 'fancy-scroll-background';
          }
          moveElement(0);
        }

        function moveElement (distance) {
          position += distance;
          if(position > 0) {
            position = 0;
          }
          if(position - windowWidth < -width - 10) {
            position = -width - 10 + windowWidth;
          }
          element.css(cssPrefix('transform', 'translate3d(' + position + 'px, 0, 0)'));
          moveScrollbar();
        }

        function cssPrefix (key, value) {
          var prefixes = ['-webkit-', '-moz-', '-o-'];
          var prefixedRule = {};

          for(var i = 0, l = prefixes.length; i < l ; i++){
            prefixedRule[prefixes[i] + key] = value;
          }

          return prefixedRule;
        }

        function moveScrollbar () {
          var completion = position / -(width - windowWidth);
          var remainderScrollbarWidth = (1 - scrollbarInnerWidthPercent);
          var offset = Math.min(completion, 1) * remainderScrollbarWidth * (windowWidth * .99);

          // this line is causing some weird compositing bugs on chrome with my thinkpad w530s nvidia gpu. Works fine on other hardware/software. The left positioning works without using the GPU.
          // jScrollbarInner.css(cssPrefix('transform', 'translate3d(' + offset + 'px, 0, 0)'));
          jScrollbarInner.css('left', offset + 'px');
        }

        function fancyScrollWheelHandler (e) {
          // only scroll when mouse is over the board-dropzone-inner
          // and not any of the columns or cards
          if(e.target === e.currentTarget){
            moveElement(e.originalEvent.wheelDelta / 3);
          }
        }

        function fancyKeyHandler (e) {
          if(e.keyCode === 37) {
            moveElement(speed);
          }
          else if(e.keyCode === 39) {
            moveElement(-speed);
          }
        }

        init();

        scope.$on('$destroy', function () {
          element.unbind('mousewheel');
          $document.unbind('keydown');
          window.removeEventListener('resize', sizeScrollbar);
        });

      }
    };
  }]);
