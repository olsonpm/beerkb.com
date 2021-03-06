'use strict';


//---------//
// Imports //
//---------//

const schema = require('../schema')
  , r = require('../../../lib/external/ramda.custom')
  , styleList = require('../style-list')
  ;


//------//
// Init //
//------//

const { isLaden, startsWithUppercase } = schema.fns
  , inStyleList = r.contains(r.__, styleList)
  , lte30 = r.pipe(r.length, r.lte(r.__, 30))
  , lte500 = r.pipe(r.length, r.lte(r.__, 500))
  ;

schema.assignName({ inStyleList, lte30, lte500 });


//------//
// Main //
//------//

const definition = {
  name: {
    namedValidationFns: [isLaden, startsWithUppercase, lte30]
  }
  , style: {
    namedValidationFns: [inStyleList]
  }
  , description: {
    namedValidationFns: [isLaden, startsWithUppercase, lte500]
  }
};


//---------//
// Exports //
//---------//

module.exports = {
  validate: schema.validate(definition)
  , keys: r.keys(definition)
};
