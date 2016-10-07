'use strict';


//---------//
// Globals //
//---------//

const refresh = global.refresh = require('gulp-refresh');


//---------//
// Imports //
//---------//

const backend = require('../src/server')
  , bPromise = require('bluebird')
  , common = require('./common')
  , fp = require('lodash/fp')
  , gulp = require('gulp')
  , minimist = require('minimist')
  , ncpAsync = bPromise.promisifyAll(require('ncp'))
  , path = require('path')
  , r = require('ramda')
  , tasks = fp.reduce(
    (res, val) => fp.set(val, require('./' + val), res)
    , {}
    , ['njk', 'js', 'scss', 'fonts']
  )
  ;


//------//
// Init //
//------//

const argv = minimist(process.argv.slice(2), { default: { ssl: true }})
  , cleanDir = common.cleanDir
  ;

let isDev = !!argv.dev;


//------//
// Main //
//------//

gulp.task('build', build)
  .task('clean', clean)
  .task('serve', r.nAry(0, serve))
  ;

function serve(isDev_) {
  if (typeof isDev_ !== 'undefined') isDev = isDev_;

  return build()
    .then(() => {
      listen();
      return backend.start()
        .then(watchAll);
    });
}

function build() {
  return clean().then(buildAll);
}


//-------------//
// Helper Fxns //
//-------------//

function buildAll() {
  return bPromise.all(
      fp.invokeMap('build', tasks)
    )
    .then(() => {
      if (!isDev) return;

      return ncpAsync(
        path.join(__dirname, '../node_modules/livereload-js/dist/livereload.js')
        , path.join(__dirname, '../dist/static/js/livereload.js')
      );
    });
}

function watchAll() {
  return bPromise.all(
    fp.invokeMap('watch', tasks)
  );
}

function clean() {
  return cleanDir('dist');
}

function listen() {
  let opts = {
    basePath: './dist'
    , reloadPage: '/'
  };

  refresh.listen(opts);
}


//---------//
// Exports //
//---------//

module.exports = { serve, build };
