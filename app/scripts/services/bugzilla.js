'use strict';

angular.module('kanbanzillaApp')
  .factory('Bugzilla', ['$http', '$q', '$timeout', function($http, $q, $timeout) {

    /**
     * Authentication handled from within the bugzillaAuthInterceptor.
     * It should intercept all http requests to the bugzilla rest api
     * and include the authenticated credentials with the request
     * leaving this service untouched.
     */

    var TEST_URL = 'https://api-dev.bugzilla.mozilla.org/test/latest',
        PROD_URL = 'https://api-dev.bugzilla.mozilla.org/latest',
        PROXY_URL = '/api',
        // BASE_URL = PROD_URL;
        // BASE_URL = TEST_URL;
        BASE_URL = PROXY_URL;

    var cache = {};

    // $http.defaults.headers.jsonp['Content-Type'] = 'application/json';
    // $http.defaults.headers.jsonp['Accept'] = 'application/javascript';


    return {

      getConfig: function () {
        console.log('getting /config');
        // return $http.get(BASE_URL + '/configuration/', {cache: true});
        return $http.get('config.json');
      },

      /* BUGS=============== */

      getLink: function (id) {
        return 'https://bugzilla.mozilla.org/show_bug.cgi?id=' + id;
      },

      getBugsForProduct: function (product) {
        console.log('/bug?product=' + product);
        return $http({
          method: 'GET',
          url: BASE_URL + '/bug',
          params: {'product': product}
        });
      },

      getBugs: function (searchParams) {
        searchParams['include_fields'] = 'summary,id,keywords,creator,component,creation_time,depends_on,last_change_time,severity,status,assigned_to';
        return $http({
          method: 'GET',
          url: BASE_URL + '/bug',
          params: searchParams,
          // cache: true
        });
      },

      getBugsWithType: function (searchParams, type, id) {
        searchParams[type] = id;
        searchParams['include_fields'] = 'summary,id,keywords,creator,component,creation_time,depends_on,last_change_time,severity,status,assigned_to';
        return $http({
          method: 'GET',
          url: BASE_URL + '/bug',
          params: searchParams,
          config: {cache: true}
        });
      },

      getBug: function (id) {
        return $http.get(BASE_URL + '/bug/' + id);
      },

      countBugs: function (searchParams) {
        return $http({
          method: 'GET',
          url: BASE_URL + '/count',
          params: searchParams
        });
      },

      createBug: function (data) {
        // - /bug POST
      },

      updateBug: function (id, data) {
        // - /bug/<id> PUT
      },

      /* COMMENTS=========== */

      getCommentsForBug: function (id) {
        return $http.get(BASE_URL + '/bug/' + id + '/comment', {cache: true});
      },

      postComment: function (bugId, data) {
        console.log('posting comment to ' + bugId + ' with text ' + data.text);
        return $http.post(BASE_URL + '/bug/' + bugId + '/comment', data);
      },

      /* HISTORY============= */

      getHistoryForBug: function (id) {
        // - /bug/<id>/history GET
        return $http.get(BASE_URL + '/bug/' + id + '/history');
      },

      /* FLAGS=============== */

      getFlagsForBug: function (id) {
        // - /bug/<id>/flag GET
        return $http.get(BASE_URL + '/bug/' + id + '/flag');
      },

      /* ATTACHMENTS========= */

      getAttachmentsForBug: function (id) {
        // - /bug/<id>/attachment GET
        return $http.get(BASE_URL + '/bug/' + id + '/attachment');
      },

      postAttachment: function (bugId, data) {
        // - /bug/<id>/attachment POST
      },

      getAttachment: function (id) {
        // - /attachment/<id> GET
        return $http.get(BASE_URL + '/attachment/' + id);
      },

      updateAttachment: function (id, data) {
        // - /attachment/<id> PUT
      },

      /* USERS============= */

      searchForUsers: function (query) {
        // - /user GET - requires authentication
        return $http({
          method: 'GET',
          url: BASE_URL + '/user',
          params: query
        });
      },

      getUser: function (id) {
        // - /user/<id> GET
        return $http.get(BASE_URL + '/user/' + id);
      },

      // attemptLogin: function(name, pass) {
      //   this.attemptServerLogin(name, pass);

      //   return $http({
      //     method: 'GET',
      //     url: BASE_URL + '/user',
      //     params: {
      //       match: name,
      //     }
      //   });
      // },

      attemptLogin: function (name, pass) {
        return $http.post(BASE_URL + '/login', {login: name, password: pass});
      }

    };
  }]);
