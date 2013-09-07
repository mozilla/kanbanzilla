'use strict';

angular.module('kanbanzillaApp',
  ['ui.select2', 'ui.bootstrap', 'ui.sortable', 'ngCookies', 'notifications'])
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

    $httpProvider.responseInterceptors.push('globalErrorHandling');
  }])
  .run([     '$rootScope', '$location', '$timeout',
    function ($rootScope,  $location,    $timeout) {

    var routeLoadingDelay = 75, // time in ms to delay showing the route loading spinner
        routeLoadingTimeout;
    $rootScope.routeLoading = false;

    $rootScope.$on('$routeChangeStart',
      function () {
      routeLoadingTimeout = $timeout(function () {
        $rootScope.routeLoading = true;
      }, routeLoadingDelay);
    });

    $rootScope.$on('$routeChangeSuccess',
      function () {
      $timeout.cancel(routeLoadingTimeout);
      $rootScope.routeLoading = false;
    });

    $rootScope.$on('$routeChangeError',
      function () {
      $location.path('/');
    });

  }]);
