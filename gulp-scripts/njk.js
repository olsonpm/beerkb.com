'use strict';


//---------//
// Imports //
//---------//

const bPromise = require('bluebird')
  , gulp = require('gulp')
  , mkdirpAsync = bPromise.promisify(require('mkdirp'))
  , ncpAsync = bPromise.promisifyAll(require('ncp'))
  , path = require('path')
  , rimrafAsync = bPromise.promisify(require('rimraf'))
  , utils = require('../lib/utils')
  ;


//------//
// Init //
//------//

const inDir = './src/website/client/views'
  , outDir = './dist/views'
  , { streamToPromise } = utils
  , refresh = global.refresh
  ;


//------//
// Main //
//------//

gulp.task('njk-build', build)
  .task('njk-clean', clean)
  .task('njk-watch', watch)
  ;


//-------------//
// Helper Fxns //
//-------------//

function build() {
  return clean()
    .then(() => mkdirpAsync(inDir))
    .then(() => ncpAsync(inDir, outDir))
    .then(() => refresh.reload())
    ;
}

function clean() {
  return rimrafAsync(outDir);
}

function watch() {
  return streamToPromise(
    gulp.watch(path.join(inDir, '**/*'), ['njk-build'])
  );
}


//---------//
// Exports //
//---------//

module.exports = { build, clean, watch };
