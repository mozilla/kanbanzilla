'use strict';

angular.module('kanbanzillaApp')
  .factory('bugzillaAuthInterceptor', ['$q', 'bugzillaAuth', function ($q, bugzillaAuth) {

    function toBugzillaAPI (url) {
      if(url.indexOf('https://api-dev.bugzilla.mozilla.org') !== -1) {
        return true;
      }
      else {
        return false;
      }
    }

    function augmentRequestWithAuth (request) {
      if(toBugzillaAPI(request.url) && bugzillaAuth.isUserLoggedIn()) {
        var user = bugzillaAuth.getUser();
        request.params = request.params || {};
        request.params.username = user.username;
        request.params.password = user.password;
      }
    }

    return {
      'response': function (response) {
        return response;
      },
      'request': function (request) {
        augmentRequestWithAuth(request);
        console.log(request);
        return request;
      }
    };
  }]);
