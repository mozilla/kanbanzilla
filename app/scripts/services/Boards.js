'use strict';

angular.module('kanbanzillaApp')
  .factory('Boards', ['$http', function ($http){

    function persist () {
      localStorage.setItem('boards', JSON.stringify(boards));
      localStorage.setItem('boardCounter', boardCounter);
    }

    function getFromPersisted () {
      return JSON.parse(localStorage.getItem('boards')) || [];
    }

    var boards = getFromPersisted();
    var boardCounter = localStorage.getItem('boardCounter') || 0;

    return {
      create: function (newBoard) {
        newBoard.id = ++boardCounter;
        if(!newBoard.hasOwnProperty('components')){
          newBoard.components = [];
        }
        if(!newBoard.hasOwnProperty('columns')){
          newBoard.columns = [];
        }
        $http.post('/api/board', newBoard);
        // boards.push(newBoard);
        // persist();
        return newBoard;
      },

      get: function (name) {
        for(var i = 0; i < boards.length ; i++){
          if(boards[i].name === name) {
            return boards[i];
          }
        }
      },

      getAllBoards: function () {
        return boards;
      },

      getById: function (id) {

      },

      remove: function (board) {
        boards.splice(boards.indexOf(board), 1);
        console.log(board);
        persist();
      },

      update: function (name, params) {
        // update existing params with the new ones
      },

      save: persist

    }

  }]);
