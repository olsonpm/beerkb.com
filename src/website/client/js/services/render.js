'use strict';


//---------//
// Imports //
//---------//

const nunjucksSlim = require('nunjucks/browser/nunjucks-slim')
  , precompiledTemplates = require('../precompiled-templates')
  , r = require('../external/ramda.custom')
  ;


//------//
// Main //
//------//

const env = initiateNunjucks()
  , render = r.curryN(2, env.render.bind(env))
  ;


//-------------//
// Helper Fxns //
//-------------//

function initiateNunjucks() {
  const env = nunjucksSlim.configure();
  env.loaders.length = 0;
  const precompiledTemplatesLoader = new nunjucksSlim.PrecompiledLoader(precompiledTemplates);
  precompiledTemplatesLoader.cache = {};
  env.loaders.push(precompiledTemplatesLoader);

  return env;
}


//---------//
// Exports //
//---------//

module.exports = render;
