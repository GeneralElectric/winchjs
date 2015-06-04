/* global angular: false */
/**
 * WinchJS Throttle - This handles for the throttling of multiple calls.
 *
 * Written by Sean Cady
 */
angular.module('winch')
/**
 * Throttle service
 */
  .service('Throttle', ['$q', '$timeout', function($q, $timeout) {
    var pending = {};

    /**
     * Is function currently pending
     * @param fn
     * @returns {boolean}
     */
    function isPending(fn) {
      return pending.hasOwnProperty(fn);
    }

    /**
     * Clear a function
     * @param fn
     */
    function clearPending(fn) {
      delete pending[fn];
    }

    /**
     * Get a currently pending function
     * @param fn
     * @returns promise
     */
    function getPending(fn) {
      return pending[fn];
    }

    /**
     * Store function
     * @param fn
     * @param defer
     */
    function storePending(fn, defer) {
      pending[fn] = defer;
    }

    return {
      /**
       * Function that merges all the same calls into the first for the delay specified
       * @param fn
       * @param delay
       * @returns promise
       */
      throttle: function(fn, delay) {
        var deferred = $q.defer();

        //Check if Delay is valid, if not default to 100ms
        delay = parseInt(delay, 10);
        if (delay <= 0) {
          delay = 100;
        }

        if (typeof fn === 'function') {
          if (isPending(fn)) {
            //return existing promise
            return getPending(fn).promise;
          } else {
            $timeout(function() {
              fn();
              deferred.resolve();
              //remove it
              clearPending(fn);
            }, delay);
            //store promise
            storePending(fn, deferred);
            return deferred.promise;
          }
        } else {
          deferred.reject('Not a Function');
          return deferred.promise;
        }
      }
    };
  }]);
