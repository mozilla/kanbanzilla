'use strict';

angular.module('kanbanzillaApp')
  .factory('ColumnMap', [function column() {
    // Bit of a hack to let the board revert drag/drops on filtered lists
    // Let's other controllers grab column directive controllers by name and call their methods
    // Was implemented because of bug 915443 and the need to give the sortable
    // knowledge about both the filtered model as well as the unaltered one
    var columns = {};
    return {
      debug: function () {
        console.log(columns);
      },
      registerColumn: function (colName, colScope) {
        columns[colName] = colScope;
      },
      getColumn: function (colName) {
        return columns[colName];
      },
      wipeColumns: function () {
        columns = {};
      }
    };
  }]);
