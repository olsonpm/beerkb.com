'use strict';

const path = require('path');

module.exports = {
  target: 'node'
  , context: __dirname
  , entry: './index.js'
  , output: {
    path: path.join(__dirname, 'release')
    , filename: 'index.pack.js'
    , pathinfo: true
    , libraryTarget: 'commonjs2'
  }
  , module: {
    loaders: [{
      test: /\.json$/
      , loader: 'json'
    }]
  }
  , externals: [{ vertx: true }, /\.ts$/]
  , node: { __dirname: false }
};
