'use strict';

const koaApp = require('./src/server/app');

function getRequestListener() {
  const res = koaApp.get.apply(null, arguments);
  return res.callback();
}

module.exports = { getRequestListener };
