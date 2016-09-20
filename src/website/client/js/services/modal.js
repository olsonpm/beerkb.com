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

      modalBacklightDt.css('display', 'block');
      aModalDt.css('display', 'block');
      renderModal(ctx);

      aModalDt.find('button').forEach(assignCb(cbs));

      return velocity(
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

function verticallyCenter(modalDt) {
  const modal = modalDt[0];
  const yOffset = Math.round((document.documentElement.clientHeight - modal.clientHeight) / 2);
  modalDt.css('top', yOffset + 'px');
  return modalDt;
}

function horizontallyCenter(modalDt) {
  const modal = modalDt[0];
  const xOffset = Math.round((document.documentElement.clientWidth - modal.clientWidth) / 2);
  modalDt.css('left', xOffset + 'px');
  return modalDt;
}

const center = {
  form: verticallyCenter
  , dialog: r.pipe(verticallyCenter, horizontallyCenter)
};

function getRenderer(type, modalDt) {
  return ctx => {
    modalDt.html(render('modal-' + type, ctx));
    addHoveredDt(modalDt.find('button'));
    center[type](modalDt);
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
