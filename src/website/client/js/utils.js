'use strict';


//---------//
// Imports //
//---------//

const r = require('ramda')
  , rUtils = require('./r-utils')
  , $ = require('./external/domtastic.custom')
  ;


//------//
// Init //
//------//

const rectangleProps = ['top', 'right', 'bottom', 'left']
  , {
    invoke
  } = rUtils
  ;


//------//
// Main //
//------//

const getRoundedRectangleProps = r.pipe(
  $
  , r.head
  , invoke('getBoundingClientRect')
  , r.pick(rectangleProps)
  , r.map(Math.round)
);

const getRandomIntBetween = r.curry(
  (min, max) => Math.floor(Math.random()*(max - min + 1) + min)
);


//---------//
// Exports //
//---------//

module.exports = {
  getRandomIntBetween
  , getRoundedRectangleProps
};
