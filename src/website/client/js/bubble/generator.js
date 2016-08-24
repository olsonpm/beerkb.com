'use strict';


//---------//
// Imports //
//---------//

const r = require('../external/ramda.custom')
  , rUtils = require('../r-utils')
  ;


//------//
// Init //
//------//

const {
    between
    , middle
    , lte
    , mutableAssoc
    , mutableFilter
    , mutableMap
    , mutableReject
    , reduceFirst
    , reduceIndexed
    , sample
    , shallowClone
    , size
    , square
    , toNumber
    , transform
  } = rUtils
  , distanceBetween = getDistanceBetween()
  , mutableMapIndexed = r.addIndex(mutableMap)
  ;

const createBubbles = ({
    clientWidth
    , clientHeight
    , h1pLoc
    , headerLoc
    , bubbleCreated
  }) => {
  // bubbleOffset represents the minimum number of on-screen pixels a max-width
  //   bubble will have given a min or max x/y position value.

  let bubbleOffset = 10
    , bubbleDiameterRange = r.range(24, 80)
    , createdBubbles = []
    , maxBubbleDiameter = r.last(bubbleDiameterRange)
    , medianBubbleDiameter = middle(bubbleDiameterRange)
    , viewRangeWidth = r.range(
      -maxBubbleDiameter + bubbleOffset
      , clientWidth - bubbleOffset
    )
    , viewRangeHeight = r.range(
      -maxBubbleDiameter + bubbleOffset
      , clientHeight - bubbleOffset
    )
    , available = initAvailable({
      viewRangeWidth
      , viewRangeHeight
      , maxBubbleDiameter
      , h1pLoc
      , headerLoc
    })
    , numBubbles = calculateNumBubbles(available, medianBubbleDiameter, 0.05)
    , calculateNewBubble = getCalculateNewBubble(
      createdBubbles
      , bubbleDiameterRange
      , bubbleCreated
    )
    ;

  r.forEach(
    r.partial(calculateNewBubble, [available])
    , r.range(0, numBubbles)
  );

  return createdBubbles;
};

//-------------//
// Helper Fxns //
//-------------//

function getCalculateNewBubble(createdBubbles, bubbleDiameterRange, bubbleCreated) {
  const modifyAvailable = getModifyAvailable(middle(bubbleDiameterRange))
    , newBubbleDiameter = getNewBubbleDiameter(createdBubbles, bubbleDiameterRange)
    ;

  return available => {
    // loc = location and represents the top left corner of the div
    const loc = {};

    loc.x = r.pipe(r.keys, sample, toNumber)(available);
    loc.y = sample(available[loc.x]);

    let diameter = newBubbleDiameter(loc);

    const aNewBubble = newBubble({ loc, diameter });
    createdBubbles.push(aNewBubble);
    bubbleCreated(aNewBubble);
    return modifyAvailable(available, loc, diameter);
  };
}

function getModifyAvailable(medianBubbleDiameter) {
  return (available, loc, diameter) => {
    // we need to add one because medianBubbleDiameter should be the largest
    //   guaranteed diameter in an available location.
    //
    // e.g. when medianBubbleDiameter = 10, loc = { x: 20, y: 0 }, and
    //   diameter = 5 then pixels 11 through 25 should be removed
    //   from availability
    //
    //            10         20
    // |----------=----------=-----
    //            oxxxxxxxxxxxxxxx
    //             [---------[---]
    //                 |       V
    //                 |    New circle
    //                 V
    //   Space to guarantee any diameter up to medianBubbleDiameter
    //     will be free of collision
    //
    const inCurrentBubbleX = between(loc.x - medianBubbleDiameter + 1, loc.x + diameter)
      , inCurrentBubbleY = between(loc.y - medianBubbleDiameter + 1, loc.y + diameter)
      ;

    return r.pipe(
      mutableMapIndexed(
        (yAvail, x) => (inCurrentBubbleX(x))
          ? mutableReject(inCurrentBubbleY, yAvail)
          : yAvail
      )
      , mutableFilter(size)
    )(available);
  };
}

