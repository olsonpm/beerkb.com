'use strict';


//---------//
// Imports //
//---------//

const $ = require('./external/domtastic.custom')
  , bubbleGenerator = require('./bubble-generator')
  , duration = require('./constants/duration')
  , modal = require('./services/modal')
  , render = require('./services/render')
  , utils = require('./utils')
  , velocity = require('velocity-animate')
  ;


//------//
// Init //
//------//

let bodyHeight = document.body.clientHeight
  , bodyWidth = document.body.clientWidth;

const { addHoveredDt } = utils;

window.addEventListener('resize', handleWindowResize);
$('#soul > footer .other-credits').on('click', otherCreditsOnClick);
addHoveredDt($('#soul > footer').find('a, .other-credits'));


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

function createBubble({ x, y, moveDuration, diameter, size }) {
  const bubbleWrapper = getBubbleDiv(x, y, diameter, size)
    , bubbleDiv = bubbleWrapper.children()[0];

  bubbleLayer.append(bubbleWrapper);
  const easing = 'easeInQuad';

  return Promise.all([
      velocity(
        bubbleDiv
        , {
          translateZ: 0
          , translateY: -(bodyHeight + (diameter * 4)) + 'px'
        }
        , { duration: moveDuration, easing }
      )
      , velocity(
        bubbleWrapper
        , { opacity: 0 }
        , {
          delay: moveDuration - duration.small
          , duration: duration.small
        }
      )
    ])
    .then(bubbleDiv.remove.bind(bubbleDiv));
}

function getBubbleDiv(x, y, diameter, size) {
  return $(document.createElement('div'))
    .addClass('bubble-wrapper')
    .append(
      $(document.createElement('div'))
      .attr({
        class: 'bubble ' + size
        , style: render('bubble-style', { x, y, diameter })
      })
    );
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

function otherCreditsOnClick() {
  const egor = '<a href="https://www.behance.net/pio-5">Egor Rumyantsev</a>'
    , freepik = '<a href="http://www.freepik.com/">Freepik</a>'
    , flaticon = '<a href="www.flaticon.com">www.flaticon.com</a>';
  const content = ['<ul class="credits">'
    , '<li>Waste bin icon made by ' + egor + ' from ' + flaticon + '.</li>'
    , '<li>Pencil icon made by ' + freepik + ' from ' + flaticon + '.</li>'
    , '</ul>'].join('');

  modal.dialog.show({
    ctx: {
      title: 'Other Credits'
      , content
      , btns: [{ action: 'ok', text: 'ok' }]
    }
    , cbs: {
      ok: modal.dialog.hide
    }
  });
}
