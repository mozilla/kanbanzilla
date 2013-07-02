'use strict';

angular.module('kanbanzillaApp')
  .factory('Bugzilla', ['$http', function($http) {

    var TEST_URL = 'https://api-dev.bugzilla.mozilla.org/test/1.3',
        PROD_URL = 'https://api-dev.bugzilla.mozilla.org/latest',
        BASE_URL = PROD_URL;

    // $http.defaults.headers.jsonp['Content-Type'] = 'application/json';
    // $http.defaults.headers.jsonp['Accept'] = 'application/javascript';


    return {

      authenticate: function (user, pass) {

      },

      /* BUGS=============== */

      getLink: function (id) {
        return 'https://bugzilla.mozilla.org/show_bug.cgi?id=' + id;
      },

      getAllBugs: function () {

      },

      getBug: function (id) {
        // - /bug/<id> GET
        return $http.get(BASE_URL + '/bug/' + id);
      },

      countBugs: function (searchParams) {
        // - /count GET
      },

      createBug: function (data) {
        // - /bug POST
      },

      updateBug: function (id, data) {
        // - /bug/<id> PUT
      },

      /* COMMENTS=========== */

      commentsForBug: function (id) {
        // - /bug/<id>/comment GET
      },

      postComment: function (bugId, data) {
        // - /bug/<id>/comment POST
      },

      /* HISTORY============= */

      getHistoryForBug: function (id) {
        // - /bug/<id>/history GET
      },

      /* FLAGS=============== */

      getFlagsForBug: function (id) {
        // - /bug/<id>/flag GET
      },

      /* ATTACHMENTS========= */

      getAttachmentsForBug: function (id) {
        // - /bug/<id>/attachment GET
      },

      postAttachment: function (bugId, data) {
        // - /bug/<id>/attachment POST
      },

      getAttachment: function (id) {
        // - /attachment/<id> GET
      },

      updateAttachment: function (id, data) {
        // - /attachment/<id> PUT
      },

      /* USERS============= */

      searchForUsers: function (query) {
        // - /user GET - requires authentication
      },

      getUser: function (id) {
        // - /user/<id> GET
      }

    };
  }]);
