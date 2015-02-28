var gulp = require('gulp'),
  gutil = require('gulp-util'),
  coffee = require('gulp-coffee'),
  coffeelint = require('gulp-coffeelint'),
  browserify = require('gulp-browserify'),
  compass = require('gulp-compass'),
  jshint = require('gulp-jshint'),
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
var htmlSources = ['builds/development/*.html'];
var jsonSources = ['builds/development/js/*.json'];
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
    .pipe(gulp.dest('builds/development/js')) // write to the resulting script.js file
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
      image: 'builds/development/images/',
      style: 'expanded',
      comments: true,
      logging: true
    })) // run throught compass
    .pipe(gulp.dest('builds/development/css')) // write to the resulting style.css file
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
    root: 'builds/development/', // at this moment we only have our development website
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

/************ MY TEST RENAME TASK *************************************/

var fs = require("fs"); // filesystem

var shortenFileNames = function(path, count) {
  fs.readdirSync(path).forEach(function(dir, count) {
    var oldName = dir;
    oldPath = path + '/' + oldName;
    var entry = fs.statSync(oldPath);

    if (oldName) {
      if (entry.isDirectory()) { // directory
        results = results.concat(shortenFileNames(oldPath, count + 1));
      } else if (entry.isFile()) { // file
        newPath = path + '/' + 'a' + count + '.txt';
        if (oldPath !== newPath) {
          // console.log('renaming <' + oldPath + '> to <' + newPath + '>');
          fs.rename(oldPath, newPath, function(err) {
              if (err) {
                throw (err);
              };
            })
            // } else {
            //   console.log('old file name <' + oldPath + '> is the same as new file name');
        };
      };
    };
  });
};

var directoryList = [];
var fileList = [];

var shortenDirectoryNames = function(root) {
  var directoryCount = 1;
  var fileCount = 1;

  fs.readdirSync(root).forEach(function(dir) {
    path = root + '/' + dir;
    var entry = fs.statSync(path);

    if (entry && entry.isDirectory()) { // directory
      console.log('entry <' + path + '> is een directory #' + directoryCount++);
      directoryList.push(path);
      shortenDirectoryNames(path);
    } else if (entry && entry.isFile()) { // file
      console.log('entry <' + path + '> is een file #' + fileCount);
      newPath = root + '/' + 'a' + fileCount + '.txt';
      if (path !== newPath) {
        console.log('renaming <' + path + '> to <' + newPath + '>');
        fs.renameSync(path, newPath);
      };
      console.log('pushing <' + path + '> and <' + newPath + '>');
      fileList.push([path, newPath]);
      fileCount++;
    };
  });
};

// fs.readdirSync(path).forEach(function(dir, count) {
//   console.log('path = <' + path + '>, dir = <' + dir + '>, count = ' + count)
//   var oldName = dir;
//   oldPath = path + '/' + oldName;
//   var entry = fs.statSync(oldPath);

//   if (entry && entry.isDirectory()) { // directory
//     console.log('oldPath <' + oldPath + '>, oldName <' + oldName + '>, entry is een directory')
//     newPath = path + '/' + 'a' + count;
//     if (oldPath !== newPath) {
//       console.log('renaming directory <' + oldPath + '> to <' + newPath + '>');
//       fs.rename(oldPath, newPath, function(err) {
//         console.log('inside rename <' + oldPath + '> to <' + newPath + '>');
//         if (err) {
//           throw (err);
//         };
//         shortenDirectoryNames(newPath, count + 1);
//         console.log('back from recursive call oldPath <' + oldPath + '>, oldName <' + oldName + '>' + '>, newPath <' + newPath + '>');
//       })
//     } else {
//       console.log('old directory name <' + oldPath + '> is the same as new directory name');
//       shortenDirectoryNames(newPath, count + 1);
//       console.log('back from recursive call oldPath <' + oldPath + '>, oldName <' + oldName + '>' + '>, newPath <' + newPath + '>');
//     };
//   };
// });

var rootPath = '/www/rename1';

gulp.task('filesystem', function() {
  shortenDirectoryNames(rootPath, 1);

  var count1 = 0;
  console.log('This is the list of directories after rename:');
  directoryList.forEach(function(path) {
    console.log(path);
    count1++;
  });

  var count2 = 0;
  console.log('This is the list of files after rename:');
  fileList.forEach(function(old2new) {
    console.log(old2new[0] + ' -> ' + old2new[1]);
    count2++;
  });
  console.log('Total of ' + count1 + ' directories and ' + count2 + ' files')
});
