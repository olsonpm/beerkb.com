'use strict';

//
// README
// - Some vars have the abbreviation 'dt', which means 'domtastic' and
//   represents a domtastic wrapped element
//
// TODO: extract the button handling to a separate file(s)
//


//---------//
// Imports //
//---------//

const $ = require('../external/domtastic.custom')
  , duration = require('../constants/duration')
  , formData = require('../services/form-data')
  , modal = require('../services/modal')
  , modalForms = require('../modal-forms')
  , request = require('../services/request')
  , r = require('../external/ramda.custom')
  , rUtils = require('../r-utils')
  , schemas = require('../../../shared/schemas')
  , utils = require('../utils')
  , velocity = require('velocity-animate')
  ;


//------//
// Init //
//------//

const optionData = getOptionData()
  , { mutableMerge, size } = rUtils
  , { addHovered, addHoveredDt, addHoveredToParent, removeDt } = utils
  , schemaErrorMessages = {
    inStyleList: 'Required'
    , inStateList: 'Required'
    , isLaden: 'Required'
    , startsWithUppercase: 'The first letter must be uppercase'
  }
  ;

let vm;


//------//
// Main //
//------//

const run = vm_ => {
  vm = initVm(vm_);
  initBreweryAndBeerHandlers();
};


//-------------//
// Helper Fxns //
//-------------//

function initBreweryAndBeerHandlers() {
  $('ul[data-items="brewery"] > li:not(.add-one), ul[data-items="beer"] > li:not(.add-one)').forEach(handleItemEl);
  $('ul[data-items="brewery"] > li.add-one > h2').forEach(addHovered);
  $('ul.options > li').forEach(handleOptions);
}

function handleOptions(option) {
  const optionDt = $(option);
  addHoveredDt(optionDt);
  option.onclick = createOptionOnClick(optionDt);
}

function createOptionOnClick(optionDt) {
  return () => {
    const action = optionDt.attr('data-action')
      , itemDt = optionDt.closest('[data-item-id]')
      , itemParentDt = itemDt.parent()
      , itemType = itemParentDt.attr('data-items')
      , data = {
        id: itemDt.attr('data-item-id')
        , itemType
        , itemDt
      }
      ;

    if (itemType === 'beer') {
      data.brewery_id = itemParentDt.closest('[data-item-id]')
        .attr('data-item-id');
    }

    const option = optionData[action]
      , showArgs = option.getShowArgs(data);

    option.modal.show(showArgs);
  };
}

function handleItemEl(itemEl) {
  const itemDt = $(itemEl)
    , itemHeaderDt = itemDt.children('h2, h3')
    , itemHeader = itemHeaderDt[0]
    ;

  addHoveredToParent(itemHeader);
  itemHeader.onclick = createItemOnClick(itemDt);
}

function createItemOnClick(itemDt) {
  return () => {
    // just return if animating
    if (itemDt.hasClass('expanding') || itemDt.hasClass('collapsing')) { return; }

    const action = (itemDt.hasClass('collapsed'))
      ? showPanel
      : hidePanel;

    action(itemDt);
  };
}

