'use strict';


//---------//
// Imports //
//---------//

const bPromise = require('bluebird')
  , bFs = bPromise.promisifyAll(require('fs'))
  , minimist = require('minimist')
  , path = require('path')
  ;


//------//
// Init //
//------//

const argv = minimist(process.argv.slice(2), { default: { ssl: true }})
  , isDev = !!argv.dev
  , hasSsl = !!argv.ssl
  ;


//------//
// Main //
//------//

let key, cert;

try {
  key = bFs.readFileSync((isDev)
    ? path.join(__dirname, 'selfsigned.key')
    : path.join(process.env.HOME, 'ssl/beerkb/key')
  );
  cert = bFs.readFileSync((isDev)
    ? path.join(__dirname, 'selfsigned.crt')
    : path.join(process.env.HOME, 'ssl/beerkb/crt')
  );
} catch (e) {
  if (e.code !== 'ENOENT') throw e;
}

if (!isDev && hasSsl && (!key || !cert)) {
  throw new Error("files 'key' and 'cert' must exist in ~/ssl/beerkb");
}

//---------//
// Exports //
//---------//

module.exports = {
  key
  , cert
  , credentials: {
    key, cert
  }
};
