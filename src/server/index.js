'use strict';


//---------//
// Imports //
//---------//

const beerkbInternalS2r = require('beerkb-internal-s2r')
  , bPromise = require('bluebird')
  , chalk = require('chalk')
  , getApp = require('./app').get
  , http = require('http')
  , portfinder = require('portfinder')
  , ssl = require('../../ssl')
  ;


//------//
// Init //
//------//

const bGetPort = bPromise.promisify(portfinder.getPort)
  , highlight = chalk.green
  , httpsOptions = ssl.get('credentials')
  ;


//------//
// Main //
//------//

const start = () => {
  runSanityCheck(httpsOptions);

  return bPromise.props({
      internalS2r: beerkbInternalS2r.run()
      , beerkbPort: bGetPort()
    })
    .then(({ internalS2r, beerkbPort }) => {
      const app = getApp(internalS2r.port);
      http.createServer(app.callback())
        .listen(beerkbPort);

      console.log('beerkb.com backend listening on port ' + highlight(beerkbPort));
      return beerkbPort;
    })
    ;
};


//-------------//
// Helper Fxns //
//-------------//

function runSanityCheck({ key, cert }) {
  if (!key)
    throw new Error("key must be truthy: " + key);
  else if (!cert)
    throw new Error("cert must be truthy: " + cert);
}


//---------//
// Exports //
//---------//

module.exports = { start };
