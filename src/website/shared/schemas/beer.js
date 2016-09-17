'use strict';


//---------//
// Imports //
//---------//

const schema = require('../schema')
  , r = require('../ramda.custom')
  , styleList = require('../style-list')
  ;


//------//
// Init //
//------//

const { isLaden, startsWithUppercase } = schema.fns
  , inStyleList = r.contains(r.__, styleList)
  ;

schema.assignName({ inStyleList });


//------//
// Main //
//------//

const definition = {
  name: {
    namedValidationFns: [isLaden, startsWithUppercase]
  }
  , style: {
    namedValidationFns: [inStyleList]
  }
  , description: {
    namedValidationFns: [isLaden, startsWithUppercase]
  }
};


//---------//
// Exports //
//---------//

module.exports = {
  validate: schema.validate(definition)
  , keys: r.keys(definition)
};
