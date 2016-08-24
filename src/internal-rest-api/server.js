'use strict';


//---------//
// Imports //
//---------//

const Koa = require('koa')
  , minimist = require('minimist')
  , sqliteToRest = require('sqlite-to-rest')
  ;


//------//
// Init //
//------//

const argv = minimist(process.argv.slice(2))
  , dbPath = './beer.sqlite3'
  , getSqliteRouter = sqliteToRest.getSqliteRouter
  , isDev = !!argv.dev
  , port = (isDev)
    ? 8085
    : process.env.sqliteToRest_port;

runSanityCheck(port);


//------//
// Main //
//------//

const app = new Koa();

const res = getSqliteRouter({ dbPath })
  .then(router => {
    app.use(router.routes())
      .use(router.allowedMethods())
      .listen(port);

    console.log(`Listening on port: ${port}`);
  });


//-------------//
// Helper Fxns //
//-------------//

function runSanityCheck(port) {
  if (!port)
    throw new Error("port must be truthy: " + port);
}


//---------//
// Exports //
//---------//

module.exports = res;