function getOptionData() {
  return {
    delete: {
      modal: modal.dialog
      , getShowArgs({ id, brewery_id, itemType, itemDt }) {
        const myself = this;

        const itemData = vm.getItemData({ id, brewery_id, itemType })
          , content = 'Are you sure you want to delete <span class="item">' + itemData.name + '</span>?'
          , title = 'Delete ' + itemData.name;

        return {
          ctx: {
            title
            , content
            , btns: [
              { text: 'You Bet', action: 'submit' }
              , { text: 'Cancel', action: 'cancel' }
            ]
          }
          , cbs: {
            submit: () => {
              // return request.delete[itemType](id)
              //   .then(myself.modal.hide)
              return myself.modal.hide()
                .then(removeDt(itemDt));
            }
            , cancel: () => myself.modal.hide()
          }
        };
      }
    }
    , edit: {
      modal: modal.form
      , getShowArgs({ id, brewery_id, itemType }) {
        const myself = this
          , itemData = vm.getItemData({ id, brewery_id, itemType })
          , ctx = mutableMerge({
              title: 'Edit ' + itemData.name
            }
            , modalForms[itemType](itemData)
          );

        return {
          ctx
          , cbs: {
            submit() {
              return myself.modal.hide()
                .then(() => { console.log('Submitted edit of ' + itemData.name); });
            }
            , cancel() {
              return myself.modal.hide()
                .then(() => { console.log('Cancelled edit of ' + itemData.name); });
            }
          }
        };
      }
    }
    , 'add-beer': {
      modal: modal.form
      , getShowArgs({ id }) {
        const myself = this
          , itemData = vm.brewery[id]
          , title = 'Add A Beer To ' + itemData.name
          ;

        let getCtx = mutableMerge({ title });

        return {
          ctx: getCtx(modalForms.beer({}))
          , cbs: {
            submit() {
              const beerData = formData.get(myself.modal.dt)
                , errors = schemas.beer.validate(schemaErrorMessages, beerData);

              if (size(errors)) {
                const errorKeys = r.keys(errors)
                  , hasError = el => r.contains(el.getAttribute('data-for'), errorKeys)
                  , allErrorEls = myself.modal.dt.find('.error[data-for]')
                  , activeErrorEls = allErrorEls.filter(hasError)
                  , inactiveErrorEls = allErrorEls.filter(r.complement(hasError))
                  ;

                // set error text to the first error
                activeErrorEls.forEach(el => el.innerHTML = errors[el.getAttribute('data-for')][0]);

                const velocityPromises = activeErrorEls.map(el => velocity(el, { opacity: 1 }, { duration: duration.small }))
                  .concat(inactiveErrorEls.map(el => velocity(el, { opacity: 0 }, { duration: duration.small })))
                  ;

                return Promise.all(velocityPromises);
              } else {
                return myself.modal.hide()
                  .then(() => { console.log('Submitted beer addition to ' + itemData.name); });
              }
            }
            , cancel() {
              return myself.modal.hide()
                .then(() => { console.log('Cancelled beer addition to ' + itemData.name); });
            }
          }
        };
      }
    }
  };
}

function initVm(vm_) {
  return mutableMerge(
    vm_
    , {
      getItemData({ id, brewery_id, itemType }) {
        return (itemType === 'brewery')
          ? vm.brewery[id]
          : vm.brewery[brewery_id].beer[id];
      }
    }
  );
}

function showPanel(itemDt) {
  const collapseIndicator = itemDt.find('h2 > .collapse-indicator')
    , panel = itemDt.children('.panel')[0];

  itemDt.removeClass('collapsed');
  itemDt.addClass('expanding');
  panel.style.display = 'block';
  panel.style['margin-top'] = -panel.clientHeight + 'px';
  panel.style.display = '';

  return Promise.all([showPanel(), rotateIndicator()]);

  function showPanel() {
    return velocity(
      panel
      , { 'margin-top': 0 }
      , {
        duration: duration.medium
        , complete: () => { itemDt.removeClass('expanding'); }
      }
    );
  }

  function rotateIndicator() {
    return velocity(
      collapseIndicator
      , { rotateZ: '90deg' }
      , { duration: duration.medium }
    );
  }
}

function hidePanel(itemDt) {
  const collapseIndicator = itemDt.find('h2 > .collapse-indicator')
    , panel = itemDt.children('.panel')[0];

  itemDt.addClass('collapsing');
  return Promise.all([collapsePanel(), rotateIndicator()]);

  // scoped helper fxns
  function collapsePanel() {
    return velocity(
        panel
        , { 'margin-top': -panel.clientHeight + 'px' }
        , { duration: duration.medium }
      )
      .then(() => {
        itemDt.removeClass('collapsing');
        itemDt.addClass('collapsed');
      });
  }
  function rotateIndicator() {
    return velocity(
      collapseIndicator
      , { rotateZ: 0 }
      , { duration: duration.medium }
    );
  }
}


//---------//
// Exports //
//---------//

module.exports = { run };
