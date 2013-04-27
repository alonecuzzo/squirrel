/**
 * grunt
 * CoffeeScript example
 */
module.exports = function(grunt){

  grunt.initConfig({
    coffee: {
      compileApp: {
        files: [ 'coffee/app.coffee' ],
        dest: 'app.js'
      }
    },
    watch: {
      app: {
        files: 'coffee/app.coffee',
        tasks: 'coffee:compileApp ok'
      }
    }
  });

  grunt.loadNpmTasks('grunt-compass');
  grunt.loadTasks('tasks');
  grunt.registerTask('default', 'coffee ok');

};