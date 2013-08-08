'use strict';

angular.module('kanbanzillaApp')
  .controller('BoardCtrl', ['$scope', '$location', '$q','Bugzilla', 'Boards', '$routeParams', '$window',
  function ($scope, $location, $q, Bugzilla, Boards, $routeParams, $window) {

    function getColumn (name) {
      for (var i = 0 ; i < $scope.boardInfo.columns.length ; i++){
        if($scope.boardInfo.columns[i].name === name) {
          return $scope.boardInfo.columns[i];
        }
      }
    }

    function receiveHandler (data, ui) {
      var bug = ui.item.sortable.moved;
      var columnName = data.target.parentNode.parentNode.attributes['display-title'].nodeValue;
      var column = getColumn(columnName);
      if(column.statuses.length > 1) {
        console.log('choose between these statuses', column.statuses);
      }
      else if(column.statuses[0] === 'RESOLVED') {
        console.log('choose between these statuses', ['FIXED', 'INVALID', 'WONTFIX', 'DUPLICATE', 'WORKSFORME', 'INCOMPLETE']);
      }
      else if(column.statuses.length === 1) {
        console.log('change the status on bug: #' + bug.id + ' to ' + column.statuses[0]);
      }
      else {
        console.log('change the whiteboard on bug: #' + bug.id + ' to kanbanzilla[' + columnName + ']');
      }
    }


    // ui-sortable options, placeholder is a class, and helper clone disables
    // the click event from firing when dropping cards.
    $scope.sortableOptions = {
      placeholder: 'proxy-card',
      connectWith: '[ui-sortable]',
      helper: 'clone',
      receive: receiveHandler
    };


    Boards.get($routeParams.id).
      success(function (data) {
        $scope.boardInfo = data;
        console.log($scope.boardInfo);
      });

    $scope.goToBugzilla = function (bug) {
      window.location = Bugzilla.getLink(bug.id);
    };

    $scope.openComment = function () {
      $window.alert('opening comment');
    };

    $scope.$on('$destroy', function () {
      console.log('board destroyed');
    });

  }]);
