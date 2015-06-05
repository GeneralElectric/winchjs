module.exports = function(grunt) {
  'use strict';
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.initConfig({
    connect: {
      winch: {
        options: {
          base: './',
          port: 8282,
          keepalive: true
        }
      }
    },
    concat:{
      dist:{
        src: [
          'files/winch.js',
          'files/winch-throttle.js',
          'files/winch-factory.js',
          'files/winch-filter.js',
          'files/winch-master.js',
          'files/winch-scroll.js',
          'files/winch-img.js'
        ],
        dest: 'dist/winch.js'
      }
    },
    uglify: {
      winch: {
        options: {
          sourceMap: true,
          sourceMapName: 'dist/winch.map'
        },
        files: {
          'dist/winch.min.js': [
            'files/winch.js',
            'files/winch-throttle.js',
            'files/winch-factory.js',
            'files/winch-filter.js',
            'files/winch-master.js',
            'files/winch-scroll.js',
            'files/winch-img.js'
          ]
        }
      }
    },
    jscs: {
      src: ['files/*.js', 'tests/*.js', 'Gruntfile.js', 'karma.conf.js'],
      options: {
        config: '.jscsrc'
      }
    },
    jshint: {
      src: ['files/*.js', 'tests/*.js', 'example/*.js', 'Gruntfile.js', 'karma.conf.js'],
      options: {
        jshintrc: '.jshintrc'
      }
    }
  });
  // Default task.
  grunt.registerTask('default', ['connect:winch']);
  grunt.registerTask('hint', ['jscs', 'jshint']);
  grunt.registerTask('min', ['uglify:winch']);
};
