'use strict';


//---------//
// Imports //
//---------//

const $ = require('../external/domtastic.custom')
  , duration = require('../constants/duration')
  , r = require('../external/ramda.custom')
  , render = require('../services/render')
  , tabbable = require('tabbable')
  , utils = require('../utils')
  , velocity = require('velocity-animate')
  ;


//------//
// Init //
//------//

const modalBacklightDt = $('#modal-backlight')
  , modalBacklight = modalBacklightDt[0]
  , { addHoveredDt, keycodes } = utils
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

      const escapableTargets = aModalDt.find('input, textbox, button').map(r.identity);

      aModalDt.on('keyup', e => {
        if (r.contains(e.target, escapableTargets) && e.keyCode === keycodes.esc) myself.hide();
      });

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

function verticallyPosition(modalDt) {
  const modal = modalDt[0];
  const yOffset = Math.round((document.documentElement.clientHeight - modal.clientHeight) / 3);
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
  form: verticallyPosition
  , dialog: r.pipe(verticallyPosition, horizontallyCenter)
};

function getRenderer(type, modalDt) {
  return ctx => {
    modalDt.html(render('modal-' + type, ctx));
    if (type === 'form') {
      tabbable(modalDt[0])[0].focus();
    } else {
      modalDt.find('button:not([data-action="delete"])')[0].focus();
    }
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
