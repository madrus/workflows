var gulp = require('gulp'),
  gutil = require('gulp-util'),
  coffee = require('gulp-coffee'),
  coffeelint = require('gulp-coffeelint'),
  browserify = require('gulp-browserify'),
  compass = require('gulp-compass'),
  minify = require('gulp-minify-css'),
  jshint = require('gulp-jshint'),
  uglify = require('gulp-uglify'),
  plumber = require('gulp-plumber'),
  connect = require('gulp-connect'),
  gulpif = require('gulp-if'),
  concat = require('gulp-concat');

var env,
  coffeeSources,
  jsSources,
  sassSources,
  htmlSources,
  jsonSources,
  outputDir,
  sassStyle;

env = process.env.NODE_ENV || 'development'; // global environment setting

if (env === 'development') {
  outputDir = 'builds/development/';
  sassStyle = 'expanded';
} else {
  outputDir = 'builds/production/';
  sassStyle = 'compressed';
};

coffeeSources = ['components/coffee/*.coffee'];
jsSources = [
  'components/scripts/rclick.js',
  'components/scripts/pixgrids.js',
  'components/scripts/tagline.js',
  'components/scripts/template.js'
];
sassSources = ['components/sass/style.scss'];
htmlSources = [outputDir + '*.html'];
jsonSources = [outputDir + 'js/*.json'];

var onError = function(err) {
  console.log(err);
}

gulp.task('coffee', function() {
  return gulp.src(coffeeSources) // source file(s)
    .pipe(coffee({
      bare: true
    })) // and pipe it the the gulp-coffee plugin
    // without the top-level function safety wrapper
    .on('error', gutil.log) // on error log the error message
    .pipe(gulp.dest('components/scripts')); // write the resulting javascript file to the scripts folder
});

gulp.task('coffeeLint', function() {
  return gulp.src(coffeeSources) // source file(s)
    .pipe(coffeelint())
    .pipe(coffeelint.reporter()); // Dump results
});

gulp.task('js', function() {
  return gulp.src(jsSources) // source file(s)
    .pipe(concat('script.js')) // concatenate
    .pipe(browserify()) // make it ready for the browser
    .pipe(gulpif(env === 'production', uglify()))
    .pipe(gulp.dest(outputDir + 'js')) // write to the resulting script.js file
    .pipe(connect.reload()); // refresh the page
});

gulp.task('jsLint', function() {
  return gulp.src(jsSources) // source file(s)
    .pipe(jshint())
    .pipe(jshint.reporter()); // Dump results
});

gulp.task('compass', function() {
  return gulp.src(sassSources) // source file(s)
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(compass({
      sass: 'components/sass',
      image: outputDir + 'images/',
      style: sassStyle,
      comments: true,
      logging: false
    })) // run throught compass
    .pipe(gulpif(env === 'production', minify()))
    .pipe(gulp.dest(outputDir + 'css')) // write to the resulting style.css file
    .pipe(connect.reload()); // refresh the page
});

gulp.task('html', function() {
  return gulp.src(htmlSources)
    .pipe(connect.reload()); // refresh the page
});

gulp.task('json', function() {
  return gulp.src(jsonSources)
    .pipe(connect.reload()); // refresh the page
});

gulp.task('connect', function() {
  connect.server({
    root: outputDir, // at this moment we only have our development website
    livereload: true
  });
});

gulp.task('watch', function() {
  gulp.watch(coffeeSources, ['coffeeLint']); // if anything changes in coffee folder(s) run coffee task
  gulp.watch(coffeeSources, ['coffee']); // if anything changes in coffee folder(s) run coffee task
  gulp.watch(jsSources, ['jsLint']); // if anything changes in scripts folder(s) run js task
  gulp.watch(jsSources, ['js']); // if anything changes in scripts folder(s) run js task
  gulp.watch('components/sass/*.scss', ['compass']); // if anything changes in sass folder(s) run compass task
  gulp.watch(htmlSources, ['html']); // if anything changes in html files reload the page
  gulp.watch(jsonSources, ['json']); // if anything changes in json files reload the page
});

gulp.task('default', ['html', 'json', 'coffeeLint', 'coffee', 'jsLint', 'js', 'compass', 'connect', 'watch']);
