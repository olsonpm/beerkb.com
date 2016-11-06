'use strict';


//---------//
// Imports //
//---------//

const rUtils = require('../../../../lib/r-utils');


//------//
// Init //
//------//

const { mutableAssoc } = rUtils;


//------//
// Main //
//------//

const exportMe = {
  get
};


//-------------//
// Helper Fxns //
//-------------//

function get(ctxDt) {
  return ctxDt.find('[data-form]').reduce(
    (res, { id, value }) => mutableAssoc(id, value, res)
    , {}
  );
}


//---------//
// Exports //
//---------//

module.exports = exportMe;
