'use strict';


//---------//
// Imports //
//---------//

const $ = require('../external/domtastic.custom')
  , duration = require('../constants/duration')
  , r = require('../external/ramda.custom')
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
  , postModalRender = {
    form: postFormRender
    , dialog: r.always(undefined)
  }
  ;


//------//
// Main //
//------//

const exportMe = {
  form: createModal('form')
  , dialog: createModal('dialog')
};


//-------------//
// Helper Fxns //
//-------------//

function createModal(type) {
  const aModalDt = $('#modal-' + type)
    , renderModal = getRenderer(type, aModalDt)
    ;

  return {
    show({ ctx, cbs }) {
      const myself = this;

      aModalDt.css('display', 'block');
      renderModal(ctx);

      modalBacklightDt.css('display', 'block');
      aModalDt.find('button').forEach(assignCb(cbs));

      velocity(
          [aModalDt[0], modalBacklight]
          , { opacity: 1 }
          , { duration: duration.small }
        )
        .then(() => {
           modalBacklightDt.on('click', e => {
             if (e.target === modalBacklight) return myself.hide();
           });
        });
    }
    , hide() {
      modalBacklightDt.off('click');
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
    , dt: aModalDt
  };
}

function getRenderer(type, modalDt) {
  return ctx => {
    modalDt.html(render('modal-' + type, ctx));
    addHoveredDt(modalDt.find('button'));
    postModalRender[type](modalDt);
  };
}

function postFormRender(modalDt) {
  modalDt.find('form')[0].onsubmit = e => {
    e.preventDefault();
    return false;
  };
}

function assignCb(cbs) {
  return button => button.onclick = cbs[$(button).attr('data-action')];
}


//---------//
// Exports //
//---------//

module.exports = exportMe;
