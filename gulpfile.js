var gulp = require('gulp'),
    gutil = require('gulp-util'),
    coffee = require('gulp-coffee');

var coffeeSources = ['components/coffee/*.coffee'];

gulp.task('coffee', function() {
  gulp.src(coffeeSources) // get source file
    .pipe(coffee({ bare: true })) // and pipe it the the gulp-coffee plugin
                                  // without the top-level function safety wrapper
      .on('error', gutil.log)     // on error log the error message
    .pipe(gulp.dest('components/scripts')) // move the newly created file to scripts folder
});