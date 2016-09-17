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
  ;

schema.assignName({ inStateList });


//------//
// Main //
//------//

const definition = {
  name: {
    namedValidationFns: [isLaden, startsWithUppercase]
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
