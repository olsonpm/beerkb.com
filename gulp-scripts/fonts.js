'use strict';


//---------//
// Imports //
//---------//

const bPromise = require('bluebird')
  , gulp = require('gulp')
  , path = require('path')
  , rimrafAsync = bPromise.promisify(require('rimraf'))
  , utils = require('../lib/utils')
  , vFs = require('vinyl-fs')
  ;


//------//
// Init //
//------//

const inDir = path.resolve('./src/client/assets/fonts/*')
  , outDir = path.resolve('./dist/static/assets/fonts')
  , { streamToPromise } = utils
  , refresh = global.refresh
  ;


//------//
// Main //
//------//

gulp.task('fonts-build', build)
  .task('fonts-clean', clean)
  .task('fonts-watch', watch);


//-------------//
// Helper Fxns //
//-------------//

function build() {
  return clean()
    .then(streamToPromise(
      vFs.src(inDir)
        .pipe(vFs.dest(outDir))
        .pipe(refresh())
    ));
}

function clean() {
  return rimrafAsync(outDir);
}

function watch() {
  return streamToPromise(
    gulp.watch(path.join(inDir, '**/*'), ['fonts-build'])
  );
}


//---------//
// Exports //
//---------//

module.exports = { build, clean, watch };
