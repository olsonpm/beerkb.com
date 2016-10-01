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
  , childProcess = require('child_process')
  , common = require('./common')
  , fp = require('lodash/fp')
  , gulp = require('gulp')
  , minimist = require('minimist')
  , moment = require('moment')
  , ncpAsync = bPromise.promisifyAll(require('ncp'))
  , path = require('path')
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

initDailyDbReset();


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

  refresh.listen(opts);
}

function initDailyDbReset() {
  const dbDir = path.join(__dirname, '../src/internal-rest-api')
    , resetFile = path.join(dbDir, 'beer.reset.sqlite3')
    , curFile = path.join(dbDir, 'beer.sqlite3')
    , msTilMidnight =  moment().add(1, 'day').startOf('day').diff(moment())
    ;

  setTimeout(() => {
    resetDb();
    setInterval(resetDb, 86400000);
  }, msTilMidnight);

  function resetDb() { childProcess.exec('cp ' + resetFile + ' ' + curFile); }
}
