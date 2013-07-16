'use strict';

angular.module('kanbanzillaApp')
  .factory('Boards', [function () {

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
      create: function (name) {
        var newBoard = {
          id: ++boardCounter,
          name: name,
          components: [],
          columns: []
        };
        boards.push(newBoard);
        persist();
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

      remove: function (name) {

      },

      update: function (name, params) {
        // update existing params with the new ones
      },

      save: persist

    }

  }]);
