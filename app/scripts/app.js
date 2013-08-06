'use strict';

angular.module('kanbanzillaApp', ['ui.select2', 'ui.bootstrap', 'ui.sortable', 'ngCookies'])
  .config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/settings', {
        templateUrl: 'views/settings.html',
        controller: 'SettingsCtrl'
      })
      .when('/board/new', {
        templateUrl: 'views/newboard.html',
        controller: 'NewboardCtrl'
      })
      .when('/board/:type/:id', {
        templateUrl: 'views/board.html',
        controller: 'BoardCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

    // $httpProvider.interceptors.push('bugzillaAuthInterceptor');
  }]);
