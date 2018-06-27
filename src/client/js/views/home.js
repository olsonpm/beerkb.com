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
  , dedent = require('dedent')
  , duration = require('../constants/duration')
  , formData = require('../services/form-data')
  , modal = require('../services/modal')
  , modalForms = require('../modal-forms')
  , request = require('../services/request')
  , r = require('../../../../lib/external/ramda.custom')
  , render = require('../services/render')
  , rUtils = require('../../../../lib/r-utils')
  , schemas = require('../../../shared/schemas')
  , utils = require('../utils')
  , velocity = require('velocity-animate')
  ;


//------//
// Init //
//------//

const addToVm = getAddToVm()
  , optionData = getOptionData()
  , { mutableMerge, size } = rUtils
  , {
    addHovered, addHoveredDt, addHoveredToParent, directFind, directFindAll
    , getNumColumns, pairAdjacentElements, removeDt, unwrap
  } = utils
  , schemaErrorMessages = {
    inStyleList: 'Required'
    , inStateList: 'Required'
    , isLaden: 'Required'
    , startsWithUppercase: 'The first letter must be uppercase'
    , lte30: 'Limit 30 characters'
    , lte50: 'Limit 50 characters'
    , lte500: 'Limit 500 characters'
  }
  , sendRequest = getSendRequest()
  , updateVm = getUpdateVm()
  , viewDt = $('#view-home')
  ;

let vm
  , numColumns = getNumColumns()
  ;

const isOdd = n => n % 2
  , elIsOdd = (el, idx) => isOdd(idx)
  , elIsEven = r.complement(elIsOdd);

const columnsToGetFilterFn = {
  4: col => isOdd(col) ? elIsOdd : elIsEven
  , 2: col => col === 1 ? elIsOdd : elIsEven
  , 1: () => elIsEven
};

const shouldTruncateName = el => el.getBoundingClientRect().width > 200;

const truncateName = el => {
  const fullNameText = el.textContent;
  // must recursively remove characters and test width until the string
  //   reaches a proper truncation length
  _truncateName(el);

  // then we need to add the full name into the panel
  const moreDataDt = directFind($(el).parent().siblings('.panel'), ['.more-data'])
    , fullNameDt = directFind(moreDataDt, ['.full-name']);
  if (fullNameDt.length) {
    fullNameDt.text(fullNameText);
  } else {
    moreDataDt.prepend(
      $(document.createElement('span'))
        .addClass('full-name')
        .text(fullNameText)
    );
  }
};
const _truncateName = el => {
  el.textContent = el.textContent.slice(0, -1);
  if (!shouldTruncateName(el)) {
    el.textContent += '...';
  }
  else _truncateName(el);
};

setBreweryColors();
initTruncations();

window.addEventListener('resize', handleWindowResize);


//------//
// Main //
//------//

const run = vm_ => {
  vm = vm_;
  initBreweryAndBeerHandlers();
};


//-------------//
// Helper Fxns //
//-------------//

function initBreweryAndBeerHandlers() {
  $('ul[data-items="brewery"] > li:not(.add-one), ul[data-items="beer"] > li:not(.add-one)').forEach(handleItemEl);
  handleNewBrewery($('ul[data-items="brewery"] > li.add-one'));
}

function handleNewBrewery(newBreweryDt) {
  const newBrewery = newBreweryDt[0];
  addHovered(newBrewery);
  newBrewery.onclick = () => {
    const ctx = mutableMerge({
        title: 'Add A Brewery'
      }
      , modalForms.brewery({})
    );

    return modal.form.show({
      ctx
      , cbs: {
        submit() {
          const breweryData = formData.get(modal.form.dt)
            , errors = schemas.brewery.validate(schemaErrorMessages, breweryData);

          if (size(errors)) return handleErrors(modal.form.dt, errors);

          return modal.form.hide()
            .then(() => sendRequest.create('brewery', breweryData))
            ;
        }
        , cancel() {
          console.log('cancelled new brewery');
          return modal.form.hide();
        }
      }
    });
  };
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

  directFind(itemDt, ['.panel', 'ul.options', 'li']).forEach(handleOptions);
  addHoveredToParent(itemHeader);
  itemHeader.onclick = createItemOnClick(itemDt);
}

