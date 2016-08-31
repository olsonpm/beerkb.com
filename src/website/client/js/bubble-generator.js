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
  , { betweenI, betweenRange, staticCond } = rUtils
  ;


//------//
// Main //
//------//

const run = ({
    clientWidth
    , clientHeight
    , bubbleDiameterRange
    , fizzRateRange // ms
    , fizzSpeedRange // 1px/<x>ms
    , onBubbleCreate
  }) => {

  const getRandomDiameter = r.partial(getRandomIntBetween, bubbleDiameterRange)
    , getRandomFizzSpeed = r.partial(getRandomIntBetween, fizzSpeedRange)
    , getRandomFizzRate = r.partial(getRandomIntBetween, fizzRateRange)
    , getSize = createGetSize(bubbleDiameterRange)
    ;

  createBubblesUntilStop();

  // scoped helper fxns

  function createBubblesUntilStop() {
    setTimeout(
      () => {
        createBubble();
        createBubblesUntilStop();
      }
      , getRandomFizzRate()
    );
  }

  function createBubble() {
    const diameter = getRandomDiameter()
      , radius = Math.round(diameter / 2)
      , duration = (getRandomFizzSpeed() * (clientHeight + diameter))
      , x = getRandomIntBetween(-radius, clientWidth + radius)
      , size = getSize(diameter)
      ;

    onBubbleCreate({ x, duration, diameter, size });
  }
};


//-------------//
// Helper Fxns //
//-------------//

function createGetSize([diameterMin, diameterMax]) {
  const diameterDifference = r.subtract(diameterMax, diameterMin)
    , aThird = Math.round(diameterDifference / 3)
    ;

  return staticCond([
    [betweenRange(diameterMin, diameterMin + aThird), 'small']
    , [betweenRange(diameterMin + aThird, diameterMax - aThird), 'medium']
    , [betweenI(diameterMax - aThird, diameterMax), 'large']
  ]);
}


//---------//
// Exports //
//---------//

module.exports = { run };
