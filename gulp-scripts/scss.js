'use strict';


//---------//
// Imports //
//---------//

const autoprefixer = require('autoprefixer')
  , bPromise = require('bluebird')
  , cssnano = require('cssnano')
  , gulp = require('gulp')
  , path = require('path')
  , postcss = require('gulp-postcss')
  , rimrafAsync = bPromise.promisify(require('rimraf'))
  , sass = require('gulp-sass')
  , sourcemaps = require('gulp-sourcemaps')
  , utils = require('../lib/utils')
  , vFs = require('vinyl-fs')
  ;


//------//
// Init //
//------//

const inDir = path.join(__dirname, '../src/client/assets/scss')
  , indexScss = path.join(inDir, 'index.scss')
  , outDir = path.join(__dirname, '../dist/static/assets/css')
  , processors = [
    autoprefixer({browsers: ['last 2 versions']})
    , cssnano()
  ]
  , refresh = global.refresh
  , { streamToPromise } = utils
  ;


//------//
// Main //
//------//

gulp.task('scss-build', build)
  .task('scss-clean', clean)
  .task('scss-watch', watch)
  ;


//-------------//
// Helper Fxns //
//-------------//

function build() {
  return clean()
    .then(() => streamToPromise(
      vFs.src(indexScss)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(sourcemaps.write('.'))
        .pipe(vFs.dest(outDir))
        .pipe(refresh())
    ));
}

function clean() {
  return rimrafAsync(outDir);
}

function watch() {
  return streamToPromise(
    gulp.watch(path.join(inDir, '**/*'), ['scss-build'])
  );
}


//---------//
// Exports //
//---------//

module.exports = { build, clean, watch };
