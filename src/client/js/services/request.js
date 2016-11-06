'use strict';


//---------//
// Imports //
//---------//

const axios = require('axios')
  , r = require('../../../../lib/external/ramda.custom')
  , rUtils = require('../../../../lib/r-utils')
  ;


//------//
// Init //
//------//

const items = ['beer', 'brewery']
  , axiosInst = axios.create({
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
    delete: r.curry((itemType, id) => axiosInst.delete(itemType, { params: { id } }))
    , edit: r.curry((itemType, data, id) => axiosInst({
      method: 'post'
      , url: itemType
      , params: { id }
      , data
    }))
    , create: r.curry((itemType, data) => axiosInst.post(itemType, data))
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
