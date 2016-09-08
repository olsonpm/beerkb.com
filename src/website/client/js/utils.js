'use strict';


//---------//
// Imports //
//---------//

const $ = require('./external/domtastic.custom')
  , duration = require('./constants/duration')
  , hoverIntent = require('hoverintent')
  , r = require('ramda')
  , velocity = require('velocity-animate')
  ;


//------//
// Init //
//------//

const hoverIntentWrapper = r.curry(
  (el, elDt) => hoverIntent(el, onEnter(elDt), onLeave(elDt))
);


//------//
// Main //
//------//

const addHovered = el => hoverIntentWrapper(el, $(el))
  , addHoveredDt = dt => dt.forEach(el => hoverIntentWrapper(el, $(el)))
  , addHoveredToParent = el => hoverIntentWrapper(el, $(el).parent());

const getRandomIntBetween = r.curry(
  (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
);

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
  , getRandomIntBetween
  , removeDt
};
