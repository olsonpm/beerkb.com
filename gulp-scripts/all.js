'use strict';


//---------//
// Globals //
//---------//

const rUtils = require('../lib/r-utils')
  , path = require('path')
  , gulpRefresh = require('gulp-refresh')
  ;

const { mutableMerge } = rUtils;

mutableMerge(
  global
  , {
    releaseDir: path.join(__dirname, '../release')
    , refresh: gulpRefresh
  }
);


//---------//
// Imports //
//---------//

const bPromise = require('bluebird');

const backend = require('../src/server')
  , common = require('./common')
  , fp = require('lodash/fp')
  , gulp = require('gulp')
  , minimist = require('minimist')
  , ncpAsync = bPromise.promisifyAll(require('ncp'))
  , r = require('ramda')
  , tasks = fp.reduce(
    (res, val) => fp.set(val, require('./' + val), res)
    , {}
    , ['njk', 'js', 'scss', 'fonts']
  )
  , webpack = require('webpack')
  , webpackConfig = require('../webpack.config')
  ;


//------//
// Init //
//------//

const argv = minimist(process.argv.slice(2), { default: { ssl: true }})
  , bWebpack = bPromise.promisify(webpack)
  , cleanDir = common.cleanDir
  ;

let isDev = !!argv.dev;


//------//
// Main //
//------//

gulp.task('build', r.nAry(0, build))
  .task('build-release', ['build'], buildRelease)
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

function build(releaseDir) {
  if (releaseDir) global.releaseDir = releaseDir;
  return clean().then(buildAll);
}

function buildRelease() {
  return bWebpack(webpackConfig).then(stats => {
    if (stats.hasErrors())
      throw new Error("Error during compile: " + JSON.stringify(stats.toJson(true), null, 2));
  });
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
        , path.join(global.releaseDir, 'static/js/livereload.js')
      );
    });
}

function watchAll() {
  return bPromise.all(
    fp.invokeMap('watch', tasks)
  );
}

function clean() {
  return cleanDir('release');
}

function listen() {
  let opts = {
    basePath: './release'
    , reloadPage: '/'
  };

  global.refresh.listen(opts);
}


//---------//
// Exports //
//---------//

module.exports = { serve, build };
