var gulp = require('gulp'),
    gutil = require('gulp-util'),
    coffee = require('gulp-coffee'),
    browserify = require('gulp-browserify'),
    compass = require('gulp-compass'),
    concat = require('gulp-concat');

var coffeeSources = ['components/coffee/*.coffee'];
var jsSources = [
  'components/scripts/rclick.js',
  'components/scripts/pixgrids.js',
  'components/scripts/tagline.js',
  'components/scripts/template.js'
];
var sassSources = ['components/sass/style.scss'];

gulp.task('coffee', function() {
  gulp.src(coffeeSources) // source file(s)
    .pipe(coffee({ bare: true })) // and pipe it the the gulp-coffee plugin
                                  // without the top-level function safety wrapper
      .on('error', gutil.log)     // on error log the error message
    .pipe(gulp.dest('components/scripts')) // write the resulting javascript file to the scripts folder
});

gulp.task('js', function() {
  gulp.src(jsSources) // source file(s)
    .pipe(concat('script.js')) // concatenate
    .pipe(browserify()) // make it ready for the browser
    .pipe(gulp.dest('builds/development/js')) // write to the resulting script.js file
});

gulp.task('compass', function() {
  gulp.src(sassSources) // source file(s)
    .pipe(compass({
      sass: 'components/sass',
      image: 'builds/development/images/',
      style: 'expanded',
      comments: 'true'
    })) // run throught compass
      .on('error', gutil.log)     // on error log the error message
    .pipe(gulp.dest('builds/development/css')) // write to the resulting style.css file
});

gulp.task('watch', function() {
  gulp.watch(coffeeSources, ['coffee']); // if anything changes in coffee folder(s) run coffee task
  gulp.watch(jsSources, ['js']); // if anything changes in scripts folder(s) run js task
  gulp.watch('components/sass/*.scss', ['compass']); // if anything changes in sass folder(s) run compass task
});

gulp.task('default', ['coffee', 'js', 'compass', 'watch']);