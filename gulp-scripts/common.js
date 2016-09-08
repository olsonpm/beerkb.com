'use strict';


//---------//
// Imports //
//---------//

const bPromise = require('bluebird')
  , fs = require('fs')
  , path = require('path')
  , rimrafAsync = bPromise.promisify(require('rimraf'))
  ;


//------//
// Init //
//------//

const bFs = bPromise.promisifyAll(fs)
  , mkdirAsync = bFs.mkdirAsync.bind(bFs)
  ;


//------//
// Main //
//------//

const cleanDir = dir => {
  dir = path.resolve(dir);
  return rimrafAsync(dir)
    .thenReturn(dir)
    .then(mkdirAsync);
};


//---------//
// Exports //
//---------//

module.exports = { cleanDir };
