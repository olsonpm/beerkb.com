'use strict';

// always polyfill and initialize base
require('promise-polyfill');
require('./base');


//---------//
// Imports //
//---------//

const $ = require('./external/domtastic.custom')
  , views = require('./views')
  ;


//------//
// Main //
//------//

const viewName = window.location.pathname.slice(1) || 'home';

if (!views.contains(viewName)) {
  throw new Error("View doesn't exist: " + viewName);
}

views[viewName].run(getVm(viewName));


//-------------//
// Helper Fxns //
//-------------//

function getVm(viewName) {
  return JSON.parse($(`#view-${viewName} > .vm`)[0].innerHTML);
}
