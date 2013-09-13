'use strict';

angular.module('kanbanzillaApp')
  .controller('BoardCtrl',
          ['$scope', '$location', '$q','Bugzilla', 'Boards', '$routeParams', '$window', '$dialog', 'board', '$notification', '$route', 'bugzillaAuth', '$timeout', 'ColumnMap',
  function ($scope,   $location,   $q,  Bugzilla,   Boards,   $routeParams,   $window,   $dialog,   board,   $notification,   $route,   bugzillaAuth,   $timeout,   ColumnMap) {

    // Remembers the last move to be able to revert back
    var revertInfo = {
      index: undefined,
      column: undefined
    };

    $scope.boardInfo = board.data; // the resolve from the routeProvider
    $scope.user = bugzillaAuth.getUser();
    console.log($scope.boardInfo);
    // ui-sortable options, placeholder is a class, and helper clone disables
    // the click event from firing when dropping cards.
    $scope.sortableOptions = {
      placeholder: 'proxy-card',
      connectWith: '[ui-sortable]',
      helper: 'clone',
      revert: 100,
      receive: receiveHandler,
      start: startHandler
    };

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
            // don't include components that are already a part of the board.
            if(!boardComponentsContain(componentName, productName)){
              componentsKeys.push(productName + ': ' + componentName);
            }
          }
        }
        $scope.componentsKeys = componentsKeys;
        $scope.components = components;
      });

    function getColumn (name) {
      // just gets the data model, not the directive
      for (var i = 0 ; i < $scope.boardInfo.columns.length ; i++){
        if($scope.boardInfo.columns[i].name === name) {
          return $scope.boardInfo.columns[i];
        }
      }
    }

    // Use this function rather than the Bugzilla.updateBug method
    // as this one also reverts changes on error.
    function updateBug(bug, data, dropColumn) {
      Bugzilla.updateBug(bug.id, data)
        .error(function () {
          revert(bug, dropColumn);
        });
    }

    function revert (bug, dropColumn) {
      ColumnMap.getColumn(revertInfo.column.name).insertBug(bug, revertInfo.index);
      ColumnMap.getColumn(dropColumn.name).removeBug(bug);
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
        // Bugzilla.updateBug(bug.id, { status: column.statuses[0] });
        updateBug(bug, { status: column.statuses[0] }, column);
      }
      else {
        // Bugzilla.updateBug(bug.id, { whiteboard: columnName });
        updateBug(bug, { whiteboard: columnName }, column);
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

      // the cases where there is more than one status/resolution to pick take another step
      if(open){
        dropModalDialog.open().then(function (result) {
          if(result.action === 'submit'){
            updateBug(bug, result.data, column);
          }
          else if (result.action === 'close'){
            revert(bug, column);
          }
        });
      }
    }

    function startHandler (data, ui) {
      var columnName = data.target.parentNode.parentNode.attributes['display-title'].nodeValue;
      var column = getColumn(columnName);
      revertInfo.column = column;
      revertInfo.index = ui.item.sortable.index; // index of the bug in the column
    }

    function updateBoardWith (data) {
      console.log(data);
    }


    $scope.refresh = function () {
      $route.reload();
    };

    $scope.poll = function () {
      // Boards.getUpdates($scope.boardInfo.board.id, $scope.boardInfo.latest_change_time)
      //   .success(function (data) {
      //     if(data.latest_change_time !== undefined) {
      //       console.log('theres been an update');
      //       updateBoardWith(data);
      //     }
      //     else {
      //       console.log('no update');
      //     }
      //   });
    };

    $scope.updateBoard = function (data) {
      if(safeWaitFlag) {
        Boards.update($scope.boardInfo.board.id, data)
          .success(function (respData) {
            $notification.success('Saved', 'Your board has been updated');
            console.log(respData);
          });
      }
    };


    $scope.newBug = function () {
      var url = Bugzilla.getPostBugPageForComponent($scope.boardInfo.board.components[0]);
      window.open(url, '_blank');
    };



    // Sidebar/Settings Methods
    $scope.addComponent = function () {
      // remove from those that can be selected
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
      // put component back into those that can be selected
      $scope.componentsKeys.push(removedComponent.product + ': ' + removedComponent.component);
      // immediate client-side removal
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

    /**
     * watch individual changes and only send those changes to be updated
     * $scope.$watch fires immediately, so the safeWaitFlag prevents the $watch
     * from sending an update on board load when no update has actually happened.
     */
    var safeWaitFlag = false;
    setTimeout(function() { safeWaitFlag = true; }, 1);

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
