'use strict';

//
// TODO
// - This file should be built.  Aint nobody got time fo dat dough.
//


//---------//
// Imports //
//---------//

const r = require('../../../../lib/external/ramda.custom')
  , rUtils = require('../../../../lib/r-utils')
  ;


//------//
// Init //
//------//

const { mutableMerge } = rUtils;

const views = {
  home: require('./home.js')
};


//------//
// Main //
//------//

const exportMe = mutableMerge(
  { contains }
  , views
);


//-------------//
// Helper Fxns //
//-------------//

function contains(viewName) {
  return r.contains(
    viewName
    , r.keys(views)
  );
}


//---------//
// Exports //
//---------//

module.exports = exportMe;
