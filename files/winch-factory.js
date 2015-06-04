/* global angular: false */
/**
 * WinchJS Factory - Maintain state of winch
 *
 * Written by Sean Cady
 */
angular.module('winch')
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
  }]);
