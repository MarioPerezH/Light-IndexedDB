module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    distFolder: 'dist',
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: 'src/*.js',
        dest: '<%= distFolder %>/indexeddb.concat.js'
      }
    },
    uglify: {
      options: {
        compress: true
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: '<%= distFolder %>/indexeddb.min.js'
      }
    },
    connect: {
      server: {
        options: {
          port: 9000,
          base: './',
        }
      }
    },
    open: {
      dev: {
        path: 'http://localhost:<%= connect.server.options.port %>/test',
        app: 'Chrome'
      }
    },
    exec: {
      compileTS: {
        command: 'tsc -p .'
      },
    },
    clean: {
      js: ['src/*.js', 'test/*.js', '<%= distFolder %>/*.js', '!<%= distFolder %>/*.min.js']
    },
    watch: {
      files: '**/*.ts',
      tasks: ['exec']
    },
  });

  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('dist', ['exec', 'concat', 'uglify', 'clean']);
  grunt.registerTask('dev', ['exec', 'open', 'connect', 'watch']);
};