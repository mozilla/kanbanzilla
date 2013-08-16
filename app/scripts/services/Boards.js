'use strict';

angular.module('kanbanzillaApp')
  .factory('Boards', ['$http', function ($http){
    return {
      create: function (newBoard) {
        if(!newBoard.hasOwnProperty('components')){
          newBoard.components = [];
        }
        if(!newBoard.hasOwnProperty('columns')){
          newBoard.columns = [];
        }
        return $http.post('/api/board', newBoard);
      },

      get: function (id) {
        return $http.get('/api/board/' + id);
      },

      getAllBoards: function () {
        return $http.get('/api/board');
      },

      getUpdates: function (id, lastChangeTime) {
        return $http.get('/api/board/' + id, {params: {'since': lastChangeTime}});
      },

      remove: function (id) {
        return $http({
          method: 'DELETE',
          url: '/api/board/' + id
        });
      },

      update: function (name, params) {
        // update existing params with the new ones
      }
    }

  }]);
