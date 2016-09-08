'use strict';


//---------//
// Imports //
//---------//

const axios = require('axios')
  , r = require('../external/ramda.custom')
  , rUtils = require('../r-utils')
  ;


//------//
// Init //
//------//

const items = ['beer', 'brewery']
  , instance = axios.create({
    baseURL: window.location.origin + '/api/'
  })
  , itemMethods = getItemMethods()
  , { transform } = rUtils;


//------//
// Main //
//------//

const exportMe = createBeerAndBreweryMethods(items);


//-------------//
// Helper Fxns //
//-------------//

function getItemMethods() {
  return {
    delete: r.curry((itemType, id) => instance.delete(itemType, { params: { id } }))
  };
}

function createBeerAndBreweryMethods(items) {
  return r.map(
    anItemMethod => transform(
      (res, cur) => res[cur] = anItemMethod(cur)
      , {}
      , items
    )
    , itemMethods
  );
}


//---------//
// Exports //
//---------//

module.exports = exportMe;
