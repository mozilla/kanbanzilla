'use strict';

angular.module('kanbanzillaApp')
  .factory('bugzillaAuth', function () {
    // this service should actually handle the logic
    // to authenticate users and remember that information
    // the bugzillaAuthInterceptor should use this service
    // to find out if and what to inject into requests
    var user = {};
    user.username = '';
    user.password = '';
    user.loggedIn = false;

    return {

      login: function (username, password) {
        user.username = username;
        user.password = password;
      },

      isUserLoggedIn: function () {
        return user.loggedIn;
      },

      getUser: function () {
        return user;
      }

    };
  });
