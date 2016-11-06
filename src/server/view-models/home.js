'use strict';

//
// README
// - Returns the following structure:
//
// {
//   brewery: {
//     (brewery id): {
//       city_name: <string>
//       , name: <string>
//       , state: <string>
//       , beer: {
//         (beer id): {
//           description: <string>
//           , name: <string>
//           , style: <string>
//         }
//         ... id per beer
//       }
//     }
//     ... id per brewery
//   }
//   , pairedColumnsOfBreweryIds: [
//     [
//       [(brewery id)... ] x2
//     ] x2
//   ]
// }
//


//---------//
// Imports //
//---------//

const bPromise = require('bluebird')
  , r = require('ramda')
  , rUtils = require('../../../lib/r-utils')
  ;


//------//
// Init //
//------//

const {
  distribute, mutableAssoc, mutableDissoc, mutableMap, mutablePick
  , mutableRotate
} = rUtils;


//------//
// Main //
//------//

const create = ({ bGetBeers, bGetBreweries }) => ({
  get: () => bPromise.props({
      beer: bGetBeers({})
      , brewery: bGetBreweries({})
    })
    .then(({ beer, brewery }) => {
      const beersPerBrewery = r.groupBy(r.prop('brewery_id'), beer);
      const res = {
        brewery: mutableMap(
          brewery => prepBrewery(brewery, beersPerBrewery[brewery.id])
          , r.indexBy(r.prop('id'), brewery)
        )
      };

      res.pairedColumnsOfBreweryIds = r.pipe(
        r.keys
        , distribute(4)
        , mutableRotate(1)
        , r.splitEvery(2)
      )(res.brewery);

      return res;
    })
});


//-------------//
// Helper Fxns //
//-------------//

function prepBrewery(brewery, beer) {
  return mutableAssoc(
    'beer'
    , r.pipe(
      mutableMap(val => mutablePick(['description', 'id', 'name', 'style'], val))
      , r.indexBy(r.prop('id'))
      , mutableMap(mutableDissoc('id'))
    )(beer)
    , r.pick(['city_name', 'name', 'state'], brewery)
  );
}


//---------//
// Exports //
//---------//

module.exports = create;
