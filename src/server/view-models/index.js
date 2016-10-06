'use strict';


//---------//
// Imports //
//---------//

const r = require('ramda');


//------//
// Init //
//------//

const vms = {
  home: require('./home')
};


//------//
// Main //
//------//

const createAll = ({ getBItem }) => {
  const bGetBreweries = getBItem('brewery')
    , bGetBeers = getBItem('beer')
    ;

  const argsPerVm = {
    home: { bGetBeers, bGetBreweries }
  };

  return r.evolve(vms, argsPerVm);
};


//---------//
// Exports //
//---------//

module.exports = { createAll };
