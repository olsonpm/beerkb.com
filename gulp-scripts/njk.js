'use strict';


//---------//
// Imports //
//---------//

const bPromise = require('bluebird')
  , bFs = bPromise.promisifyAll(require('fs'))
  , gulp = require('gulp')
  , mkdirpAsync = bPromise.promisify(require('mkdirp'))
  , ncpAsync = bPromise.promisifyAll(require('ncp'))
  , nunjucks = require('nunjucks')
  , path = require('path')
  , rimrafAsync = bPromise.promisify(require('rimraf'))
  , utils = require('../lib/utils')
  ;


//------//
// Init //
//------//

const browserCompiledTemplatesIn = './src/server/browser-templates'
  , browserCompiledTemplatesOut = './src/client/js/precompiled-templates.js'
  , inDir = './src/server/views'
  , outDir = './dist/views'
  , refresh = global.refresh
  , { streamToPromise } = utils
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
    .then(compileBrowserTemplates)
    .then(() => mkdirpAsync(inDir))
    .then(() => ncpAsync(inDir, outDir))
    .then(() => refresh.reload())
    ;
}

function compileBrowserTemplates() {
  const contents = nunjucks.precompile(
    browserCompiledTemplatesIn
    , {
      include: [/.*/]
      , wrapper
    }
  );
  return bFs.writeFileAsync(browserCompiledTemplatesOut, contents);
}

function clean() {
  return rimrafAsync(outDir);
}

function watch() {
  return streamToPromise(
    gulp.watch([path.join(inDir, '**/*'), path.join(browserCompiledTemplatesIn, '**/*')], ['njk-build'])
  );
}

function wrapper(templates, opts) {
  let out = ''
    , name
    , template
    , eol
    ;

  opts = opts || {};
  eol = opts.eol || '\n';

  for (var i = 0; i < templates.length; i++) {
    name = JSON.stringify(templates[i].name);
    template = templates[i].template;

    out += 'module.exports[' + name.replace('.njk', '') + '] = ' +
      '(function() {' + eol + template + eol +
      '})();' + eol;
  }

  return out;
}


//---------//
// Exports //
//---------//

module.exports = { build, clean, watch };
