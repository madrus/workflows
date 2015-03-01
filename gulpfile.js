var gulp = require('gulp'),
  coffee = require('gulp-coffee'),
  compass = require('gulp-compass'),
  autoprefixer = require('gulp-autoprefixer');
  // minifying
  minifyCSS = require('gulp-minify-css'),
  minifyHTML = require('gulp-minify-html'),
  minifyJSON = require('gulp-jsonminify'),
  uglify = require('gulp-uglify'),
  imagemin = require('gulp-imagemin'),
  pngcrush = require('imagemin-pngcrush'),
  // code linting
  lintCOFFIE = require('gulp-coffeelint'),
  lintJS = require('gulp-jshint'),
  // tools
  gutil = require('gulp-util'),
  gulpif = require('gulp-if'),
  notify = require('gulp-notify'),
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
    .pipe(lintCOFFIE())
    .pipe(lintCOFFIE.reporter()) // Dump results
    .pipe(coffee({
      bare: true
    })) // and pipe it the the gulp-coffee plugin
    // without the top-level function safety wrapper
    .on('error', gutil.log) // on error log the error message
    .pipe(gulp.dest('components/scripts')); // write the resulting javascript file to the scripts folder
});

gulp.task('js', function() {
  return gulp.src(jsSources) // source file(s)
    .pipe(lintJS())
    .pipe(lintJS.reporter()) // Dump results
    .pipe(concat('script.js')) // concatenate
    .pipe(browserify()) // make it ready for the browser
    .pipe(gulpif(env === 'production', uglify()))
    .pipe(gulp.dest(outputDir + 'js')) // write to the resulting script.js file
    .pipe(connect.reload()); // refresh the page
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
    .pipe(autoprefixer({
      browsers: ['last 10 versions', 'ie 9']
    }))
    .pipe(gulpif(env === 'production', minifyCSS()))
    .pipe(gulp.dest(outputDir + 'css')) // write to the resulting style.css file
    .pipe(notify('SASS compiled, prefixed and minified'))
    .pipe(connect.reload()); // refresh the page
});

gulp.task('html', function() {
  return gulp.src('builds/development/*.html')
    .pipe(gulpif(env === 'production', minifyHTML()))
    .pipe(gulpif(env === 'production', gulp.dest(outputDir)))
    .pipe(connect.reload()); // refresh the page
});

gulp.task('images', function() {
  return gulp.src('builds/development/images/**/*.*') // any subdirectory and any image
    .pipe(gulpif(env === 'production', imagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      use: [pngcrush()]
    })))
    .pipe(gulpif(env === 'production', gulp.dest(outputDir + 'images')))
    .pipe(connect.reload()); // refresh the page
});

gulp.task('json', function() {
  return gulp.src('builds/development/js/*.json')
    .pipe(gulpif(env === 'production', minifyJSON()))
    .pipe(gulpif(env === 'production', gulp.dest('builds/production/js')))
    .pipe(connect.reload()); // refresh the page
});

gulp.task('connect', function() {
  connect.server({
    root: outputDir, // at this moment we only have our development website
    livereload: true
  });
});

gulp.task('watch', function() {
  gulp.watch(coffeeSources, ['coffee']); // if anything changes in coffee folder(s), lint and compile them
  gulp.watch(jsSources, ['js']); // if anything changes in scripts folder(s), lint and uglify them
  gulp.watch('components/sass/*.scss', ['compass']); // if anything changes in sass folder(s), compile and evt. compress them
  gulp.watch('builds/development/*.html', ['html']); // if anything changes in html files, evt. minify them and reload the page
  gulp.watch('builds/development/*.json', ['json']); // if anything changes in json files, evt. minify them and reload the page
  gulp.watch('builds/development/images/**/*.*', ['images']); // if anything changes in image files, evt. minify them and reload the page
});

gulp.task('default', ['html', 'json', 'coffee', 'js', 'compass', 'images', 'connect', 'watch']);
