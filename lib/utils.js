'use strict';


//---------//
// Imports //
//---------//

const bPromise = require('bluebird');


//------//
// Main //
//------//

const isUndefined = val => typeof val === 'undefined';

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
  isUndefined
  , streamToPromise
};
