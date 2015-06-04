//Karma Config
module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: './',

    // frameworks to use
    frameworks: ['mocha'],

    // list of files / patterns to load in the browser
    files: [
      './node_modules/chai/chai.js',
      './node_modules/chai-spies/chai-spies.js',
      './bower_components/angular/angular.js',
      './bower_components/angular-mocks/angular-mocks.js',
      './files/winch.js',
      './files/winch-factory.js',
      './files/winch-filter.js',
      './files/winch-img.js',
      './files/winch-master.js',
      './files/winch-scroll.js',
      './files/winch-throttle.js',
      './tests/winch-factory.spec.js',
      './tests/winch-filter.spec.js',
      './tests/winch-img.spec.js',
      './tests/winch-master.spec.js',
      './tests/winch-scroll.spec.js',
      './tests/winch-throttle.spec.js'
    ],

    // list of files to exclude
    exclude: [],

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['dots', 'coverage'],

    preprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      './files/winch.js': ['coverage'],
      './files/winch-factory.js': ['coverage'],
      './files/winch-filter.js': ['coverage'],
      './files/winch-img.js': ['coverage'],
      './files/winch-master.js': ['coverage'],
      './files/winch-scroll.js': ['coverage'],
      './files/winch-throttle.js': ['coverage']
    },

    // optionally, configure the reporter
    coverageReporter: {
      reporters: [
        {type: 'html', dir: './coverage/'},
        {type: 'lcovonly', dir: './coverage/'}
      ]
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      //'Chrome',
      //'Firefox',
      //'IE',
      'PhantomJS'
    ],

    // If browser does not capture in given timeout [ms], kill it

    captureTimeout: 100000,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
