/* global angular: false */
/**
 * WinchJS
 *
 * This is designed to lazy load images in an AngularJS application
 * Written by Sean Cady
 */
angular.module('winch', [])
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
    }])
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
    }
  ])
/**
 * Replace img tag with winch-img
 * Ex:
 * <winch-img src="http://placehold.it/350x150"></winch-img>
 * <winch-img data-src="awesome.jpg"></winch-img>
 * <winch-img img-src="awesome2.jpg"></winch-img>
 * <winch-img data-img-src="awesome3.jpg" data-img-loaded="imageLoadedCallback"></winch-img>
 */
  .directive('winchImg', ['$compile', '$timeout', 'winchFactory',
    function($compile, $timeout, winchFactory) {
      return {
        priority: 0,
        restrict: 'AE',
        scope: {
          imgUrl: '&',
          imgLoaded: '&'
        },
        link: function(scope, elem, attr) {
          var img;
          //Add a not loaded class
          scope._isLoaded = false;
          elem.addClass('winch-img-not-loaded');

          /**
           * Register self in factory, if it fails 5 times load self
           */
          scope.registerImg = function(attempt) {
            if (!winchFactory.registerImg(
                scope.getImgURL(),
                scope.loadSelf,
                scope.isVisible)) {
              if (attempt < 5) {
                $timeout(function() {
                  scope.registerImg(attempt + 1);
                }, 1000);
              } else {
                scope.loadSelf();
              }
            }
          };

          /**
           * Check if image bottom is bellow window top
           * @param image
           * @param window
           * @returns {boolean}
           */
          function checkImageTop(image, window) {
            //Image bottom is below window top
            return ((image.bottom + window.vOffset) >= window.top);
          }

          /**
           * Check if image top is above window bottom
           * @param image
           * @param window
           * @returns {boolean}
           */
          function checkImageBottom(image, window) {
            //Image top is above bottom
            return ((image.top - window.vOffset) <= window.bottom);
          }

          /**
           * Check if the image is in view based on left box bounds
           * @param image
           * @param window
           * @returns {boolean}
           */
          function checkImageLeft(image, window) {
            //Image right is left of window left
            return ((image.right + window.hOffset) >= window.left);
          }

          /**
           * Check if the image is in view based on right box bounds
           * @param image
           * @param window
           * @returns {boolean}
           */
          function checkImageRight(image, window) {
            //Image left is right of window right
            return ((image.right - window.hOffset) <= window.right);
          }

          /**
           * Check if the image is bigger than the view port
           * @param image
           * @param window
           */
          function checkImageBiggerThanScreen(image, window) {
            return (image.left <= window.left - window.hOffset && image.right >= window.right + window.hOffset) ||
              (image.bottom >= window.bottom + window.vOffset && image.top <= window.top - window.vOffset);
          }

          /**
           * If image is visible return true.
           */
          scope.isVisible = function() {
            var imageBox = scope.boundingBox(),
              windowBox = winchFactory.getMasterBox();

            return checkImageBiggerThanScreen(imageBox, windowBox) ||
              (checkImageTop(imageBox, windowBox) &&
              checkImageBottom(imageBox, windowBox) &&
              checkImageLeft(imageBox, windowBox) &&
              checkImageRight(imageBox, windowBox));
          };

          /**
           * Load self trigger
           */
          scope.loadSelf = function() {
            if (!scope._isLoaded) {
              elem.addClass('winch-img-loaded').removeClass('winch-img-not-loaded');
              img = $compile('<img class="winch-img" data-ng-src="{{getImgURL()}}">')(scope);
              if (attr.winchImgClass) {
                angular.element(img).addClass(attr.winchImgClass);
              }
              elem.empty().append(img);
              scope._isLoaded = true;
              try {
                scope.imgLoaded();
              } catch (e) {
                //Eat error
              }

              $timeout(function() {
                scope.$destroy();
              }, 100);
            }
          };

          /**
           * Get Bounding box for image
           * Used for testing
           */
          scope.boundingBox = function() {
            return elem[0].getBoundingClientRect();
          };

          /**
           * Get image URL
           */
          scope.getImgURL = function() {
            if (scope.imgUrl && typeof scope.imgUrl() !== 'undefined') {
              return scope.imgUrl();
            }
            return attr.src || attr.imgSrc;
          };

          /**
           * If 'winch:validate' is received check if visible.  If visible
           * trigger URL load for all.
           */
          scope.$on('winch:validate', function() {
            if (scope.isVisible()) {
              scope.loadSelf();
              winchFactory.loadImage(scope.getImgURL());
            }
          });

          //Register image to start loading process
          scope.registerImg(1);
        }
      };
    }])
