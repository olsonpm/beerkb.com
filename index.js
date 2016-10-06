'use strict';

const backend = require('./src/server')
  , gulpEntry = require('./gulp-scripts/all.js')
  ;

module.exports = {
  build: gulpEntry.build
  , getApp: backend.getApp
  , serve: gulpEntry.serve
};
