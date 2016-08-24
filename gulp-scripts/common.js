'use strict';


//---------//
// Imports //
//---------//

const bPromise = require('bluebird')
  , fs = require('fs')
  , fp = require('lodash/fp')
  , path = require('path')
  , rimrafAsync = bPromise.promisify(require('rimraf'))
  ;


//------//
// Init //
//------//

const bFs = fp.bindAll(['mkdirAsync'], bPromise.promisifyAll(fs));


//------//
// Main //
//------//

const cleanDir = dir => {
  dir = path.resolve(dir);
  return rimrafAsync(dir)
    .thenReturn(dir)
    .then(bFs.mkdirAsync);
};


//---------//
// Exports //
//---------//

module.exports = { cleanDir };
