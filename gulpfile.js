"use strict";

var gulp = require('gulp'), // global and local
  coffee = require('gulp-coffee'),
  compass = require('gulp-compass'),
  autoprefixer = require('gulp-autoprefixer'),
  // minifying
  minifyCSS = require('gulp-cssmin'),
  minifyHTML = require('gulp-minify-html'),
  minifyJSON = require('gulp-jsonminify'),
  uglify = require('gulp-uglify'),
  pngcrush = require('imagemin-pngcrush'), // necessary for gulp-imagemin
  imagemin = require('gulp-imagemin'),
  // code linting
  lintCOFFIE = require('gulp-coffeelint'),
  lintJS = require('gulp-jshint'),
  stylish = require('jshint-stylish'),
  // tools
  //gutil = require('gulp-util'),
  gulpif = require('gulp-if'),
  notify = require('gulp-notify'),
  browserify = require('gulp-browserify'), // make sure you install jquery and mustasche plugins
  plumber = require('gulp-plumber'),
  connect = require('gulp-connect'),
  concat = require('gulp-concat'),
  // rename = require('gulp-rename'),
  del = require('del'),
  path = require('path');

var env,
  coffeeSources,
  jsSources,
  sassSources,
  sassStyle,
  outputDir;

env = process.env.NODE_ENV || 'development'; // global environment setting

if (env === 'production') {
  outputDir = 'builds/production/';
  sassStyle = 'compressed';
  console.log("Running in PRODUCTION mode");
} else {
  outputDir = 'builds/development/';
  sassStyle = 'expanded';
  console.log("Running in DEVELOPMENT mode");
}

coffeeSources = ['components/coffee/*.coffee'];
jsSources = [
  'components/scripts/rclick.js',
  'components/scripts/pixgrid.js',
  'components/scripts/tagline.js',
  'components/scripts/template.js'
];
sassSources = ['components/sass/style.scss'];

// var onError = function(error) {
//   console.log("onError custom error message: " + error);
//   this.emit('end');
// };

//the title and icon that will be used for the Grunt notifications
var notifyInfo = {
  title: 'Gulp',
  subtitle: 'Failure!',
  icon: path.join(__dirname, 'gulp.png')
};

//error notification settings for plumber
var plumberErrorHandler = function (err) {
  notify.onError({
    title: notifyInfo.title,
    subtitle: notifyInfo.subtitle,
    icon: notifyInfo.icon,
    message: "Error: <%= error.message %>",
    sound: "Beep"
  })(err);
  this.emit('end');
};

gulp.task('html', function () {
  return gulp.src('builds/development/*.html')
    .pipe(plumber({
      errorHandler: plumberErrorHandler
    }))
    .pipe(gulpif(env === 'production', minifyHTML()))
    // .pipe(gulpif(env === 'production', rename({ suffix: '.min' })))
    .pipe(gulpif(env === 'production', gulp.dest(outputDir)))
    .pipe(connect.reload()); // refresh the page
});

gulp.task('compass', function () {
  return gulp.src(sassSources) // source file(s)
    .pipe(plumber({
      errorHandler: plumberErrorHandler
    }))
    .pipe(compass({
      sass: 'components/sass',
      css: outputDir + 'css',
      image: outputDir + 'images/',
      style: sassStyle,
      comments: true,
      logging: false
    })) // run throught compass
    .pipe(autoprefixer({
      browsers: ['last 2 version', 'safari 5', 'ie 7', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4']
    }))
    .pipe(gulpif(env === 'production', minifyCSS()))
    // .pipe(gulpif(env === 'production', rename({ suffix: '.min' })))
    .pipe(gulp.dest(outputDir + 'css')) // write to the resulting style.css file
    .pipe(connect.reload()); // refresh the page
});

gulp.task('coffee', function () {
  return gulp.src(coffeeSources) // source file(s)
    .pipe(plumber({
      errorHandler: plumberErrorHandler
    }))
    .pipe(lintCOFFIE())
    .pipe(lintCOFFIE.reporter()) // Dump results
    .pipe(coffee({
      bare: true
    })) // and pipe it the the gulp-coffee plugin
    // without the top-level function safety wrapper
    // .on('error', onError()) // on error log the error message
    .pipe(gulp.dest('components/scripts')); // write the resulting javascript file to the scripts folder
});

gulp.task('js', function () {
  return gulp.src(jsSources) // source file(s)
    .pipe(plumber({
      errorHandler: plumberErrorHandler
    }))
    .pipe(lintJS())
    .pipe(lintJS.reporter(stylish)) // Dump results
    .pipe(concat('script.js')) // concatenate
    .pipe(browserify()) // make it ready for the browser (add code of dependencies)
    .pipe(gulpif(env === 'production', uglify()))
    // .pipe(gulpif(env === 'production', rename({ suffix: '.min' })))
    .pipe(gulp.dest(outputDir + 'js')) // write to the resulting script.js file
    .pipe(connect.reload()); // refresh the page
});

gulp.task('images', function () {
  return gulp.src('builds/development/images/**/*.*') // any subdirectory and any image
    .pipe(plumber({
      errorHandler: plumberErrorHandler
    }))
    .pipe(gulpif(env === 'production', imagemin({
      progressive: true,
      svgoPlugins: [{
        removeViewBox: false
      }],
      use: [pngcrush()]
    })))
    .pipe(gulpif(env === 'production', gulp.dest(outputDir + 'images')))
    .pipe(connect.reload()); // refresh the page
});

gulp.task('json', function () {
  return gulp.src('builds/development/js/*.json')
    .pipe(plumber({
      errorHandler: plumberErrorHandler
    }))
    .pipe(gulpif(env === 'production', minifyJSON()))
    // .pipe(gulpif(env === 'production', rename({ suffix: '.min' })))
    .pipe(gulpif(env === 'production', gulp.dest('builds/production/js')))
    .pipe(connect.reload()); // refresh the page
});

// cleaning is only done by production builds
gulp.task('clean', function () {
  del([
    'builds/production/*.html',
    'builds/production/css/*.css',
    'builds/production/js/*.js',
    'builds/production/js/*.json',
    'builds/production/images/**/*.*',
    'builds/production/images/*'
  ], function (err, deletedFiles) {
    console.log('Files deleted:', deletedFiles.join('\r'));
  });
});

gulp.task('connect', function () {
  connect.server({
    root: outputDir, // development or production
    livereload: true
  });
});

gulp.task('watch', function () {
  gulp.watch(coffeeSources, ['coffee']); // if anything changes in coffee folder(s), lint and compile them
  gulp.watch(jsSources, ['js']); // if anything changes in scripts folder(s), lint and uglify them
  gulp.watch('components/sass/*.scss', ['compass']); // if anything changes in sass folder(s), compile and evt. compress them
  gulp.watch('builds/development/*.html', ['html']); // if anything changes in html files, evt. minify them and reload the page
  gulp.watch('builds/development/js/*.json', ['json']); // if anything changes in json files, evt. minify them and reload the page
  gulp.watch('builds/development/images/**/*.*', ['images']); // if anything changes in image files, evt. minify them and reload the page
});

// default tast to run, compile, minimize and watch with live reload
gulp.task('default', ['html', 'json', 'coffee', 'js', 'compass', 'images', 'connect', 'watch']);

// run everything once but do not watch, nor live reload
gulp.task('build', ['html', 'json', 'coffee', 'js', 'compass', 'images']);
