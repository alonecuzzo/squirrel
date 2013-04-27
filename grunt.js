/**
 * grunt
 * CoffeeScript example
 */
module.exports = function(grunt){

  grunt.initConfig({
    coffee: {
      compileApp: {
        files: [ 'src/app.coffee' ],
        dest: 'app.js'
      }
    },
    watch: {
      app: {
        files: 'src/app.coffee',
        tasks: 'coffee:compileApp ok'
      }
    }
  });

  grunt.loadTasks('tasks');
  grunt.registerTask('default', 'coffee ok');

};