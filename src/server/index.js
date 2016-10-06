'use strict';


//---------//
// Imports //
//---------//

const beerkbInternalS2r = require('beerkb-internal-s2r')
  , bPromise = require('bluebird')
  , bFs = bPromise.promisifyAll(require('fs'))
  , bRequest = require('request-promise')
  , chalk = require('chalk')
  , http = require('http')
  , Koa = require('koa')
  , koaCompress = require('koa-compress')
  , koaJsonBody = require('koa-json-body')
  , koaNunjucks = require('koa-nunjucks-2')
  , koaRouter = require('koa-router')
  , koaStatic = require('koa-static')
  , minimist = require('minimist')
  , path = require('path')
  , portfinder = require('portfinder')
  , r = require('ramda')
  , request = require('request')
  , rUtils = require('./r-utils')
  , schemas = require('../shared/schemas')
  , ssl = require('../../ssl')
  , viewModels = require('./view-models')
  ;


//------//
// Init //
//------//

const app = new Koa()
  , argv = minimist(process.argv.slice(2), { default: { ssl: true }})
  , bGetPort = bPromise.promisify(portfinder.getPort)
  , distDir = path.resolve(path.join(__dirname, '../../dist'))
  , highlight = chalk.green
  , httpsOptions = ssl.credentials
  , isDev = !!argv.dev
  , { isDefined, mutableMerge, size } = rUtils
  ;

let router = koaRouter();


//------//
// Main //
//------//

const getApp = (internalS2rPort, letsEncryptStaticDir) => {
  app.use(koaCompress())
    .use(koaStatic('./dist/static'))
    ;

  if (letsEncryptStaticDir) {
    app.use(koaStatic(letsEncryptStaticDir));
  }

  app.use(koaJsonBody());

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

  router = setupRoutes(router, internalS2rPort);

  app.use(router.routes())
    .use(router.allowedMethods());

  return app;
};

const start = () => {
  runSanityCheck(httpsOptions);

  return bPromise.props({
      internalS2rPort: beerkbInternalS2r.run()
      , beerkbPort: bGetPort()
    })
    .then(({ internalS2rPort, beerkbPort }) => {
      const app = getApp(internalS2rPort);
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

module.exports = { start, getApp };
