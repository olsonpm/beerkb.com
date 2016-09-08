'use strict';


//---------//
// Imports //
//---------//

const chalk = require('chalk')
  , Koa = require('koa')
  , minimist = require('minimist')
  , path = require('path')
  , sqliteToRest = require('sqlite-to-rest')
  ;


//------//
// Init //
//------//

const argv = minimist(process.argv.slice(2))
  , dbPath = path.join(__dirname, 'beer.sqlite3')
  , getSqliteRouter = sqliteToRest.getSqliteRouter
  , highlight = chalk.green
  , isDev = !!argv.dev
  , port = (isDev)
    ? 8085
    : process.env.sqliteToRest_port;

runSanityCheck(port);


//------//
// Main //
//------//

const app = new Koa();

const run = () => getSqliteRouter({ dbPath })
  .then(router => {
    app.use(router.routes())
      .use(router.allowedMethods())
      .listen(port);

    console.log('sqlite-to-rest server listening on port: ' + highlight(port));
    return port;
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

module.exports = { run };
