'use strict';


//---------//
// Imports //
//---------//

const $ = require('./external/domtastic')
  , velocity = require('velocity-animate')
  , r = require('./external/ramda.custom')
  , template = require('lodash.template')
  , utils = require('./utils')
  ;


//------//
// Init //
//------//

const {
    getRoundedRectangleProps
  } = utils
  , styleTpl = getStyleTpl()
  ;


//------//
// Main //
//------//

// handle bubble worker
const bubbleLayer = $(document.createElement('div')).attr({ id: 'bubble-layer' });
$(document.body).prepend(bubbleLayer);

const worker = new Worker('js/bubble-worker.js');

worker.onmessage = e => {
  displayBubble(e.data);
};

const initialData = {
  clientWidth: document.body.clientWidth
  , clientHeight: document.body.clientHeight
  , h1pLoc: getRoundedRectangleProps('h1 + p')
  , headerLoc: getRoundedRectangleProps('header')
};
worker.postMessage(initialData);


//-------------//
// Helper Fxns //
//-------------//

const delay = r.partial(
  ms => new Promise(resolve => setTimeout(resolve, ms))
  , [200]
);

let showBubble = Promise.resolve();
function displayBubble(aBubble) {
  showBubble = showBubble.then(() => {
      const bubbleDiv = getBubbleDiv(aBubble.loc, aBubble.diameter);
      bubbleLayer.append(bubbleDiv);
      velocity(bubbleDiv, { opacity: 1 }, { duration: 200 });
    })
    .then(delay)
    ;
}

function getBubbleDiv(loc, diameter) {
  return $(document.createElement('div'))
    .attr({
      class: 'bubble'
      , style: styleTpl({diameter, loc})
    });
}

function getStyleTpl() {
  return template(
    'width: <%= diameter %>px; height: <%= diameter %>px; left: <%= loc.x %>px;'
    + ' top: <%= loc.y %>px;"></div>'
  );
}
