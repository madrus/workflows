var gulp = require('gulp'),
    gutil = require('gulp-util'),
    coffee = require('gulp-coffee'),
    browserify = require('gulp-browserify'),
    concat = require('gulp-concat');

var coffeeSources = ['components/coffee/*.coffee'];
var jsSources = [
  'components/scripts/rclick.js',
  'components/scripts/pixgrids.js',
  'components/scripts/tagline.js',
  'components/scripts/template.js'
];

gulp.task('coffee', function() {
  gulp.src(coffeeSources) // source file(s)
    .pipe(coffee({ bare: true })) // and pipe it the the gulp-coffee plugin
                                  // without the top-level function safety wrapper
      .on('error', gutil.log)     // on error log the error message
    .pipe(gulp.dest('components/scripts')) // move the newly created file to scripts folder
});

gulp.task('js', function() {
  gulp.src(jsSources) // source file(s)
    .pipe(concat('script.js'))
    .pipe(browserify()) // make it ready for the browser
    .pipe(gulp.dest('builds/development/js'))
});