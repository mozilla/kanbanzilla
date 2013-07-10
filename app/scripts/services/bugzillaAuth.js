'use strict';

angular.module('kanbanzillaApp')
  .factory('bugzillaAuth', [function () {
    // this service should actually handle the logic
    // to authenticate users and remember that information
    // the bugzillaAuthInterceptor should use this service
    // to find out if and what to inject into requests

    function persist () {
      localStorage.setItem('user', JSON.stringify(user));
    }

    function readFromPersisted () {
      return JSON.parse(localStorage.getItem('user')) || {username: '', password: '', loggedIn: false};
    }

    var user = readFromPersisted();

    return {

      login: function (username, password) {
        user.username = username;
        user.password = password;
        user.loggedIn = true;
        persist();
      },

      logout: function () {
        user.username = '';
        user.password = '';
        user.loggedIn = false;
        persist();
      },

      isUserLoggedIn: function () {
        return user.loggedIn;
      },

      getUser: function () {
        return user;
      }

    };
  }]);
