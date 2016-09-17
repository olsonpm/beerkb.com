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
// }
//


//---------//
// Imports //
//---------//

const bPromise = require('bluebird')
  , r = require('ramda')
  , rUtils = require('../r-utils')
  ;


//------//
// Init //
//------//

const { mutableAssoc, mutableDissoc, mutableMap, mutablePick } = rUtils;


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
