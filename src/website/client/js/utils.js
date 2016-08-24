'use strict';


//---------//
// Imports //
//---------//

const r = require('ramda')
  , rUtils = require('./r-utils')
  , $ = require('./external/domtastic')
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


//---------//
// Exports //
//---------//

module.exports = {
  getRoundedRectangleProps
};
