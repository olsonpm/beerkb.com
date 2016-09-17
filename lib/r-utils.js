'use strict';


//---------//
// Imports //
//---------//

const r = require('./external/ramda.custom')
  , isInteger = require('is-integer')
  ;


//------//
// Main //
//------//


// short

const betweenI = getBetween('inclusive')
  , betweenRange = getBetween('range')
  , [lte, subtract] = r.map(r.flip, [r.lte, r.subtract])
  , square = x => x * x
  , toBoolean = val => !!val
  ;


// longer

const coerceArray = r.unless(r.pipe(r.type, r.identical('Array')), r.of);

const containsAny = r.curry(
  (src, target) => {
    let found = false
      , i = 0;

    while(!found && i < target.length) {
      found = r.contains(target[i], src);
      i+=1;
    }

    return found;
  }
);

const invoke = r.curry(
  (prop, obj) => r.pipe(r.prop, r.bind(r.__, obj), r.call)(prop, obj)
);

const isUndefined = val => typeof val === 'undefined'
  , isDefined = r.complement(isUndefined);

const size = val => {
    switch (r.type(val)) {
      case 'Object':
        return r.keys(val).length;
      default:
        if (isInteger(val.length))
          return val.length;
        else
          throw new Error("Invalid Input: size requires r.type of Object or an integer length property");
    }
  }
  , isLaden = r.pipe(size, toBoolean);

const middle = col => col[Math.floor(col.length / 2)];

const mutableAssoc = r.curry(
  (path, val, obj) => { obj[path] = val; return obj; }
);

const mutableDissoc = r.curry(
  (path, obj) => { delete obj[path]; return obj; }
);

const mutableMerge = r.curry(
  (target, src) => {
    for (let key in src) {
      target[key] = src[key];
    }
    return target;
  }
);

const _mutableFilterArr = (predicate, arr) => {
  let idx = arr.length;
  while (idx--) {
    if (!predicate(arr[idx])) arr.splice(idx, 1);
  }
  return arr;
};
const _mutableFilterObj = (predicate, obj) => {
  for (let key in obj) {
    if (!predicate(obj[key])) delete obj[key];
  }
  return obj;
};

const mutableFilter = r.curry(
  (predicate, list) => {
    switch (r.type(list)) {
      case 'Array':
        return _mutableFilterArr(predicate, list);
      case 'Object':
        return _mutableFilterObj(predicate, list);
      default:
        throw new Error("Invalid Input: mutableFilter requires r.type of Array or Object");
    }
  }
);

const _mutableMapArr = (transform, arr) => {
  for (let i = 0; i < arr.length; i++) {
    arr[i] = transform(arr[i], i);
  }
  return arr;
};
const _mutableMapObj = (transform, obj) => {
  for (let key in obj) {
    obj[key] = transform(obj[key], key);
  }
  return obj;
};
const mutableMap = r.curry(
  (transform, list) => {
    switch (r.type(list)) {
      case 'Array':
        return _mutableMapArr(transform, list);
      case 'Object':
        return _mutableMapObj(transform, list);
      default:
        throw new Error("Invalid Input: mutableFilter requires r.type of Array or Object");
    }
  }
);

const mutableOmit = r.curry(
  (propsToOmitArr, obj) => {
    propsToOmitArr.forEach(prop => delete obj[prop]);
    return obj;
  }
);

const mutablePick = r.curry(
  (propsToPickArr, obj) => {
    for (let key in obj) {
      if (!r.contains(key, propsToPickArr)) { delete obj[key]; }
    }
    return obj;
  }
);

const mutableReject = r.curry(
  (predicate, list) => mutableFilter(r.complement(predicate), list)
);

const reduceFirst = r.curry(
  (reducer, list) => r.reduce(
    reducer, r.head(list), r.tail(list)
  )
);

const reduceIndexed = r.addIndex(r.reduce);

const rswitch = r.curry(
  (caseObj, key, args) => r.apply(
    r.propOr('default', key, caseObj)
    , args
  )
);

const sample = list => {
  // if not an array, then assume it's an object
  if (!r.type(list) === 'Array') list = r.values(list);
  return list[Math.floor(Math.random() * list.length)];
};

const _cloneList = r.map(r.identity)
  , _cloneCases = {
    Array: _cloneList
    , Object: _cloneList
    , default: invalidType => {
      throw new Error("Invalid Input: shallowClone requires an r.type of Array or Object\n"
        + "r.type(" + invalidType + ") -> " + r.type(invalidType)
      );
    }
  };
const shallowClone = val => rswitch(_cloneCases, r.type(val), [val]);

const staticCond = r.curry(
  (conds, val) => r.pipe(
    r.find(aCond => r.head(aCond)(val))
    , r.last
  )(conds)
);

const _toNumberCases = {
  Number: r.identity
  , String: str => parseInt(str, 10)
  , default: invalidType => {
    throw new Error("Invalid Input: toNumber requires an r.type of String or Number\n"
      + "r.type(" + invalidType + ") -> " + r.type(invalidType)
    );
  }
};

const toNumber = val => rswitch(_toNumberCases, r.type(val), [val]);

const transform = r.curry(
  (reducer, start, list) => r.forEach(
    r.partial(reducer, [start])
    , list || []
  ) && start
);


//-------------//
// Helper Fxns //
//-------------//

function getBetween(type) {
  const ltFn = (type === 'inclusive')
    ? r.lte
    : r.lt;

  return r.curry(
    (low, high, val) => {
      if (low > high) [low, high] = [high, low];
      return r.gte(val, low) && ltFn(val, high);
    }
  );
}


//---------//
// Exports //
//---------//

module.exports = {
  betweenI
  , betweenRange
  , coerceArray
  , containsAny
  , invoke
  , isDefined
  , isLaden
  , isUndefined
  , lte
  , middle
  , mutableAssoc
  , mutableDissoc
  , mutableFilter
  , mutableMap
  , mutableMerge
  , mutablePick
  , mutableOmit
  , mutableReject
  , reduceFirst
  , reduceIndexed
  , sample
  , shallowClone
  , size
  , square
  , staticCond
  , subtract
  , toBoolean
  , toNumber
  , transform
};
