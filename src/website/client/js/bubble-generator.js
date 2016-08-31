'use strict';


//---------//
// Imports //
//---------//

const r = require('./external/ramda.custom')
  , utils = require('./utils')
  ;


//------//
// Init //
//------//

const { getRandomIntBetween } = utils;


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
    , getRandomFizzRate = r.partial(getRandomIntBetween, fizzRateRange);

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
      ;

    onBubbleCreate({ x, duration, diameter });
  }
};


//---------//
// Exports //
//---------//

module.exports = { run };
