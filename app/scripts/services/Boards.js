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
        if(!newBoard.hasOwnProperty('components')){
          newBoard.components = [];
        }
        if(!newBoard.hasOwnProperty('columns')){
          newBoard.columns = [];
        }
        $http.post('/api/board', newBoard);
        return newBoard;
      },

      get: function (id) {
        return $http.get('/api/board/' + id);
      },

      getAllBoards: function () {
        return $http.get('/api/board');
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
