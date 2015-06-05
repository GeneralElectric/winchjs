/**
 * Unit Tests for the WinchJS State Factory
 */
var expect = chai.expect;

describe('WinchJS Factory', function() {
  'use strict';
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

    expect(winchFactory._img.hasOwnProperty(testUrl)).to.be.equal(true);
    expect(winchFactory._img[testUrl].loaded).to.be.equal(false);
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
    expect(winchFactory.registerImg()).to.be.equal(false);
    expect(winchFactory.registerImg('test')).to.be.equal(false);
    expect(winchFactory.registerImg('test',
      function() {
      }
    )).to.be.equal(false);
    expect(winchFactory.registerImg({},
      function() {
      },
      function() {
      }
    )).to.be.equal(false);
    expect(winchFactory.registerImg({}, 'test',
      function() {
      }
    )).to.be.equal(false);
    expect(winchFactory.registerImg({},
      function() {
      }, 'test')).to.be.equal(false);
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
