'use strict';

angular.module('kanbanzillaApp', ['ui.select2', 'ui.bootstrap', 'ui.sortable', 'ngCookies'])
  .config(['$routeProvider', '$httpProvider', '$locationProvider', function ($routeProvider, $httpProvider, $locationProvider) {

    $locationProvider.html5Mode(true).hashPrefix('!');

    // Where should the resolve definitions go? In the app file like this
    // or as a property of the controllers they belong to, inside their ctrl
    // files. I can see the merits of both.
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        resolve: {
          boardsResolve: ['Boards', function (Boards) {
            return Boards.getAllBoards();
          }]
        }
      })
      .when('/board/new', {
        templateUrl: 'views/newboard.html',
        controller: 'NewboardCtrl',
        resolve: {
          config: ['Bugzilla', function (Bugzilla) {
            return Bugzilla.getConfig();
          }]
        }
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
