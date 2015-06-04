/* jshint mocha: true */
/* global chai: false, inject: false, angular: false, module: false, window: false, document: false */

/**
 * Unit Tests for the WinchJS Filter
 */
var expect = chai.expect;

describe('Winchify Filter', function() {
  'use strict';

  var $filter;

  beforeEach(module('winch'));

  beforeEach(inject(function($injector) {
    $filter = $injector.get('$filter');
  }));

  it('filter img tags', function() {
    expect($filter('winchify')('<img src="http://foobar.com/image.png">')).to.be
      .equal('<winch-img src="http://foobar.com/image.png"></winch-img>');
    expect($filter('winchify')('<IMG src="http://foobar.com/image.png">')).to.be
      .equal('<winch-img src="http://foobar.com/image.png"></winch-img>');
  });

  it('should filter img inside other tags', function() {
    expect($filter('winchify')('<div><span><img src="http://foobar.com/image.png"></span></div>')).to.be
      .equal('<div><span><winch-img src="http://foobar.com/image.png"></winch-img></span></div>');
  });

  it('should handle more than one image', function() {
    expect($filter('winchify')(
      '<IMG src="http://foobar.com/image.png">' +
      '<img src="http://foobar.com/image2.png">'
    )).to.be.equal(
      '<winch-img src="http://foobar.com/image.png"></winch-img>' +
      '<winch-img src="http://foobar.com/image2.png"></winch-img>'
    );
  });

  it('filter skip non-img tags', function() {
    expect($filter('winchify')('<a href="http://foobar.com/image.png">stuff</a>')).to.be
      .equal('<a href="http://foobar.com/image.png">stuff</a>');
  });

  it('should handle ng-src', function() {
    expect($filter('winchify')('<img data-ng-src="http://foobar.com/image.png">')).to.be
      .equal('<winch-img data-img-src="http://foobar.com/image.png"></winch-img>');
  });
});
