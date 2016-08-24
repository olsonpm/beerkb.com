'use strict';


//---------//
// Globals //
//---------//

const refresh = global.refresh = require('gulp-refresh');


//---------//
// Imports //
//---------//

const backend = require('../src/website/server')
  , bPromise = require('bluebird')
  , common = require('./common')
  , fp = require('lodash/fp')
  , gulp = require('gulp')
  , minimist = require('minimist')
  , ncpAsync = bPromise.promisifyAll(require('ncp'))
  , ssl = require('../ssl')
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
  , hasSsl = argv.ssl
  , isDev = !!argv.dev
  ;


//------//
// Main //
//------//

gulp.task('build', () => clean().then(buildAll))
  .task('clean', clean)
  .task('serve', ['build'], () => {
    listen();
    return backend.start()
      .then(watchAll);
  });


//-------------//
// Helper Fxns //
//-------------//

function buildAll() {
  return bPromise.all(
      fp.invokeMap('build', tasks)
    )
    .then(() => {
      if (isDev) {
        return ncpAsync(
          './node_modules/livereload-js/dist/livereload.js'
          , './dist/static/js/livereload.js'
        );
      }
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

  if (hasSsl) {
    opts = fp.assign(
      opts
      , ssl.credentials
    );
  }
  refresh.listen(opts);
}
