'use strict';

angular.module('kanbanzillaApp')
  .factory('BugzillaMock', ['$q','$http', function($q,$http) {

    return {
      getBug: function () {
        return $http.get('35.json');
      },
      getAllBugs: function () {
        return $http.get('allbugs.json');
      },
      getLink: function (id) {
        return 'https://bugzilla.mozilla.org/show_bug.cgi?id=' + id;
      }
    };

  }]);
