/* global angular: false */
/**
 * WinchJS Master - This add the listeners to the page to handle scrolling, and resizing
 *
 * This is designed to lazy load images in an AngularJS application
 * Written by Sean Cady
 */
angular.module('winch')
/**
 * This is the master directive.  It attaches all with windows listeners
 * Ex:
 * <div data-winch-master></div>
 */
  .directive('winchMaster', ['$window', '$timeout', 'winchFactory', 'Throttle',
    function($window, $timeout, winchFactory, Throttle) {
      return {
        restrict: 'AE',
        link: function(scope, elem, attr) {
          var window = angular.element($window),
            elems, index;

          scope._scrollObjects = [window];

          //If a list is provided of selectors setup additional scroll events.
          if (attr.winchMaster) {
            attr.winchMaster.split(',').forEach(function(selector) {
              elems = $window.document.querySelectorAll(selector);
              for (index = 0; index < elems.length; index += 1) {
                scope._scrollObjects.push(angular.element(elems[index]));
              }
            });
          }

          //Function to setup scrollers based on scrollObjects
          scope.setupScrollers = function() {
            //Setup scroll events
            scope._scrollObjects.forEach(function(scrollTarget) {
              scrollTarget.on('scroll', function() {
                scope.triggerValidation();
              });
            });
          };

          scope.setupScrollers();

          //Setup window listener on resize
          window.on('resize', function() {
            setWindowView();
            scope.triggerValidation();
          });

          //setup destroy listener to remove bindings
          scope.$on('$destroy', function() {
            scope._scrollObjects.forEach(function(scrollTarget) {
              scrollTarget.off('scroll');
            });
          });

          /**
           * Stores the current window dimensions
           */
          function setWindowView() {
            winchFactory.setWindowView(
              $window.innerHeight,
              $window.innerWidth
            );
          }

          /**
           * Trigger a page validation, throttled
           */
          scope.triggerValidation = function() {
            Throttle.throttle(winchFactory.triggerValidation, 100);
          };

          //Set window view on load
          setWindowView();

          $timeout(function() {
            scope.triggerValidation();
          }, 100);
        }
      };
    }]);
