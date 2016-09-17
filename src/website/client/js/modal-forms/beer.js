'use strict';


//---------//
// Imports //
//---------//

const styleList = require('../../../shared/style-list')
  , helpers = require('./helpers')
  ;


//------//
// Main //
//------//

const keyToTpl = {
    name: 'text'
    , description: 'text-area'
    , style: 'select'
  }
  , keyToValue = ['name', 'description']
  , keyToList = {
    style: styleList
  }
  ;

module.exports = (aBeer, keyToErrors) => ({
  inputFields: helpers.buildInputFields({
    keyToTpl, keyToValue, keyToList, keyToErrors, item: aBeer, type: 'beer'
  })
});
