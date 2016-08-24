'use strict';


//---------//
// Imports //
//---------//

const bPromise = require('bluebird')
  , bFs = bPromise.promisifyAll(require('fs'))
  , chalk = require('chalk')
  , http2 = require('http2')
  , Koa = require('koa')
  , koaCompress = require('koa-compress')
  , koaNunjucks = require('koa-nunjucks-2')
  , koaRouter = require('koa-router')
  , koaStatic = require('koa-static')
  , minimist = require('minimist')
  , path = require('path')
  , portfinder = bPromise.promisifyAll(require('portfinder'))
  , ssl = require('../../../ssl')
  ;


//------//
// Init //
//------//

const app = new Koa()
  , argv = minimist(process.argv.slice(2), { default: { ssl: true }})
  , isDev = !!argv.dev
  , distDir = path.resolve(path.join(__dirname, '../../../dist'))
  , highlight = chalk.green
  , http2Options = ssl.credentials
  , sqliteToRestPort = (isDev)
    ? 8085
    : process.env.sqliteToRest_port
  ;

let router = koaRouter();

runSanityCheck(http2Options);


//------//
// Main //
//------//

const start = () => {
  app.use(koaCompress())
    .use(koaStatic('./dist/static'));

  if (isDev) {
    app.use((ctx, next) => {
      return next()
        .catch(err => {
          if (ctx.status === 500) {
            console.error(err);
            ctx.type = 'html';
            ctx.body = bFs.createReadStream(path.join(__dirname, '../../dist/views/errors/500.html'));
            ctx.status = 200;
          } else {
            throw err;
          }
        });
    });
  }

  app.use(
    koaNunjucks({
      path: path.join(distDir, 'views')
      , nunjucksConfig: {
        noCache: isDev
        , throwOnUndefined: true
        , watch: isDev
      }
    })
  );

  router = setupRoutes(router);

  app.use(router.routes())
    .use(router.allowedMethods());

  return portfinder.getPortAsync()
    .then(port => {
      http2.createServer(
          http2Options
          , app.callback()
        )
        .listen(port);

      console.log('listening on port ' + highlight(port));
      return port;
    });
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

function setupRoutes(router) {
  return router.get('/', (ctx, next) => {
      ctx.render(
        'home'
        , { isDev }
      );
      return next();
    })

    .post('/api/beer/:id', (ctx, next) => {
      ctx.body = '/api/beer posted!\nctx.params.id: ' + ctx.params.id;
      return next();
    })

    .post('/api/brewery/:id', (ctx, next) => {
      ctx.body = '/api/brewery posted!\nctx.params.id: ' + ctx.params.id;
      return next();
    })

    .delete('/api/beer/:id', (ctx, next) => {
      ctx.body = '/api/beer deleted!\nctx.params.id: ' + ctx.params.id;
      return next();
    })

    .delete('/api/brewery/:id', (ctx, next) => {
      ctx.body = '/api/brewery delete!\nctx.params.id: ' + ctx.params.id;
      return next();
    })

    .get('/api/beer', (ctx, next) => {
      ctx.body = '/api/beer got!\nctx.querystring: ' + ctx.querystring;
      return next();
    })

    .delete('/api/brewery', (ctx, next) => {
      ctx.body = '/api/brewery got!\nctx.querystring: ' + ctx.querystring;
      return next();
    })
    ;
}


//---------//
// Exports //
//---------//

module.exports = { start };
