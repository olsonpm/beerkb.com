'use strict';


//---------//
// Imports //
//---------//

const $ = require('./external/domtastic.custom')
  , bubbleGenerator = require('./bubble-generator')
  , render = require('./services/render')
  , velocity = require('velocity-animate')
  ;


//------//
// Init //
//------//

let bodyHeight = document.body.clientHeight
  , bodyWidth = document.body.clientWidth;

window.onresize = handleWindowResize;


//------//
// Main //
//------//

// handle bubble worker
const bubbleLayer = $(document.createElement('div')).attr({ id: 'bubble-layer' });
$(document.body).prepend(bubbleLayer);

initBubbleGenerator();
initScrollHandler();


//-------------//
// Helper Fxns //
//-------------//

function createBubble({ x, y, duration, diameter, size }) {
  const bubbleDiv = getBubbleDiv(x, y, diameter, size);
  bubbleLayer.append(bubbleDiv);
  const easing = 'easeInQuart';

  return velocity(
      bubbleDiv
      , {
        translateZ: 0
        , translateY: -(bodyHeight + (diameter * 2)) + 'px'
      }
      , { duration, easing }
    )
    .then(bubbleDiv.remove.bind(bubbleDiv));
}

function getBubbleDiv(x, y, diameter, size) {
  return $(document.createElement('div'))
    .attr({
      class: 'bubble ' + size
      , style: render('bubble-style', { x, y, diameter })
    });
}

function initBubbleGenerator() {
  bubbleGenerator.run({
    clientHeight: bodyHeight
    , clientWidth: bodyWidth
    , clientWidthRange: [480, 992] // values taken from _variables.scss
    , fizzRateRange: [400, 800] // ms
    , fizzSpeedRange: [4, 15] // 1px/<x>ms
    , onBubbleCreate: createBubble
    , scrollY: window.scrollY
  });
}

function handleWindowResize() {
  bodyHeight = document.body.clientHeight;
  bodyWidth = document.body.clientHeight;

  bubbleGenerator.updateClientDimensions({
    clientHeight: bodyHeight
    , clientWidth: bodyWidth
  });
}

function initScrollHandler() {
  window.addEventListener('scroll', () => {
    bubbleGenerator.updateScrollY(window.scrollY);
  });
}