function createItemOnClick(itemDt) {
  return () => {
    // just return if animating
    if (itemDt.hasClass('expanding') || itemDt.hasClass('collapsing')) { return; }

    $('li[data-item-id].last-clicked').removeClass('last-clicked');

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

        const itemData = getItemData({ id, brewery_id, itemType })
          , content = '<p>Are you sure you want to delete ' + spanItem(itemData.name) + '?</p>'
          , title = 'Delete ' + itemData.name;

        return {
          ctx: {
            title
            , content
            , btns: [
              { text: 'You Bet', action: 'delete' }
              , { text: 'Cancel', action: 'cancel' }
            ]
          }
          , cbs: {
            delete() {
              return myself.modal.hide()
                .then(() => request.delete[itemType](id))
                .catch(res => {
                  if (r.path(['response', 'status'], res) !== 404) throw res;
                })
                .then(deleteItem.bind(null, itemDt, itemType, id, brewery_id))
                .catch(handleRequestError(itemData.name, 'deleting'));
            }
            , cancel() { myself.modal.hide(); }
          }
        };
      }
    }
    , edit: {
      modal: modal.form
      , getShowArgs({ id, brewery_id, itemType, itemDt }) {
        const myself = this
          , itemData = getItemData({ id, brewery_id, itemType })
          , ctx = mutableMerge({
              title: 'Edit ' + itemData.name
            }
            , modalForms[itemType](itemData)
          );

        return {
          ctx
          , cbs: {
            submit() {
              let newData = formData.get(myself.modal.dt);
              const errors = schemas[itemType].validate(schemaErrorMessages, newData);

              if (size(errors)) return handleErrors(myself.modal.dt, errors);

              return myself.modal.hide()
                .then(() => {
                  const oldDataWithFormKeys = r.pick(r.keys(newData), itemData)
                    , changed = !r.equals(newData, oldDataWithFormKeys)
                    ;

                  if (!changed) return;

                  newData = mutableMerge(newData, { brewery_id });
                  return sendRequest.edit(itemType, newData, itemData.name, brewery_id, id, itemDt);
                })
                ;
            }
            , cancel() { return myself.modal.hide(); }
          }
        };
      }
    }
    , 'add-beer': {
      modal: modal.form
      , getShowArgs({ id }) {
        const brewery_id = id
          , myself = this
          , itemData = vm.brewery[brewery_id]
          , title = 'Add A Beer To ' + itemData.name
          ;

        let getCtx = mutableMerge({ title });

        return {
          ctx: getCtx(modalForms.beer({}))
          , cbs: {
            submit() {
              const beerData = formData.get(myself.modal.dt)
                , errors = schemas.beer.validate(schemaErrorMessages, beerData);

              if (size(errors)) return handleErrors(myself.modal.dt, errors);

              return myself.modal.hide()
                .then(() => sendRequest.create('beer', mutableMerge(beerData, { brewery_id })))
                ;
            }
            , cancel() { return myself.modal.hide(); }
          }
        };
      }
    }
  };
}

function getItemData({ id, brewery_id, itemType }) {
  return (itemType === 'brewery')
    ? vm.brewery[id]
    : vm.brewery[brewery_id].beer[id];
}

