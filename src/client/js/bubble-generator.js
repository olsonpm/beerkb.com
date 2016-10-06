'use strict';


//---------//
// Imports //
//---------//

const r = require('./external/ramda.custom')
  , rUtils = require('./r-utils')
  , utils = require('./utils')
  ;


//------//
// Init //
//------//

const { getRandomIntBetween } = utils
  , { betweenI, betweenRange, staticCond, mutableMerge } = rUtils
  , state = {}
  ;


//------//
// Main //
//------//

const updateClientDimensions = ({ clientWidth, clientHeight }) => {
  mutableMerge(state, { clientWidth, clientHeight });
  updateBubbleDiameterRange();
};

const run = ({
    clientWidth
    , clientHeight
    , clientWidthRange // controls the bubble diameter range
    , fizzRateRange // ms
    , fizzSpeedRange // 1px/<x>ms
    , onBubbleCreate
    , scrollY
  }) => {

  initializeState({ clientWidth, clientHeight, clientWidthRange, scrollY });

  const getRandomDiameter = () => r.apply(getRandomIntBetween, state.bubbleDiameterRange)
    , getRandomFizzSpeed = r.partial(getRandomIntBetween, fizzSpeedRange)
    , getRandomFizzRate = r.partial(getRandomIntBetween, fizzRateRange)
    ;

  createInfiniteBubbles();

  // scoped helper fxns

  function createInfiniteBubbles() {
    setTimeout(
      () => {
        createBubble();
        createInfiniteBubbles();
      }
      , getRandomFizzRate()
    );
  }

  function createBubble() {
    const diameter = getRandomDiameter()
      , y = (state.scrollY + state.clientHeight + diameter)
      , radius = Math.round(diameter / 2)
      // * 4 is just an arbitrary distance needed so the bubble disappearing
      //   animation happens while off-screen.
      , moveDuration = getRandomFizzSpeed() * (state.clientHeight + (diameter * 4))
      , x = getRandomIntBetween(-radius, state.clientWidth + radius)
      , size = state.getSize(diameter)
      ;

    onBubbleCreate({ x, y, moveDuration, diameter, size });
  }
};


//-------------//
// Helper Fxns //
//-------------//

function updateGetSize() {
  const [diameterMin, diameterMax] = state.bubbleDiameterRange
    , diameterDifference = r.subtract(diameterMax, diameterMin)
    , aThird = Math.round(diameterDifference / 3)
    ;

  state.getSize = staticCond([
    [betweenRange(diameterMin, diameterMin + aThird), 'small']
    , [betweenRange(diameterMin + aThird, diameterMax - aThird), 'medium']
    , [betweenI(diameterMax - aThird, diameterMax), 'large']
  ]);
}

function updateBubbleDiameterRange() {
  const [minWidth, maxWidth] = state.clientWidthRange;
  state.bubbleDiameterRange = [
    getLinearSlope(15, 30, state.clientWidth)
    , getLinearSlope(50, 70, state.clientWidth)
  ];

  updateGetSize();

  // scoped helper fxns
  function getLinearSlope(min, max) {
    const slope = (max - min)/(maxWidth - minWidth)
      , yIntercept = max - (maxWidth * slope)
      , res = Math.round(slope * state.clientWidth + yIntercept)
      ;

    return r.clamp(min, max, res);
  }
}

function initializeState({ clientHeight, clientWidth, clientWidthRange, scrollY }) {
  state.clientWidthRange = clientWidthRange;
  state.scrollY = scrollY;
  updateClientDimensions({ clientHeight, clientWidth });
}

function updateScrollY(scrollY) {
  state.scrollY = scrollY;
}


//---------//
// Exports //
//---------//

module.exports = {
  run
  , updateClientDimensions
  , updateScrollY
};
