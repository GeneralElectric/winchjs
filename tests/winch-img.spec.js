/**
 * Unit Tests for the WinchJS Image Directive
 */
var expect = chai.expect;

describe('WinchJS Image Directive', function() {
  'use strict';

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
        return boundingBox;
      }),
      loadImage: chai.spy(function() {
      }),
      registerImg: chai.spy(function() {
        return true;
      })
    };

    // Register our factories
    $provide.factory('winchFactory', function() {
      return mockwinchFactory;
    });
  }));

  beforeEach(inject(function($injector) {
    $rootScope = $injector.get('$rootScope');
    $scope = $rootScope.$new();
    $compile = $injector.get('$compile');
    $timeout = $injector.get('$timeout');
  }));

  beforeEach(function() {
    html = angular.element('<div winch-img img-src="http://placehold.it/200x200"></div>');
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
    expect(element.hasClass('winch-img-not-loaded')).to.be.equal(true);

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

  it('should make five attempts to register before loading self', function() {
    var status = false, url = '';
    mockwinchFactory.registerImg = chai.spy(function() {
      return status;
    });

    $scope.getUrl = function() {
      return url;
    };

    html = angular.element('<div winch-img img-fn="getUrl()"></div>');

    element = compile(html, $scope);
    element.isolateScope().loadSelf = chai.spy(element.isolateScope().loadSelf);

    //First Call
    expect(mockwinchFactory.registerImg).to.have.been.called.exactly(1);
    $timeout.flush(999);
    //100 MS not completed
    expect(mockwinchFactory.registerImg).to.have.been.called.exactly(1);
    $timeout.flush();
    //Second Call
    expect(mockwinchFactory.registerImg).to.have.been.called.exactly(2);
    $timeout.flush();
    //Third Call
    expect(mockwinchFactory.registerImg).to.have.been.called.exactly(3);
    $timeout.flush();
    //Forth Call
    expect(mockwinchFactory.registerImg).to.have.been.called.exactly(4);
    $timeout.flush();
    //Fifth Call
    expect(mockwinchFactory.registerImg).to.have.been.called.exactly(5);
    expect(element.isolateScope().loadSelf).to.have.been.called.once();
  });

  it('should register after dynamic value resolves (before 5 attempts)', function() {
    var status = false, url = '';
    mockwinchFactory.registerImg = chai.spy(function() {
      return status;
    });

    $scope.getUrl = function() {
      return url;
    };

    html = angular.element('<div winch-img img-fn="getUrl()"></div>');

    element = compile(html, $scope);
    element.isolateScope().loadSelf = chai.spy(element.isolateScope().loadSelf);

    //First Call
    expect(mockwinchFactory.registerImg).to.have.been.called.exactly(1);
    $timeout.flush();
    //Second Call
    expect(mockwinchFactory.registerImg).to.have.been.called.exactly(2);
    url = 'http://placehold.it/200x200';
    status = true;
    $timeout.flush();
    expect(mockwinchFactory.registerImg).to.have.been.called.exactly(3);
    //No new delay timer should be allocated
    $timeout.verifyNoPendingTasks();
  });

  it('should load image on loadSelf()', function() {
    element = compile(html, $scope);
    isolateScope = element.isolateScope();

    isolateScope.loadSelf();
    $scope.$digest();

    expect(isolateScope._isLoaded).to.be.equal(true);
    expect(element.children()[0].src).to.be.equal('http://placehold.it/200x200');
  });

  it('should destroy self after loadSelf is called', function(done) {
    element = compile(html, $scope);
    isolateScope = element.isolateScope();

    isolateScope.loadSelf();
    $scope.$digest();

    isolateScope.$on('$destroy', function() {
      expect(true).to.be.equal(true);
      done();
    });

    $timeout.flush();

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
    html = '<div winch-img img-src="http://placehold.it/200x200" data-winch-img-class="test-load-class"></div>';
    element = compile(html, $scope);
    isolateScope = element.isolateScope();

    isolateScope.loadSelf();
    $scope.$digest();

    expect(element.children()[0].classList.contains('test-load-class')).to.be.equal(true);
  });

  it('should call imgLoaded callback if provided', function() {
    $scope.imgLoaded = chai.spy(function() {
    });

    html = '<div winch-img img-src="http://placehold.it/200x200" data-img-loaded="imgLoaded()"></div>';

    element = compile(html, $scope);
    isolateScope = element.isolateScope();
    expect($scope.imgLoaded).not.to.have.been.called();

    isolateScope.loadSelf();
    $scope.$digest();

    expect($scope.imgLoaded).to.have.been.called();
  });

  it('should handle incorrect imgLoaded callback', function() {
    $scope.imgLoaded = function() {
      throw new Error('Test Error');
    };

    html = '<div winch-img img-src="http://placehold.it/200x200" data-img-loaded="imgLoaded()"></div>';

    element = compile(html, $scope);
    isolateScope = element.isolateScope();

    expect(isolateScope.loadSelf).to.not.throw(Error);
  });

  it('should only process loadSelf once', function() {
    $scope.imgLoaded = chai.spy(function() {
    });

    html = '<div winch-img img-src="http://placehold.it/200x200" data-img-loaded="imgLoaded()"></div>';

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
      return false;
    };

    $scope.$broadcast('winch:validate');

    expect(isolateScope.loadSelf).to.not.have.been.called();
    expect(mockwinchFactory.loadImage).to.not.have.been.called();

    isolateScope.isVisible = function() {
      return true;
    };

    $scope.$broadcast('winch:validate');

    expect(isolateScope.loadSelf).to.have.been.called();
    expect(mockwinchFactory.loadImage).to.have.been.called();
  });

  it('should load allow expression function for image source', function() {
    html = '<div winch-img img-url="imgFnParent()"></div>';

    $scope.imgFnParent = function() {
      return 'http://placehold.it/200x200?text=Dynamic';
    };

    element = compile(html, $scope);
    isolateScope = element.isolateScope();

    isolateScope.loadSelf();
    $scope.$digest();

    expect(element.children()[0].src).to.be.equal('http://placehold.it/200x200?text=Dynamic');
  });

  it('should load allow expression value for image source', function() {
    html = '<div winch-img img-url="imgFnParent"></div>';

    $scope.imgFnParent = 'http://placehold.it/200x200?text=Dynamic2';

    element = compile(html, $scope);
    isolateScope = element.isolateScope();

    isolateScope.loadSelf();
    $scope.$digest();

    expect(element.children()[0].src).to.be.equal('http://placehold.it/200x200?text=Dynamic2');
  });

  it('should handle incorrect dynamic expression for image source', function() {
    html = '<div winch-img img-url="imgFnParent" img-src="http://placehold.it/200x200?text=BadExpression"></div>';

    element = compile(html, $scope);
    isolateScope = element.isolateScope();

    isolateScope.loadSelf();
    $scope.$digest();

    expect(element.children()[0].src).to.be.equal('http://placehold.it/200x200?text=BadExpression');
  });
});

