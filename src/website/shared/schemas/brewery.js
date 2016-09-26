'use strict';


//---------//
// Imports //
//---------//

const schema = require('../schema')
  , r = require('../ramda.custom')
  , stateList = require('../state-list')
  ;


//------//
// Init //
//------//

const { isLaden, startsWithUppercase } = schema.fns
  , inStateList = r.contains(r.__, stateList)
  , lte30 = r.pipe(r.length, r.lte(r.__, 30))
  ;

schema.assignName({ inStateList, lte30 });


//------//
// Main //
//------//

const definition = {
  name: {
    namedValidationFns: [isLaden, startsWithUppercase, lte30]
  }
  , state: {
    namedValidationFns: [inStateList]
  }
  , city_name: {
    namedValidationFns: [isLaden, startsWithUppercase]
  }
  , beer: { flags: ['ignore'] }
};

module.exports = {
  validate: schema.validate(definition)
  , keys: r.pipe(r.reject(schema.isIgnored), r.keys)(definition)
};
