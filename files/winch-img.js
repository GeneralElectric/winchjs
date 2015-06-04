/* global angular: false */
/**
 * WinchJS Image - Directive used to lazy load images
 *
 * Written by Sean Cady
 */
angular.module('winch')
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
    }]);
