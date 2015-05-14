module.exports = function(grunt) {
  'use strict';
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-uglify');
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
    uglify: {
      winch: {
        options: {
          sourceMap: true,
          sourceMapName: 'winch.map'
        },
        files: {
          'winch.min.js': ['winch.js']
        }
      }
    },
    jscs: {
      src: ['winch.js', 'winch.spec.js', 'Gruntfile.js', 'karma.conf.js'],
      options: {
        config: '.jscsrc'
      }
    }
  });
  // Default task.
  grunt.registerTask('default', ['connect:winch']);
  grunt.registerTask('hint', ['jscs']);
  grunt.registerTask('min', ['uglify:winch']);
};
