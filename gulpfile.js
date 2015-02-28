var gulp = require('gulp'),
    gutil = require('gulp-util'),
    coffee = require('gulp-coffee'),
    browserify = require('gulp-browserify'),
    compass = require('gulp-compass'),
    plumber = require('gulp-plumber'),
    connect = require('gulp-connect'),
    concat = require('gulp-concat');

var coffeeSources = ['components/coffee/*.coffee'];
var jsSources = [
  'components/scripts/rclick.js',
  'components/scripts/pixgrids.js',
  'components/scripts/tagline.js',
  'components/scripts/template.js'
];
var sassSources = ['components/sass/style.scss'];
var onError = function(err) {
    console.log(err);
}

gulp.task('coffee', function() {
    return gulp.src(coffeeSources) // source file(s)
    .pipe(coffee({ bare: true })) // and pipe it the the gulp-coffee plugin
                                  // without the top-level function safety wrapper
      .on('error', gutil.log)     // on error log the error message
    .pipe(gulp.dest('components/scripts')); // write the resulting javascript file to the scripts folder
});

gulp.task('js', function() {
    return gulp.src(jsSources) // source file(s)
    .pipe(concat('script.js')) // concatenate
    .pipe(browserify()) // make it ready for the browser
    .pipe(gulp.dest('builds/development/js')) // write to the resulting script.js file
    .pipe(connect.reload()); // refresh the page
});

gulp.task('compass', function() {
    return gulp.src(sassSources) // source file(s)
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(compass({
      sass: 'components/sass',
      image: 'builds/development/images/',
      style: 'expanded',
      comments: true,
      logging: true
    })) // run throught compass
    .pipe(gulp.dest('builds/development/css')) // write to the resulting style.css file
    .pipe(connect.reload()); // refresh the page
});

gulp.task('connect', function(){
    connect.server({
      root: 'builds/development/', // at this moment we only have our development website
      livereload: true
    });
});

gulp.task('watch', function() {
    gulp.watch(coffeeSources, ['coffee']); // if anything changes in coffee folder(s) run coffee task
    gulp.watch(jsSources, ['js']); // if anything changes in scripts folder(s) run js task
    gulp.watch('components/sass/*.scss', ['compass']); // if anything changes in sass folder(s) run compass task
});

gulp.task('default', ['coffee', 'js', 'compass', 'connect', 'watch']);