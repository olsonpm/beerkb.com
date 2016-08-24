'use strict';


//---------//
// Imports //
//---------//

const bPromise = require('bluebird')
  , fp = require('lodash/fp')
  ;


//------//
// Main //
//------//

const filteredInvokeMap = str => fp.flow(
  fp.filter(str)
  , fp.invokeMap(str)
);

const streamToPromise = stream => {
  return new bPromise(function(resolve, reject) {
    stream.on("end", resolve);
    stream.on("error", reject);
  });
};


//---------//
// Exports //
//---------//

module.exports = {
  filteredInvokeMap
  , streamToPromise
};
