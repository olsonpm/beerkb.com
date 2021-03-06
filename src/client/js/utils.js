'use strict';


//---------//
// Imports //
//---------//

const $ = require('./external/domtastic.custom')
  , duration = require('./constants/duration')
  , hoverIntent = require('hoverintent')
  , r = require('../../../lib/external/ramda.custom')
  , rUtils = require('../../../lib/r-utils')
  , velocity = require('velocity-animate')
  ;


//------//
// Init //
//------//

const hoverIntentWrapper = r.curry(
    (el, elDt) => {
      if (!("ontouchstart" in document.documentElement)) hoverIntent(el, onEnter(elDt), onLeave(elDt));
    }
  )
  , { feed, size } = rUtils
  , screenSizes = {
    xxsMax: 619
    , xsMin: 620
    , xsMax: 767
    , smMin: 768
    , smMax: 991
    , mdMin: 992
    , mdMax: 1189
    , lgMin: 1190
  }
  , screenSizesPx = r.map(size => size + 'px', screenSizes)
  ;


//------//
// Main //
//------//

const addHovered = el => hoverIntentWrapper(el, $(el))
  , addHoveredDt = dt => dt.forEach(el => hoverIntentWrapper(el, $(el)))
  , addHoveredToParent = el => hoverIntentWrapper(el, $(el).parent())
  ;

const directFind = r.curry(
  (ctxDt, path) => {
    if (path.length === 1) return ctxDt.children(path[0]);

    return directFind(ctxDt.children(r.head(path)), r.tail(path));
  }
);

const directFindAll = ctxDt => r.pipe(r.map(directFind(ctxDt)), r.filter(size));

const getRandomIntBetween = r.curry(
  (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
);

const joinAdjacentArrays = feed(
  r.flip(r.append)
  , r.concat
  , []
);

function pairAdjacentElements(anArray) {
  const result = []

  let currentPair = [],
    i = 0

  for (const item of anArray) {
    currentPair.push(item)
    if (i % 2 === 1) {
      result.push(currentPair)
      currentPair = []
    }
    i += 1
  }

  if (currentPair.length) result.push(currentPair)

  return result
}

const keycodes = {
  esc: 27
};

const getNumColumns = () => {
  let res;
  if (window.matchMedia("(min-width: " + screenSizesPx.lgMin + ")").matches) {
    res = 4;
  } else if(window.matchMedia("(min-width: " + screenSizesPx.xsMin + ")").matches) {
    res = 2;
  } else {
    res = 1;
  }
  return res;
};

const removeDt = elDt => {
  return velocity(
      elDt[0]
      , {
        'margin-top': 0
        , 'margin-bottom': 0
        , 'padding-top': 0
        , 'padding-bottom': 0
        , 'border-top': 0
        , 'border-bottom': 0
        , height: 0
        , opacity: 0
      }
      , { duration: duration.medium }
    )
    .then(elDt.remove.bind(elDt));
};

const unwrap = r.map(r.identity);


//-------------//
// Helper Fxns //
//-------------//

function onEnter(dt) {
  return () => dt.addClass('hovered');
}
function onLeave(dt) {
  return () => dt.removeClass('hovered');
}


//---------//
// Exports //
//---------//

module.exports = {
  addHovered
  , addHoveredDt
  , addHoveredToParent
  , directFind
  , directFindAll
  , getNumColumns
  , getRandomIntBetween
  , joinAdjacentArrays
  , keycodes
  , pairAdjacentElements
  , removeDt
  , screenSizesPx
  , unwrap
};