/**
 * Maintain state of winch
 */
  .factory('winchFactory', [function() {
    //Basic API structure
    var API = {
      _img: {}
    };

    /**
     * Register an image
     * @param URL
     * @param load
     * @param validate
     * @returns {boolean}
     */
    API.registerImg = function(URL, load, validate) {
      if (typeof load !== 'function') {
        return false;
      }
      if (typeof validate !== 'function') {
        return false;
      }
      if (typeof URL !== 'string' || URL.length < 1) {
        return false;
      }

      if (API._img.hasOwnProperty(URL)) {
        //If already loaded once (cached) trigger load immediately
        if (API._img[URL].loaded) {
          load();
        } else {
          API._img[URL].fnLoad.push(load);
          API._img[URL].fnValidate.push(validate);
        }
      } else {
        API._img[URL] = {
          fnLoad: [load],
          fnValidate: [validate],
          loaded: false
        };
      }
      return true;
    };

    /**
     * Load all images with the same URL
     * @param URL
     */
    API.loadImage = function(URL) {
      var index = 0, length;
      if (API._img.hasOwnProperty(URL)) {
        length = API._img[URL].fnLoad.length;
        for (index = 0; index < length; index += 1) {
          API._img[URL].fnLoad[index]();
        }
        API._img[URL] = {
          loaded: true,
          fnValidate: [],
          fnLoad: []
        };
      }
    };

    /**
     * Trigger validation of images
     * @param URL - optional
     */
    API.triggerValidation = function(URL) {
      var imageIndex, imageKeys, validationIndex, validationLength;
      if (URL && API._img[URL]) {
        for (validationIndex = 0; validationIndex < API._img[URL].fnValidate.length; validationIndex += 1) {
          if (API._img[URL].fnValidate[validationIndex]()) {
            API.loadImage(URL);
          }
        }
      } else if (!URL) {
        imageKeys = Object.keys(API._img);
        for (imageIndex = 0; imageIndex < imageKeys.length; imageIndex += 1) {
          validationLength = API._img[imageKeys[imageIndex]].fnValidate.length;
          for (validationIndex = 0; validationIndex < validationLength; validationIndex += 1) {
            if (API._img[imageKeys[imageIndex]].fnValidate[validationIndex] &&
              API._img[imageKeys[imageIndex]].fnValidate[validationIndex]()) {
              API.loadImage(imageKeys[imageIndex]);
            }
          }
        }
      }
    };

    /**
     * Store the current window Height and Width
     * @param height
     * @param width
     */
    API.setWindowView = function(height, width) {
      API.windowWidth = width;
      API.windowHeight = height;
    };

    /**
     * Return window width
     * @returns number
     */
    API.getWindowWidth = function() {
      return API.windowWidth;
    };

    /**
     * Return window height
     * @returns number
     */
    API.getWindowHeight = function() {
      return API.windowHeight;
    };

    /**
     * Returns an object of window bounding
     * @returns {{top: number, bottom: number, left: number, right: number, vOffset: number, hOffset: number}}
     */
    API.getMasterBox = function() {
      return {
        top: 0,
        bottom: API.windowHeight,
        left: 0,
        right: API.windowWidth,
        vOffset: 100,
        hOffset: 100
      };
    };
    return API;
  }])
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
        if (!(parseInt(delay, 10) > 0)) {
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
  }])
/**
 * winch Filter to convert HTML img tags to winch-img directives
 */
  .filter('winchify', function() {
    return function(html) {
      var openTag = '<img', openRgx,
        closeTag = '</img>', closeRgx,
        ngSrcAttr = 'ng-src',
        ngSrcRgx;
      openRgx = new RegExp(openTag, 'gi');
      closeRgx = new RegExp(closeTag, 'gi');
      ngSrcRgx = new RegExp(ngSrcAttr, 'gi');

      //Recursive functions for adding </img> tag after <img> tag
      function addCloseImg(string) {
        if (string.search(openRgx) > -1) {
          var location = string.indexOf('>', string.search(openRgx) + openTag.length);
          //Add Close Image tag
          return string.substr(0, location + 1) + '</img>' + addCloseImg(string.substr(location + 1));
        } else {
          //no image found - return remaining content
          return string;
        }
      }

      if (html.search(openRgx) > -1) { //Verify there is an image tag
        html = addCloseImg(html)
          .replace(openRgx, '<winch-img')
          .replace(ngSrcRgx, 'img-src')
          .replace(closeRgx, '</winch-img>');

        return html;
      } else {
        return html;
      }
    };
  });
