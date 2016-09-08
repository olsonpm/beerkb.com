'use strict';

//
// README
// - Some vars have the abbreviation 'dt', which means 'domtastic' and
//   represents a domtastic wrapped element
//


//---------//
// Imports //
//---------//

const $ = require('../external/domtastic.custom')
  , duration = require('../constants/duration')
  , modal = require('../services/modal')
  , r = require('../external/ramda.custom')
  , request = require('../services/request')
  , rUtils = require('../r-utils')
  , utils = require('../utils')
  , velocity = require('velocity-animate')
  ;


//------//
// Init //
//------//

const optionData = getOptionData()
  , { mutableMerge } = rUtils
  , { addHovered, addHoveredDt, addHoveredToParent, removeDt } = utils
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

    const option = optionData[action];
    const showArgs = option.getShowArgs(data);
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
          , content = 'Are you sure you want to delete <span class="item">' + itemData.name + '</span>?';

        return {
          ctx: {
            title: 'Delete ' + itemData.name
            , content: content
            , btns: [
              { text: 'You Bet', action: 'delete' }
              , { text: 'Cancel', action: 'cancel' }
            ]
          }
          , cbs: {
            delete: () => {
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
      modal: modal.window
      , getShowArgs: r.always(undefined)
    }
    , 'add-beer': {
      modal: modal.window
      , getShowArgs: r.always(undefined)
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
