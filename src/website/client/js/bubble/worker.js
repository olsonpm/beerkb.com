'use strict';


//---------//
// Imports //
//---------//

const bubbleGenerator = require('./generator')
  , rUtils = require('../r-utils')
  ;


//------//
// Init //
//------//

const {
  mutableAssoc
} = rUtils;


//------//
// Main //
//------//

self.onmessage = e => {
  bubbleGenerator.createBubbles(
    mutableAssoc('bubbleCreated', self.postMessage, e.data)
  );
};
