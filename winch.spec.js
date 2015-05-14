/* jshint mocha: true*/
/* global chai: false */
/* global inject: false */

/**
 *
 */
'use strict';
var expect = chai.expect;

describe('winchJS Unit Tests', function() {
  describe('State Factory', function() {
    var winchFactory;

    beforeEach(module('winch'));

    beforeEach(inject(function($injector) {
      winchFactory = $injector.get('winchFactory');
    }));

    it('should have the correct API functions', function() {
      expect(winchFactory.registerImg).to.be.a('function');
      expect(winchFactory.loadImage).to.be.a('function');
      expect(winchFactory.triggerValidation).to.be.a('function');
      expect(winchFactory.setWindowView).to.be.a('function');
      expect(winchFactory.getWindowWidth).to.be.a('function');
      expect(winchFactory.getWindowHeight).to.be.a('function');
      expect(winchFactory.getMasterBox).to.be.a('function');
    });

    it('should allow Img to be registered', function() {

      var testUrl = 'http://foo.com/bar.png',
        fnLoad = function() {
        },
        fnLoad2 = function() {
        },
        fnValidate = function() {
        },
        fnValidate2 = function() {
        };

      winchFactory.registerImg(testUrl, fnLoad, fnValidate);

      expect(winchFactory._img.hasOwnProperty(testUrl)).to.be.true;
      expect(winchFactory._img[testUrl].loaded).to.be.false;
      expect(winchFactory._img[testUrl].fnLoad[0]).to.be.equal(fnLoad);
      expect(winchFactory._img[testUrl].fnValidate[0]).to.be.equal(fnValidate);

      winchFactory.registerImg(testUrl, fnLoad2, fnValidate2);

      expect(winchFactory._img[testUrl].fnLoad[1]).to.be.equal(fnLoad2);
      expect(winchFactory._img[testUrl].fnValidate[1]).to.be.equal(fnValidate2);
    });

    it('should trigger load if already loaded', function() {
      var testUrl = 'http://foo.com/bar.png',
        fnLoad = function() {
        },
        fnLoad2 = chai.spy(function() {
        }),
        fnValidate = function() {
        },
        fnValidate2 = function() {
        };

      winchFactory.registerImg(testUrl, fnLoad, fnValidate);

      winchFactory._img[testUrl].loaded = true;

      winchFactory.registerImg(testUrl, fnLoad2, fnValidate2);

      expect(fnLoad2).to.have.been.called();
    });

    it('should enforce data type requirements for registering and image', function() {
      expect(winchFactory.registerImg()).to.be.false;
      expect(winchFactory.registerImg('test')).to.be.false;
      expect(winchFactory.registerImg('test',
        function() {
        }
      )).to.be.false;
      expect(winchFactory.registerImg({},
        function() {
        },
        function() {
        }
      )).to.be.false;
      expect(winchFactory.registerImg({}, 'test',
        function() {
        }
      )).to.be.false;
      expect(winchFactory.registerImg({},
        function() {
        }, 'test')).to.be.false;
    });

    it('should set and get window dimensions', function() {
      winchFactory.setWindowView(123, 456);
      expect(winchFactory.getWindowWidth()).to.equal(456);
      expect(winchFactory.getWindowHeight()).to.equal(123);
      expect(winchFactory.getMasterBox().top).to.equal(0);
      expect(winchFactory.getMasterBox().bottom).to.equal(123);
      expect(winchFactory.getMasterBox().left).to.equal(0);
      expect(winchFactory.getMasterBox().right).to.equal(456);
      expect(winchFactory.getMasterBox().vOffset).to.equal(100);
      expect(winchFactory.getMasterBox().hOffset).to.equal(100);
    });

    it('should load all images by URL', function() {
      var img1 = {
          url: 'http://foo.bar',
          load: chai.spy(function() {
          }),
          validation: function() {
          }
        },
        img2 = {
          url: 'http://foo.bar',
          load: chai.spy(function() {
          }),
          validation: function() {
          }
        };

      winchFactory.registerImg(img1.url, img1.load, img1.validation);
      winchFactory.registerImg(img2.url, img2.load, img2.validation);

      expect(img1.load).not.to.have.been.called();
      expect(img2.load).not.to.have.been.called();

      //Not a matching URL, but close
      winchFactory.loadImage('foo.bar');

      expect(img1.load).not.to.have.been.called();
      expect(img2.load).not.to.have.been.called();

      winchFactory.loadImage('http://foo.bar');

      expect(img1.load).to.have.been.called();
      expect(img2.load).to.have.been.called();
    });

    it('should trigger validation by URL', function() {
      var img1 = {
          url: 'http://foo1.bar',
          load: function() {
          },
          validation: chai.spy(function() {
            return true;
          })
        },
        img2 = {
          url: 'http://foo2.bar',
          load: function() {
          },
          validation: chai.spy(function() {
            return true;
          })
        },
        img3 = {
          url: 'http://foo3.bar',
          load: function() {
          },
          validation: chai.spy(function() {
            return false;
          })
        };

      winchFactory.registerImg(img1.url, img1.load, img1.validation);
      winchFactory.registerImg(img2.url, img2.load, img2.validation);
      winchFactory.registerImg(img3.url, img3.load, img3.validation);

      winchFactory.triggerValidation('foo.bar');
      expect(img1.validation).to.be.spy;
      expect(img1.validation).to.not.have.been.called();
      expect(img2.validation).to.not.have.been.called();
      expect(img3.validation).to.not.have.been.called();

      winchFactory.triggerValidation('http://foo1.bar');
      expect(img1.validation).to.have.been.called();
      expect(img2.validation).not.to.have.been.called();
      expect(img3.validation).not.to.have.been.called();

      winchFactory.triggerValidation('http://foo3.bar');
      expect(img3.validation).to.have.been.called();

      winchFactory.triggerValidation();
      //Unregistered on last run
      expect(img1.validation).to.have.been.called.once();
      expect(img2.validation).to.have.been.called();
      expect(img3.validation).to.have.been.called();
    });
  });

  describe('Throttle Service', function() {
    var Throttle, $timeout;

    beforeEach(module('winch'));

    beforeEach(inject(function($injector) {
      Throttle = $injector.get('Throttle');
      $timeout = $injector.get('$timeout');
    }));

    it('should have the correct API functions', function() {
      expect(Throttle.throttle).to.be.a('function');
    });

    it('should delay and then call the service', function() {
      var fnTest = chai.spy(function() {
      });

      Throttle.throttle(fnTest, 10);
      $timeout.flush(9);
      expect(fnTest).not.to.have.been.called();
      $timeout.flush();
      expect(fnTest).to.have.been.called();
    });

    it('merge multiple calls together', function() {
      var fnTest = chai.spy(function() {
        }),
        promise1, promise2;

      promise1 = Throttle.throttle(fnTest, 100);
      $timeout.flush(40);
      promise2 = Throttle.throttle(fnTest, 50);
      expect(promise1).to.equal(promise2);
      $timeout.flush(51);
      expect(fnTest).not.to.have.been.called();
      $timeout.flush(10);
      expect(fnTest).to.have.been.called.once();

    });

    it('should handle an incorrect delay', function() {
      var fnTest = chai.spy(function() {
      });

      Throttle.throttle(fnTest, -40);
      $timeout.flush(99);
      expect(fnTest).to.have.been.called.exactly(0);
      $timeout.flush(2);
      expect(fnTest).to.have.been.called.exactly(1);

      Throttle.throttle(fnTest, false);
      $timeout.flush(101);
      expect(fnTest).to.have.been.called.exactly(2);

      Throttle.throttle(fnTest, {});
      $timeout.flush(101);
      expect(fnTest).to.have.been.called.exactly(3);
    });

    it('should handle incorrect function', function(done) {
      Throttle.throttle('test', 100).then(function() {
        expect(true).to.be.false;
        done();
      }, function(error) {
        expect(error).to.equal('Not a Function');
        done();
      });
      $timeout.flush();

    });
  });

  describe('Master Directive', function() {
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
        return mockwinchFactory
      });

      $provide.service('Throttle', function() {
        return mockThrottle
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
      window.document.body.appendChild(tz);
      tz.appendChild(element);
    }

    function clearTestZone() {
      var tz = window.document.getElementById('test-zone');
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
    })
  });

  describe('Image Directive', function() {
    var $compile, $rootScope, $scope, $timeout, boundingBox, mockwinchFactory, html, element, isolateScope;

    beforeEach(module('winch'));

    beforeEach(module(function($provide) {
      boundingBox = {
        top: 0,
        bottom: 400,
        left: 0,
        right: 400,
        vOffset: 100,
        hOffset: 100
      };

      mockwinchFactory = {
        getMasterBox: chai.spy(function() {
          return boundingBox
        }),
        loadImage: chai.spy(function() {
        }),
        registerImg: chai.spy(function() {
          return true;
        })
      };

      // Register our factories
      $provide.factory('winchFactory', function() {
        return mockwinchFactory
      });
    }));

    beforeEach(inject(function($injector) {
      $rootScope = $injector.get('$rootScope');
      $scope = $rootScope.$new();
      $compile = $injector.get('$compile');
      $timeout = $injector.get('$timeout');
    }));

    beforeEach(function() {
      html = angular.element('<div winch-img image-src="http://placehold.it/200x200"></div>');
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
      isolateScope = element.isolateScope();

      expect(isolateScope.isVisible).to.be.a('function');
      expect(isolateScope.registerImg).to.be.a('function');
      expect(isolateScope.loadSelf).to.be.a('function');
      expect(isolateScope.boundingBox).to.be.a('function');
      expect(isolateScope.getImgURL).to.be.a('function');

      expect(isolateScope.getImgURL()).to.be.equal('http://placehold.it/200x200');
      expect(element.hasClass('winch-img-not-loaded')).to.be.true;

      //Should be all zero in testing
      expect(isolateScope.boundingBox()).to.be.deep.equal({
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        width: 0,
        height: 0
      });
    });

    it('should register itself image on load', function() {
      element = compile(html, $scope);
      expect(mockwinchFactory.registerImg).to.have.been.called();
    });

    it('should load image on loadSelf()', function() {
      element = compile(html, $scope);
      isolateScope = element.isolateScope();

      isolateScope.loadSelf();
      $scope.$digest();

      expect(isolateScope._isLoaded).to.be.true;
      expect(element.children()[0].src).to.be.equal('http://placehold.it/200x200');
    });

    it('should calculate isVisible', function() {
      var imageBox = {
        bottom: 200,
        height: 200,
        left: 100,
        right: 300,
        top: 0,
        width: 200
      };

      element = compile(html, $scope);
      isolateScope = element.isolateScope();

      isolateScope.boundingBox = function() {
        return imageBox;
      };

      //On screen at start
      expect(isolateScope.isVisible()).to.be.equal(true);

      //Move off screen left
      imageBox.left = -301;
      imageBox.right = -101;
      expect(isolateScope.isVisible()).to.be.equal(false);

      //Move off screen right
      imageBox.left = 801;
      imageBox.right = 501;
      expect(isolateScope.isVisible()).to.be.equal(false);

      //reset left/right
      imageBox.left = 0;
      imageBox.right = 200;

      //Move off screen top
      imageBox.top = -301;
      imageBox.bottom = -101;
      expect(isolateScope.isVisible()).to.be.equal(false);

      //Move off screen bottom
      imageBox.top = 501;
      imageBox.bottom = 801;
      expect(isolateScope.isVisible()).to.be.equal(false);

      //Image larger than view screen
      imageBox.top = -201;
      imageBox.bottom = 601;
      imageBox.left = -201;
      imageBox.right = 601;
      expect(isolateScope.isVisible()).to.be.equal(true);
    });

    it('should add css class on image load if defined', function() {
      html = '<div winch-img image-src="http://placehold.it/200x200" data-winch-img-class="test-load-class"></div>';
      element = compile(html, $scope);
      isolateScope = element.isolateScope();

      isolateScope.loadSelf();
      $scope.$digest();

      expect(element.children()[0].classList.contains('test-load-class')).to.be.equal(true)
    });

    it('should call imgLoaded callback if provided', function() {
      $scope.imgLoaded = chai.spy(function() {
      });

      html = '<div winch-img image-src="http://placehold.it/200x200" data-img-loaded="imgLoaded()"></div>';

      element = compile(html, $scope);
      isolateScope = element.isolateScope();

      isolateScope.loadSelf();
      $scope.$digest();

      expect($scope.imgLoaded).to.have.been.called();
    });

    it('should call imgLoaded only if a function', function() {
//TODO
    });

    it('should only process loadSelf once', function() {
      $scope.imgLoaded = chai.spy(function() {
      });

      html = '<div winch-img image-src="http://placehold.it/200x200" data-img-loaded="imgLoaded()"></div>';

      element = compile(html, $scope);
      isolateScope = element.isolateScope();

      element.empty = chai.spy(element.empty);

      isolateScope.loadSelf();
      expect($scope.imgLoaded).to.have.been.called.once();

      isolateScope.loadSelf();
      expect($scope.imgLoaded).to.have.been.called.once();
    });

    it('should validate on message \'winch:validate\'', function() {
      element = compile(html, $scope);
      isolateScope = element.isolateScope();

      isolateScope.loadSelf = chai.spy(isolateScope.loadSelf);
      isolateScope.isVisible = function() {
        return false
      };

      $scope.$broadcast('winch:validate');

      expect(isolateScope.loadSelf).to.not.have.been.called();
      expect(mockwinchFactory.loadImage).to.not.have.been.called();

      isolateScope.isVisible = function() {
        return true
      };

      $scope.$broadcast('winch:validate');

      expect(isolateScope.loadSelf).to.have.been.called();
      expect(mockwinchFactory.loadImage).to.have.been.called();
    });
  });

  describe('Scroll Trigger Directive', function() {
    var winchFactory, Throttle, $scope, $rootScope, $compile, $q, $timeout, html, element, isolateScope;

    beforeEach(module('winch'));

    beforeEach(module(function($provide) {
      winchFactory = function() {
        return {
          triggerValidation: function() {
          }
        }
      };
      Throttle = function() {
        return {
          throttle: function() {
            var deferred = $q.defer();
            return deferred.promise;
          }
        }
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
      window.document.body.appendChild(tz);
      tz.appendChild(element);
    }

    function clearTestZone() {
      var tz = window.document.getElementById('test-zone');
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

  describe('winchify Filter', function() {
    var $filter, winchify;

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
        .equal('<winch-img data-image-src="http://foobar.com/image.png"></winch-img>')
    })
  });
});
