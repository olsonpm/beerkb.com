'use strict';

//
// README
// - Given the signature (schema, errs, obj) -> { prop: [error messages] }
//
// :schema has the following structure (* represents optional)
// {
//   (propName): {
//     flags*: ['isOptional']
//     , namedValidationFns: [(aNamedValidationFn)...]
//   }
// }
//
// :errs has the following structure
// {
//   (validationFnName): error message
// }
//
// :obj the object to validate the schema against
//


//---------//
// Imports //
//---------//

const r = require('./ramda.custom')
  , rUtils = require('./r-utils')
  ;


//------//
// Init //
//------//

const { coerceArray, containsAny, isLaden, mutableAssoc, mutableMap, size } = rUtils;


//------//
// Main //
//------//


const invoke = r.curry((str, obj) => r.invoker(0, str)(obj))
  , equalsSelfAfter = r.curry((fn, obj) => r.converge(r.identical, [fn, r.identity])(obj))
  , notEqualsSelfAfter = r.complement(equalsSelfAfter)
  , charIsUppercase = r.both(equalsSelfAfter(invoke('toUpperCase')), notEqualsSelfAfter(invoke('toLowerCase')))
  ;

const assignName = mutableMap(function(fn, name) { return mutableAssoc('_name', name, fn); });

const startsWithUppercase = r.pipe(r.head, charIsUppercase)
  , isString = r.pipe(r.type, r.identical('String'));

const validate = r.curry(
  (schema, errs, obj) => {
    const sKeys = r.keys(schema)
      , requiredKeys = getRequiredKeys(schema)
      , oKeys = r.keys(obj)
      ;

    const extraProps = r.difference(oKeys, sKeys)
      , missingProps = r.difference(requiredKeys, oKeys)
      ;

    let errMsg = '';

    if (extraProps.length) errMsg += 'The following properties are not in the schema: ' + extraProps.join(', ') + '\n';
    if (missingProps.length) errMsg += 'The following required properties are missing: ' + missingProps.join(', ') + '\n';
    if (errMsg) throw new Error(errMsg);

    return r.pipe(
      r.reject(isIgnored)
      , r.mapObjIndexed(toFailedValidations(obj))
      , r.map(toErrorMessageList(errs))
      , r.filter(size)
    )(schema);
  }
);


//-----------//
// Post-Main //
//-----------//

const fns = {
  isLaden
  , isString
  , startsWithUppercase
};

assignName(fns);


//-------------//
// Helper Fxns //
//-------------//

function toFailedValidations(obj) {
  return (def, prop) => r.reject(
    r.apply(r.__, [obj[prop]])
    , def.namedValidationFns
  );
}

function toErrorMessageList(errs) {
  return failedValidations => r.map(
    r.pipe(r.prop('_name'), r.prop(r.__, errs))
    , failedValidations
  );
}

function isIgnored(val) {
  return r.contains('ignore', coerceArray(val.flags));
}

function getRequiredKeys(schema) {
  return r.pipe(
    r.reject(
      r.pipe(r.prop('flags'), coerceArray, containsAny(['isOptional', 'ignore']))
    )
    , r.keys
  )(schema);
}


//---------//
// Exports //
//---------//

module.exports = {
  validate
  , assignName
  , isIgnored
  , fns
};
