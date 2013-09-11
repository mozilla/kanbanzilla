'use strict';

angular.module('kanbanzillaApp')
  .factory('globalErrorHandling', ['$q', '$notification', function ($q, $notification) {

    function extractMessage (response) {
      var message = {title: 'Ok', body: 'Something went wrong!'};
      var el = angular.element(response);
      console.log(el);
      message.title = el[3].innerHTML;
      message.body = el[5].innerHTML;
      return message;
    }

    function successHandler (successResponse) {
      return successResponse;
    }

    function errorHandler (errorResponse) {
      var msg = extractMessage(errorResponse.data);
      $notification.error(msg.title, msg.body);
      console.log(errorResponse);
      return $q.reject(errorResponse);
    }

    return function(promise) {
      return promise.then(successHandler, errorHandler);
    };
  }]);