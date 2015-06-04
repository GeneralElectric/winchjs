/* jshint mocha: true */
/* global chai: false, inject: false, angular: false, module: false, window: false, document: false */

/**
 * Unit Tests for the WinchJS Master Directive
 */
var expect = chai.expect;

describe('WinchJS Master Directive', function() {
  'use strict';

  var $compile, $rootScope, $scope, $timeout, $q, $window, mockwinchFactory, mockThrottle, html, element;

  beforeEach(module('winch'));

  beforeEach(module(function($provide) {
    mockwinchFactory = {
      setWindowView: chai.spy(function() {
      }),
      triggerValidation: chai.spy(function() {
      })
    };

    mockThrottle = {
      throttle: chai.spy(function() {
      })
    };

    // Register our factories
    $provide.factory('winchFactory', function() {
      return mockwinchFactory;
    });

    $provide.service('Throttle', function() {
      return mockThrottle;
    });
  }));

  beforeEach(inject(function($injector) {
    $rootScope = $injector.get('$rootScope');
    $scope = $rootScope.$new();
    $compile = $injector.get('$compile');
    $q = $injector.get('$q');
    $timeout = $injector.get('$timeout');
    $window = $injector.get('$window');
  }));

  beforeEach(function() {
    html = angular.element('<div winch-master=""></div>');
  });

  function addTestZone(element) {
    var tz = document.createElement('div');
    tz.id = 'test-zone';
    document.body.appendChild(tz);
    tz.appendChild(element);
  }

  function clearTestZone() {
    var tz = document.getElementById('test-zone');
    if (tz) {
      tz.parentNode.removeChild(tz);
    }
  }

  afterEach(function() {
    clearTestZone();
  });

  /**
   * Compiles the HTML string into a Angular element
   * @param htmlString
   * @param scope
   * @returns {*}
   */
  function compile(htmlString, scope) {
    return $compile(htmlString)(scope);
  }

  it('should compile and have the correct scope setup', function() {
    element = compile(html, $scope);
    expect($scope.triggerValidation).to.be.a('function');
    expect($scope.setupScrollers).to.be.a('function');
    expect(mockThrottle.throttle).to.not.have.been.called();
    expect(mockwinchFactory.setWindowView).to.have.been.called();
    $timeout.flush();
    expect(mockThrottle.throttle).to.have.been.called();
    $timeout.verifyNoPendingTasks();

  });

  it('should add watchers to scroll targets', function() {
    html = angular.element(
      '<div class="parent"><div winch-master=".test-target"></div><div class="test-target"></div></div>'
    );
    addTestZone(html[0]);
    element = compile(html, $scope);

    $scope.triggerValidation = chai.spy($scope.triggerValidation);

    var event = document.createEvent('Event');
    //Test Scroll
    event.initEvent('scroll', true, true);
    document.querySelector('.test-target').dispatchEvent(event);

    expect($scope.triggerValidation).to.have.been.called();
  });

  it('should handle incorrect scroll targets', function() {
    html = angular.element(
      '<div class="parent"><div winch-master=".test-target2"></div><div class="test-target"></div></div>'
    );
    addTestZone(html[0]);
    element = compile(html, $scope);

    expect($scope._scrollObjects.length).to.be.equal(1);
  });

  it('should trigger validation on window resize', function() {
    element = compile(html, $scope);

    $scope.triggerValidation = chai.spy($scope.triggerValidation);

    var event = document.createEvent('Event');
    //Test Scroll
    event.initEvent('resize', true, true);
    window.dispatchEvent(event);

    expect($scope.triggerValidation).to.have.been.called();
  });

  it('should clean up on destroy', function() {
    html = angular.element(
      '<div class="parent"><div winch-master=".test-target"></div><div class="test-target"></div></div>'
    );
    addTestZone(html[0]);
    element = compile(html, $scope);

    $scope._scrollObjects[0].off = chai.spy($scope._scrollObjects[0].off);
    $scope._scrollObjects[1].off = chai.spy($scope._scrollObjects[1].off);

    $scope.$destroy();

    expect($scope._scrollObjects[0].off).to.have.been.called();
    expect($scope._scrollObjects[1].off).to.have.been.called();
  });
});
