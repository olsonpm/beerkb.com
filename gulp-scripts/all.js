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

const beerkbInternalS2r = require('beerkb-internal-s2r')
  , chalk = require('chalk')
  , common = require('./common')
  , fp = require('lodash/fp')
  , gulp = require('gulp')
  , http = require('http')
  , minimist = require('minimist')
  , ncpAsync = bPromise.promisifyAll(require('ncp'))
  , portfinder = require('portfinder')
  , r = require('ramda')
  , requireReload = require('require-reload')
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
  , bGetPort = bPromise.promisify(portfinder.getPort)
  , bWebpack = bPromise.promisify(webpack)
  , cleanDir = common.cleanDir
  , highlight = chalk.green
  , reload = requireReload(require)
  ;

let isDev = !!argv.dev;


//------//
// Main //
//------//

gulp.task('build', r.nAry(0, build))
  .task('clean', clean)
  .task('serve', ['build'], r.nAry(0, serve))
  ;

function serve(isDev_) {
  if (typeof isDev_ !== 'undefined') isDev = isDev_;

  const compiler = webpack(webpackConfig);
  let requestListener;

  bPromise.props({
      backendPort: bGetPort()
      , internalS2r: beerkbInternalS2r.run()
    })
    .then(({ backendPort, internalS2r }) => {
      // can't just pass requestListener since it may get hotreloaded
      http.createServer((req, res) => requestListener(req, res))
        .listen(backendPort);

      console.log('beerkb listening on port: ' + highlight(backendPort));

      compiler.watch({}, (err, stats) => {
        if (err || stats.hasErrors()) return;

        // no errors, good to go
        requestListener = reload('../release/index.pack').getRequestListener(internalS2r.port, '', isDev);
        console.log('webpack finished building');
        global.refresh.reload();
      });
    });

  listen();

  return watchAll();
}

function build(releaseDir) {
  if (releaseDir) global.releaseDir = releaseDir;
  return clean().then(buildAll)
    .then(() => bWebpack(webpackConfig))
    .then(stats => {
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
      return ncpAsync(
        path.join(__dirname, '../src/server/favicon.ico')
        , path.join(global.releaseDir, 'static/favicon.ico')
      );
    })
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
