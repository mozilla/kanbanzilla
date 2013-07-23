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
        BASE_URL = PROD_URL;
        // BASE_URL = TEST_URL;

    var cache = {};

    // $http.defaults.headers.jsonp['Content-Type'] = 'application/json';
    // $http.defaults.headers.jsonp['Accept'] = 'application/javascript';


    return {

      getConfig: function () {
        console.log('getting /config');
        // return $http.get(BASE_URL + '/configuration/', {cache: true});
        return $http.get('config.json');
      },

      getProducts: function () {
        var deferred = $q.defer();
        deferred.promise.success = deferred.promise.then;

        if(cache.products) {
          console.log('grabbing from cache');
          $timeout(function() {
            deferred.resolve(cache.products);
          },1);
        }
        else {
          $http.get(BASE_URL + '/configuration')
            .success(function (data) {
              var products = [];
              for(var product in data.product) {
                products.push(product);
              }
              cache.products = products;
              deferred.resolve(products);
            })
            .error(function(data){
              deferred.resolve(data);
            });
        }
        return deferred.promise;
      },

      getAllComponents: function () {
        $http.get(BASE_URL + '/configuration')
          .success(function (data) {
            console.log(data);
          });
      },

      getComponentsForProduct: function () {

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
        return $http({
          method: 'GET',
          url: BASE_URL + '/bug',
          params: searchParams
        });
      },

      getBugsWithType: function (searchParams, type, id) {
        searchParams[type] = id;
        return $http({
          method: 'GET',
          url: BASE_URL + '/bug',
          params: searchParams,
          config: {cache: true}
        });
      },

      getBug: function (id) {
        // - /bug/<id> GET
        return $http.get(BASE_URL + '/bug/' + id);
      },

      countBugs: function (searchParams) {
        // - /count GET
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
        // - /bug/<id>/comment GET
        return $http.get(BASE_URL + '/bug/' + id + '/comment', {cache: true});
      },

      postComment: function (bugId, data) {
        // - /bug/<id>/comment POST
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

      attemptLogin: function(name, pass) {
        return $http({
          method: 'GET',
          url: BASE_URL + '/user',
          params: {
            match: name,
            username: name,
            password: pass
          }
        });
      }

    };
  }]);
