'use strict';


//---------//
// Imports //
//---------//

const $ = require('./external/domtastic.custom')
  , velocity = require('velocity-animate')
  , r = require('./external/ramda.custom')
  , template = require('lodash.template')
  , bubbleGenerator = require('./bubble-generator')
  ;


//------//
// Init //
//------//

const clientHeight = document.body.clientHeight
  , styleTpl = getStyleTpl()
  // these width values are taken from _variables.scss
  , width = {
    small: 480
    , large: 992
  }
  ;


//------//
// Main //
//------//

// handle bubble worker
const bubbleLayer = $(document.createElement('div')).attr({ id: 'bubble-layer' });
$(document.body).prepend(bubbleLayer);

bubbleGenerator.run({
  bubbleDiameterRange: getBubbleDiameterRange(document.body.clientWidth)
  , clientHeight
  , clientWidth: document.body.clientWidth
  , fizzRateRange: [200, 700] // ms
  , fizzSpeedRange: [4, 15] // 1px/<x>ms
  , onBubbleCreate: createBubble
});


//-------------//
// Helper Fxns //
//-------------//

function createBubble({ x, duration, diameter, size }) {
  const bubbleDiv = getBubbleDiv(x, diameter, size);
  bubbleLayer.append(bubbleDiv);
  const easing = 'easeInQuart';

  velocity(
    bubbleDiv
    , {
      translateZ: 0 // Force HA by animating a 3D property
      , translateY: -(clientHeight + (diameter * 2)) + 'px'
    }
    // , { top: -diameter + 'px' }
    , { duration, complete, easing }
  );

  // scoped helper fxns

  function complete() {
    bubbleDiv.remove();
  }
}

function getBubbleDiv(x, diameter, size) {
  const y = clientHeight + diameter;
  return $(document.createElement('div'))
    .attr({
      class: 'bubble ' + size
      , style: styleTpl({ x, y, diameter })
    });
}

function getStyleTpl() {
  return template(
    'width: <%= diameter %>px; height: <%= diameter %>px; left: <%= x %>px;'
    + ' top: <%= y %>px;"></div>'
  );
}

function getBubbleDiameterRange(clientWidth) {
  return [
    getLinearSlope(15, 30, clientWidth)
    , getLinearSlope(50, 70, clientWidth)
  ];
}

function getLinearSlope(min, max, clientWidth) {
  const slope = (max - min)/(width.large - width.small)
    , yIntercept = max - (width.large * slope)
    , res = Math.round(slope * clientWidth + yIntercept)
    ;

  return r.clamp(min, max, res);
}
