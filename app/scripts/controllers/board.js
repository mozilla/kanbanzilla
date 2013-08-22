'use strict';

angular.module('kanbanzillaApp')
  .controller('BoardCtrl', ['$scope', '$location', '$q','Bugzilla', 'Boards', '$routeParams', '$window', '$dialog', 'board',
  function ($scope, $location, $q, Bugzilla, Boards, $routeParams, $window, $dialog, board) {

    $scope.boardInfo = board.data; // the resolve from the routeProvider
    console.log($scope.boardInfo);

    Bugzilla.getConfig()
      .success(function (data) {
        var components = [];
        var products = data.product;
        for(var productName in products) {
          for(var componentName in products[productName].component) {
            components.push(productName + ': ' + componentName);
          }
        }
        $scope.components = components;
      });

    function getColumn (name) {
      for (var i = 0 ; i < $scope.boardInfo.columns.length ; i++){
        if($scope.boardInfo.columns[i].name === name) {
          return $scope.boardInfo.columns[i];
        }
      }
    }

    function receiveHandler (data, ui) {
      var bug = ui.item.sortable.moved;
      // dependent on html structure, would like to change this but its hard with what
      // the ui-sortable directive gives us.
      var columnName = data.target.parentNode.parentNode.attributes['display-title'].nodeValue;
      var column = getColumn(columnName);

      var statuses = [];
      var title = 'Update Bug';
      var open = false;

      if(column.statuses.length > 1) {
        title = 'Move Bug to ' + columnName;
        statuses = column.statuses;
        open = true;
      }
      else if(column.statuses[0] === 'RESOLVED') {
        title = 'Move Bug to Resolved';
        statuses = ['RESOLVED'];
        open = true;
      }
      else if(column.statuses.length === 1) {
        Bugzilla.updateBug(bug.id, { status: column.statuses[0] });
      }
      else {
        Bugzilla.updateBug(bug.id, { whiteboard: columnName });
      }

      var dropModalDialog = $dialog.dialog({
        backdrop: true,
        keyboard: true,
        backdropClick: true,
        templateUrl: 'views/dropbugmodal.html',
        controller: 'DropBugModalCtrl',
        statuses: statuses,
        title: title
      });

      $scope.select2Options = {
        'simple_tags': true,
        'minimumInputLength': 3
      };

      if(open){
        dropModalDialog.open().then(function (result) {
          if(result.action === 'submit'){
            Bugzilla.updateBug(bug.id, result.data);
          }
          else if (result.action === 'close'){
            console.log('need to undo and send bug back to intial column');
          }
        });
      }


    }

    function updateBoardWith (data) {
      console.log(data);
    }


    // ui-sortable options, placeholder is a class, and helper clone disables
    // the click event from firing when dropping cards.
    $scope.sortableOptions = {
      placeholder: 'proxy-card',
      connectWith: '[ui-sortable]',
      helper: 'clone',
      revert: 100,
      receive: receiveHandler
    };

    $scope.refresh = function () {
      Boards.getUpdates($scope.boardInfo.board.id, $scope.boardInfo.latest_change_time)
        .success(function (data) {
          if(data.latest_change_time !== undefined) {
            console.log('theres been an update');
            updateBoardWith(data);
          }
          else {
            console.log('no update');
          }
        });
    };

    $scope.updateBoard = function () {
      console.log($scope.components);
      Boards.update($scope.boardInfo.board.id, {
        "name": "heheh",
        "components": [1,2,3]
      })
        .success(function (data) {
          console.log(data);
        });
    };

    $scope.addComponent = function () {
      $scope.boardInfo.board.components.push({component: $scope.newComponent});
      $scope.newComponent = '';
    };

    function queryString (data) {
      var str = '?';
      for(var key in data) {
        if(data.hasOwnProperty(key) && key !== '$$hashKey'){
          str += key + "=" + data[key] + '&';
        }
      }
      str = str.slice(0,-1);
      return str;
    }

    $scope.newBug = function () {
      var url = 'https://bugzilla.mozilla.org/enter_bug.cgi';
      url += queryString($scope.boardInfo.board.components[0]);
      window.open(url, '_blank');
    };


    $scope.$on('$destroy', function () {
      console.log('board destroyed');
    });

  }]);
