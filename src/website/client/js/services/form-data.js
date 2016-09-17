'use strict';


//---------//
// Imports //
//---------//

const rUtils = require('../r-utils')
  , snakeCase = require('lodash.snakecase')
  ;


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
    (res, el) => mutableAssoc(snakeCase(el.id), el.value, res)
    , {}
  );
}


//---------//
// Exports //
//---------//

module.exports = exportMe;
