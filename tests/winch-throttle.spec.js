/* jshint mocha: true */
/* global chai: false, inject: false, angular: false, module: false, window: false, document: false */

/**
 * Unit Tests for the WinchJS Throttle Service
 */
var expect = chai.expect;

describe('WinchJS Throttle Service', function() {
  'use strict';

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
      expect(true).to.be.equal(false);
      done();
    }, function(error) {
      expect(error).to.equal('Not a Function');
      done();
    });
    $timeout.flush();
  });
});
