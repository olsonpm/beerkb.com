'use strict';


//---------//
// Imports //
//---------//

const bPromise = require('bluebird')
  , bFs = bPromise.promisifyAll(require('fs'))
  , chalk = require('chalk')
  , https = require('https')
  , Koa = require('koa')
  , koaCompress = require('koa-compress')
  , koaNunjucks = require('koa-nunjucks-2')
  , koaRouter = require('koa-router')
  , koaStatic = require('koa-static')
  , minimist = require('minimist')
  , path = require('path')
  , portfinder = bPromise.promisifyAll(require('portfinder'))
  , r = require('ramda')
  , request = require('request')
  , bRequest = require('request-promise')
  , rUtils = require('./r-utils')
  , sqliteToRestServer = require('../../internal-rest-api/server')
  , ssl = require('../../../ssl')
  , utils = require('../../../lib/utils')
  , viewModels = require('./view-models')
  ;


//------//
// Init //
//------//

const app = new Koa()
  , argv = minimist(process.argv.slice(2), { default: { ssl: true }})
  , isDev = !!argv.dev
  , distDir = path.resolve(path.join(__dirname, '../../../dist'))
  , highlight = chalk.green
  , httpsOptions = ssl.credentials
  , { mutableMerge } = rUtils
  , { isUndefined } = utils
  ;

let router = koaRouter();

runSanityCheck(httpsOptions);


//------//
// Main //
//------//

const start = () => {
  return sqliteToRestServer.run()
    .then(sqliteToRestPort => {
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

      router = setupRoutes(router, sqliteToRestPort);

      app.use(router.routes())
        .use(router.allowedMethods());

      return portfinder.getPortAsync()
        .then(port => {
          https.createServer(
              httpsOptions
              , app.callback()
            )
            .listen(port);

          console.log('beerkb.com backend listening on port ' + highlight(port));
          return port;
        });
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

function setupRoutes(router, sqliteToRestPort) {
  const engine = createViewModelAndApiEngine(sqliteToRestPort);

  router = createApiRoutes(router, engine.getApiResponse);

  return router.get('/', (ctx, next) => {
    return engine.getVm('home')
      .then(vm => ctx.render('home', vm))
      .then(next);
  });
}

function createApiRoutes(router, getApiResponse) {
  r.forEach(
    ([method, item]) => {
      router[method](
        '/api/' + item
        , (ctx, next) => {

          ctx.body = getApiResponse(method, item, ctx);
          return next();
        }
      );
    }
    , getMethodItemPairs()
  );

  return router;
}

function getMethodItemPairs() {
  return r.xprod(['get', 'post', 'delete'], ['brewery', 'beer']);
}

const createGetItem = r.curry(r.memoize(
  (usePromise, port, itemName) => {
    const uri = `http://localhost:${port}/${itemName}`;
    return r.pipe(
      mutableMerge({ uri, json: true })
      , usePromise
        ? bRequest
        : request
    );
  }
));

function createViewModelAndApiEngine(sqliteToRestPort) {
  const getItem = createGetItem(false, sqliteToRestPort)
    , getBItem = createGetItem(true, sqliteToRestPort)
    ;

  const vm = viewModels.createAll({ getBItem });

  return {
    getVm: viewName => vm[viewName].get()
      .then(r.pipe(
        r.assoc('vm', r.__, {})
        , mutableMerge({ isDev, viewName })
      ))
    , getApiResponse: (method, item, ctx) =>
      getItem(item)(getApiRequestOpts(method, item, ctx, sqliteToRestPort))
  };
}

function getApiRequestOpts(method, item, ctx, sqliteToRestPort) {
  return r.reject(
    isUndefined
    , {
      method: method.toUpperCase()
      , uri: `http://localhost:${sqliteToRestPort}/${item}${ctx.search}`
      , body: ctx.body
    }
  );
}


//---------//
// Exports //
//---------//

module.exports = { start };
