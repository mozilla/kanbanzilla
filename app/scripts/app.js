'use strict';

angular.module('kanbanzillaApp', ['ui.select2', 'ui.bootstrap', 'ui.sortable', 'ngCookies'])
  .config(['$routeProvider', '$httpProvider', '$locationProvider', function ($routeProvider, $httpProvider, $locationProvider) {

    $locationProvider.html5Mode(true).hashPrefix('!');

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
      .when('/board/:id', {
        templateUrl: 'views/board.html',
        controller: 'BoardCtrl',
        resolve: {
          board: ['$route', 'Boards', function ($route, Boards) {
            return Boards.get($route.current.params.id);
          }]
        }
      })
      .otherwise({
        redirectTo: '/'
      });
    // $httpProvider.interceptors.push('bugzillaAuthInterceptor');
  }])
  .run(['$rootScope', '$location', function ($rootScope, $location) {

    $rootScope.routeLoading = false;

    $rootScope.$on('$routeChangeStart',
      function () {
      $rootScope.routeLoading = true;
      console.log('starting route change');
    });

    $rootScope.$on('$routeChangeSuccess',
      function () {
      $rootScope.routeLoading = false;
      console.log('route changed successfully');
    });

    $rootScope.$on('$routeChangeError',
      function () {
      console.log('route failed');
      $location.path('/');
    });

  }]);
