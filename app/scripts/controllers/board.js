'use strict';

angular.module('kanbanzillaApp')
  .controller('BoardCtrl', ['$scope', '$location', '$q','Bugzilla', 'Boards', '$routeParams', '$window', '$dialog', 'board',
  function ($scope, $location, $q, Bugzilla, Boards, $routeParams, $window, $dialog, board) {

    $scope.boardInfo = board.data; // the resolve from the routeProvider
    console.log($scope.boardInfo);

    function boardComponentsContain(componentName, productName) {
      for(var i = 0; i < $scope.boardInfo.board.components.length ; i++){
        if($scope.boardInfo.board.components[i].component === componentName &&
          $scope.boardInfo.board.components[i].product === productName){
          return true;
        }
      }
      return false;
    }
    // For the editing board sidebar to edit components
    Bugzilla.getConfig()
      .success(function (data) {
        var components = {};
        var componentsKeys = [];
        var products = data.product;
        for(var productName in products) {
          for(var componentName in products[productName].component) {
            components[productName + ': ' + componentName] = {component: componentName, product: productName};
            if(!boardComponentsContain(componentName, productName)){
              componentsKeys.push(productName + ': ' + componentName);
            }
          }
        }
        $scope.componentsKeys = componentsKeys;
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

    $scope.updateBoard = function (data) {
      if(safeWaitFlag) {
        Boards.update($scope.boardInfo.board.id, data)
          .success(function (respData) {
            console.log(respData);
          });
      }
    };

    $scope.addComponent = function () {
      var index = $scope.componentsKeys.indexOf($scope.newComponent);
      var componentObject = $scope.components[$scope.newComponent];
      if(index >= 0) {
        $scope.componentsKeys.splice(index, 1);
      }
      $scope.boardInfo.board.components.push(componentObject);
      $scope.newComponent = '';
      Boards.addComponent($scope.boardInfo.board.id, componentObject)
        .success(function (data) {
          console.log(data);
        });
    };

    $scope.removeComponent = function (removedComponent) {
      $scope.componentsKeys.push(removedComponent.product + ': ' + removedComponent.component);
      for(var i = 0; i < $scope.boardInfo.board.components.length ; i++){
        if($scope.boardInfo.board.components[i] === removedComponent) {
          $scope.boardInfo.board.components.splice(i, 1);
          break;
        }
      }
      Boards.removeComponent($scope.boardInfo.board.id, removedComponent)
        .success(function (data) {
          console.log(data);
        });
    };

    $scope.newBug = function () {
      var url = Bugzilla.getPostBugPageForComponent($scope.boardInfo.board.components[0]);
      window.open(url, '_blank');
    };

    // watch individual changes, and only send those changes to be updated
    // $scope.$watch fires immediately, so the safeWaitFlag is so the update
    // function knows not to send the PUT immediately.
    var safeWaitFlag = false;
    setTimeout(function() {
      safeWaitFlag = true;
    }, 1);
    $scope.$watch('boardInfo.board.name', function (data) {
      $scope.updateBoard({name: data});
    });
    $scope.$watch('boardInfo.board.description', function (data) {
      $scope.updateBoard({description: data});
    });

    $scope.$on('$destroy', function () {
      console.log('board destroyed');
    });

  }]);
