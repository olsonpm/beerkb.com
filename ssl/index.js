'use strict';


//---------//
// Imports //
//---------//

const bPromise = require('bluebird')
  , bFs = bPromise.promisifyAll(require('fs'))
  , path = require('path')
  , r = require('ramda')
  ;


//------//
// Main //
//------//

let credentials = {};

const get = something => {
  if (r.isEmpty(credentials)) setCredentials();

  return (something === 'credentials')
    ? credentials
    : credentials[something];
};


//-------------//
// Helper Fxns //
//-------------//

function setCredentials() {
  credentials = {
    key: bFs.readFileSync(path.join(__dirname, 'selfsigned.key'))
    , cert: bFs.readFileSync(path.join(__dirname, 'selfsigned.crt'))
  };
}


//---------//
// Exports //
//---------//

module.exports = { get };