function getNewBubbleDiameter(createdBubbles, bubbleDiameterRange) {
  const maxBubbleDiameter = r.last(bubbleDiameterRange)
    , medianBubbleDiameter = middle(bubbleDiameterRange)
    // a new bubble might collide with existing ones if the distance of its
    //   corner-to-corner length plus the bubble's radius is greater than
    //   the distance between its location and the bubble's center.
    // e.g.
    //      c2c      bRad
    // |-----------|------|
    //
    //   loc->bCenter
    // |--------------|
    , mightCollide = loc => {
      const cornerToCorner = distanceBetween(loc, r.map(r.add(maxBubbleDiameter), loc));
      return aBubble => distanceBetween(loc, aBubble.center) < (cornerToCorner + aBubble.radius);
    };

  return loc => {
    const possibleCollisionBubbles = r.filter(
      mightCollide(loc)
      , createdBubbles
    );

    // if there are no possible collisions then just sample a diameter
    if (!size(possibleCollisionBubbles)) {
      return sample(bubbleDiameterRange);
    }

    // otherwise we need to check each point in the possible bubble area and see
    //   if it will collide with existing bubbles.  Based off our available
    //   space algorithm, we can be assured at least a median diameter will
    //   be free of collisions
    const minCollisionX = loc.x + medianBubbleDiameter
      , maxCollisionX = loc.x + maxBubbleDiameter
      , minCollisionY = loc.y + medianBubbleDiameter
      , maxCollisionY = loc.y + maxBubbleDiameter
      , collisionBubbleArea = r.pipe(
        transform(
          (res, val) => {
            const setPossibleCollisionYForX = mutableAssoc(val, r.__, res);
            if (between(loc.x, minCollisionX, val)) {
              setPossibleCollisionYForX(r.range(minCollisionY, maxCollisionY + 1));
            } else {
              setPossibleCollisionYForX(r.range(loc.y, maxCollisionY + 1));
            }
          }
          , {}
        )
        , r.filter(size)
      )(r.range(loc.x, maxCollisionX + 1));

    // another crude algorithm follows since I'm not good enough at maths
    // - filter possible collisions to actual collisions then find the closest
    //   collision to loc.
    const willCollide = r.curry(
      (createdBubbles, x, y) => r.any(
        ({ center, radius }) => distanceBetween({ x, y }, center) < radius
        , createdBubbles
      )
    );

    const distFromLargestPossibleCenter = distanceBetween(
      {
        x: loc.x + medianBubbleDiameter - 1
        , y: loc.y + medianBubbleDiameter - 1
      }
    );

    const minCollisionPos = r.pipe(
      r.mapObjIndexed(
        (yAvail, x) => r.filter(willCollide(createdBubbles, x), yAvail)
      )
      , r.filter(size)
      , r.toPairs
      , reduceIndexed(
        (res, [x, yValsForX]) => res.concat(
          r.map(yVal => ({ x: x, y: yVal }), yValsForX)
        )
        , []
      )
      , reduceFirst(r.minBy(distFromLargestPossibleCenter))
    )(collisionBubbleArea);


    const maxDiameter = (minCollisionPos)
      ? r.max(
          Math.abs(minCollisionPos.x - loc.x)
          , Math.abs(minCollisionPos.y - loc.y)
        )
      : maxBubbleDiameter;

    return sample(
      r.takeWhile(lte(maxDiameter), bubbleDiameterRange)
    );
  };
}

function initAvailable({
    viewRangeWidth
    , viewRangeHeight
    , maxBubbleDiameter
    , h1pLoc
    , headerLoc
  }) {

  let available = transform(
    (res, val) => mutableAssoc(val, shallowClone(viewRangeHeight), res)
    , {}
    , viewRangeWidth
  );

  // We don't want bubbles appearing near the header, so we'll remove those
  //   coordinates from availability.
  //
  // Because the p following h1 is the widest element, the 'header' will be
  //   defined as having the width of that element and the height of <header>
  //   in addition to the extra space above (off-screen).
  const xInRange = between(h1pLoc.left - maxBubbleDiameter, h1pLoc.right)
    ;

  return mutableMapIndexed(
    (yAvail, x) => {
      return (xInRange(x))
        ? mutableReject(lte(headerLoc.bottom), yAvail)
        : yAvail;
    }
    , available
  );
}

function calculateNumBubbles(available, medianBubbleDiameter, numBubbleWeight) {
  //
  // for sake of simplicity, the number of bubbles will be calculated via the
  //   following logic.
  //
  // totalAvailableCoordinates / medianBubbleDiameter^2 equals the
  //   maximum number of bubbles that could possibly fit on the available
  //   space (assuming a perfectly average aggregate of samples).
  //
  // numBubbleWeight is multiplied by the above calculation to result in the
  //   number of bubbles this engine creates.  This means the numBubbleWeight
  //   must be between 0 & 1
  //
  const totalAvailableCoordinates = r.pipe(
    r.map(size)
    , r.values
    , r.sum
  )(available);

  const medianBubbleDiameterSquared = square(medianBubbleDiameter);

  const res = Math.round(
    numBubbleWeight * totalAvailableCoordinates / medianBubbleDiameterSquared
  );

  return res;
}

function newBubble(argsObj) {
  const rad = argsObj.diameter / 2;
  argsObj.radius = rad;
  argsObj.center = {
    x: Math.round(argsObj.loc.x + rad)
    , y: Math.round(argsObj.loc.y + rad)
  };
  return argsObj;
}

function getDistanceBetween() {
  return r.curry(
    (loc1, loc2) => {
      return r.pipe(
        r.add(square(loc1.y - loc2.y))
        , Math.sqrt
        , Math.round
      )(square(loc1.x - loc2.x));
    }
  );
}


//---------//
// Exports //
//---------//

module.exports = {
  createBubbles
  , _: {
    initAvailable
    , calculateNumBubbles
    , newBubble
    , getDistanceBetween
  }
};
