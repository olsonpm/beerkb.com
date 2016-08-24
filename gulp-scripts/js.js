'use strict';


//---------//
// Imports //
//---------//

const bPromise = require('bluebird')
  , gulp = require('gulp')
  , path = require('path')
  , rimrafAsync = bPromise.promisify(require('rimraf'))
  , utils = require('../lib/utils')
  , webpackAsync = bPromise.promisify(require("webpack"))
  ;


//------//
// Init //
//------//

const inDir = path.resolve('./src/website/client/js')
  , outDir = path.resolve('./dist/static/js')
  , { streamToPromise } = utils
  , refresh = global.refresh
  ;


//------//
// Main //
//------//

gulp.task('js-build', build)
  .task('js-clean', clean)
  .task('js-watch', watch);


//-------------//
// Helper Fxns //
//-------------//

function build() {
  return clean()
    .then(() => {
      return webpackAsync({
        entry: {
          index: path.join(inDir, 'index.js')
          , "bubble-worker": path.join(inDir, 'bubble/worker')
        }
        , output: {
          filename: '[name].js'
          , path: outDir
          , pathinfo: true
        }
        , module: {
          loaders: [{
            test: /\.js$/
            , exclude: /(node_modules)/
            , loader: 'babel'
            , query: {
              presets: ['es2015']
            }
          }]
        }
        , devtool: 'cheap-source-map'
      });
    })
    .then(refresh.reload())
    ;
}

function clean() {
  return rimrafAsync(outDir);
}

function watch() {
  return streamToPromise(
    gulp.watch(path.join(inDir, '**/*.js'), ['js-build'])
  );
}


//---------//
// Exports //
//---------//

module.exports = { build, clean, watch };
