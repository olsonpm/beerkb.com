'use strict';


//---------//
// Imports //
//---------//

const stateList = require('../../../shared/state-list')
  , helpers = require('./helpers')
  ;


//------//
// Main //
//------//

const keyToTpl = {
    city_name: 'text'
    , name: 'text'
    , state: 'select'
  }
  , keyToValue = ['city_name', 'name']
  , keyToList = {
    state: stateList
  }
  ;

module.exports = (aBrewery, keyToErrors) => ({
  inputFields: helpers.buildInputFields({
    keyToTpl, keyToValue, keyToList, keyToErrors, item: aBrewery, type: 'brewery'
  })
});
