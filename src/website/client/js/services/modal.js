'use strict';


//---------//
// Imports //
//---------//

const $ = require('../external/domtastic.custom')
  , duration = require('../constants/duration')
  , render = require('../services/render')
  , utils = require('../utils')
  , velocity = require('velocity-animate')
  ;


//------//
// Init //
//------//

const modalBacklightDt = $('#modal-backlight')
  , modalBacklight = modalBacklightDt[0]
  , { addHoveredDt } = utils
  ;


//------//
// Main //
//------//

const exportMe = {
  window: createModal('window')
  , dialog: createModal('dialog')
};


//-------------//
// Helper Fxns //
//-------------//

function createModal(type) {
  const aModalDt = $('#modal-' + type)
    , renderModal = getRenderer(type)
    ;

  return {
    show({ ctx, cbs }) {
      aModalDt.css('display', 'block');
      renderModal(aModalDt, ctx);

      modalBacklightDt.css('display', 'block');

      aModalDt.find('button').forEach(assignCb(cbs));

      velocity(
        [aModalDt[0], modalBacklight]
        , { opacity: 1 }
        , { duration: duration.small }
      );
    }
    , hide() {
      return velocity(
          [aModalDt[0], modalBacklight]
          , { opacity: 0 }
          , { duration: duration.small }
        )
        .then(() => {
          aModalDt.css('display', 'none')
            .html('');

          modalBacklightDt.css('display', 'none');
        });
    }
  };
}

function getRenderer(type) {
  return (modalDt, ctx) => {
    modalDt.html(render('modal-' + type, ctx));
    addHoveredDt(modalDt.find('button'));
  };
}

function assignCb(cbs) {
  return button => button.onclick = cbs[$(button).attr('data-action')];
}


//---------//
// Exports //
//---------//

module.exports = exportMe;
