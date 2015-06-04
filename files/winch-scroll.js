/* global angular: false */
/**
 * WinchJS Scroll Trigger - This allows for additional triggers on the page containers
 *
 * Written by Sean Cady
 */
angular.module('winch')
/**
 * Attach this directive to any element that the scroll should cause a re-validation
 * Ex:
 * <div data-winch-scroll-trigger></div>
 */
  .directive('winchScrollTrigger', ['winchFactory', 'Throttle', '$timeout',
    function(winchFactory, Throttle, $timeout) {
      return {
        restrict: 'A',
        scope: {
          winchScrollTrigger: '@'
        },
        link: function(scope, elem) {
          var elems, selectors, index, timerRef;

          scope._scrollObjects = [elem];

          /**
           * add Event listeners to target
           * @param target
           */
          function setup(target) {
            //Setup scroll listener to trigger validation
            target.on('scroll', function() {
              scope.triggerValidation();
            });

            //Listen for end of transition to trigger recheck
            target.on('transitionend webkitTransitionEnd oTransitionEnd', function() {
              scope.triggerValidation();
            });
            //Listen for start of transition to trigger recheck
            target.on('transitionstart webkitTransitionStart oTransitionStart', function() {
              scope.triggerValidation();
            });
          }

          /**
           * Remove event listeners from target
           * @param target
           */
          function tearDown(target) {
            target.off('scroll');
            target.off('transionend webkitTransitionEnd oTransitionEnd');
            target.off('transitionstart webkitTransitionStart oTransitionStart');
          }

          //If selector defined also watch on that
          if (scope.winchScrollTrigger) {
            selectors = scope.winchScrollTrigger.split(',');

            //Wait 300ms before setup event watchers to make sure paint occurs
            timerRef = $timeout(function() {
              try {
                selectors.forEach(function(selector) {
                  elems = elem[0].querySelectorAll(selector);
                  for (index = 0; index < elems.length; index += 1) {
                    scope._scrollObjects.push(angular.element(elems[index]));
                  }
                });
              } catch (e) {
                throw new Error('Error during scroller selection, most likely a bad selector:',
                  scope.winchScrollTrigger);
              }
              //Loop through all additional scroll objects and setup event listeners
              for (index = 1; index < scope._scrollObjects.length; index += 1) {
                setup(scope._scrollObjects[index]);
              }
            }, 300);
          }

          setup(scope._scrollObjects[0]);

          /**
           * Trigger a page validation, throttled
           */
          scope.triggerValidation = function() {
            Throttle.throttle(winchFactory.triggerValidation, 100);
          };

          //setup destroy listener to remove bindings
          scope.$on('$destroy', function() {
            $timeout.cancel(timerRef);
            for (index = 0; index < scope._scrollObjects.length; index += 1) {
              tearDown(scope._scrollObjects[index]);
            }
          });
        }
      };
    }]);
