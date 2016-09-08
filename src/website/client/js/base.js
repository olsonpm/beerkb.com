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
        translateZ: 0 // Force HA by animating a 3D property
        , translateY: -(document.body.clientHeight + (diameter * 2)) + 'px'
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
    clientHeight: document.body.clientHeight
    , clientWidth: document.body.clientWidth
    , clientWidthRange: [480, 992] // values taken from _variables.scss
    , fizzRateRange: [200, 700] // ms
    , fizzSpeedRange: [4, 15] // 1px/<x>ms
    , onBubbleCreate: createBubble
    , scrollY: window.scrollY
  });
}

function handleWindowResize() {
  bubbleGenerator.updateClientDimensions({
    clientHeight: document.body.clientHeight
    , clientWidth: document.body.clientWidth
  });
}

function initScrollHandler() {
  window.addEventListener('scroll', () => {
    bubbleGenerator.updateScrollY(window.scrollY);
  });
}
