'use strict';

angular.module('kanbanzillaApp')
  .factory('bugzillaAuth', ['$cookies', '$http', function ($cookies, $http) {
    // this service should actually handle the logic
    // to authenticate users and remember that information
    // the bugzillaAuthInterceptor should use this service
    // to find out if and what to inject into requests


    function readFromPersisted () {
      if($cookies.token !== undefined && $cookies.username !== undefined) {
        return { username: $cookies.username.replace(/\"/g, ''), loggedIn: true };
      }
      else {
        return { username: '', loggedIn: false };
      }
    }

    function removeCookies () {
      return $http.post('/api/logout', {confirm: true});
    }

    var user = readFromPersisted();

    return {

      login: function (username) {
        user.username = username;
        user.loggedIn = true;
      },

      logout: function () {
        user.username = '';
        user.loggedIn = false;
        removeCookies();
      },

      isUserLoggedIn: function () {
        return user.loggedIn;
      },

      getUser: function () {
        return user;
      }

    };
  }]);
