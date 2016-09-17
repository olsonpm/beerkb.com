'use strict';


//---------//
// Imports //
//---------//

const kebabCase = require('lodash.kebabcase')
  , r = require('../external/ramda.custom')
  , rUtils = require('../r-utils')
  , schemas = require('../../../shared/schemas')
  , startCase = require('lodash.startcase')
  ;


//------//
// Init //
//------//

const { isDefined, isLaden } = rUtils
  , keys = {
    beer: schemas.beer.keys
    , brewery: schemas.brewery.keys
  }
  ;


//------//
// Main //
//------//

module.exports = {
  buildInputFields: ({ keyToTpl, keyToValue, keyToList, keyToLabel={}
    , keyToId={}, keyToErrors={}, item, type }) => {

    return r.pipe(
      r.map(
        key => ({
          tpl: 'input-fields/' + keyToTpl[key]
          , value: (r.contains(key, keyToValue)) ? item[key] : undefined
          , list: keyToList[key]
          , selected: keyToList[key] && item[key]
          , errors: keyToErrors[key]
          , label: keyToLabel[key] || startCase(key)
          , id: keyToId[key] || kebabCase(key)
        })
      )
      , r.map(r.pickBy(isDefined))
      , r.filter(isLaden)
    )(keys[type]);
  }
};
