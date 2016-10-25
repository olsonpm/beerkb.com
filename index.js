'use strict';

const r = require('ramda');

const invoke = r.curry(
  (prop, obj) => r.pipe(r.prop, r.bind(r.__, obj), r.call)(prop, obj)
);

module.exports = {
  getRequestListener: r.pipe(require('./src/server').getApp, invoke('callback'))
};
