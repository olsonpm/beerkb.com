'use strict';

const getApp = require('./src/server').getApp;

function getRequestListener() {
  const res = getApp.apply(null, arguments);
  return res.callback();
}

module.exports = { getRequestListener };
