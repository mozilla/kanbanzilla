'use strict';

angular.module('kanbanzillaApp')
  .config(function ($provide) {
    $provide.decorator('$sniffer', function ($delegate) {
      $delegate.history = false;
      return $delegate;
    });
  });
