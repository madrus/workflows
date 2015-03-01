var gulp = require('gulp'),
  coffee = require('gulp-coffee'),
  compass = require('gulp-compass'),
  // minifying
  minifyCSS = require('gulp-minify-css'),
  minifyHTML = require('gulp-minify-html'),
  minifyJSON = require('gulp-jsonminify'),
  uglify = require('gulp-uglify'),
  // code linting
  jshint = require('gulp-jshint'),
  coffeelint = require('gulp-coffeelint'),
  // tools
  gutil = require('gulp-util'),
  gulpif = require('gulp-if'),
  browserify = require('gulp-browserify'),
  plumber = require('gulp-plumber'),
  connect = require('gulp-connect'),
  concat = require('gulp-concat');

var env,
  coffeeSources,
  jsSources,
  sassSources,
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

var onError = function(error) {
  // do here what else you need
  console.log(error);
  this.emit('end');
};

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
    .pipe(gulpif(env === 'production', minifyCSS()))
    .pipe(gulp.dest(outputDir + 'css')) // write to the resulting style.css file
    .pipe(connect.reload()); // refresh the page
});

gulp.task('html', function() {
  return gulp.src('builds/development/*.html')
    .pipe(gulpif(env === 'production', minifyHTML()))
    .pipe(gulpif(env === 'production', gulp.dest(outputDir)))
    .pipe(connect.reload()); // refresh the page
});

gulp.task('json', function() {
  return gulp.src('builds/development/js/*.json')
    .pipe(gulpif(env === 'production', minifyJSON()))
    .pipe(gulpif(env === 'production', gulp.dest('builds/production/js/')))
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
  gulp.watch('builds/development/*.html', ['html']); // if anything changes in html files reload the page
  gulp.watch('builds/development/*.json', ['json']); // if anything changes in json files reload the page
});

gulp.task('default', ['html', 'json', 'coffeeLint', 'coffee', 'jsLint', 'js', 'compass', 'connect', 'watch']);
