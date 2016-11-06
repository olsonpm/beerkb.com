'use strict';


//---------//
// Imports //
//---------//

const bPromise = require('bluebird')
  , bFs = bPromise.promisifyAll(require('fs'))
  , bRequest = require('request-promise')
  , Koa = require('koa')
  , koaCompress = require('koa-compress')
  , koaJsonBody = require('koa-json-body')
  , koaNunjucks = require('koa-nunjucks-2')
  , koaRouter = require('koa-router')
  , koaStatic = require('koa-static')
  , path = require('path')
  , r = require('ramda')
  , request = require('request')
  , rUtils = require('../../lib/r-utils')
  , schemas = require('../shared/schemas')
  , viewModels = require('./view-models')
  ;


//------//
// Init //
//------//

const app = new Koa()
  , releaseDir = __dirname
  , { isDefined, mutableMerge, size } = rUtils
  ;

let isDev
  , router = koaRouter()
  ;


//------//
// Main //
//------//

const getApp = (internalS2rPort, letsEncryptStaticDir, isDev_) => {
  if (typeof isDev_ !== 'undefined') isDev = isDev_;

  app.use(koaCompress())
    .use(koaStatic(path.join(releaseDir, 'static')))
    ;

  if (letsEncryptStaticDir) {
    app.use(koaStatic(letsEncryptStaticDir, { hidden: true }));
  }

  app.use(koaJsonBody());

  if (isDev) {
    app.use((ctx, next) => {
      return next()
        .catch(err => {
          if (ctx.status === 500) {
            console.error(err);
            ctx.type = 'html';
            ctx.body = bFs.createReadStream(path.join(releaseDir, 'views/errors/500.html'));
            ctx.status = 200;
          } else {
            throw err;
          }
        });
    });
  }

  app.use(
    koaNunjucks({
      path: path.join(releaseDir, 'views')
      , nunjucksConfig: {
        noCache: isDev
        , throwOnUndefined: true
        , watch: isDev
      }
    })
  );

  router = setupRoutes(router, internalS2rPort);

  app.use(router.routes())
    .use(router.allowedMethods());

  return app;
};


//-------------//
// Helper Fxns //
//-------------//

function setupRoutes(router, internalS2rPort) {
  const engine = createViewModelAndApiEngine(internalS2rPort);

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
          return getApiResponse(method, item, ctx)
            .then(apiResponseStream => { ctx.body = apiResponseStream; })
            .catch(({ statusCode, error }) => {
              ctx.status = statusCode;
              ctx.body = error;
            })
            .then(next);
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
    return opts => {
      opts = mutableMerge({ uri, json: true }, opts);
      if (usePromise) {
        return bRequest(opts)
          .catch(err => {
            if (err.statusCode === 404) return [];
            throw err;
          });
      }

      return request(opts);
    };
  }
));

function createViewModelAndApiEngine(internalS2rPort) {
  const getItem = createGetItem(false, internalS2rPort)
  , getBItem = createGetItem(true, internalS2rPort)
  ;

  const vm = viewModels.createAll({ getBItem });

  return {
    getVm: viewName => vm[viewName].get()
      .then(r.pipe(
        r.assoc('vm', r.__, {})
        , mutableMerge({ isDev, viewName })
      ))
    , getApiResponse: (method, item, ctx) => {
      if (ctx.request.body) { // need to validate body if it's passed
        var propertyToFailedValidators = schemas[item].validate({}, r.pick(schemas[item].keys, ctx.request.body));
        if (size(propertyToFailedValidators)) {
          return bPromise.resolve({
            statusCode: 400
            , error: {
              msg: 'The following properties failed their respective validators'
              , propertyToFailedValidators
            }
          });
        }
      }

      let res = bPromise.resolve();

      // TODO: clean the below if statements.  They are hacks to just git'r'done
      const baseUrl = `http://localhost:${internalS2rPort}`;
      if (method === 'post' && item === 'beer') {
        res = res.then(() => bRequest({
            uri: `${baseUrl}/brewery?id=${ctx.request.body.brewery_id}`
            , json: true
          }))
          .catch(err => {
            if (err.statusCode === 404) {
              const name = ctx.request.body.name;
              err.statusCode = 400;
              err.error = {
                msg: 'Unable to create beer ' + name + ' because its '
                 + 'brewery no longer exists.'
                , id: 'brewery_no_longer_exists'
              };
            }
            throw err;
          });
      }
      if (method === 'delete' && item === 'brewery') {
        res = res.then(() => bRequest({
            uri: `${baseUrl}/beer?brewery_id=${ctx.query.id}`
            , json: true
          }))
          .catch(err => {
            if (err.statusCode === 404) return [];
            else throw err;
          })
          .then(r.pipe(
            r.map(aBeer => bRequest.del(`${baseUrl}/beer?id=${aBeer.id}`))
            , bPromise.all
          ));
      }

      return res.then(() => getItem(item)(getApiRequestOpts(method, item, ctx, internalS2rPort)));
    }
  };
}

function getApiRequestOpts(method, item, ctx, internalS2rPort) {
  return r.filter(
    isDefined
    , {
      method: method.toUpperCase()
      , uri: `http://localhost:${internalS2rPort}/${item}${ctx.search}`
      , body: ctx.request.body
    }
  );
}


//---------//
// Exports //
//---------//

module.exports = { getApp };
