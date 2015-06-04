/* global angular: false */
/**
 * WinchJS Filter - Creates easy way to convert existing html snippets to use winchJS
 *
 * Written by Sean Cady
 */
angular.module('winch')
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
