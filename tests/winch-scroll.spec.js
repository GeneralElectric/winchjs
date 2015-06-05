/**
 * Unit Tests for the WinchJS Scroll Trigger Directive
 */
var expect = chai.expect;

describe('WinchJS Scroll Trigger Directive', function() {
  'use strict';

  var winchFactory, Throttle, $scope, $rootScope, $compile, $q, $timeout, html, element, isolateScope;

  beforeEach(module('winch'));

  beforeEach(module(function($provide) {
    winchFactory = function() {
      return {
        triggerValidation: function() {
        }
      };
    };
    Throttle = function() {
      return {
        throttle: function() {
          var deferred = $q.defer();
          return deferred.promise;
        }
      };
    };
    // Register services
    $provide.factory('winchFactory', winchFactory);
    $provide.service('Throttle', Throttle);
  }));

  beforeEach(inject(function($injector) {
    $rootScope = $injector.get('$rootScope');
    $scope = $rootScope.$new();
    $compile = $injector.get('$compile');
    $q = $injector.get('$q');
    $timeout = $injector.get('$timeout');
  }));

  beforeEach(function() {
    html = angular.element('<div winch-scroll-trigger></div>');
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

  function compile(htmlString, scope) {
    return $compile(htmlString)(scope);
  }

  it('should compile and add functions', function() {
    element = compile(html, $scope);
    isolateScope = element.isolateScope();
    expect(isolateScope.triggerValidation).to.be.a('function');
  });

  it('should trigger validation on scroll and transition', function() {
    element = compile(html, $scope);
    isolateScope = element.isolateScope();
    isolateScope.triggerValidation = chai.spy(isolateScope.triggerValidation);

    var event = document.createEvent('Event');
    //Test Scroll
    event.initEvent('scroll', true, true);
    element[0].dispatchEvent(event);
    expect(isolateScope.triggerValidation).to.have.been.called.exactly(1);

    //Test transitionend webkitTransitionEnd oTransitionEnd
    event.initEvent('transitionend', true, true);
    element[0].dispatchEvent(event);
    expect(isolateScope.triggerValidation).to.have.been.called.exactly(2);

    //Test transitionstart webkitTransitionStart oTransitionStart
    event.initEvent('transitionstart', true, true);
    element[0].dispatchEvent(event);
    expect(isolateScope.triggerValidation).to.have.been.called.exactly(3);
  });

  it('should handle adding events to selectors, and listening for events', function() {
    html = angular.element('<div winch-scroll-trigger=".test-scroll"><div class="test-scroll"></div>' +
      '<div class="no-test-scroll"></div></div>');

    addTestZone(html[0]);
    element = compile(html, $scope);
    isolateScope = element.isolateScope();
    $timeout.flush();

    expect(isolateScope._scrollObjects.length).to.be.equal(2);

    isolateScope.triggerValidation = chai.spy(isolateScope.triggerValidation);
    var event = document.createEvent('Event');
    //Test Scroll on target
    event.initEvent('scroll', false, true);
    document.querySelector('#test-zone div.test-scroll').dispatchEvent(event);
    $scope.$digest();

    expect(isolateScope.triggerValidation).to.have.been.called.exactly(1);
  });

  it('should clean up listeners on destroy', function() {
    html = angular.element('<div winch-scroll-trigger=".test-scroll"><div class="test-scroll"></div>' +
      '<div class="no-test-scroll"></div></div>');

    addTestZone(html[0]);
    element = compile(html, $scope);
    isolateScope = element.isolateScope();
    $timeout.flush();

    isolateScope._scrollObjects[0].off = chai.spy(isolateScope._scrollObjects[0].off);
    isolateScope._scrollObjects[1].off = chai.spy(isolateScope._scrollObjects[1].off);

    $scope.$destroy();

    expect(isolateScope._scrollObjects[0].off).to.have.been.called();
    expect(isolateScope._scrollObjects[1].off).to.have.been.called();
  });

  it('should handle a bad selector', function() {
    html = angular.element('<div winch-scroll-trigger="#bad\'selector"></div>');

    addTestZone(html[0]);

    expect(function() {
      element = compile(html, $scope);
      $timeout.flush();
    }).to.throw('Error during scroller selection, most likely a bad selector');
  });
});