function showPanel(itemDt) {
  itemDt.addClass('last-clicked');

  const collapseIndicator = directFindAll(itemDt)([['h2', '.collapse-indicator'], ['h3', '.collapse-indicator']])[0]
    , panel = itemDt.children('.panel')[0];

  itemDt.removeClass('collapsed');
  itemDt.addClass('expanding');
  panel.style.display = 'block';
  panel.style['margin-top'] = -panel.clientHeight + 'px';
  panel.style.display = '';

  return Promise.all([_showPanel(), rotateIndicator()]);

  function _showPanel() {
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
  const collapseIndicator = directFindAll(itemDt)([['h2', '.collapse-indicator'], ['h3', '.collapse-indicator']])[0]
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

function handleErrors(modalDt, errors) {
  const errorKeys = r.keys(errors)
    , hasError = el => r.contains(el.getAttribute('data-for'), errorKeys)
    , allErrorEls = modalDt.find('.error[data-for]')
    , activeErrorEls = allErrorEls.filter(hasError)
    , inactiveErrorEls = allErrorEls.filter(r.complement(hasError))
    ;

  // set error text to the first error
  activeErrorEls.forEach(el => el.innerHTML = errors[el.getAttribute('data-for')][0]);

  const velocityPromises = activeErrorEls.map(el => velocity(el, { opacity: 1 }, { duration: duration.small }))
    .concat(inactiveErrorEls.map(el => velocity(el, { opacity: 0 }, { duration: duration.small })))
    ;

  return Promise.all(velocityPromises);
}

const itemSelector = {
  beer: (brewery_id, id) => 'ul[data-items="brewery"] > li[data-item-id="' + brewery_id + '"] '
    + 'ul[data-items="beer"] > li[data-item-id="' + id + '"]'
  , brewery: id => 'ul[data-items="brewery"] > li[data-item-id="' + id + '"]'
};

const propCtx = [['h2'], ['h3'], ['.panel', '.more-data']];

const propSelectors = r.reduce(
  (res, cur) => r.assoc(cur, getPropSelectors(cur), res)
  , {}
  , ['beer', 'brewery']
);

function getPropSelectors(itemType) {
  return r.pipe(
    r.path([itemType, 'keys'])
    , r.map(prop => '*[data-prop="' + prop + '"]')
    , r.join(', ')
  )(schemas);
}

const addToDom = {
  beer(beerList, data) {
    const collection = beerList[0];

    beerList.append(render('new-beer', data));

    const newItem = beerList.children().pop()
      , newItemDt = $(newItem)
      , newHeight = collection.clientHeight
      ;

    handleItemEl(newItem);
    const name = directFind(newItemDt, ['h3', '[data-prop="name"]'])[0];
    if (shouldTruncateName(name)) {
      truncateName(name);
    }
    newItemDt.css('display', 'none');

    return velocity(
        collection
        , { height: newHeight }
        , { duration: duration.medium }
      )
      .then(() => {
        beerList.css('height', 'auto');
        newItemDt.css({ display: 'block', opacity: 0 });

        return velocity(
          newItem
          , { opacity: 1 }
          , { duration: duration.small }
        );
      });
  }
  , brewery(breweryList, data) {
    breweryList.append(render('new-brewery', data));

    // from stackoverflow - removes whitespace.  This would be unnecessary if
    //   I designed the code properly and re-rendered upon a data change
    breweryList.contents().forEach(el => {
      if (el.nodeType === 3 && !r.trim(el.nodeValue)) {
        $(el).remove();
      }
    });

    const newItem = breweryList.children().pop()
      , newItemDt = $(newItem);

    handleItemEl(newItem);
    newItemDt.css('opacity', '0');

    setBreweryColors();

    const name = directFind(newItemDt, ['h2', '[data-prop="name"]'])[0];
    if (shouldTruncateName(name)) {
      truncateName(name);
    }

    return Promise.all([
      velocity(
        newItem
        , { opacity: 1 }
        , { duration: duration.medium }
      )
      , velocity(
        newItem
        , 'scroll'
        , { duration: duration.long }
      )
    ]);
  }
};

function updateDom(itemDt, data, itemType) {
  r.pipe(
    directFindAll(itemDt)
    , r.map(dt => dt.find(propSelectors[itemType]))
    , r.forEach(dt => dt.forEach(updateProp(data)))
  )(propCtx);

  const name = directFindAll(itemDt)([
      ['h2', '[data-prop="name"]']
      , ['h3', '[data-prop="name"]']
    ])[0][0];

  if (shouldTruncateName(name)) {
    truncateName(name);
  } else {
    directFind(itemDt, ['.panel', '.more-data', '.full-name'])
      .remove();
  }
}

function updateProp(data) {
  return el => {
    const elDt = $(el)
      , newText = data[elDt.attr('data-prop')];

    elDt.text(newText);
  };
}

function getAddToVm() {
  return {
    beer: data => {
      const vmData = r.omit(['id', 'brewery_id'], data);
      vm.brewery[data.brewery_id].beer[data.id] = vmData;
      return addToDom.beer(viewDt.find('ul[data-items="brewery"] > li[data-item-id="'
        + data.brewery_id + '"] ul[data-items="beer"]'), data
      );
    }
    , brewery: data => {
      const vmData = r.pipe(
        r.omit(['id'])
        , r.assoc('beer', {})
      )(data);

      vm.brewery[data.id] = vmData;

      return addToDom.brewery(findColumnToAddBrewery(), data);
    }
  };
}

function getUpdateVm() {
  return {
    beer: ({ data, brewery_id, id }) => {
      mutableMerge(vm.brewery[brewery_id].beer[id], data);
      updateDom(viewDt.find(itemSelector.beer(brewery_id, id)), data, 'beer');
    }
    , brewery: ({ data, id }) => {
      mutableMerge(vm.brewery[id], data);
      updateDom(viewDt.find(itemSelector.brewery(id)), data, 'brewery');
    }
  };
}

function getErrorContent(name, methoding) {
  return '<p>Very sorry, but an error occurred preventing you from '
    + methoding + ' ' + name + '.</p>';
}

function handleRequestError(name, methoding) {
  return err => {
    console.error(err);

    return modal.dialog.show({
      ctx: {
        title: 'Error'
        , content: getErrorContent(name, methoding)
        , btns: [{ action: 'ok', text: 'I forgive you' }]
      }
      , cbs: { ok() { return modal.dialog.hide(); } }
    });
  };
}

function getSendRequest() {
  return {
    edit(itemType, data, oldName, brewery_id, id, itemDt) {
      return request.edit[itemType](data, id)
        .then(res => updateVm[itemType]({
          data: r.pick(r.keys(data), res.data) // the server provides keys we don't need such as 'id'
          , brewery_id
          , id
        }))
        .catch(err => {
          if (r.path(['response', 'data', 'id'], err) === 'brewery_no_longer_exists') {
            const breweryData = getItemData({ id: brewery_id, itemType: 'brewery' })
              , breweryDt = viewDt.find('[data-item-id="' + brewery_id + '"]');

            return modal.dialog.show({
              ctx: {
                title: 'No Longer Exists'
                , content: '<p>The brewery ' + spanItem(breweryData.name) + ' has been deleted '
                   + 'by someone else so you are unable to edit its beer.  This '
                   + 'application doesn\'t support real-time notifications, so a '
                   + 'page refresh is necessary to see edits made by others.</p><p>'
                   + 'The brewery ' + spanItem(breweryData.name) + ' will now be deleted.</p>'
                , btns: [{ text: 'Sounds good', action: 'ok' }]
              }
              , cbs: { ok() {
                return modal.dialog.hide()
                  .then(() => deleteItem(breweryDt, 'brewery', brewery_id));
              }}
            });
          } else if (r.path(['response', 'status'], err) === 404) {
            return modal.dialog.show({
              ctx: {
                title: 'No Longer Exists'
                , content: '<p>' + spanItem(oldName) + ' has been deleted by someone else so '
                   + 'you are unable to edit it.  This application doesn\'t support '
                   + 'real-time notifications, so a page refresh is necessary to see '
                   + 'edits made by others.</p><p>' + spanItem(oldName) + ' will now '
                   + 'be deleted.</p>'
                , btns: [{ text: 'Sounds good', action: 'ok' }]
              }
              , cbs: { ok() {
                return modal.dialog.hide()
                  .then(() => deleteItem(itemDt, itemType, id, brewery_id));
              }}
            });
          } else throw err;
        })
        .catch(handleRequestError(oldName || data.name, 'editing'));
    }
    , create(itemType, data) {
      return request.create[itemType](data)
        .then(res => addToVm[itemType](res.data))
        .catch(err => {
          if (r.path(['response', 'data', 'id'], err) !== 'brewery_no_longer_exists') throw err;

          const breweryData = getItemData({ id: data.brewery_id, itemType: 'brewery' })
            , breweryDt = viewDt.find('[data-item-id="' + data.brewery_id + '"]');

          return modal.dialog.show({
            ctx: {
              title: 'No Longer Exists'
              , content: dedent(`
                <p>
                  The brewery ${spanItem(breweryData.name)} has been deleted by
                  someone else so you are unable to add a beer to it.  This
                  application doesn't support real-time notifications, so a page
                  refresh is necessary to see edits made by others.
                </p>
                <p>
                  The brewery ${spanItem(breweryData.name)} will now be deleted.
                </p>
              `)
              , btns: [{ text: 'Sounds good', action: 'ok' }]
            }
            , cbs: { ok() {
              return modal.dialog.hide()
                .then(() => deleteItem(breweryDt, 'brewery', data.brewery_id));
            }}
          });
        })
        .catch(handleRequestError(data.name, 'creating'));
    }
  };
}

function getBreweriesPerColumn() {
  switch (numColumns) {
    case 4: return $('ul[data-items="brewery"]').map(el => $(el).children());
    case 2: return r.pipe(
        unwrap
        , pairAdjacentElements
        , r.map(
          r.reduce((res, cur) => r.concat(res, unwrap($(cur).children())), [])
        )
        , r.map($)
      )($('ul[data-items="brewery"]'));
    case 1: return [$($('ul[data-items="brewery"]')
      .map(el => unwrap($(el).children()))
      .reduce(r.concat))];
  }
}

function setBreweryColors() {
  const getFilterFn = columnsToGetFilterFn[numColumns];

  getBreweriesPerColumn()
    .forEach((breweries, col) => {
      breweries.filter(getFilterFn(col))
        .filter(':not(.add-one)')
        .removeClass('dark');

      breweries.filter(r.complement(getFilterFn(col)))
        .filter(':not(.add-one):not(.dark)')
        .addClass('dark');
    });
}

function findColumnToAddBrewery() {
  let breweries = viewDt.find('ul[data-items="brewery"]')
    , breweryColumn = findEmptyBreweryColumn(breweries);

  if (breweryColumn) { return $(breweryColumn); }

  if (numColumns === 4) {
    breweryColumn = breweries.map(el => directFind($(el), ['li']))
        .reduce(r.minBy(r.prop('length')))
        .parent()[0];
  } else if (numColumns === 2) {
    breweryColumn = breweries.filter(elIsOdd)
        .map(el => directFind($(el), ['li']))
        .reduce(r.minBy(r.prop('length')))
        .parent()[0];
  } else { // numColumns === 1
    breweryColumn = $(viewDt.find('ul[data-items="brewery"]').pop());
  }

  return $(breweryColumn);
}

function findEmptyBreweryColumn(breweries) {
  return breweries.filter(el => !$(el).children().length)[0];
}

function handleWindowResize() {
  if (numColumns !== getNumColumns()) {
    numColumns = getNumColumns();
    setBreweryColors();
  }
}

function initTruncations() {
  $('.panel').addClass('show');

  directFindAll($('li[data-item-id]'))([
      ['h2', '[data-prop="name"]']
      , ['h3', '[data-prop="name"]']
    ])
    .map(unwrap)
    .reduce(r.concat, [])
    .filter(shouldTruncateName)
    .forEach(truncateName);

  $('.panel').removeClass('show');
}

function deleteItem(itemDt, itemType, id, brewery_id) {
  if (itemType === 'brewery') delete vm.brewery[id];
  else delete vm.brewery[brewery_id].beer[id];
  return removeDt(itemDt);
}

function spanItem(name) {
  return '<span class="item">' + name + '</span>';
}


//---------//
// Exports //
//---------//

module.exports = { run };
