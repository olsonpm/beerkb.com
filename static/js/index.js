/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!********************************!*\
  !*** ./src/client/js/index.js ***!
  \********************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// always polyfill and initialize base

	__webpack_require__(/*! promise-polyfill */ 1);
	__webpack_require__(/*! ./base */ 4);

	//---------//
	// Imports //
	//---------//

	var $ = __webpack_require__(/*! ./external/domtastic.custom */ 5),
	    views = __webpack_require__(/*! ./views */ 22);

	//------//
	// Main //
	//------//

	var viewName = window.location.pathname.slice(1) || 'home';

	if (!views.contains(viewName)) {
	  throw new Error("View doesn't exist: " + viewName);
	}

	views[viewName].run(getVm(viewName));

	//-------------//
	// Helper Fxns //
	//-------------//

	function getVm(viewName) {
	  return JSON.parse($('#view-' + viewName + ' > .vm')[0].innerHTML);
	}

/***/ },
/* 1 */
/*!***************************************!*\
  !*** ./~/promise-polyfill/promise.js ***!
  \***************************************/
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate) {(function (root) {

	  // Store setTimeout reference so promise-polyfill will be unaffected by
	  // other code modifying setTimeout (like sinon.useFakeTimers())
	  var setTimeoutFunc = setTimeout;

	  function noop() {}
	  
	  // Polyfill for Function.prototype.bind
	  function bind(fn, thisArg) {
	    return function () {
	      fn.apply(thisArg, arguments);
	    };
	  }

	  function Promise(fn) {
	    if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
	    if (typeof fn !== 'function') throw new TypeError('not a function');
	    this._state = 0;
	    this._handled = false;
	    this._value = undefined;
	    this._deferreds = [];

	    doResolve(fn, this);
	  }

	  function handle(self, deferred) {
	    while (self._state === 3) {
	      self = self._value;
	    }
	    if (self._state === 0) {
	      self._deferreds.push(deferred);
	      return;
	    }
	    self._handled = true;
	    Promise._immediateFn(function () {
	      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
	      if (cb === null) {
	        (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
	        return;
	      }
	      var ret;
	      try {
	        ret = cb(self._value);
	      } catch (e) {
	        reject(deferred.promise, e);
	        return;
	      }
	      resolve(deferred.promise, ret);
	    });
	  }

	  function resolve(self, newValue) {
	    try {
	      // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
	      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
	      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
	        var then = newValue.then;
	        if (newValue instanceof Promise) {
	          self._state = 3;
	          self._value = newValue;
	          finale(self);
	          return;
	        } else if (typeof then === 'function') {
	          doResolve(bind(then, newValue), self);
	          return;
	        }
	      }
	      self._state = 1;
	      self._value = newValue;
	      finale(self);
	    } catch (e) {
	      reject(self, e);
	    }
	  }

	  function reject(self, newValue) {
	    self._state = 2;
	    self._value = newValue;
	    finale(self);
	  }

	  function finale(self) {
	    if (self._state === 2 && self._deferreds.length === 0) {
	      Promise._immediateFn(function() {
	        if (!self._handled) {
	          Promise._unhandledRejectionFn(self._value);
	        }
	      });
	    }

	    for (var i = 0, len = self._deferreds.length; i < len; i++) {
	      handle(self, self._deferreds[i]);
	    }
	    self._deferreds = null;
	  }

	  function Handler(onFulfilled, onRejected, promise) {
	    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
	    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
	    this.promise = promise;
	  }

	  /**
	   * Take a potentially misbehaving resolver function and make sure
	   * onFulfilled and onRejected are only called once.
	   *
	   * Makes no guarantees about asynchrony.
	   */
	  function doResolve(fn, self) {
	    var done = false;
	    try {
	      fn(function (value) {
	        if (done) return;
	        done = true;
	        resolve(self, value);
	      }, function (reason) {
	        if (done) return;
	        done = true;
	        reject(self, reason);
	      });
	    } catch (ex) {
	      if (done) return;
	      done = true;
	      reject(self, ex);
	    }
	  }

	  Promise.prototype['catch'] = function (onRejected) {
	    return this.then(null, onRejected);
	  };

	  Promise.prototype.then = function (onFulfilled, onRejected) {
	    var prom = new (this.constructor)(noop);

	    handle(this, new Handler(onFulfilled, onRejected, prom));
	    return prom;
	  };

	  Promise.all = function (arr) {
	    var args = Array.prototype.slice.call(arr);

	    return new Promise(function (resolve, reject) {
	      if (args.length === 0) return resolve([]);
	      var remaining = args.length;

	      function res(i, val) {
	        try {
	          if (val && (typeof val === 'object' || typeof val === 'function')) {
	            var then = val.then;
	            if (typeof then === 'function') {
	              then.call(val, function (val) {
	                res(i, val);
	              }, reject);
	              return;
	            }
	          }
	          args[i] = val;
	          if (--remaining === 0) {
	            resolve(args);
	          }
	        } catch (ex) {
	          reject(ex);
	        }
	      }

	      for (var i = 0; i < args.length; i++) {
	        res(i, args[i]);
	      }
	    });
	  };

	  Promise.resolve = function (value) {
	    if (value && typeof value === 'object' && value.constructor === Promise) {
	      return value;
	    }

	    return new Promise(function (resolve) {
	      resolve(value);
	    });
	  };

	  Promise.reject = function (value) {
	    return new Promise(function (resolve, reject) {
	      reject(value);
	    });
	  };

	  Promise.race = function (values) {
	    return new Promise(function (resolve, reject) {
	      for (var i = 0, len = values.length; i < len; i++) {
	        values[i].then(resolve, reject);
	      }
	    });
	  };

	  // Use polyfill for setImmediate for performance gains
	  Promise._immediateFn = (typeof setImmediate === 'function' && function (fn) { setImmediate(fn); }) ||
	    function (fn) {
	      setTimeoutFunc(fn, 0);
	    };

	  Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
	    if (typeof console !== 'undefined' && console) {
	      console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
	    }
	  };

	  /**
	   * Set the immediate function to execute callbacks
	   * @param fn {function} Function to execute
	   * @deprecated
	   */
	  Promise._setImmediateFn = function _setImmediateFn(fn) {
	    Promise._immediateFn = fn;
	  };

	  /**
	   * Change the function to execute on unhandled rejection
	   * @param {function} fn Function to execute on unhandled rejection
	   * @deprecated
	   */
	  Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
	    Promise._unhandledRejectionFn = fn;
	  };
	  
	  if (typeof module !== 'undefined' && module.exports) {
	    module.exports = Promise;
	  } else if (!root.Promise) {
	    root.Promise = Promise;
	  }

	})(this);

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(/*! ./~/timers-browserify/main.js */ 2).setImmediate))

/***/ },
/* 2 */
/*!*************************************!*\
  !*** ./~/timers-browserify/main.js ***!
  \*************************************/
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate, clearImmediate) {var nextTick = __webpack_require__(/*! process/browser.js */ 3).nextTick;
	var apply = Function.prototype.apply;
	var slice = Array.prototype.slice;
	var immediateIds = {};
	var nextImmediateId = 0;

	// DOM APIs, for completeness

	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) { timeout.close(); };

	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};

	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};

	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};

	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);

	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};

	// That's not how node.js implements it but the exposed api is the same.
	exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
	  var id = nextImmediateId++;
	  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

	  immediateIds[id] = true;

	  nextTick(function onNextTick() {
	    if (immediateIds[id]) {
	      // fn.call() is faster so we optimize for the common use-case
	      // @see http://jsperf.com/call-apply-segu
	      if (args) {
	        fn.apply(null, args);
	      } else {
	        fn.call(null);
	      }
	      // Prevent ids from leaking
	      exports.clearImmediate(id);
	    }
	  });

	  return id;
	};

	exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
	  delete immediateIds[id];
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(/*! ./~/timers-browserify/main.js */ 2).setImmediate, __webpack_require__(/*! ./~/timers-browserify/main.js */ 2).clearImmediate))

/***/ },
/* 3 */
/*!******************************!*\
  !*** ./~/process/browser.js ***!
  \******************************/
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 4 */
/*!*******************************!*\
  !*** ./src/client/js/base.js ***!
  \*******************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//---------//
	// Imports //
	//---------//

	var $ = __webpack_require__(/*! ./external/domtastic.custom */ 5),
	    bubbleGenerator = __webpack_require__(/*! ./bubble-generator */ 6),
	    duration = __webpack_require__(/*! ./constants/duration */ 13),
	    modal = __webpack_require__(/*! ./services/modal */ 17),
	    render = __webpack_require__(/*! ./services/render */ 18),
	    utils = __webpack_require__(/*! ./utils */ 12),
	    velocity = __webpack_require__(/*! velocity-animate */ 16);

	//------//
	// Init //
	//------//

	var bodyHeight = document.body.clientHeight,
	    bodyWidth = document.body.clientWidth;

	var addHoveredDt = utils.addHoveredDt;


	window.addEventListener('resize', handleWindowResize);
	$('#soul > footer .other-credits').on('click', otherCreditsOnClick);
	addHoveredDt($('#soul > footer').find('a, .other-credits'));

	//------//
	// Main //
	//------//

	// handle bubble worker
	var bubbleLayer = $(document.createElement('div')).attr({ id: 'bubble-layer' });
	$(document.body).prepend(bubbleLayer);

	initBubbleGenerator();
	initScrollHandler();

	//-------------//
	// Helper Fxns //
	//-------------//

	function createBubble(_ref) {
	  var x = _ref.x,
	      y = _ref.y,
	      moveDuration = _ref.moveDuration,
	      diameter = _ref.diameter,
	      size = _ref.size;

	  var bubbleWrapper = getBubbleDiv(x, y, diameter, size),
	      bubbleDiv = bubbleWrapper.children()[0];

	  bubbleLayer.append(bubbleWrapper);
	  var easing = 'easeInQuad';

	  return Promise.all([velocity(bubbleDiv, {
	    translateZ: 0,
	    translateY: -(bodyHeight + diameter * 4) + 'px'
	  }, { duration: moveDuration, easing: easing }), velocity(bubbleWrapper, { opacity: 0 }, {
	    delay: moveDuration - duration.small,
	    duration: duration.small
	  })]).then(bubbleDiv.remove.bind(bubbleDiv));
	}

	function getBubbleDiv(x, y, diameter, size) {
	  return $(document.createElement('div')).addClass('bubble-wrapper').append($(document.createElement('div')).attr({
	    class: 'bubble ' + size,
	    style: render('bubble-style', { x: x, y: y, diameter: diameter })
	  }));
	}

	function initBubbleGenerator() {
	  bubbleGenerator.run({
	    clientHeight: bodyHeight,
	    clientWidth: bodyWidth,
	    clientWidthRange: [480, 992] // values taken from _variables.scss
	    , fizzRateRange: [400, 800] // ms
	    , fizzSpeedRange: [3, 9] // 1px/<x>ms
	    , onBubbleCreate: createBubble,
	    scrollY: window.scrollY
	  });
	}

	function handleWindowResize() {
	  bodyHeight = document.body.clientHeight;
	  bodyWidth = document.body.clientWidth;

	  bubbleGenerator.updateClientDimensions({
	    clientHeight: bodyHeight,
	    clientWidth: bodyWidth
	  });
	}

	function initScrollHandler() {
	  window.addEventListener('scroll', function () {
	    bubbleGenerator.updateScrollY(window.scrollY);
	  });
	}

	function otherCreditsOnClick() {
	  var egor = '<a href="https://www.behance.net/pio-5">Egor Rumyantsev</a>',
	      freepik = '<a href="http://www.freepik.com/">Freepik</a>',
	      flaticon = '<a href="www.flaticon.com">www.flaticon.com</a>';
	  var content = ['<ul class="credits">', '<li>Waste bin icon made by ' + egor + ' from ' + flaticon + '.</li>', '<li>Pencil icon made by ' + freepik + ' from ' + flaticon + '.</li>', '</ul>'].join('');

	  modal.dialog.show({
	    ctx: {
	      title: 'Other Credits',
	      content: content,
	      btns: [{ action: 'ok', text: 'ok' }]
	    },
	    cbs: {
	      ok: modal.dialog.hide
	    }
	  });
	}

/***/ },
/* 5 */
/*!****************************************************!*\
  !*** ./src/client/js/external/domtastic.custom.js ***!
  \****************************************************/
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	(function (global, factory) {
	  ( false ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() :  true ? !(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)) : global.$ = factory();
	})(undefined, function () {
	  'use strict';

	  /*
	   * @module Util
	   */

	  /*
	   * Reference to the global scope
	   * @private
	   */

	  var global = new Function('return this')();

	  /**
	   * Convert `NodeList` to `Array`.
	   *
	   * @param {NodeList|Array} collection
	   * @return {Array}
	   * @private
	   */

	  var toArray = function toArray(collection) {
	    var length = collection.length;
	    var result = new Array(length);
	    for (var i = 0; i < length; i++) {
	      result[i] = collection[i];
	    }
	    return result;
	  };

	  /**
	   * Faster alternative to [].forEach method
	   *
	   * @param {Node|NodeList|Array} collection
	   * @param {Function} callback
	   * @return {Node|NodeList|Array}
	   * @private
	   */

	  var each = function each(collection, callback, thisArg) {
	    var length = collection.length;
	    if (length !== undefined && collection.nodeType === undefined) {
	      for (var i = 0; i < length; i++) {
	        callback.call(thisArg, collection[i], i, collection);
	      }
	    } else {
	      callback.call(thisArg, collection, 0, collection);
	    }
	    return collection;
	  };

	  /**
	   * Assign enumerable properties from source object(s) to target object
	   *
	   * @method extend
	   * @param {Object} target Object to extend
	   * @param {Object} [source] Object to extend from
	   * @return {Object} Extended object
	   * @example
	   *     $.extend({a: 1}, {b: 2});
	   *     // {a: 1, b: 2}
	   * @example
	   *     $.extend({a: 1}, {b: 2}, {a: 3});
	   *     // {a: 3, b: 2}
	   */

	  var extend = function extend(target) {
	    for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	      sources[_key - 1] = arguments[_key];
	    }

	    sources.forEach(function (src) {
	      for (var prop in src) {
	        target[prop] = src[prop];
	      }
	    });
	    return target;
	  };

	  /**
	   * Return the collection without duplicates
	   *
	   * @param collection Collection to remove duplicates from
	   * @return {Node|NodeList|Array}
	   * @private
	   */

	  var uniq = function uniq(collection) {
	    return collection.filter(function (item, index) {
	      return collection.indexOf(item) === index;
	    });
	  };

	  var isPrototypeSet = false;

	  var reFragment = /^\s*<(\w+|!)[^>]*>/;
	  var reSingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/;
	  var reSimpleSelector = /^[\.#]?[\w-]*$/;

	  /*
	   * Versatile wrapper for `querySelectorAll`.
	   *
	   * @param {String|Node|NodeList|Array} selector Query selector, `Node`, `NodeList`, array of elements, or HTML fragment string.
	   * @param {String|Node|NodeList} context=document The context for the selector to query elements.
	   * @return {Object} The wrapped collection
	   * @chainable
	   * @example
	   *     var $items = $(.items');
	   * @example
	   *     var $element = $(domElement);
	   * @example
	   *     var $list = $(nodeList, document.body);
	   * @example
	   *     var $element = $('<p>evergreen</p>');
	   */

	  var $$2 = function $$2(selector) {
	    var context = arguments.length <= 1 || arguments[1] === undefined ? document : arguments[1];

	    var collection = void 0;

	    if (!selector) {

	      collection = document.querySelectorAll(null);
	    } else if (selector instanceof Wrapper) {

	      return selector;
	    } else if (typeof selector !== 'string') {

	      collection = selector.nodeType || selector === window ? [selector] : selector;
	    } else if (reFragment.test(selector)) {

	      collection = createFragment(selector);
	    } else {

	      context = typeof context === 'string' ? document.querySelector(context) : context.length ? context[0] : context;

	      collection = querySelector(selector, context);
	    }

	    return wrap(collection);
	  };

	  /*
	   * Find descendants matching the provided `selector` for each element in the collection.
	   *
	   * @param {String|Node|NodeList|Array} selector Query selector, `Node`, `NodeList`, array of elements, or HTML fragment string.
	   * @return {Object} The wrapped collection
	   * @example
	   *     $('.selector').find('.deep').$('.deepest');
	   */

	  var find = function find(selector) {
	    var nodes = [];
	    each(this, function (node) {
	      return each(querySelector(selector, node), function (child) {
	        if (nodes.indexOf(child) === -1) {
	          nodes.push(child);
	        }
	      });
	    });
	    return $$2(nodes);
	  };

	  /*
	   * Returns `true` if the element would be selected by the specified selector string; otherwise, returns `false`.
	   *
	   * @param {Node} element Element to test
	   * @param {String} selector Selector to match against element
	   * @return {Boolean}
	   *
	   * @example
	   *     $.matches(element, '.match');
	   */

	  var matches = function () {
	    var context = typeof Element !== 'undefined' ? Element.prototype : global;
	    var _matches = context.matches || context.matchesSelector || context.mozMatchesSelector || context.msMatchesSelector || context.oMatchesSelector || context.webkitMatchesSelector;
	    return function (element, selector) {
	      return _matches.call(element, selector);
	    };
	  }();

	  /*
	   * Use the faster `getElementById`, `getElementsByClassName` or `getElementsByTagName` over `querySelectorAll` if possible.
	   *
	   * @private
	   * @param {String} selector Query selector.
	   * @param {Node} context The context for the selector to query elements.
	   * @return {Object} NodeList, HTMLCollection, or Array of matching elements (depending on method used).
	   */

	  var querySelector = function querySelector(selector, context) {

	    var isSimpleSelector = reSimpleSelector.test(selector);

	    if (isSimpleSelector) {
	      if (selector[0] === '#') {
	        var element = (context.getElementById ? context : document).getElementById(selector.slice(1));
	        return element ? [element] : [];
	      }
	      if (selector[0] === '.') {
	        return context.getElementsByClassName(selector.slice(1));
	      }
	      return context.getElementsByTagName(selector);
	    }

	    return context.querySelectorAll(selector);
	  };

	  /*
	   * Create DOM fragment from an HTML string
	   *
	   * @private
	   * @param {String} html String representing HTML.
	   * @return {NodeList}
	   */

	  var createFragment = function createFragment(html) {

	    if (reSingleTag.test(html)) {
	      return [document.createElement(RegExp.$1)];
	    }

	    var elements = [];
	    var container = document.createElement('div');
	    var children = container.childNodes;

	    container.innerHTML = html;

	    for (var i = 0, l = children.length; i < l; i++) {
	      elements.push(children[i]);
	    }

	    return elements;
	  };

	  /*
	   * Calling `$(selector)` returns a wrapped collection of elements.
	   *
	   * @private
	   * @param {NodeList|Array} collection Element(s) to wrap.
	   * @return Object) The wrapped collection
	   */

	  var wrap = function wrap(collection) {

	    if (!isPrototypeSet) {
	      Wrapper.prototype = $$2.fn;
	      Wrapper.prototype.constructor = Wrapper;
	      isPrototypeSet = true;
	    }

	    return new Wrapper(collection);
	  };

	  /*
	   * Constructor for the Object.prototype strategy
	   *
	   * @constructor
	   * @private
	   * @param {NodeList|Array} collection Element(s) to wrap.
	   */

	  var Wrapper = function Wrapper(collection) {
	    var i = 0;
	    var length = collection.length;
	    for (; i < length;) {
	      this[i] = collection[i++];
	    }
	    this.length = length;
	  };

	  var selector = Object.freeze({
	    get $() {
	      return $$2;
	    },
	    find: find,
	    matches: matches,
	    Wrapper: Wrapper
	  });

	  var ArrayProto = Array.prototype;

	  /**
	   * Checks if the given callback returns a true(-ish) value for each element in the collection.
	   *
	   * @param {Function} callback Function to execute for each element, invoked with `element` as argument.
	   * @param {Object} [thisArg] Value to use as `this` when executing `callback`.
	   * @return {Boolean} Whether each element passed the callback check.
	   * @example
	   *     $('.items').every(function(element) {
	   *         return element.hasAttribute('active')
	   *     });
	   *     // true/false
	   */

	  var every = ArrayProto.every;

	  /**
	   * Filter the collection by selector or function, and return a new collection with the result.
	   *
	   * @param {String|Function} selector Selector or function to filter the collection.
	   * @param {Object} [thisArg] Value to use as `this` when executing `callback`.
	   * @return {Object} A new wrapped collection
	   * @chainable
	   * @example
	   *     $('.items').filter('.active');
	   * @example
	   *     $('.items').filter(function(element) {
	   *         return element.hasAttribute('active')
	   *     });
	   */

	  var filter = function filter(selector, thisArg) {
	    var callback = typeof selector === 'function' ? selector : function (element) {
	      return matches(element, selector);
	    };
	    return $$2(ArrayProto.filter.call(this, callback, thisArg));
	  };

	  /**
	   * Execute a function for each element in the collection.
	   *
	   * @param {Function} callback Function to execute for each element, invoked with `element` as argument.
	   * @param {Object} [thisArg] Value to use as `this` when executing `callback`.
	   * @return {Object} The wrapped collection
	   * @chainable
	   * @example
	   *     $('.items').forEach(function(element) {
	   *         element.style.color = 'evergreen';
	   *     );
	   */

	  var forEach = function forEach(callback, thisArg) {
	    return each(this, callback, thisArg);
	  };

	  var each$1 = forEach;

	  /**
	   * Returns the index of an element in the collection.
	   *
	   * @param {Node} element
	   * @return {Number} The zero-based index, -1 if not found.
	   * @example
	   *     $('.items').indexOf(element);
	   *     // 2
	   */

	  var indexOf = ArrayProto.indexOf;

	  /**
	   * Create a new collection by executing the callback for each element in the collection.
	   *
	   * @param {Function} callback Function to execute for each element, invoked with `element` as argument.
	   * @param {Object} [thisArg] Value to use as `this` when executing `callback`.
	   * @return {Array} Collection with the return value of the executed callback for each element.
	   * @example
	   *     $('.items').map(function(element) {
	   *         return element.getAttribute('name')
	   *     });
	   *     // ['ever', 'green']
	   */

	  var map = ArrayProto.map;

	  /**
	   * Removes the last element from the collection, and returns that element.
	   *
	   * @return {Object} The last element from the collection.
	   * @example
	   *     var lastElement = $('.items').pop();
	   */

	  var pop = ArrayProto.pop;

	  /**
	   * Adds one or more elements to the end of the collection, and returns the new length of the collection.
	   *
	   * @param {Object} element Element(s) to add to the collection
	   * @return {Number} The new length of the collection
	   * @example
	   *     $('.items').push(element);
	   */

	  var push = ArrayProto.push;

	  /**
	   * Apply a function against each element in the collection, and this accumulator function has to reduce it
	   * to a single value.
	   *
	   * @param {Function} callback Function to execute on each value in the array, taking four arguments (see example).
	   * @param {Mixed} initialValue Object to use as the first argument to the first call of the callback.
	   * @example
	   *     $('.items').reduce(function(previousValue, element, index, collection) {
	   *         return previousValue + element.clientHeight;
	   *     }, 0);
	   *     // [total height of elements]
	   */

	  var reduce = ArrayProto.reduce;

	  /**
	   * Apply a function against each element in the collection (from right-to-left), and this accumulator function has
	   * to reduce it to a single value.
	   *
	   * @param {Function} callback Function to execute on each value in the array, taking four arguments (see example).
	   * @param {Mixed} initialValue Object to use as the first argument to the first call of the callback.
	   * @example
	   *     $('.items').reduceRight(function(previousValue, element, index, collection) {
	   *         return previousValue + element.textContent;
	   *     }, '')
	   *     // [reversed text of elements]
	   */

	  var reduceRight = ArrayProto.reduceRight;

	  /**
	   * Reverses an array in place. The first array element becomes the last and the last becomes the first.
	   *
	   * @return {Object} The wrapped collection, reversed
	   * @chainable
	   * @example
	   *     $('.items').reverse();
	   */

	  var reverse = function reverse() {
	    return $$2(toArray(this).reverse());
	  };

	  /**
	   * Removes the first element from the collection, and returns that element.
	   *
	   * @return {Object} The first element from the collection.
	   * @example
	   *     var firstElement = $('.items').shift();
	   */

	  var shift = ArrayProto.shift;

	  /**
	   * Checks if the given callback returns a true(-ish) value for any of the elements in the collection.
	   *
	   * @param {Function} callback Function to execute for each element, invoked with `element` as argument.
	   * @return {Boolean} Whether any element passed the callback check.
	   * @example
	   *     $('.items').some(function(element) {
	   *         return element.hasAttribute('active')
	   *     });
	   *     // true/false
	   */

	  var some = ArrayProto.some;

	  /**
	   * Adds one or more elements to the beginning of the collection, and returns the new length of the collection.
	   *
	   * @param {Object} element Element(s) to add to the collection
	   * @return {Number} The new length of the collection
	   * @example
	   *     $('.items').unshift(element);
	   */

	  var unshift = ArrayProto.unshift;

	  var array = Object.freeze({
	    every: every,
	    filter: filter,
	    forEach: forEach,
	    each: each$1,
	    indexOf: indexOf,
	    map: map,
	    pop: pop,
	    push: push,
	    reduce: reduce,
	    reduceRight: reduceRight,
	    reverse: reverse,
	    shift: shift,
	    some: some,
	    unshift: unshift
	  });

	  function _classCallCheck(instance, Constructor) {
	    if (!(instance instanceof Constructor)) {
	      throw new TypeError("Cannot call a class as a function");
	    }
	  }

	  function BaseClass(api) {

	    /**
	     * Provide subclass for classes or components to extend from.
	     * The opposite and successor of plugins (no need to extend `$.fn` anymore, complete control).
	     *
	     * @return {Class} The class to extend from, including all `$.fn` methods.
	     * @example
	     *     import { BaseClass } from  'domtastic';
	     *
	     *     class MyComponent extends BaseClass {
	     *         doSomething() {
	     *             return this.addClass('.foo');
	     *         }
	     *     }
	     *
	     *     let component = new MyComponent('body');
	     *     component.doSomething();
	     *
	     * @example
	     *     import $ from  'domtastic';
	     *
	     *     class MyComponent extends $.BaseClass {
	     *         progress(value) {
	     *             return this.attr('data-progress', value);
	     *         }
	     *     }
	     *
	     *     let component = new MyComponent(document.body);
	     *     component.progress('ive').append('<p>enhancement</p>');
	     */

	    var BaseClass = function BaseClass() {
	      _classCallCheck(this, BaseClass);

	      Wrapper.call(this, $$2.apply(undefined, arguments));
	    };

	    extend(BaseClass.prototype, api);
	    return BaseClass;
	  }

	  var isNumeric = function isNumeric(value) {
	    return !isNaN(parseFloat(value)) && isFinite(value);
	  };

	  var camelize = function camelize(value) {
	    return value.replace(/-([\da-z])/gi, function (matches, letter) {
	      return letter.toUpperCase();
	    });
	  };

	  var dasherize = function dasherize(value) {
	    return value.replace(/([a-z\d])([A-Z])/g, '$1-$2').toLowerCase();
	  };

	  /**
	   * Get the value of a style property for the first element, or set one or more style properties for each element in the collection.
	   *
	   * @param {String|Object} key The name of the style property to get or set. Or an object containing key-value pairs to set as style properties.
	   * @param {String} [value] The value of the style property to set.
	   * @return {Object} The wrapped collection
	   * @chainable
	   * @example
	   *     $('.item').css('padding-left'); // get
	   *     $('.item').css('color', '#f00'); // set
	   *     $('.item').css({'border-width': '1px', display: 'inline-block'}); // set multiple
	   */

	  var css = function css(key, value) {

	    var styleProps = void 0,
	        prop = void 0,
	        val = void 0;

	    if (typeof key === 'string') {
	      key = camelize(key);

	      if (typeof value === 'undefined') {
	        var element = this.nodeType ? this : this[0];
	        if (element) {
	          val = element.style[key];
	          return isNumeric(val) ? parseFloat(val) : val;
	        }
	        return undefined;
	      }

	      styleProps = {};
	      styleProps[key] = value;
	    } else {
	      styleProps = key;
	      for (prop in styleProps) {
	        val = styleProps[prop];
	        delete styleProps[prop];
	        styleProps[camelize(prop)] = val;
	      }
	    }

	    each(this, function (element) {
	      for (prop in styleProps) {
	        if (styleProps[prop] || styleProps[prop] === 0) {
	          element.style[prop] = styleProps[prop];
	        } else {
	          element.style.removeProperty(dasherize(prop));
	        }
	      }
	    });

	    return this;
	  };

	  var css$1 = Object.freeze({
	    css: css
	  });

	  var forEach$1 = Array.prototype.forEach;

	  /**
	   * Append element(s) to each element in the collection.
	   *
	   * @param {String|Node|NodeList|Object} element What to append to the element(s).
	   * Clones elements as necessary.
	   * @return {Object} The wrapped collection
	   * @chainable
	   * @example
	   *     $('.item').append('<p>more</p>');
	   */

	  var append = function append(element) {
	    if (this instanceof Node) {
	      if (typeof element === 'string') {
	        this.insertAdjacentHTML('beforeend', element);
	      } else {
	        if (element instanceof Node) {
	          this.appendChild(element);
	        } else {
	          var elements = element instanceof NodeList ? toArray(element) : element;
	          forEach$1.call(elements, this.appendChild.bind(this));
	        }
	      }
	    } else {
	      _each(this, append, element);
	    }
	    return this;
	  };

	  /**
	   * Place element(s) at the beginning of each element in the collection.
	   *
	   * @param {String|Node|NodeList|Object} element What to place at the beginning of the element(s).
	   * Clones elements as necessary.
	   * @return {Object} The wrapped collection
	   * @chainable
	   * @example
	   *     $('.item').prepend('<span>start</span>');
	   */

	  var prepend = function prepend(element) {
	    if (this instanceof Node) {
	      if (typeof element === 'string') {
	        this.insertAdjacentHTML('afterbegin', element);
	      } else {
	        if (element instanceof Node) {
	          this.insertBefore(element, this.firstChild);
	        } else {
	          var elements = element instanceof NodeList ? toArray(element) : element;
	          forEach$1.call(elements.reverse(), prepend.bind(this));
	        }
	      }
	    } else {
	      _each(this, prepend, element);
	    }
	    return this;
	  };

	  /**
	   * Place element(s) before each element in the collection.
	   *
	   * @param {String|Node|NodeList|Object} element What to place as sibling(s) before to the element(s).
	   * Clones elements as necessary.
	   * @return {Object} The wrapped collection
	   * @chainable
	   * @example
	   *     $('.items').before('<p>prefix</p>');
	   */

	  var before = function before(element) {
	    if (this instanceof Node) {
	      if (typeof element === 'string') {
	        this.insertAdjacentHTML('beforebegin', element);
	      } else {
	        if (element instanceof Node) {
	          this.parentNode.insertBefore(element, this);
	        } else {
	          var elements = element instanceof NodeList ? toArray(element) : element;
	          forEach$1.call(elements, before.bind(this));
	        }
	      }
	    } else {
	      _each(this, before, element);
	    }
	    return this;
	  };

	  /**
	   * Place element(s) after each element in the collection.
	   *
	   * @param {String|Node|NodeList|Object} element What to place as sibling(s) after to the element(s). Clones elements as necessary.
	   * @return {Object} The wrapped collection
	   * @chainable
	   * @example
	   *     $('.items').after('<span>suf</span><span>fix</span>');
	   */

	  var after = function after(element) {
	    if (this instanceof Node) {
	      if (typeof element === 'string') {
	        this.insertAdjacentHTML('afterend', element);
	      } else {
	        if (element instanceof Node) {
	          this.parentNode.insertBefore(element, this.nextSibling);
	        } else {
	          var elements = element instanceof NodeList ? toArray(element) : element;
	          forEach$1.call(elements.reverse(), after.bind(this));
	        }
	      }
	    } else {
	      _each(this, after, element);
	    }
	    return this;
	  };

	  /**
	   * Clone a wrapped object.
	   *
	   * @return {Object} Wrapped collection of cloned nodes.
	   * @example
	   *     $(element).clone();
	   */

	  var clone = function clone() {
	    return $$2(_clone(this));
	  };

	  /**
	   * Clone an object
	   *
	   * @param {String|Node|NodeList|Array} element The element(s) to clone.
	   * @return {String|Node|NodeList|Array} The cloned element(s)
	   * @private
	   */

	  var _clone = function _clone(element) {
	    if (typeof element === 'string') {
	      return element;
	    } else if (element instanceof Node) {
	      return element.cloneNode(true);
	    } else if ('length' in element) {
	      return [].map.call(element, function (el) {
	        return el.cloneNode(true);
	      });
	    }
	    return element;
	  };

	  /**
	   * Specialized iteration, applying `fn` in reversed manner to a clone of each element, but the provided one.
	   *
	   * @param {NodeList|Array} collection
	   * @param {Function} fn
	   * @param {Node} element
	   * @private
	   */

	  var _each = function _each(collection, fn, element) {
	    var l = collection.length;
	    while (l--) {
	      var elm = l === 0 ? element : _clone(element);
	      fn.call(collection[l], elm);
	    }
	  };

	  var dom = Object.freeze({
	    append: append,
	    prepend: prepend,
	    before: before,
	    after: after,
	    clone: clone,
	    _clone: _clone,
	    _each: _each
	  });

	  /**
	   * Get the value of an attribute for the first element, or set one or more attributes for each element in the collection.
	   *
	   * @param {String|Object} key The name of the attribute to get or set. Or an object containing key-value pairs to set as attributes.
	   * @param {String} [value] The value of the attribute to set.
	   * @return {Object} The wrapped collection
	   * @chainable
	   * @example
	   *     $('.item').attr('attrName'); // get
	   *     $('.item').attr('attrName', 'attrValue'); // set
	   *     $('.item').attr({attr1: 'value1', 'attr-2': 'value2'}); // set multiple
	   */

	  var attr = function attr(key, value) {

	    if (typeof key === 'string' && typeof value === 'undefined') {
	      var element = this.nodeType ? this : this[0];
	      return element ? element.getAttribute(key) : undefined;
	    }

	    return each(this, function (element) {
	      if ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
	        for (var _attr in key) {
	          element.setAttribute(_attr, key[_attr]);
	        }
	      } else {
	        element.setAttribute(key, value);
	      }
	    });
	  };

	  /**
	   * Remove attribute from each element in the collection.
	   *
	   * @param {String} key Attribute name
	   * @return {Object} The wrapped collection
	   * @chainable
	   * @example
	   *     $('.items').removeAttr('attrName');
	   */

	  var removeAttr = function removeAttr(key) {
	    return each(this, function (element) {
	      return element.removeAttribute(key);
	    });
	  };

	  var dom_attr = Object.freeze({
	    attr: attr,
	    removeAttr: removeAttr
	  });

	  /**
	   * Add a class to the element(s)
	   *
	   * @param {String} value Space-separated class name(s) to add to the element(s).
	   * @return {Object} The wrapped collection
	   * @chainable
	   * @example
	   *     $('.item').addClass('bar');
	   *     $('.item').addClass('bar foo');
	   */

	  var addClass = function addClass(value) {
	    if (value && value.length) {
	      each(value.split(' '), _each$1.bind(this, 'add'));
	    }
	    return this;
	  };

	  /**
	   * Remove a class from the element(s)
	   *
	   * @param {String} value Space-separated class name(s) to remove from the element(s).
	   * @return {Object} The wrapped collection
	   * @chainable
	   * @example
	   *     $('.items').removeClass('bar');
	   *     $('.items').removeClass('bar foo');
	   */

	  var removeClass = function removeClass(value) {
	    if (value && value.length) {
	      each(value.split(' '), _each$1.bind(this, 'remove'));
	    }
	    return this;
	  };

	  /**
	   * Toggle a class at the element(s)
	   *
	   * @param {String} value Space-separated class name(s) to toggle at the element(s).
	   * @return {Object} The wrapped collection
	   * @chainable
	   * @example
	   *     $('.item').toggleClass('bar');
	   *     $('.item').toggleClass('bar foo');
	   */

	  var toggleClass = function toggleClass(value) {
	    if (value && value.length) {
	      each(value.split(' '), _each$1.bind(this, 'toggle'));
	    }
	    return this;
	  };

	  /**
	   * Check if the element(s) have a class.
	   *
	   * @param {String} value Check if the DOM element contains the class name. When applied to multiple elements,
	   * returns `true` if _any_ of them contains the class name.
	   * @return {Boolean} Whether the element's class attribute contains the class name.
	   * @example
	   *     $('.item').hasClass('bar');
	   */

	  var hasClass = function hasClass(value) {
	    return (this.nodeType ? [this] : this).some(function (element) {
	      return element.classList.contains(value);
	    });
	  };

	  /**
	   * Specialized iteration, applying `fn` of the classList API to each element.
	   *
	   * @param {String} fnName
	   * @param {String} className
	   * @private
	   */

	  var _each$1 = function _each$1(fnName, className) {
	    return each(this, function (element) {
	      return element.classList[fnName](className);
	    });
	  };

	  var dom_class = Object.freeze({
	    addClass: addClass,
	    removeClass: removeClass,
	    toggleClass: toggleClass,
	    hasClass: hasClass
	  });

	  /**
	   * Append each element in the collection to the specified element(s).
	   *
	   * @param {Node|NodeList|Object} element What to append the element(s) to. Clones elements as necessary.
	   * @return {Object} The wrapped collection
	   * @chainable
	   * @example
	   *     $('.item').appendTo(container);
	   */

	  var appendTo = function appendTo(element) {
	    var context = typeof element === 'string' ? $$2(element) : element;
	    append.call(context, this);
	    return this;
	  };

	  /*
	   * Empty each element in the collection.
	   *
	   * @return {Object} The wrapped collection
	   * @chainable
	   * @example
	   *     $('.item').empty();
	   */

	  var empty = function empty() {
	    return each(this, function (element) {
	      return element.innerHTML = '';
	    });
	  };

	  /**
	   * Remove the collection from the DOM.
	   *
	   * @return {Array} Array containing the removed elements
	   * @example
	   *     $('.item').remove();
	   */

	  var remove = function remove() {
	    return each(this, function (element) {
	      if (element.parentNode) {
	        element.parentNode.removeChild(element);
	      }
	    });
	  };

	  /**
	   * Replace each element in the collection with the provided new content, and return the array of elements that were replaced.
	   *
	   * @return {Array} Array containing the replaced elements
	   */

	  var replaceWith = function replaceWith() {
	    return before.apply(this, arguments).remove();
	  };

	  /**
	   * Get the `textContent` from the first, or set the `textContent` of each element in the collection.
	   *
	   * @param {String} [value]
	   * @return {Object} The wrapped collection
	   * @chainable
	   * @example
	   *     $('.item').text('New content');
	   */

	  var text = function text(value) {

	    if (value === undefined) {
	      return this[0].textContent;
	    }

	    return each(this, function (element) {
	      return element.textContent = '' + value;
	    });
	  };

	  /**
	   * Get the `value` from the first, or set the `value` of each element in the collection.
	   *
	   * @param {String} [value]
	   * @return {Object} The wrapped collection
	   * @chainable
	   * @example
	   *     $('input.firstName').value('New value');
	   */

	  var val = function val(value) {

	    if (value === undefined) {
	      return this[0].value;
	    }

	    return each(this, function (element) {
	      return element.value = value;
	    });
	  };

	  var dom_extra = Object.freeze({
	    appendTo: appendTo,
	    empty: empty,
	    remove: remove,
	    replaceWith: replaceWith,
	    text: text,
	    val: val
	  });

	  /*
	   * Get the HTML contents of the first element, or set the HTML contents for each element in the collection.
	   *
	   * @param {String} [fragment] HTML fragment to set for the element. If this argument is omitted, the HTML contents are returned.
	   * @return {Object} The wrapped collection
	   * @chainable
	   * @example
	   *     $('.item').html();
	   *     $('.item').html('<span>more</span>');
	   */

	  var html = function html(fragment) {

	    if (typeof fragment !== 'string') {
	      var element = this.nodeType ? this : this[0];
	      return element ? element.innerHTML : undefined;
	    }

	    return each(this, function (element) {
	      return element.innerHTML = fragment;
	    });
	  };

	  var dom_html = Object.freeze({
	    html: html
	  });

	  /**
	   * Return the closest element matching the selector (starting by itself) for each element in the collection.
	   *
	   * @param {String} selector Filter
	   * @param {Object} [context] If provided, matching elements must be a descendant of this element
	   * @return {Object} New wrapped collection (containing zero or one element)
	   * @chainable
	   * @example
	   *     $('.selector').closest('.container');
	   */

	  var closest = function () {

	    var closest = function closest(selector, context) {
	      var nodes = [];
	      each(this, function (node) {
	        while (node && node !== context) {
	          if (matches(node, selector)) {
	            nodes.push(node);
	            break;
	          }
	          node = node.parentElement;
	        }
	      });
	      return $$2(uniq(nodes));
	    };

	    return typeof Element === 'undefined' || !Element.prototype.closest ? closest : function (selector, context) {
	      var _this = this;

	      if (!context) {
	        var _ret = function () {
	          var nodes = [];
	          each(_this, function (node) {
	            var n = node.closest(selector);
	            if (n) {
	              nodes.push(n);
	            }
	          });
	          return {
	            v: $$2(uniq(nodes))
	          };
	        }();

	        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
	      } else {
	        return closest.call(this, selector, context);
	      }
	    };
	  }();

	  var selector_closest = Object.freeze({
	    closest: closest
	  });

	  var _this3 = this;

	  /**
	   * Shorthand for `addEventListener`. Supports event delegation if a filter (`selector`) is provided.
	   *
	   * @param {String} eventNames List of space-separated event types to be added to the element(s)
	   * @param {String} [selector] Selector to filter descendants that delegate the event to this element.
	   * @param {Function} handler Event handler
	   * @param {Boolean} useCapture=false
	   * @return {Object} The wrapped collection
	   * @chainable
	   * @example
	   *     $('.item').on('click', callback);
	   *     $('.container').on('click focus', '.item', handler);
	   */

	  var on = function on(eventNames, selector, handler, useCapture, once) {
	    var _this = this;

	    if (typeof selector === 'function') {
	      handler = selector;
	      selector = null;
	    }

	    var parts = void 0,
	        namespace = void 0,
	        eventListener = void 0;

	    eventNames.split(' ').forEach(function (eventName) {

	      parts = eventName.split('.');
	      eventName = parts[0] || null;
	      namespace = parts[1] || null;

	      eventListener = proxyHandler(handler);

	      each(_this, function (element) {

	        if (selector) {
	          eventListener = delegateHandler.bind(element, selector, eventListener);
	        }

	        if (once) {
	          (function () {
	            var listener = eventListener;
	            eventListener = function eventListener(event) {
	              off.call(element, eventNames, selector, handler, useCapture);
	              listener.call(element, event);
	            };
	          })();
	        }

	        element.addEventListener(eventName, eventListener, useCapture || false);

	        getHandlers(element).push({
	          eventName: eventName,
	          handler: handler,
	          eventListener: eventListener,
	          selector: selector,
	          namespace: namespace
	        });
	      });
	    }, this);

	    return this;
	  };

	  /**
	   * Shorthand for `removeEventListener`.
	   *
	   * @param {String} eventNames List of space-separated event types to be removed from the element(s)
	   * @param {String} [selector] Selector to filter descendants that undelegate the event to this element.
	   * @param {Function} handler Event handler
	   * @param {Boolean} useCapture=false
	   * @return {Object} The wrapped collection
	   * @chainable
	   * @example
	   *     $('.item').off('click', callback);
	   *     $('#my-element').off('myEvent myOtherEvent');
	   *     $('.item').off();
	   */

	  var off = function off() {
	    var eventNames = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
	    var selector = arguments[1];

	    var _this2 = this;

	    var handler = arguments[2];
	    var useCapture = arguments[3];

	    if (typeof selector === 'function') {
	      handler = selector;
	      selector = null;
	    }

	    var parts = void 0,
	        namespace = void 0,
	        handlers = void 0;

	    eventNames.split(' ').forEach(function (eventName) {

	      parts = eventName.split('.');
	      eventName = parts[0] || null;
	      namespace = parts[1] || null;

	      return each(_this2, function (element) {

	        handlers = getHandlers(element);

	        each(handlers.filter(function (item) {
	          return (!eventName || item.eventName === eventName) && (!namespace || item.namespace === namespace) && (!handler || item.handler === handler) && (!selector || item.selector === selector);
	        }), function (item) {
	          element.removeEventListener(item.eventName, item.eventListener, useCapture || false);
	          handlers.splice(handlers.indexOf(item), 1);
	        });

	        if (!eventName && !namespace && !selector && !handler) {
	          clearHandlers(element);
	        } else if (handlers.length === 0) {
	          clearHandlers(element);
	        }
	      });
	    }, this);

	    return this;
	  };

	  /**
	   * Add event listener and execute the handler at most once per element.
	   *
	   * @param eventNames
	   * @param selector
	   * @param handler
	   * @param useCapture
	   * @return {Object} The wrapped collection
	   * @chainable
	   * @example
	   *     $('.item').one('click', callback);
	   */

	  var one = function one(eventNames, selector, handler, useCapture) {
	    return on.call(this, eventNames, selector, handler, useCapture, 1);
	  };

	  /**
	   * Get event handlers from an element
	   *
	   * @private
	   * @param {Node} element
	   * @return {Array}
	   */

	  var eventKeyProp = '__domtastic_event__';
	  var id = 1;
	  var handlers = {};
	  var unusedKeys = [];

	  var getHandlers = function getHandlers(element) {
	    if (!element[eventKeyProp]) {
	      element[eventKeyProp] = unusedKeys.length === 0 ? ++id : unusedKeys.pop();
	    }
	    var key = element[eventKeyProp];
	    return handlers[key] || (handlers[key] = []);
	  };

	  /**
	   * Clear event handlers for an element
	   *
	   * @private
	   * @param {Node} element
	   */

	  var clearHandlers = function clearHandlers(element) {
	    var key = element[eventKeyProp];
	    if (handlers[key]) {
	      handlers[key] = null;
	      element[eventKeyProp] = null;
	      unusedKeys.push(key);
	    }
	  };

	  /**
	   * Function to create a handler that augments the event object with some extra methods,
	   * and executes the callback with the event and the event data (i.e. `event.detail`).
	   *
	   * @private
	   * @param handler Callback to execute as `handler(event, data)`
	   * @return {Function}
	   */

	  var proxyHandler = function proxyHandler(handler) {
	    return function (event) {
	      return handler.call(this, augmentEvent(event), event.detail);
	    };
	  };

	  /**
	   * Attempt to augment events and implement something closer to DOM Level 3 Events.
	   *
	   * @private
	   * @param {Object} event
	   * @return {Function}
	   */

	  var augmentEvent = function () {

	    var methodName = void 0,
	        eventMethods = {
	      preventDefault: 'isDefaultPrevented',
	      stopImmediatePropagation: 'isImmediatePropagationStopped',
	      stopPropagation: 'isPropagationStopped'
	    },
	        returnTrue = function returnTrue() {
	      return true;
	    },
	        returnFalse = function returnFalse() {
	      return false;
	    };

	    return function (event) {
	      if (!event.isDefaultPrevented || event.stopImmediatePropagation || event.stopPropagation) {
	        for (methodName in eventMethods) {
	          (function (methodName, testMethodName, originalMethod) {
	            event[methodName] = function () {
	              this[testMethodName] = returnTrue;
	              return originalMethod && originalMethod.apply(this, arguments);
	            };
	            event[testMethodName] = returnFalse;
	          })(methodName, eventMethods[methodName], event[methodName]);
	        }
	        if (event._preventDefault) {
	          event.preventDefault();
	        }
	      }
	      return event;
	    };
	  }();

	  /**
	   * Function to test whether delegated events match the provided `selector` (filter),
	   * if the event propagation was stopped, and then actually call the provided event handler.
	   * Use `this` instead of `event.currentTarget` on the event object.
	   *
	   * @private
	   * @param {String} selector Selector to filter descendants that undelegate the event to this element.
	   * @param {Function} handler Event handler
	   * @param {Event} event
	   */

	  var delegateHandler = function delegateHandler(selector, handler, event) {
	    var eventTarget = event._target || event.target;
	    var currentTarget = closest.call([eventTarget], selector, _this3)[0];
	    if (currentTarget && currentTarget !== _this3) {
	      if (currentTarget === eventTarget || !(event.isPropagationStopped && event.isPropagationStopped())) {
	        handler.call(currentTarget, event);
	      }
	    }
	  };

	  var bind = on;
	  var unbind = off;

	  var event = Object.freeze({
	    on: on,
	    off: off,
	    one: one,
	    getHandlers: getHandlers,
	    clearHandlers: clearHandlers,
	    proxyHandler: proxyHandler,
	    delegateHandler: delegateHandler,
	    bind: bind,
	    unbind: unbind
	  });

	  /**
	   * Return children of each element in the collection, optionally filtered by a selector.
	   *
	   * @param {String} [selector] Filter
	   * @return {Object} New wrapped collection
	   * @chainable
	   * @example
	   *     $('.selector').children();
	   *     $('.selector').children('.filter');
	   */

	  var children = function children(selector) {
	    var nodes = [];
	    each(this, function (element) {
	      if (element.children) {
	        each(element.children, function (child) {
	          if (!selector || selector && matches(child, selector)) {
	            nodes.push(child);
	          }
	        });
	      }
	    });
	    return $$2(nodes);
	  };

	  /**
	   * Return child nodes of each element in the collection, including text and comment nodes.
	   *
	   * @return {Object} New wrapped collection
	   * @example
	   *     $('.selector').contents();
	   */

	  var contents = function contents() {
	    var nodes = [];
	    each(this, function (element) {
	      return nodes.push.apply(nodes, toArray(element.childNodes));
	    });
	    return $$2(nodes);
	  };

	  /**
	   * Return a collection containing only the one at the specified index.
	   *
	   * @param {Number} index
	   * @return {Object} New wrapped collection
	   * @chainable
	   * @example
	   *     $('.items').eq(1)
	   *     // The second item; result is the same as doing $($('.items')[1]);
	   */

	  var eq = function eq(index) {
	    return slice.call(this, index, index + 1);
	  };

	  /**
	   * Return the DOM element at the specified index.
	   *
	   * @param {Number} index
	   * @return {Node} Element at the specified index
	   * @example
	   *     $('.items').get(1)
	   *     // The second element; result is the same as doing $('.items')[1];
	   */

	  var get = function get(index) {
	    return this[index];
	  };

	  /**
	   * Return the parent elements of each element in the collection, optionally filtered by a selector.
	   *
	   * @param {String} [selector] Filter
	   * @return {Object} New wrapped collection
	   * @chainable
	   * @example
	   *     $('.selector').parent();
	   *     $('.selector').parent('.filter');
	   */

	  var parent = function parent(selector) {
	    var nodes = [];
	    each(this, function (element) {
	      if (!selector || selector && matches(element.parentNode, selector)) {
	        nodes.push(element.parentNode);
	      }
	    });
	    return $$2(nodes);
	  };

	  /**
	   * Return the sibling elements of each element in the collection, optionally filtered by a selector.
	   *
	   * @param {String} [selector] Filter
	   * @return {Object} New wrapped collection
	   * @chainable
	   * @example
	   *     $('.selector').siblings();
	   *     $('.selector').siblings('.filter');
	   */

	  var siblings = function siblings(selector) {
	    var nodes = [];
	    each(this, function (element) {
	      return each(element.parentNode.children, function (sibling) {
	        if (sibling !== element && (!selector || selector && matches(sibling, selector))) {
	          nodes.push(sibling);
	        }
	      });
	    });
	    return $$2(nodes);
	  };

	  /**
	   * Create a new, sliced collection.
	   *
	   * @param {Number} start
	   * @param {Number} end
	   * @return {Object} New wrapped collection
	   * @example
	   *     $('.items').slice(1, 3)
	   *     // New wrapped collection containing the second, third, and fourth element.
	   */

	  var slice = function slice(start, end) {
	    return $$2([].slice.apply(this, arguments));
	  };

	  var selector_extra = Object.freeze({
	    children: children,
	    contents: contents,
	    eq: eq,
	    get: get,
	    parent: parent,
	    siblings: siblings,
	    slice: slice
	  });

	  var api = {};
	  var $ = {};

	  if (typeof selector !== 'undefined') {
	    $ = $$2;
	    $.matches = matches;
	    api.find = find;
	  }

	  extend($);
	  extend(api, array, css$1, dom_attr, dom, dom_class, dom_extra, dom_html, event, selector_closest, selector_extra);

	  $.fn = api;

	  // Version

	  $.version = '0.12.1';

	  // Util

	  $.extend = extend;

	  // Provide base class to extend from

	  if (typeof BaseClass !== 'undefined') {
	    $.BaseClass = BaseClass($.fn);
	  }

	  // Export interface

	  var $$1 = $;

	  return $$1;
	});
	//# sourceMappingURL=domtastic.js.map

/***/ },
/* 6 */
/*!*******************************************!*\
  !*** ./src/client/js/bubble-generator.js ***!
  \*******************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//---------//
	// Imports //
	//---------//

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	var r = __webpack_require__(/*! ../../../lib/external/ramda.custom */ 7),
	    rUtils = __webpack_require__(/*! ../../../lib/r-utils */ 8),
	    utils = __webpack_require__(/*! ./utils */ 12);

	//------//
	// Init //
	//------//

	var getRandomIntBetween = utils.getRandomIntBetween,
	    betweenI = rUtils.betweenI,
	    betweenRange = rUtils.betweenRange,
	    staticCond = rUtils.staticCond,
	    mutableMerge = rUtils.mutableMerge,
	    state = {};

	//------//
	// Main //
	//------//

	var updateClientDimensions = function updateClientDimensions(_ref) {
	  var clientWidth = _ref.clientWidth,
	      clientHeight = _ref.clientHeight;

	  mutableMerge(state, { clientWidth: clientWidth, clientHeight: clientHeight });
	  updateBubbleDiameterRange();
	};

	var run = function run(_ref2) {
	  var clientWidth = _ref2.clientWidth,
	      clientHeight = _ref2.clientHeight,
	      clientWidthRange = _ref2.clientWidthRange,
	      fizzRateRange = _ref2.fizzRateRange,
	      fizzSpeedRange = _ref2.fizzSpeedRange,
	      onBubbleCreate = _ref2.onBubbleCreate,
	      scrollY = _ref2.scrollY;


	  initializeState({ clientWidth: clientWidth, clientHeight: clientHeight, clientWidthRange: clientWidthRange, scrollY: scrollY });

	  var getRandomDiameter = function getRandomDiameter() {
	    return r.apply(getRandomIntBetween, state.bubbleDiameterRange);
	  },
	      getRandomFizzSpeed = r.partial(getRandomIntBetween, fizzSpeedRange),
	      getRandomFizzRate = r.partial(getRandomIntBetween, fizzRateRange);

	  createInfiniteBubbles();

	  // scoped helper fxns

	  function createInfiniteBubbles() {
	    setTimeout(function () {
	      createBubble();
	      createInfiniteBubbles();
	    }, getRandomFizzRate());
	  }

	  function createBubble() {
	    var diameter = getRandomDiameter(),
	        y = state.scrollY + state.clientHeight + diameter,
	        radius = Math.round(diameter / 2)
	    // * 4 is just an arbitrary distance needed so the bubble disappearing
	    //   animation happens while off-screen.
	    ,
	        moveDuration = getRandomFizzSpeed() * (state.clientHeight + diameter * 4),
	        x = getRandomIntBetween(-radius, state.clientWidth + radius),
	        size = state.getSize(diameter);

	    onBubbleCreate({ x: x, y: y, moveDuration: moveDuration, diameter: diameter, size: size });
	  }
	};

	//-------------//
	// Helper Fxns //
	//-------------//

	function updateGetSize() {
	  var _state$bubbleDiameter = _slicedToArray(state.bubbleDiameterRange, 2),
	      diameterMin = _state$bubbleDiameter[0],
	      diameterMax = _state$bubbleDiameter[1],
	      diameterDifference = r.subtract(diameterMax, diameterMin),
	      aThird = Math.round(diameterDifference / 3);

	  state.getSize = staticCond([[betweenRange(diameterMin, diameterMin + aThird), 'small'], [betweenRange(diameterMin + aThird, diameterMax - aThird), 'medium'], [betweenI(diameterMax - aThird, diameterMax), 'large']]);
	}

	function updateBubbleDiameterRange() {
	  var _state$clientWidthRan = _slicedToArray(state.clientWidthRange, 2),
	      minWidth = _state$clientWidthRan[0],
	      maxWidth = _state$clientWidthRan[1];

	  state.bubbleDiameterRange = [getLinearSlope(15, 30, state.clientWidth), getLinearSlope(50, 70, state.clientWidth)];

	  updateGetSize();

	  // scoped helper fxns
	  function getLinearSlope(min, max) {
	    var slope = (max - min) / (maxWidth - minWidth),
	        yIntercept = max - maxWidth * slope,
	        res = Math.round(slope * state.clientWidth + yIntercept);

	    return r.clamp(min, max, res);
	  }
	}

	function initializeState(_ref3) {
	  var clientHeight = _ref3.clientHeight,
	      clientWidth = _ref3.clientWidth,
	      clientWidthRange = _ref3.clientWidthRange,
	      scrollY = _ref3.scrollY;

	  state.clientWidthRange = clientWidthRange;
	  state.scrollY = scrollY;
	  updateClientDimensions({ clientHeight: clientHeight, clientWidth: clientWidth });
	}

	function updateScrollY(scrollY) {
	  state.scrollY = scrollY;
	}

	//---------//
	// Exports //
	//---------//

	module.exports = {
	  run: run,
	  updateClientDimensions: updateClientDimensions,
	  updateScrollY: updateScrollY
	};

/***/ },
/* 7 */
/*!**************************************!*\
  !*** ./lib/external/ramda.custom.js ***!
  \**************************************/
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;'use strict';var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};;(function(){'use strict';/**
	     * A special placeholder value used to specify "gaps" within curried functions,
	     * allowing partial application of any combination of arguments, regardless of
	     * their positions.
	     *
	     * If `g` is a curried ternary function and `_` is `R.__`, the following are
	     * equivalent:
	     *
	     *   - `g(1, 2, 3)`
	     *   - `g(_, 2, 3)(1)`
	     *   - `g(_, _, 3)(1)(2)`
	     *   - `g(_, _, 3)(1, 2)`
	     *   - `g(_, 2, _)(1, 3)`
	     *   - `g(_, 2)(1)(3)`
	     *   - `g(_, 2)(1, 3)`
	     *   - `g(_, 2)(_, 3)(1)`
	     *
	     * @constant
	     * @memberOf R
	     * @since v0.6.0
	     * @category Function
	     * @example
	     *
	     *      var greet = R.replace('{name}', R.__, 'Hello, {name}!');
	     *      greet('Alice'); //=> 'Hello, Alice!'
	     */var __={'@@functional/placeholder':true};/* eslint-disable no-unused-vars */var _arity=function _arity(n,fn){/* eslint-disable no-unused-vars */switch(n){case 0:return function(){return fn.apply(this,arguments);};case 1:return function(a0){return fn.apply(this,arguments);};case 2:return function(a0,a1){return fn.apply(this,arguments);};case 3:return function(a0,a1,a2){return fn.apply(this,arguments);};case 4:return function(a0,a1,a2,a3){return fn.apply(this,arguments);};case 5:return function(a0,a1,a2,a3,a4){return fn.apply(this,arguments);};case 6:return function(a0,a1,a2,a3,a4,a5){return fn.apply(this,arguments);};case 7:return function(a0,a1,a2,a3,a4,a5,a6){return fn.apply(this,arguments);};case 8:return function(a0,a1,a2,a3,a4,a5,a6,a7){return fn.apply(this,arguments);};case 9:return function(a0,a1,a2,a3,a4,a5,a6,a7,a8){return fn.apply(this,arguments);};case 10:return function(a0,a1,a2,a3,a4,a5,a6,a7,a8,a9){return fn.apply(this,arguments);};default:throw new Error('First argument to _arity must be a non-negative integer no greater than ten');}};var _arrayFromIterator=function _arrayFromIterator(iter){var list=[];var next;while(!(next=iter.next()).done){list.push(next.value);}return list;};var _complement=function _complement(f){return function(){return!f.apply(this,arguments);};};/**
	     * Private `concat` function to merge two array-like objects.
	     *
	     * @private
	     * @param {Array|Arguments} [set1=[]] An array-like object.
	     * @param {Array|Arguments} [set2=[]] An array-like object.
	     * @return {Array} A new, merged array.
	     * @example
	     *
	     *      _concat([4, 5, 6], [1, 2, 3]); //=> [4, 5, 6, 1, 2, 3]
	     */var _concat=function _concat(set1,set2){set1=set1||[];set2=set2||[];var idx;var len1=set1.length;var len2=set2.length;var result=[];idx=0;while(idx<len1){result[result.length]=set1[idx];idx+=1;}idx=0;while(idx<len2){result[result.length]=set2[idx];idx+=1;}return result;};var _filter=function _filter(fn,list){var idx=0;var len=list.length;var result=[];while(idx<len){if(fn(list[idx])){result[result.length]=list[idx];}idx+=1;}return result;};// String(x => x) evaluates to "x => x", so the pattern may not match.
	var _functionName=function _functionName(f){// String(x => x) evaluates to "x => x", so the pattern may not match.
	var match=String(f).match(/^function (\w*)/);return match==null?'':match[1];};var _has=function _has(prop,obj){return Object.prototype.hasOwnProperty.call(obj,prop);};var _identity=function _identity(x){return x;};var _isArguments=function(){var toString=Object.prototype.toString;return toString.call(arguments)==='[object Arguments]'?function _isArguments(x){return toString.call(x)==='[object Arguments]';}:function _isArguments(x){return _has('callee',x);};}();/**
	     * Tests whether or not an object is an array.
	     *
	     * @private
	     * @param {*} val The object to test.
	     * @return {Boolean} `true` if `val` is an array, `false` otherwise.
	     * @example
	     *
	     *      _isArray([]); //=> true
	     *      _isArray(null); //=> false
	     *      _isArray({}); //=> false
	     */var _isArray=Array.isArray||function _isArray(val){return val!=null&&val.length>=0&&Object.prototype.toString.call(val)==='[object Array]';};var _isFunction=function _isFunction(x){return Object.prototype.toString.call(x)==='[object Function]';};var _isNumber=function _isNumber(x){return Object.prototype.toString.call(x)==='[object Number]';};var _isObject=function _isObject(x){return Object.prototype.toString.call(x)==='[object Object]';};var _isPlaceholder=function _isPlaceholder(a){return a!=null&&(typeof a==='undefined'?'undefined':_typeof(a))==='object'&&a['@@functional/placeholder']===true;};var _isString=function _isString(x){return Object.prototype.toString.call(x)==='[object String]';};var _isTransformer=function _isTransformer(obj){return typeof obj['@@transducer/step']==='function';};var _map=function _map(fn,functor){var idx=0;var len=functor.length;var result=Array(len);while(idx<len){result[idx]=fn(functor[idx]);idx+=1;}return result;};var _of=function _of(x){return[x];};var _pipe=function _pipe(f,g){return function(){return g.call(this,f.apply(this,arguments));};};// \b matches word boundary; [\b] matches backspace
	var _quote=function _quote(s){var escaped=s.replace(/\\/g,'\\\\').replace(/[\b]/g,'\\b')// \b matches word boundary; [\b] matches backspace
	.replace(/\f/g,'\\f').replace(/\n/g,'\\n').replace(/\r/g,'\\r').replace(/\t/g,'\\t').replace(/\v/g,'\\v').replace(/\0/g,'\\0');return'"'+escaped.replace(/"/g,'\\"')+'"';};var _reduced=function _reduced(x){return x&&x['@@transducer/reduced']?x:{'@@transducer/value':x,'@@transducer/reduced':true};};/**
	     * An optimized, private array `slice` implementation.
	     *
	     * @private
	     * @param {Arguments|Array} args The array or arguments object to consider.
	     * @param {Number} [from=0] The array index to slice from, inclusive.
	     * @param {Number} [to=args.length] The array index to slice to, exclusive.
	     * @return {Array} A new, sliced array.
	     * @example
	     *
	     *      _slice([1, 2, 3, 4, 5], 1, 3); //=> [2, 3]
	     *
	     *      var firstThreeArgs = function(a, b, c, d) {
	     *        return _slice(arguments, 0, 3);
	     *      };
	     *      firstThreeArgs(1, 2, 3, 4); //=> [1, 2, 3]
	     */var _slice=function _slice(args,from,to){switch(arguments.length){case 1:return _slice(args,0,args.length);case 2:return _slice(args,from,args.length);default:var list=[];var idx=0;var len=Math.max(0,Math.min(args.length,to)-from);while(idx<len){list[idx]=args[from+idx];idx+=1;}return list;}};/**
	     * Polyfill from <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString>.
	     */var _toISOString=function(){var pad=function pad(n){return(n<10?'0':'')+n;};return typeof Date.prototype.toISOString==='function'?function _toISOString(d){return d.toISOString();}:function _toISOString(d){return d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate())+'T'+pad(d.getUTCHours())+':'+pad(d.getUTCMinutes())+':'+pad(d.getUTCSeconds())+'.'+(d.getUTCMilliseconds()/1000).toFixed(3).slice(2,5)+'Z';};}();var _xfBase={init:function init(){return this.xf['@@transducer/init']();},result:function result(_result){return this.xf['@@transducer/result'](_result);}};var _xwrap=function(){function XWrap(fn){this.f=fn;}XWrap.prototype['@@transducer/init']=function(){throw new Error('init not implemented on XWrap');};XWrap.prototype['@@transducer/result']=function(acc){return acc;};XWrap.prototype['@@transducer/step']=function(acc,x){return this.f(acc,x);};return function _xwrap(fn){return new XWrap(fn);};}();/**
	     * Similar to hasMethod, this checks whether a function has a [methodname]
	     * function. If it isn't an array it will execute that function otherwise it
	     * will default to the ramda implementation.
	     *
	     * @private
	     * @param {Function} fn ramda implemtation
	     * @param {String} methodname property to check for a custom implementation
	     * @return {Object} Whatever the return value of the method is.
	     */var _checkForMethod=function _checkForMethod(methodname,fn){return function(){var length=arguments.length;if(length===0){return fn();}var obj=arguments[length-1];return _isArray(obj)||typeof obj[methodname]!=='function'?fn.apply(this,arguments):obj[methodname].apply(obj,_slice(arguments,0,length-1));};};/**
	     * Optimized internal one-arity curry function.
	     *
	     * @private
	     * @category Function
	     * @param {Function} fn The function to curry.
	     * @return {Function} The curried function.
	     */var _curry1=function _curry1(fn){return function f1(a){if(arguments.length===0||_isPlaceholder(a)){return f1;}else{return fn.apply(this,arguments);}};};/**
	     * Optimized internal two-arity curry function.
	     *
	     * @private
	     * @category Function
	     * @param {Function} fn The function to curry.
	     * @return {Function} The curried function.
	     */var _curry2=function _curry2(fn){return function f2(a,b){switch(arguments.length){case 0:return f2;case 1:return _isPlaceholder(a)?f2:_curry1(function(_b){return fn(a,_b);});default:return _isPlaceholder(a)&&_isPlaceholder(b)?f2:_isPlaceholder(a)?_curry1(function(_a){return fn(_a,b);}):_isPlaceholder(b)?_curry1(function(_b){return fn(a,_b);}):fn(a,b);}};};/**
	     * Optimized internal three-arity curry function.
	     *
	     * @private
	     * @category Function
	     * @param {Function} fn The function to curry.
	     * @return {Function} The curried function.
	     */var _curry3=function _curry3(fn){return function f3(a,b,c){switch(arguments.length){case 0:return f3;case 1:return _isPlaceholder(a)?f3:_curry2(function(_b,_c){return fn(a,_b,_c);});case 2:return _isPlaceholder(a)&&_isPlaceholder(b)?f3:_isPlaceholder(a)?_curry2(function(_a,_c){return fn(_a,b,_c);}):_isPlaceholder(b)?_curry2(function(_b,_c){return fn(a,_b,_c);}):_curry1(function(_c){return fn(a,b,_c);});default:return _isPlaceholder(a)&&_isPlaceholder(b)&&_isPlaceholder(c)?f3:_isPlaceholder(a)&&_isPlaceholder(b)?_curry2(function(_a,_b){return fn(_a,_b,c);}):_isPlaceholder(a)&&_isPlaceholder(c)?_curry2(function(_a,_c){return fn(_a,b,_c);}):_isPlaceholder(b)&&_isPlaceholder(c)?_curry2(function(_b,_c){return fn(a,_b,_c);}):_isPlaceholder(a)?_curry1(function(_a){return fn(_a,b,c);}):_isPlaceholder(b)?_curry1(function(_b){return fn(a,_b,c);}):_isPlaceholder(c)?_curry1(function(_c){return fn(a,b,_c);}):fn(a,b,c);}};};/**
	     * Internal curryN function.
	     *
	     * @private
	     * @category Function
	     * @param {Number} length The arity of the curried function.
	     * @param {Array} received An array of arguments received thus far.
	     * @param {Function} fn The function to curry.
	     * @return {Function} The curried function.
	     */var _curryN=function _curryN(length,received,fn){return function(){var combined=[];var argsIdx=0;var left=length;var combinedIdx=0;while(combinedIdx<received.length||argsIdx<arguments.length){var result;if(combinedIdx<received.length&&(!_isPlaceholder(received[combinedIdx])||argsIdx>=arguments.length)){result=received[combinedIdx];}else{result=arguments[argsIdx];argsIdx+=1;}combined[combinedIdx]=result;if(!_isPlaceholder(result)){left-=1;}combinedIdx+=1;}return left<=0?fn.apply(this,combined):_arity(left,_curryN(length,combined,fn));};};/**
	     * Returns a function that dispatches with different strategies based on the
	     * object in list position (last argument). If it is an array, executes [fn].
	     * Otherwise, if it has a function with [methodname], it will execute that
	     * function (functor case). Otherwise, if it is a transformer, uses transducer
	     * [xf] to return a new transformer (transducer case). Otherwise, it will
	     * default to executing [fn].
	     *
	     * @private
	     * @param {String} methodname property to check for a custom implementation
	     * @param {Function} xf transducer to initialize if object is transformer
	     * @param {Function} fn default ramda implementation
	     * @return {Function} A function that dispatches on object in list position
	     */var _dispatchable=function _dispatchable(methodname,xf,fn){return function(){var length=arguments.length;if(length===0){return fn();}var obj=arguments[length-1];if(!_isArray(obj)){var args=_slice(arguments,0,length-1);if(typeof obj[methodname]==='function'){return obj[methodname].apply(obj,args);}if(_isTransformer(obj)){var transducer=xf.apply(null,args);return transducer(obj);}}return fn.apply(this,arguments);};};var _xany=function(){function XAny(f,xf){this.xf=xf;this.f=f;this.any=false;}XAny.prototype['@@transducer/init']=_xfBase.init;XAny.prototype['@@transducer/result']=function(result){if(!this.any){result=this.xf['@@transducer/step'](result,false);}return this.xf['@@transducer/result'](result);};XAny.prototype['@@transducer/step']=function(result,input){if(this.f(input)){this.any=true;result=_reduced(this.xf['@@transducer/step'](result,true));}return result;};return _curry2(function _xany(f,xf){return new XAny(f,xf);});}();var _xdrop=function(){function XDrop(n,xf){this.xf=xf;this.n=n;}XDrop.prototype['@@transducer/init']=_xfBase.init;XDrop.prototype['@@transducer/result']=_xfBase.result;XDrop.prototype['@@transducer/step']=function(result,input){if(this.n>0){this.n-=1;return result;}return this.xf['@@transducer/step'](result,input);};return _curry2(function _xdrop(n,xf){return new XDrop(n,xf);});}();var _xfilter=function(){function XFilter(f,xf){this.xf=xf;this.f=f;}XFilter.prototype['@@transducer/init']=_xfBase.init;XFilter.prototype['@@transducer/result']=_xfBase.result;XFilter.prototype['@@transducer/step']=function(result,input){return this.f(input)?this.xf['@@transducer/step'](result,input):result;};return _curry2(function _xfilter(f,xf){return new XFilter(f,xf);});}();var _xfind=function(){function XFind(f,xf){this.xf=xf;this.f=f;this.found=false;}XFind.prototype['@@transducer/init']=_xfBase.init;XFind.prototype['@@transducer/result']=function(result){if(!this.found){result=this.xf['@@transducer/step'](result,void 0);}return this.xf['@@transducer/result'](result);};XFind.prototype['@@transducer/step']=function(result,input){if(this.f(input)){this.found=true;result=_reduced(this.xf['@@transducer/step'](result,input));}return result;};return _curry2(function _xfind(f,xf){return new XFind(f,xf);});}();var _xmap=function(){function XMap(f,xf){this.xf=xf;this.f=f;}XMap.prototype['@@transducer/init']=_xfBase.init;XMap.prototype['@@transducer/result']=_xfBase.result;XMap.prototype['@@transducer/step']=function(result,input){return this.xf['@@transducer/step'](result,this.f(input));};return _curry2(function _xmap(f,xf){return new XMap(f,xf);});}();var _xtakeWhile=function(){function XTakeWhile(f,xf){this.xf=xf;this.f=f;}XTakeWhile.prototype['@@transducer/init']=_xfBase.init;XTakeWhile.prototype['@@transducer/result']=_xfBase.result;XTakeWhile.prototype['@@transducer/step']=function(result,input){return this.f(input)?this.xf['@@transducer/step'](result,input):_reduced(result);};return _curry2(function _xtakeWhile(f,xf){return new XTakeWhile(f,xf);});}();/**
	     * Adds two values.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Math
	     * @sig Number -> Number -> Number
	     * @param {Number} a
	     * @param {Number} b
	     * @return {Number}
	     * @see R.subtract
	     * @example
	     *
	     *      R.add(2, 3);       //=>  5
	     *      R.add(7)(10);      //=> 17
	     */var add=_curry2(function add(a,b){return Number(a)+Number(b);});/**
	     * Returns a function that always returns the given value. Note that for
	     * non-primitives the value returned is a reference to the original value.
	     *
	     * This function is known as `const`, `constant`, or `K` (for K combinator) in
	     * other languages and libraries.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Function
	     * @sig a -> (* -> a)
	     * @param {*} val The value to wrap in a function
	     * @return {Function} A Function :: * -> val.
	     * @example
	     *
	     *      var t = R.always('Tee');
	     *      t(); //=> 'Tee'
	     */var always=_curry1(function always(val){return function(){return val;};});/**
	     * Returns `true` if both arguments are `true`; `false` otherwise.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Logic
	     * @sig * -> * -> *
	     * @param {Boolean} a A boolean value
	     * @param {Boolean} b A boolean value
	     * @return {Boolean} `true` if both arguments are `true`, `false` otherwise
	     * @see R.both
	     * @example
	     *
	     *      R.and(true, true); //=> true
	     *      R.and(true, false); //=> false
	     *      R.and(false, true); //=> false
	     *      R.and(false, false); //=> false
	     */var and=_curry2(function and(a,b){return a&&b;});/**
	     * Returns `true` if at least one of elements of the list match the predicate,
	     * `false` otherwise.
	     *
	     * Dispatches to the `any` method of the second argument, if present.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig (a -> Boolean) -> [a] -> Boolean
	     * @param {Function} fn The predicate function.
	     * @param {Array} list The array to consider.
	     * @return {Boolean} `true` if the predicate is satisfied by at least one element, `false`
	     *         otherwise.
	     * @see R.all, R.none, R.transduce
	     * @example
	     *
	     *      var lessThan0 = R.flip(R.lt)(0);
	     *      var lessThan2 = R.flip(R.lt)(2);
	     *      R.any(lessThan0)([1, 2]); //=> false
	     *      R.any(lessThan2)([1, 2]); //=> true
	     */var any=_curry2(_dispatchable('any',_xany,function any(fn,list){var idx=0;while(idx<list.length){if(fn(list[idx])){return true;}idx+=1;}return false;}));/**
	     * Applies function `fn` to the argument list `args`. This is useful for
	     * creating a fixed-arity function from a variadic function. `fn` should be a
	     * bound function if context is significant.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.7.0
	     * @category Function
	     * @sig (*... -> a) -> [*] -> a
	     * @param {Function} fn
	     * @param {Array} args
	     * @return {*}
	     * @see R.call, R.unapply
	     * @example
	     *
	     *      var nums = [1, 2, 3, -99, 42, 6, 7];
	     *      R.apply(Math.max, nums); //=> 42
	     * @symb R.apply(f, [a, b, c]) = f(a, b, c)
	     */var apply=_curry2(function apply(fn,args){return fn.apply(this,args);});/**
	     * Makes a shallow clone of an object, setting or overriding the specified
	     * property with the given value. Note that this copies and flattens prototype
	     * properties onto the new object as well. All non-primitive properties are
	     * copied by reference.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.8.0
	     * @category Object
	     * @sig String -> a -> {k: v} -> {k: v}
	     * @param {String} prop the property name to set
	     * @param {*} val the new value
	     * @param {Object} obj the object to clone
	     * @return {Object} a new object similar to the original except for the specified property.
	     * @see R.dissoc
	     * @example
	     *
	     *      R.assoc('c', 3, {a: 1, b: 2}); //=> {a: 1, b: 2, c: 3}
	     */var assoc=_curry3(function assoc(prop,val,obj){var result={};for(var p in obj){result[p]=obj[p];}result[prop]=val;return result;});/**
	     * Creates a function that is bound to a context.
	     * Note: `R.bind` does not provide the additional argument-binding capabilities of
	     * [Function.prototype.bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
	     *
	     * @func
	     * @memberOf R
	     * @since v0.6.0
	     * @category Function
	     * @category Object
	     * @sig (* -> *) -> {*} -> (* -> *)
	     * @param {Function} fn The function to bind to context
	     * @param {Object} thisObj The context to bind `fn` to
	     * @return {Function} A function that will execute in the context of `thisObj`.
	     * @see R.partial
	     * @example
	     *
	     *      var log = R.bind(console.log, console);
	     *      R.pipe(R.assoc('a', 2), R.tap(log), R.assoc('a', 3))({a: 1}); //=> {a: 3}
	     *      // logs {a: 2}
	     * @symb R.bind(f, o)(a, b) = f.call(o, a, b)
	     */var bind=_curry2(function bind(fn,thisObj){return _arity(fn.length,function(){return fn.apply(thisObj,arguments);});});/**
	     * Restricts a number to be within a range.
	     *
	     * Also works for other ordered types such as Strings and Dates.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.20.0
	     * @category Relation
	     * @sig Ord a => a -> a -> a -> a
	     * @param {Number} minimum number
	     * @param {Number} maximum number
	     * @param {Number} value to be clamped
	     * @return {Number} Returns the clamped value
	     * @example
	     *
	     *      R.clamp(1, 10, -1) // => 1
	     *      R.clamp(1, 10, 11) // => 10
	     *      R.clamp(1, 10, 4)  // => 4
	     */var clamp=_curry3(function clamp(min,max,value){if(min>max){throw new Error('min must not be greater than max in clamp(min, max, value)');}return value<min?min:value>max?max:value;});/**
	     * Returns a curried equivalent of the provided function, with the specified
	     * arity. The curried function has two unusual capabilities. First, its
	     * arguments needn't be provided one at a time. If `g` is `R.curryN(3, f)`, the
	     * following are equivalent:
	     *
	     *   - `g(1)(2)(3)`
	     *   - `g(1)(2, 3)`
	     *   - `g(1, 2)(3)`
	     *   - `g(1, 2, 3)`
	     *
	     * Secondly, the special placeholder value `R.__` may be used to specify
	     * "gaps", allowing partial application of any combination of arguments,
	     * regardless of their positions. If `g` is as above and `_` is `R.__`, the
	     * following are equivalent:
	     *
	     *   - `g(1, 2, 3)`
	     *   - `g(_, 2, 3)(1)`
	     *   - `g(_, _, 3)(1)(2)`
	     *   - `g(_, _, 3)(1, 2)`
	     *   - `g(_, 2)(1)(3)`
	     *   - `g(_, 2)(1, 3)`
	     *   - `g(_, 2)(_, 3)(1)`
	     *
	     * @func
	     * @memberOf R
	     * @since v0.5.0
	     * @category Function
	     * @sig Number -> (* -> a) -> (* -> a)
	     * @param {Number} length The arity for the returned function.
	     * @param {Function} fn The function to curry.
	     * @return {Function} A new, curried function.
	     * @see R.curry
	     * @example
	     *
	     *      var sumArgs = (...args) => R.sum(args);
	     *
	     *      var curriedAddFourNumbers = R.curryN(4, sumArgs);
	     *      var f = curriedAddFourNumbers(1, 2);
	     *      var g = f(3);
	     *      g(4); //=> 10
	     */var curryN=_curry2(function curryN(length,fn){if(length===1){return _curry1(fn);}return _arity(length,_curryN(length,[],fn));});/**
	     * Returns the first element of the list which matches the predicate, or
	     * `undefined` if no element matches.
	     *
	     * Dispatches to the `find` method of the second argument, if present.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig (a -> Boolean) -> [a] -> a | undefined
	     * @param {Function} fn The predicate function used to determine if the element is the
	     *        desired one.
	     * @param {Array} list The array to consider.
	     * @return {Object} The element found, or `undefined`.
	     * @see R.transduce
	     * @example
	     *
	     *      var xs = [{a: 1}, {a: 2}, {a: 3}];
	     *      R.find(R.propEq('a', 2))(xs); //=> {a: 2}
	     *      R.find(R.propEq('a', 4))(xs); //=> undefined
	     */var find=_curry2(_dispatchable('find',_xfind,function find(fn,list){var idx=0;var len=list.length;while(idx<len){if(fn(list[idx])){return list[idx];}idx+=1;}}));/**
	     * Iterate over an input `list`, calling a provided function `fn` for each
	     * element in the list.
	     *
	     * `fn` receives one argument: *(value)*.
	     *
	     * Note: `R.forEach` does not skip deleted or unassigned indices (sparse
	     * arrays), unlike the native `Array.prototype.forEach` method. For more
	     * details on this behavior, see:
	     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach#Description
	     *
	     * Also note that, unlike `Array.prototype.forEach`, Ramda's `forEach` returns
	     * the original array. In some libraries this function is named `each`.
	     *
	     * Dispatches to the `forEach` method of the second argument, if present.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.1
	     * @category List
	     * @sig (a -> *) -> [a] -> [a]
	     * @param {Function} fn The function to invoke. Receives one argument, `value`.
	     * @param {Array} list The list to iterate over.
	     * @return {Array} The original list.
	     * @see R.addIndex
	     * @example
	     *
	     *      var printXPlusFive = x => console.log(x + 5);
	     *      R.forEach(printXPlusFive, [1, 2, 3]); //=> [1, 2, 3]
	     *      // logs 6
	     *      // logs 7
	     *      // logs 8
	     * @symb R.forEach(f, [a, b, c]) = [a, b, c]
	     */var forEach=_curry2(_checkForMethod('forEach',function forEach(fn,list){var len=list.length;var idx=0;while(idx<len){fn(list[idx]);idx+=1;}return list;}));/**
	     * Creates a new object from a list key-value pairs. If a key appears in
	     * multiple pairs, the rightmost pair is included in the object.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.3.0
	     * @category List
	     * @sig [[k,v]] -> {k: v}
	     * @param {Array} pairs An array of two-element arrays that will be the keys and values of the output object.
	     * @return {Object} The object made by pairing up `keys` and `values`.
	     * @see R.toPairs, R.pair
	     * @example
	     *
	     *      R.fromPairs([['a', 1], ['b', 2], ['c', 3]]); //=> {a: 1, b: 2, c: 3}
	     */var fromPairs=_curry1(function fromPairs(pairs){var result={};var idx=0;while(idx<pairs.length){result[pairs[idx][0]]=pairs[idx][1];idx+=1;}return result;});/**
	     * Returns `true` if the first argument is greater than or equal to the second;
	     * `false` otherwise.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Relation
	     * @sig Ord a => a -> a -> Boolean
	     * @param {Number} a
	     * @param {Number} b
	     * @return {Boolean}
	     * @see R.lte
	     * @example
	     *
	     *      R.gte(2, 1); //=> true
	     *      R.gte(2, 2); //=> true
	     *      R.gte(2, 3); //=> false
	     *      R.gte('a', 'z'); //=> false
	     *      R.gte('z', 'a'); //=> true
	     */var gte=_curry2(function gte(a,b){return a>=b;});/**
	     * Returns whether or not an object has an own property with the specified name
	     *
	     * @func
	     * @memberOf R
	     * @since v0.7.0
	     * @category Object
	     * @sig s -> {s: x} -> Boolean
	     * @param {String} prop The name of the property to check for.
	     * @param {Object} obj The object to query.
	     * @return {Boolean} Whether the property exists.
	     * @example
	     *
	     *      var hasName = R.has('name');
	     *      hasName({name: 'alice'});   //=> true
	     *      hasName({name: 'bob'});     //=> true
	     *      hasName({});                //=> false
	     *
	     *      var point = {x: 0, y: 0};
	     *      var pointHas = R.has(R.__, point);
	     *      pointHas('x');  //=> true
	     *      pointHas('y');  //=> true
	     *      pointHas('z');  //=> false
	     */var has=_curry2(_has);/**
	     * Returns true if its arguments are identical, false otherwise. Values are
	     * identical if they reference the same memory. `NaN` is identical to `NaN`;
	     * `0` and `-0` are not identical.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.15.0
	     * @category Relation
	     * @sig a -> a -> Boolean
	     * @param {*} a
	     * @param {*} b
	     * @return {Boolean}
	     * @example
	     *
	     *      var o = {};
	     *      R.identical(o, o); //=> true
	     *      R.identical(1, 1); //=> true
	     *      R.identical(1, '1'); //=> false
	     *      R.identical([], []); //=> false
	     *      R.identical(0, -0); //=> false
	     *      R.identical(NaN, NaN); //=> true
	     */// SameValue algorithm
	// Steps 1-5, 7-10
	// Steps 6.b-6.e: +0 != -0
	// Step 6.a: NaN == NaN
	var identical=_curry2(function identical(a,b){// SameValue algorithm
	if(a===b){// Steps 1-5, 7-10
	// Steps 6.b-6.e: +0 != -0
	return a!==0||1/a===1/b;}else{// Step 6.a: NaN == NaN
	return a!==a&&b!==b;}});/**
	     * A function that does nothing but return the parameter supplied to it. Good
	     * as a default or placeholder function.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Function
	     * @sig a -> a
	     * @param {*} x The value to return.
	     * @return {*} The input value, `x`.
	     * @example
	     *
	     *      R.identity(1); //=> 1
	     *
	     *      var obj = {};
	     *      R.identity(obj) === obj; //=> true
	     * @symb R.identity(a) = a
	     */var identity=_curry1(_identity);/**
	     * Tests whether or not an object is similar to an array.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.5.0
	     * @category Type
	     * @category List
	     * @sig * -> Boolean
	     * @param {*} x The object to test.
	     * @return {Boolean} `true` if `x` has a numeric length property and extreme indices defined; `false` otherwise.
	     * @deprecated since v0.23.0
	     * @example
	     *
	     *      R.isArrayLike([]); //=> true
	     *      R.isArrayLike(true); //=> false
	     *      R.isArrayLike({}); //=> false
	     *      R.isArrayLike({length: 10}); //=> false
	     *      R.isArrayLike({0: 'zero', 9: 'nine', length: 10}); //=> true
	     */var isArrayLike=_curry1(function isArrayLike(x){if(_isArray(x)){return true;}if(!x){return false;}if((typeof x==='undefined'?'undefined':_typeof(x))!=='object'){return false;}if(_isString(x)){return false;}if(x.nodeType===1){return!!x.length;}if(x.length===0){return true;}if(x.length>0){return x.hasOwnProperty(0)&&x.hasOwnProperty(x.length-1);}return false;});/**
	     * Returns a list containing the names of all the enumerable own properties of
	     * the supplied object.
	     * Note that the order of the output array is not guaranteed to be consistent
	     * across different JS platforms.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Object
	     * @sig {k: v} -> [k]
	     * @param {Object} obj The object to extract properties from
	     * @return {Array} An array of the object's own properties.
	     * @example
	     *
	     *      R.keys({a: 1, b: 2, c: 3}); //=> ['a', 'b', 'c']
	     */// cover IE < 9 keys issues
	// Safari bug
	var keys=function(){// cover IE < 9 keys issues
	var hasEnumBug=!{toString:null}.propertyIsEnumerable('toString');var nonEnumerableProps=['constructor','valueOf','isPrototypeOf','toString','propertyIsEnumerable','hasOwnProperty','toLocaleString'];// Safari bug
	var hasArgsEnumBug=function(){'use strict';return arguments.propertyIsEnumerable('length');}();var contains=function contains(list,item){var idx=0;while(idx<list.length){if(list[idx]===item){return true;}idx+=1;}return false;};return typeof Object.keys==='function'&&!hasArgsEnumBug?_curry1(function keys(obj){return Object(obj)!==obj?[]:Object.keys(obj);}):_curry1(function keys(obj){if(Object(obj)!==obj){return[];}var prop,nIdx;var ks=[];var checkArgsLength=hasArgsEnumBug&&_isArguments(obj);for(prop in obj){if(_has(prop,obj)&&(!checkArgsLength||prop!=='length')){ks[ks.length]=prop;}}if(hasEnumBug){nIdx=nonEnumerableProps.length-1;while(nIdx>=0){prop=nonEnumerableProps[nIdx];if(_has(prop,obj)&&!contains(ks,prop)){ks[ks.length]=prop;}nIdx-=1;}}return ks;});}();/**
	     * Returns the number of elements in the array by returning `list.length`.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.3.0
	     * @category List
	     * @sig [a] -> Number
	     * @param {Array} list The array to inspect.
	     * @return {Number} The length of the array.
	     * @example
	     *
	     *      R.length([]); //=> 0
	     *      R.length([1, 2, 3]); //=> 3
	     */var length=_curry1(function length(list){return list!=null&&_isNumber(list.length)?list.length:NaN;});/**
	     * Returns `true` if the first argument is less than the second; `false`
	     * otherwise.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Relation
	     * @sig Ord a => a -> a -> Boolean
	     * @param {*} a
	     * @param {*} b
	     * @return {Boolean}
	     * @see R.gt
	     * @example
	     *
	     *      R.lt(2, 1); //=> false
	     *      R.lt(2, 2); //=> false
	     *      R.lt(2, 3); //=> true
	     *      R.lt('a', 'z'); //=> true
	     *      R.lt('z', 'a'); //=> false
	     */var lt=_curry2(function lt(a,b){return a<b;});/**
	     * Returns `true` if the first argument is less than or equal to the second;
	     * `false` otherwise.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Relation
	     * @sig Ord a => a -> a -> Boolean
	     * @param {Number} a
	     * @param {Number} b
	     * @return {Boolean}
	     * @see R.gte
	     * @example
	     *
	     *      R.lte(2, 1); //=> false
	     *      R.lte(2, 2); //=> true
	     *      R.lte(2, 3); //=> true
	     *      R.lte('a', 'z'); //=> true
	     *      R.lte('z', 'a'); //=> false
	     */var lte=_curry2(function lte(a,b){return a<=b;});/**
	     * Returns the larger of its two arguments.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Relation
	     * @sig Ord a => a -> a -> a
	     * @param {*} a
	     * @param {*} b
	     * @return {*}
	     * @see R.maxBy, R.min
	     * @example
	     *
	     *      R.max(789, 123); //=> 789
	     *      R.max('a', 'b'); //=> 'b'
	     */var max=_curry2(function max(a,b){return b>a?b:a;});/**
	     * Takes a function and two values, and returns whichever value produces the
	     * smaller result when passed to the provided function.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.8.0
	     * @category Relation
	     * @sig Ord b => (a -> b) -> a -> a -> a
	     * @param {Function} f
	     * @param {*} a
	     * @param {*} b
	     * @return {*}
	     * @see R.min, R.maxBy
	     * @example
	     *
	     *      //  square :: Number -> Number
	     *      var square = n => n * n;
	     *
	     *      R.minBy(square, -3, 2); //=> 2
	     *
	     *      R.reduce(R.minBy(square), Infinity, [3, -5, 4, 1, -2]); //=> 1
	     *      R.reduce(R.minBy(square), Infinity, []); //=> Infinity
	     */var minBy=_curry3(function minBy(f,a,b){return f(b)<f(a)?b:a;});/**
	     * Negates its argument.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.9.0
	     * @category Math
	     * @sig Number -> Number
	     * @param {Number} n
	     * @return {Number}
	     * @example
	     *
	     *      R.negate(42); //=> -42
	     */var negate=_curry1(function negate(n){return-n;});/**
	     * A function that returns the `!` of its argument. It will return `true` when
	     * passed false-y value, and `false` when passed a truth-y one.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Logic
	     * @sig * -> Boolean
	     * @param {*} a any value
	     * @return {Boolean} the logical inverse of passed argument.
	     * @see R.complement
	     * @example
	     *
	     *      R.not(true); //=> false
	     *      R.not(false); //=> true
	     *      R.not(0); //=> true
	     *      R.not(1); //=> false
	     */var not=_curry1(function not(a){return!a;});/**
	     * Returns the nth element of the given list or string. If n is negative the
	     * element at index length + n is returned.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig Number -> [a] -> a | Undefined
	     * @sig Number -> String -> String
	     * @param {Number} offset
	     * @param {*} list
	     * @return {*}
	     * @example
	     *
	     *      var list = ['foo', 'bar', 'baz', 'quux'];
	     *      R.nth(1, list); //=> 'bar'
	     *      R.nth(-1, list); //=> 'quux'
	     *      R.nth(-99, list); //=> undefined
	     *
	     *      R.nth(2, 'abc'); //=> 'c'
	     *      R.nth(3, 'abc'); //=> ''
	     * @symb R.nth(-1, [a, b, c]) = c
	     * @symb R.nth(0, [a, b, c]) = a
	     * @symb R.nth(1, [a, b, c]) = b
	     */var nth=_curry2(function nth(offset,list){var idx=offset<0?list.length+offset:offset;return _isString(list)?list.charAt(idx):list[idx];});/**
	     * Returns a function which returns its nth argument.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.9.0
	     * @category Function
	     * @sig Number -> *... -> *
	     * @param {Number} n
	     * @return {Function}
	     * @example
	     *
	     *      R.nthArg(1)('a', 'b', 'c'); //=> 'b'
	     *      R.nthArg(-1)('a', 'b', 'c'); //=> 'c'
	     * @symb R.nthArg(-1)(a, b, c) = c
	     * @symb R.nthArg(0)(a, b, c) = a
	     * @symb R.nthArg(1)(a, b, c) = b
	     */var nthArg=_curry1(function nthArg(n){var arity=n<0?1:n+1;return curryN(arity,function(){return nth(n,arguments);});});/**
	     * Returns a singleton array containing the value provided.
	     *
	     * Note this `of` is different from the ES6 `of`; See
	     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/of
	     *
	     * @func
	     * @memberOf R
	     * @since v0.3.0
	     * @category Function
	     * @sig a -> [a]
	     * @param {*} x any value
	     * @return {Array} An array wrapping `x`.
	     * @example
	     *
	     *      R.of(null); //=> [null]
	     *      R.of([42]); //=> [[42]]
	     */var of=_curry1(_of);/**
	     * Retrieve the value at a given path.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.2.0
	     * @category Object
	     * @sig [String] -> {k: v} -> v | Undefined
	     * @param {Array} path The path to use.
	     * @param {Object} obj The object to retrieve the nested property from.
	     * @return {*} The data at `path`.
	     * @see R.prop
	     * @example
	     *
	     *      R.path(['a', 'b'], {a: {b: 2}}); //=> 2
	     *      R.path(['a', 'b'], {c: {b: 2}}); //=> undefined
	     */var path=_curry2(function path(paths,obj){var val=obj;var idx=0;while(idx<paths.length){if(val==null){return;}val=val[paths[idx]];idx+=1;}return val;});/**
	     * Returns a partial copy of an object containing only the keys specified. If
	     * the key does not exist, the property is ignored.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Object
	     * @sig [k] -> {k: v} -> {k: v}
	     * @param {Array} names an array of String property names to copy onto a new object
	     * @param {Object} obj The object to copy from
	     * @return {Object} A new object with only properties from `names` on it.
	     * @see R.omit, R.props
	     * @example
	     *
	     *      R.pick(['a', 'd'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1, d: 4}
	     *      R.pick(['a', 'e', 'f'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1}
	     */var pick=_curry2(function pick(names,obj){var result={};var idx=0;while(idx<names.length){if(names[idx]in obj){result[names[idx]]=obj[names[idx]];}idx+=1;}return result;});/**
	     * Returns a partial copy of an object containing only the keys that satisfy
	     * the supplied predicate.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.8.0
	     * @category Object
	     * @sig (v, k -> Boolean) -> {k: v} -> {k: v}
	     * @param {Function} pred A predicate to determine whether or not a key
	     *        should be included on the output object.
	     * @param {Object} obj The object to copy from
	     * @return {Object} A new object with only properties that satisfy `pred`
	     *         on it.
	     * @see R.pick, R.filter
	     * @example
	     *
	     *      var isUpperCase = (val, key) => key.toUpperCase() === key;
	     *      R.pickBy(isUpperCase, {a: 1, b: 2, A: 3, B: 4}); //=> {A: 3, B: 4}
	     */var pickBy=_curry2(function pickBy(test,obj){var result={};for(var prop in obj){if(test(obj[prop],prop,obj)){result[prop]=obj[prop];}}return result;});/**
	     * Returns a function that when supplied an object returns the indicated
	     * property of that object, if it exists.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Object
	     * @sig s -> {s: a} -> a | Undefined
	     * @param {String} p The property name
	     * @param {Object} obj The object to query
	     * @return {*} The value at `obj.p`.
	     * @see R.path
	     * @example
	     *
	     *      R.prop('x', {x: 100}); //=> 100
	     *      R.prop('x', {}); //=> undefined
	     */var prop=_curry2(function prop(p,obj){return obj[p];});/**
	     * If the given, non-null object has an own property with the specified name,
	     * returns the value of that property. Otherwise returns the provided default
	     * value.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.6.0
	     * @category Object
	     * @sig a -> String -> Object -> a
	     * @param {*} val The default value.
	     * @param {String} p The name of the property to return.
	     * @param {Object} obj The object to query.
	     * @return {*} The value of given property of the supplied object or the default value.
	     * @example
	     *
	     *      var alice = {
	     *        name: 'ALICE',
	     *        age: 101
	     *      };
	     *      var favorite = R.prop('favoriteLibrary');
	     *      var favoriteWithDefault = R.propOr('Ramda', 'favoriteLibrary');
	     *
	     *      favorite(alice);  //=> undefined
	     *      favoriteWithDefault(alice);  //=> 'Ramda'
	     */var propOr=_curry3(function propOr(val,p,obj){return obj!=null&&_has(p,obj)?obj[p]:val;});/**
	     * Returns a list of numbers from `from` (inclusive) to `to` (exclusive).
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig Number -> Number -> [Number]
	     * @param {Number} from The first number in the list.
	     * @param {Number} to One more than the last number in the list.
	     * @return {Array} The list of numbers in tthe set `[a, b)`.
	     * @example
	     *
	     *      R.range(1, 5);    //=> [1, 2, 3, 4]
	     *      R.range(50, 53);  //=> [50, 51, 52]
	     */var range=_curry2(function range(from,to){if(!(_isNumber(from)&&_isNumber(to))){throw new TypeError('Both arguments to range must be numbers');}var result=[];var n=from;while(n<to){result.push(n);n+=1;}return result;});/**
	     * Returns a new list or string with the elements or characters in reverse
	     * order.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig [a] -> [a]
	     * @sig String -> String
	     * @param {Array|String} list
	     * @return {Array|String}
	     * @example
	     *
	     *      R.reverse([1, 2, 3]);  //=> [3, 2, 1]
	     *      R.reverse([1, 2]);     //=> [2, 1]
	     *      R.reverse([1]);        //=> [1]
	     *      R.reverse([]);         //=> []
	     *
	     *      R.reverse('abc');      //=> 'cba'
	     *      R.reverse('ab');       //=> 'ba'
	     *      R.reverse('a');        //=> 'a'
	     *      R.reverse('');         //=> ''
	     */var reverse=_curry1(function reverse(list){return _isString(list)?list.split('').reverse().join(''):_slice(list).reverse();});/**
	     * Returns the elements of the given list or string (or object with a `slice`
	     * method) from `fromIndex` (inclusive) to `toIndex` (exclusive).
	     *
	     * Dispatches to the `slice` method of the third argument, if present.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.4
	     * @category List
	     * @sig Number -> Number -> [a] -> [a]
	     * @sig Number -> Number -> String -> String
	     * @param {Number} fromIndex The start index (inclusive).
	     * @param {Number} toIndex The end index (exclusive).
	     * @param {*} list
	     * @return {*}
	     * @example
	     *
	     *      R.slice(1, 3, ['a', 'b', 'c', 'd']);        //=> ['b', 'c']
	     *      R.slice(1, Infinity, ['a', 'b', 'c', 'd']); //=> ['b', 'c', 'd']
	     *      R.slice(0, -1, ['a', 'b', 'c', 'd']);       //=> ['a', 'b', 'c']
	     *      R.slice(-3, -1, ['a', 'b', 'c', 'd']);      //=> ['b', 'c']
	     *      R.slice(0, 3, 'ramda');                     //=> 'ram'
	     */var slice=_curry3(_checkForMethod('slice',function slice(fromIndex,toIndex,list){return Array.prototype.slice.call(list,fromIndex,toIndex);}));/**
	     * Splits a collection into slices of the specified length.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.16.0
	     * @category List
	     * @sig Number -> [a] -> [[a]]
	     * @sig Number -> String -> [String]
	     * @param {Number} n
	     * @param {Array} list
	     * @return {Array}
	     * @example
	     *
	     *      R.splitEvery(3, [1, 2, 3, 4, 5, 6, 7]); //=> [[1, 2, 3], [4, 5, 6], [7]]
	     *      R.splitEvery(3, 'foobarbaz'); //=> ['foo', 'bar', 'baz']
	     */var splitEvery=_curry2(function splitEvery(n,list){if(n<=0){throw new Error('First argument to splitEvery must be a positive integer');}var result=[];var idx=0;while(idx<list.length){result.push(slice(idx,idx+=n,list));}return result;});/**
	     * Subtracts its second argument from its first argument.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Math
	     * @sig Number -> Number -> Number
	     * @param {Number} a The first value.
	     * @param {Number} b The second value.
	     * @return {Number} The result of `a - b`.
	     * @see R.add
	     * @example
	     *
	     *      R.subtract(10, 8); //=> 2
	     *
	     *      var minus5 = R.subtract(R.__, 5);
	     *      minus5(17); //=> 12
	     *
	     *      var complementaryAngle = R.subtract(90);
	     *      complementaryAngle(30); //=> 60
	     *      complementaryAngle(72); //=> 18
	     */var subtract=_curry2(function subtract(a,b){return Number(a)-Number(b);});/**
	     * Returns all but the first element of the given list or string (or object
	     * with a `tail` method).
	     *
	     * Dispatches to the `slice` method of the first argument, if present.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig [a] -> [a]
	     * @sig String -> String
	     * @param {*} list
	     * @return {*}
	     * @see R.head, R.init, R.last
	     * @example
	     *
	     *      R.tail([1, 2, 3]);  //=> [2, 3]
	     *      R.tail([1, 2]);     //=> [2]
	     *      R.tail([1]);        //=> []
	     *      R.tail([]);         //=> []
	     *
	     *      R.tail('abc');  //=> 'bc'
	     *      R.tail('ab');   //=> 'b'
	     *      R.tail('a');    //=> ''
	     *      R.tail('');     //=> ''
	     */var tail=_checkForMethod('tail',slice(1,Infinity));/**
	     * Returns a new list containing the first `n` elements of a given list,
	     * passing each value to the supplied predicate function, and terminating when
	     * the predicate function returns `false`. Excludes the element that caused the
	     * predicate function to fail. The predicate function is passed one argument:
	     * *(value)*.
	     *
	     * Dispatches to the `takeWhile` method of the second argument, if present.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig (a -> Boolean) -> [a] -> [a]
	     * @param {Function} fn The function called per iteration.
	     * @param {Array} list The collection to iterate over.
	     * @return {Array} A new array.
	     * @see R.dropWhile, R.transduce, R.addIndex
	     * @example
	     *
	     *      var isNotFour = x => x !== 4;
	     *
	     *      R.takeWhile(isNotFour, [1, 2, 3, 4, 3, 2, 1]); //=> [1, 2, 3]
	     */var takeWhile=_curry2(_dispatchable('takeWhile',_xtakeWhile,function takeWhile(fn,list){var idx=0;var len=list.length;while(idx<len&&fn(list[idx])){idx+=1;}return _slice(list,0,idx);}));/**
	     * Calls an input function `n` times, returning an array containing the results
	     * of those function calls.
	     *
	     * `fn` is passed one argument: The current value of `n`, which begins at `0`
	     * and is gradually incremented to `n - 1`.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.2.3
	     * @category List
	     * @sig (Number -> a) -> Number -> [a]
	     * @param {Function} fn The function to invoke. Passed one argument, the current value of `n`.
	     * @param {Number} n A value between `0` and `n - 1`. Increments after each function call.
	     * @return {Array} An array containing the return values of all calls to `fn`.
	     * @example
	     *
	     *      R.times(R.identity, 5); //=> [0, 1, 2, 3, 4]
	     * @symb R.times(f, 0) = []
	     * @symb R.times(f, 1) = [f(0)]
	     * @symb R.times(f, 2) = [f(0), f(1)]
	     */var times=_curry2(function times(fn,n){var len=Number(n);var idx=0;var list;if(len<0||isNaN(len)){throw new RangeError('n must be a non-negative number');}list=new Array(len);while(idx<len){list[idx]=fn(idx);idx+=1;}return list;});/**
	     * Converts an object into an array of key, value arrays. Only the object's
	     * own properties are used.
	     * Note that the order of the output array is not guaranteed to be consistent
	     * across different JS platforms.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.4.0
	     * @category Object
	     * @sig {String: *} -> [[String,*]]
	     * @param {Object} obj The object to extract from
	     * @return {Array} An array of key, value arrays from the object's own properties.
	     * @see R.fromPairs
	     * @example
	     *
	     *      R.toPairs({a: 1, b: 2, c: 3}); //=> [['a', 1], ['b', 2], ['c', 3]]
	     */var toPairs=_curry1(function toPairs(obj){var pairs=[];for(var prop in obj){if(_has(prop,obj)){pairs[pairs.length]=[prop,obj[prop]];}}return pairs;});/**
	     * Removes (strips) whitespace from both ends of the string.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.6.0
	     * @category String
	     * @sig String -> String
	     * @param {String} str The string to trim.
	     * @return {String} Trimmed version of `str`.
	     * @example
	     *
	     *      R.trim('   xyz  '); //=> 'xyz'
	     *      R.map(R.trim, R.split(',', 'x, y, z')); //=> ['x', 'y', 'z']
	     */var trim=function(){var ws='\t\n\x0B\f\r \xA0\u1680\u180E\u2000\u2001\u2002\u2003'+'\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028'+'\u2029\uFEFF';var zeroWidth='\u200B';var hasProtoTrim=typeof String.prototype.trim==='function';if(!hasProtoTrim||ws.trim()||!zeroWidth.trim()){return _curry1(function trim(str){var beginRx=new RegExp('^['+ws+']['+ws+']*');var endRx=new RegExp('['+ws+']['+ws+']*$');return str.replace(beginRx,'').replace(endRx,'');});}else{return _curry1(function trim(str){return str.trim();});}}();/**
	     * Gives a single-word string description of the (native) type of a value,
	     * returning such answers as 'Object', 'Number', 'Array', or 'Null'. Does not
	     * attempt to distinguish user Object types any further, reporting them all as
	     * 'Object'.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.8.0
	     * @category Type
	     * @sig (* -> {*}) -> String
	     * @param {*} val The value to test
	     * @return {String}
	     * @example
	     *
	     *      R.type({}); //=> "Object"
	     *      R.type(1); //=> "Number"
	     *      R.type(false); //=> "Boolean"
	     *      R.type('s'); //=> "String"
	     *      R.type(null); //=> "Null"
	     *      R.type([]); //=> "Array"
	     *      R.type(/[A-z]/); //=> "RegExp"
	     */var type=_curry1(function type(val){return val===null?'Null':val===undefined?'Undefined':Object.prototype.toString.call(val).slice(8,-1);});/**
	     * Tests the final argument by passing it to the given predicate function. If
	     * the predicate is not satisfied, the function will return the result of
	     * calling the `whenFalseFn` function with the same argument. If the predicate
	     * is satisfied, the argument is returned as is.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.18.0
	     * @category Logic
	     * @sig (a -> Boolean) -> (a -> a) -> a -> a
	     * @param {Function} pred        A predicate function
	     * @param {Function} whenFalseFn A function to invoke when the `pred` evaluates
	     *                               to a falsy value.
	     * @param {*}        x           An object to test with the `pred` function and
	     *                               pass to `whenFalseFn` if necessary.
	     * @return {*} Either `x` or the result of applying `x` to `whenFalseFn`.
	     * @see R.ifElse, R.when
	     * @example
	     *
	     *      // coerceArray :: (a|[a]) -> [a]
	     *      var coerceArray = R.unless(R.isArrayLike, R.of);
	     *      coerceArray([1, 2, 3]); //=> [1, 2, 3]
	     *      coerceArray(1);         //=> [1]
	     */var unless=_curry3(function unless(pred,whenFalseFn,x){return pred(x)?x:whenFalseFn(x);});/**
	     * Returns a list of all the enumerable own properties of the supplied object.
	     * Note that the order of the output array is not guaranteed across different
	     * JS platforms.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Object
	     * @sig {k: v} -> [v]
	     * @param {Object} obj The object to extract values from
	     * @return {Array} An array of the values of the object's own properties.
	     * @example
	     *
	     *      R.values({a: 1, b: 2, c: 3}); //=> [1, 2, 3]
	     */var values=_curry1(function values(obj){var props=keys(obj);var len=props.length;var vals=[];var idx=0;while(idx<len){vals[idx]=obj[props[idx]];idx+=1;}return vals;});var _createPartialApplicator=function _createPartialApplicator(concat){return _curry2(function(fn,args){return _arity(Math.max(0,fn.length-args.length),function(){return fn.apply(this,concat(args,arguments));});});};// Values of other types are only equal if identical.
	var _equals=function _equals(a,b,stackA,stackB){if(identical(a,b)){return true;}if(type(a)!==type(b)){return false;}if(a==null||b==null){return false;}if(typeof a.equals==='function'||typeof b.equals==='function'){return typeof a.equals==='function'&&a.equals(b)&&typeof b.equals==='function'&&b.equals(a);}switch(type(a)){case'Arguments':case'Array':case'Object':if(typeof a.constructor==='function'&&_functionName(a.constructor)==='Promise'){return a===b;}break;case'Boolean':case'Number':case'String':if(!((typeof a==='undefined'?'undefined':_typeof(a))===(typeof b==='undefined'?'undefined':_typeof(b))&&identical(a.valueOf(),b.valueOf()))){return false;}break;case'Date':if(!identical(a.valueOf(),b.valueOf())){return false;}break;case'Error':return a.name===b.name&&a.message===b.message;case'RegExp':if(!(a.source===b.source&&a.global===b.global&&a.ignoreCase===b.ignoreCase&&a.multiline===b.multiline&&a.sticky===b.sticky&&a.unicode===b.unicode)){return false;}break;case'Map':case'Set':if(!_equals(_arrayFromIterator(a.entries()),_arrayFromIterator(b.entries()),stackA,stackB)){return false;}break;case'Int8Array':case'Uint8Array':case'Uint8ClampedArray':case'Int16Array':case'Uint16Array':case'Int32Array':case'Uint32Array':case'Float32Array':case'Float64Array':break;case'ArrayBuffer':break;default:// Values of other types are only equal if identical.
	return false;}var keysA=keys(a);if(keysA.length!==keys(b).length){return false;}var idx=stackA.length-1;while(idx>=0){if(stackA[idx]===a){return stackB[idx]===b;}idx-=1;}stackA.push(a);stackB.push(b);idx=keysA.length-1;while(idx>=0){var key=keysA[idx];if(!(_has(key,b)&&_equals(b[key],a[key],stackA,stackB))){return false;}idx-=1;}stackA.pop();stackB.pop();return true;};/**
	     * `_makeFlat` is a helper function that returns a one-level or fully recursive
	     * function based on the flag passed in.
	     *
	     * @private
	     */var _makeFlat=function _makeFlat(recursive){return function flatt(list){var value,jlen,j;var result=[];var idx=0;var ilen=list.length;while(idx<ilen){if(isArrayLike(list[idx])){value=recursive?flatt(list[idx]):list[idx];j=0;jlen=value.length;while(j<jlen){result[result.length]=value[j];j+=1;}}else{result[result.length]=list[idx];}idx+=1;}return result;};};var _reduce=function(){function _arrayReduce(xf,acc,list){var idx=0;var len=list.length;while(idx<len){acc=xf['@@transducer/step'](acc,list[idx]);if(acc&&acc['@@transducer/reduced']){acc=acc['@@transducer/value'];break;}idx+=1;}return xf['@@transducer/result'](acc);}function _iterableReduce(xf,acc,iter){var step=iter.next();while(!step.done){acc=xf['@@transducer/step'](acc,step.value);if(acc&&acc['@@transducer/reduced']){acc=acc['@@transducer/value'];break;}step=iter.next();}return xf['@@transducer/result'](acc);}function _methodReduce(xf,acc,obj){return xf['@@transducer/result'](obj.reduce(bind(xf['@@transducer/step'],xf),acc));}var symIterator=typeof Symbol!=='undefined'?Symbol.iterator:'@@iterator';return function _reduce(fn,acc,list){if(typeof fn==='function'){fn=_xwrap(fn);}if(isArrayLike(list)){return _arrayReduce(fn,acc,list);}if(typeof list.reduce==='function'){return _methodReduce(fn,acc,list);}if(list[symIterator]!=null){return _iterableReduce(fn,acc,list[symIterator]());}if(typeof list.next==='function'){return _iterableReduce(fn,acc,list);}throw new TypeError('reduce: list must be array or iterable');};}();/**
	     * Creates a new list iteration function from an existing one by adding two new
	     * parameters to its callback function: the current index, and the entire list.
	     *
	     * This would turn, for instance, Ramda's simple `map` function into one that
	     * more closely resembles `Array.prototype.map`. Note that this will only work
	     * for functions in which the iteration callback function is the first
	     * parameter, and where the list is the last parameter. (This latter might be
	     * unimportant if the list parameter is not used.)
	     *
	     * @func
	     * @memberOf R
	     * @since v0.15.0
	     * @category Function
	     * @category List
	     * @sig ((a ... -> b) ... -> [a] -> *) -> (a ..., Int, [a] -> b) ... -> [a] -> *)
	     * @param {Function} fn A list iteration function that does not pass index or list to its callback
	     * @return {Function} An altered list iteration function that passes (item, index, list) to its callback
	     * @example
	     *
	     *      var mapIndexed = R.addIndex(R.map);
	     *      mapIndexed((val, idx) => idx + '-' + val, ['f', 'o', 'o', 'b', 'a', 'r']);
	     *      //=> ['0-f', '1-o', '2-o', '3-b', '4-a', '5-r']
	     */var addIndex=_curry1(function addIndex(fn){return curryN(fn.length,function(){var idx=0;var origFn=arguments[0];var list=arguments[arguments.length-1];var args=_slice(arguments);args[0]=function(){var result=origFn.apply(this,_concat(arguments,[idx,list]));idx+=1;return result;};return fn.apply(this,args);});});/**
	     * Returns a curried equivalent of the provided function. The curried function
	     * has two unusual capabilities. First, its arguments needn't be provided one
	     * at a time. If `f` is a ternary function and `g` is `R.curry(f)`, the
	     * following are equivalent:
	     *
	     *   - `g(1)(2)(3)`
	     *   - `g(1)(2, 3)`
	     *   - `g(1, 2)(3)`
	     *   - `g(1, 2, 3)`
	     *
	     * Secondly, the special placeholder value `R.__` may be used to specify
	     * "gaps", allowing partial application of any combination of arguments,
	     * regardless of their positions. If `g` is as above and `_` is `R.__`, the
	     * following are equivalent:
	     *
	     *   - `g(1, 2, 3)`
	     *   - `g(_, 2, 3)(1)`
	     *   - `g(_, _, 3)(1)(2)`
	     *   - `g(_, _, 3)(1, 2)`
	     *   - `g(_, 2)(1)(3)`
	     *   - `g(_, 2)(1, 3)`
	     *   - `g(_, 2)(_, 3)(1)`
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Function
	     * @sig (* -> a) -> (* -> a)
	     * @param {Function} fn The function to curry.
	     * @return {Function} A new, curried function.
	     * @see R.curryN
	     * @example
	     *
	     *      var addFourNumbers = (a, b, c, d) => a + b + c + d;
	     *
	     *      var curriedAddFourNumbers = R.curry(addFourNumbers);
	     *      var f = curriedAddFourNumbers(1, 2);
	     *      var g = f(3);
	     *      g(4); //=> 10
	     */var curry=_curry1(function curry(fn){return curryN(fn.length,fn);});/**
	     * Returns all but the first `n` elements of the given list, string, or
	     * transducer/transformer (or object with a `drop` method).
	     *
	     * Dispatches to the `drop` method of the second argument, if present.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig Number -> [a] -> [a]
	     * @sig Number -> String -> String
	     * @param {Number} n
	     * @param {*} list
	     * @return {*}
	     * @see R.take, R.transduce
	     * @example
	     *
	     *      R.drop(1, ['foo', 'bar', 'baz']); //=> ['bar', 'baz']
	     *      R.drop(2, ['foo', 'bar', 'baz']); //=> ['baz']
	     *      R.drop(3, ['foo', 'bar', 'baz']); //=> []
	     *      R.drop(4, ['foo', 'bar', 'baz']); //=> []
	     *      R.drop(3, 'ramda');               //=> 'da'
	     */var drop=_curry2(_dispatchable('drop',_xdrop,function drop(n,xs){return slice(Math.max(0,n),Infinity,xs);}));/**
	     * Returns `true` if its arguments are equivalent, `false` otherwise. Handles
	     * cyclical data structures.
	     *
	     * Dispatches symmetrically to the `equals` methods of both arguments, if
	     * present.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.15.0
	     * @category Relation
	     * @sig a -> b -> Boolean
	     * @param {*} a
	     * @param {*} b
	     * @return {Boolean}
	     * @example
	     *
	     *      R.equals(1, 1); //=> true
	     *      R.equals(1, '1'); //=> false
	     *      R.equals([1, 2, 3], [1, 2, 3]); //=> true
	     *
	     *      var a = {}; a.v = a;
	     *      var b = {}; b.v = b;
	     *      R.equals(a, b); //=> true
	     */var equals=_curry2(function equals(a,b){return _equals(a,b,[],[]);});/**
	     * Takes a predicate and a "filterable", and returns a new filterable of the
	     * same type containing the members of the given filterable which satisfy the
	     * given predicate.
	     *
	     * Dispatches to the `filter` method of the second argument, if present.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig Filterable f => (a -> Boolean) -> f a -> f a
	     * @param {Function} pred
	     * @param {Array} filterable
	     * @return {Array}
	     * @see R.reject, R.transduce, R.addIndex
	     * @example
	     *
	     *      var isEven = n => n % 2 === 0;
	     *
	     *      R.filter(isEven, [1, 2, 3, 4]); //=> [2, 4]
	     *
	     *      R.filter(isEven, {a: 1, b: 2, c: 3, d: 4}); //=> {b: 2, d: 4}
	     */// else
	var filter=_curry2(_dispatchable('filter',_xfilter,function(pred,filterable){return _isObject(filterable)?_reduce(function(acc,key){if(pred(filterable[key])){acc[key]=filterable[key];}return acc;},{},keys(filterable)):// else
	_filter(pred,filterable);}));/**
	     * Returns a new list by pulling every item out of it (and all its sub-arrays)
	     * and putting them in a new array, depth-first.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig [a] -> [b]
	     * @param {Array} list The array to consider.
	     * @return {Array} The flattened list.
	     * @see R.unnest
	     * @example
	     *
	     *      R.flatten([1, 2, [3, 4], 5, [6, [7, 8, [9, [10, 11], 12]]]]);
	     *      //=> [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
	     */var flatten=_curry1(_makeFlat(true));/**
	     * Returns a new function much like the supplied one, except that the first two
	     * arguments' order is reversed.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Function
	     * @sig (a -> b -> c -> ... -> z) -> (b -> a -> c -> ... -> z)
	     * @param {Function} fn The function to invoke with its first two parameters reversed.
	     * @return {*} The result of invoking `fn` with its first two parameters' order reversed.
	     * @example
	     *
	     *      var mergeThree = (a, b, c) => [].concat(a, b, c);
	     *
	     *      mergeThree(1, 2, 3); //=> [1, 2, 3]
	     *
	     *      R.flip(mergeThree)(1, 2, 3); //=> [2, 1, 3]
	     * @symb R.flip(f)(a, b, c) = f(b, a, c)
	     */var flip=_curry1(function flip(fn){return curry(function(a,b){var args=_slice(arguments);args[0]=b;args[1]=a;return fn.apply(this,args);});});/**
	     * Returns the first element of the given list or string. In some libraries
	     * this function is named `first`.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig [a] -> a | Undefined
	     * @sig String -> String
	     * @param {Array|String} list
	     * @return {*}
	     * @see R.tail, R.init, R.last
	     * @example
	     *
	     *      R.head(['fi', 'fo', 'fum']); //=> 'fi'
	     *      R.head([]); //=> undefined
	     *
	     *      R.head('abc'); //=> 'a'
	     *      R.head(''); //=> ''
	     */var head=nth(0);/**
	     * Returns the last element of the given list or string.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.4
	     * @category List
	     * @sig [a] -> a | Undefined
	     * @sig String -> String
	     * @param {*} list
	     * @return {*}
	     * @see R.init, R.head, R.tail
	     * @example
	     *
	     *      R.last(['fi', 'fo', 'fum']); //=> 'fum'
	     *      R.last([]); //=> undefined
	     *
	     *      R.last('abc'); //=> 'c'
	     *      R.last(''); //=> ''
	     */var last=nth(-1);/**
	     * Takes a function and
	     * a [functor](https://github.com/fantasyland/fantasy-land#functor),
	     * applies the function to each of the functor's values, and returns
	     * a functor of the same shape.
	     *
	     * Ramda provides suitable `map` implementations for `Array` and `Object`,
	     * so this function may be applied to `[1, 2, 3]` or `{x: 1, y: 2, z: 3}`.
	     *
	     * Dispatches to the `map` method of the second argument, if present.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     *
	     * Also treats functions as functors and will compose them together.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig Functor f => (a -> b) -> f a -> f b
	     * @param {Function} fn The function to be called on every element of the input `list`.
	     * @param {Array} list The list to be iterated over.
	     * @return {Array} The new list.
	     * @see R.transduce, R.addIndex
	     * @example
	     *
	     *      var double = x => x * 2;
	     *
	     *      R.map(double, [1, 2, 3]); //=> [2, 4, 6]
	     *
	     *      R.map(double, {x: 1, y: 2, z: 3}); //=> {x: 2, y: 4, z: 6}
	     * @symb R.map(f, [a, b]) = [f(a), f(b)]
	     * @symb R.map(f, { x: a, y: b }) = { x: f(a), y: f(b) }
	     * @symb R.map(f, functor_o) = functor_o.map(f)
	     */var map=_curry2(_dispatchable('map',_xmap,function map(fn,functor){switch(Object.prototype.toString.call(functor)){case'[object Function]':return curryN(functor.length,function(){return fn.call(this,functor.apply(this,arguments));});case'[object Object]':return _reduce(function(acc,key){acc[key]=fn(functor[key]);return acc;},{},keys(functor));default:return _map(fn,functor);}}));/**
	     * An Object-specific version of `map`. The function is applied to three
	     * arguments: *(value, key, obj)*. If only the value is significant, use
	     * `map` instead.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.9.0
	     * @category Object
	     * @sig ((*, String, Object) -> *) -> Object -> Object
	     * @param {Function} fn
	     * @param {Object} obj
	     * @return {Object}
	     * @see R.map
	     * @example
	     *
	     *      var values = { x: 1, y: 2, z: 3 };
	     *      var prependKeyAndDouble = (num, key, obj) => key + (num * 2);
	     *
	     *      R.mapObjIndexed(prependKeyAndDouble, values); //=> { x: 'x2', y: 'y4', z: 'z6' }
	     */var mapObjIndexed=_curry2(function mapObjIndexed(fn,obj){return _reduce(function(acc,key){acc[key]=fn(obj[key],key,obj);return acc;},{},keys(obj));});/**
	     * Takes a function `f` and a list of arguments, and returns a function `g`.
	     * When applied, `g` returns the result of applying `f` to the arguments
	     * provided initially followed by the arguments provided to `g`.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.10.0
	     * @category Function
	     * @sig ((a, b, c, ..., n) -> x) -> [a, b, c, ...] -> ((d, e, f, ..., n) -> x)
	     * @param {Function} f
	     * @param {Array} args
	     * @return {Function}
	     * @see R.partialRight
	     * @example
	     *
	     *      var multiply = (a, b) => a * b;
	     *      var double = R.partial(multiply, [2]);
	     *      double(2); //=> 4
	     *
	     *      var greet = (salutation, title, firstName, lastName) =>
	     *        salutation + ', ' + title + ' ' + firstName + ' ' + lastName + '!';
	     *
	     *      var sayHello = R.partial(greet, ['Hello']);
	     *      var sayHelloToMs = R.partial(sayHello, ['Ms.']);
	     *      sayHelloToMs('Jane', 'Jones'); //=> 'Hello, Ms. Jane Jones!'
	     * @symb R.partial(f, [a, b])(c, d) = f(a, b, c, d)
	     */var partial=_createPartialApplicator(_concat);/**
	     * Returns a new list by plucking the same named property off all objects in
	     * the list supplied.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig k -> [{k: v}] -> [v]
	     * @param {Number|String} key The key name to pluck off of each object.
	     * @param {Array} list The array to consider.
	     * @return {Array} The list of values for the given key.
	     * @see R.props
	     * @example
	     *
	     *      R.pluck('a')([{a: 1}, {a: 2}]); //=> [1, 2]
	     *      R.pluck(0)([[1, 2], [3, 4]]);   //=> [1, 3]
	     * @symb R.pluck('x', [{x: 1, y: 2}, {x: 3, y: 4}, {x: 5, y: 6}]) = [1, 3, 5]
	     * @symb R.pluck(0, [[1, 2], [3, 4], [5, 6]]) = [1, 3, 5]
	     */var pluck=_curry2(function pluck(p,list){return map(prop(p),list);});/**
	     * Returns a single item by iterating through the list, successively calling
	     * the iterator function and passing it an accumulator value and the current
	     * value from the array, and then passing the result to the next call.
	     *
	     * The iterator function receives two values: *(acc, value)*. It may use
	     * `R.reduced` to shortcut the iteration.
	     *
	     * Note: `R.reduce` does not skip deleted or unassigned indices (sparse
	     * arrays), unlike the native `Array.prototype.reduce` method. For more details
	     * on this behavior, see:
	     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce#Description
	     *
	     * Dispatches to the `reduce` method of the third argument, if present.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig ((a, b) -> a) -> a -> [b] -> a
	     * @param {Function} fn The iterator function. Receives two values, the accumulator and the
	     *        current element from the array.
	     * @param {*} acc The accumulator value.
	     * @param {Array} list The list to iterate over.
	     * @return {*} The final, accumulated value.
	     * @see R.reduced, R.addIndex
	     * @example
	     *
	     *      var numbers = [1, 2, 3];
	     *      var plus = (a, b) => a + b;
	     *
	     *      R.reduce(plus, 10, numbers); //=> 16
	     * @symb R.reduce(f, a, [b, c, d]) = f(f(f(a, b), c), d)
	     */var reduce=_curry3(_reduce);/**
	     * The complement of `filter`.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig Filterable f => (a -> Boolean) -> f a -> f a
	     * @param {Function} pred
	     * @param {Array} filterable
	     * @return {Array}
	     * @see R.filter, R.transduce, R.addIndex
	     * @example
	     *
	     *      var isOdd = (n) => n % 2 === 1;
	     *
	     *      R.reject(isOdd, [1, 2, 3, 4]); //=> [2, 4]
	     *
	     *      R.reject(isOdd, {a: 1, b: 2, c: 3, d: 4}); //=> {b: 2, d: 4}
	     */var reject=_curry2(function reject(pred,filterable){return filter(_complement(pred),filterable);});/**
	     * Adds together all the elements of a list.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Math
	     * @sig [Number] -> Number
	     * @param {Array} list An array of numbers
	     * @return {Number} The sum of all the numbers in the list.
	     * @see R.reduce
	     * @example
	     *
	     *      R.sum([2,4,6,8,100,1]); //=> 121
	     */var sum=reduce(add,0);// Array.prototype.indexOf doesn't exist below IE9
	// manually crawl the list to distinguish between +0 and -0
	// NaN
	// non-zero numbers can utilise Set
	// all these types can utilise Set
	// null can utilise Set
	// anything else not covered above, defer to R.equals
	var _indexOf=function _indexOf(list,a,idx){var inf,item;// Array.prototype.indexOf doesn't exist below IE9
	if(typeof list.indexOf==='function'){switch(typeof a==='undefined'?'undefined':_typeof(a)){case'number':if(a===0){// manually crawl the list to distinguish between +0 and -0
	inf=1/a;while(idx<list.length){item=list[idx];if(item===0&&1/item===inf){return idx;}idx+=1;}return-1;}else if(a!==a){// NaN
	while(idx<list.length){item=list[idx];if(typeof item==='number'&&item!==item){return idx;}idx+=1;}return-1;}// non-zero numbers can utilise Set
	return list.indexOf(a,idx);// all these types can utilise Set
	case'string':case'boolean':case'function':case'undefined':return list.indexOf(a,idx);case'object':if(a===null){// null can utilise Set
	return list.indexOf(a,idx);}}}// anything else not covered above, defer to R.equals
	while(idx<list.length){if(equals(list[idx],a)){return idx;}idx+=1;}return-1;};/**
	     * ap applies a list of functions to a list of values.
	     *
	     * Dispatches to the `ap` method of the second argument, if present. Also
	     * treats curried functions as applicatives.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.3.0
	     * @category Function
	     * @sig [a -> b] -> [a] -> [b]
	     * @sig Apply f => f (a -> b) -> f a -> f b
	     * @param {Array} fns An array of functions
	     * @param {Array} vs An array of values
	     * @return {Array} An array of results of applying each of `fns` to all of `vs` in turn.
	     * @example
	     *
	     *      R.ap([R.multiply(2), R.add(3)], [1,2,3]); //=> [2, 4, 6, 4, 5, 6]
	     * @symb R.ap([f, g], [a, b]) = [f(a), f(b), g(a), g(b)]
	     */// else
	var ap=_curry2(function ap(applicative,fn){return typeof applicative.ap==='function'?applicative.ap(fn):typeof applicative==='function'?function(x){return applicative(x)(fn(x));}:// else
	_reduce(function(acc,f){return _concat(acc,map(f,fn));},[],applicative);});/**
	     * Returns the result of calling its first argument with the remaining
	     * arguments. This is occasionally useful as a converging function for
	     * `R.converge`: the left branch can produce a function while the right branch
	     * produces a value to be passed to that function as an argument.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.9.0
	     * @category Function
	     * @sig (*... -> a),*... -> a
	     * @param {Function} fn The function to apply to the remaining arguments.
	     * @param {...*} args Any number of positional arguments.
	     * @return {*}
	     * @see R.apply
	     * @example
	     *
	     *      var indentN = R.pipe(R.times(R.always(' ')),
	     *                           R.join(''),
	     *                           R.replace(/^(?!$)/gm));
	     *
	     *      var format = R.converge(R.call, [
	     *                                  R.pipe(R.prop('indent'), indentN),
	     *                                  R.prop('value')
	     *                              ]);
	     *
	     *      format({indent: 2, value: 'foo\nbar\nbaz\n'}); //=> '  foo\n  bar\n  baz\n'
	     * @symb R.call(f, a, b) = f(a, b)
	     */var call=curry(function call(fn){return fn.apply(this,_slice(arguments,1));});/**
	     * Accepts a converging function and a list of branching functions and returns
	     * a new function. When invoked, this new function is applied to some
	     * arguments, each branching function is applied to those same arguments. The
	     * results of each branching function are passed as arguments to the converging
	     * function to produce the return value.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.4.2
	     * @category Function
	     * @sig (x1 -> x2 -> ... -> z) -> [(a -> b -> ... -> x1), (a -> b -> ... -> x2), ...] -> (a -> b -> ... -> z)
	     * @param {Function} after A function. `after` will be invoked with the return values of
	     *        `fn1` and `fn2` as its arguments.
	     * @param {Array} functions A list of functions.
	     * @return {Function} A new function.
	     * @example
	     *
	     *      var add = (a, b) => a + b;
	     *      var multiply = (a, b) => a * b;
	     *      var subtract = (a, b) => a - b;
	     *
	     *      //≅ multiply( add(1, 2), subtract(1, 2) );
	     *      R.converge(multiply, [add, subtract])(1, 2); //=> -3
	     *
	     *      var add3 = (a, b, c) => a + b + c;
	     *      R.converge(add3, [multiply, add, subtract])(1, 2); //=> 4
	     * @symb R.converge(f, [g, h])(a, b) = f(g(a, b), h(a, b))
	     */var converge=_curry2(function converge(after,fns){return curryN(reduce(max,0,pluck('length',fns)),function(){var args=arguments;var context=this;return after.apply(context,_map(function(fn){return fn.apply(context,args);},fns));});});/**
	     * "lifts" a function to be the specified arity, so that it may "map over" that
	     * many lists, Functions or other objects that satisfy the [FantasyLand Apply spec](https://github.com/fantasyland/fantasy-land#apply).
	     *
	     * @func
	     * @memberOf R
	     * @since v0.7.0
	     * @category Function
	     * @sig Number -> (*... -> *) -> ([*]... -> [*])
	     * @param {Function} fn The function to lift into higher context
	     * @return {Function} The lifted function.
	     * @see R.lift, R.ap
	     * @example
	     *
	     *      var madd3 = R.liftN(3, R.curryN(3, (...args) => R.sum(args)));
	     *      madd3([1,2,3], [1,2,3], [1]); //=> [3, 4, 5, 4, 5, 6, 5, 6, 7]
	     */var liftN=_curry2(function liftN(arity,fn){var lifted=curryN(arity,fn);return curryN(arity,function(){return _reduce(ap,map(lifted,arguments[0]),_slice(arguments,1));});});/**
	     * Performs left-to-right function composition. The leftmost function may have
	     * any arity; the remaining functions must be unary.
	     *
	     * In some libraries this function is named `sequence`.
	     *
	     * **Note:** The result of pipe is not automatically curried.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Function
	     * @sig (((a, b, ..., n) -> o), (o -> p), ..., (x -> y), (y -> z)) -> ((a, b, ..., n) -> z)
	     * @param {...Function} functions
	     * @return {Function}
	     * @see R.compose
	     * @example
	     *
	     *      var f = R.pipe(Math.pow, R.negate, R.inc);
	     *
	     *      f(3, 4); // -(3^4) + 1
	     * @symb R.pipe(f, g, h)(a, b) = h(g(f(a, b)))
	     */var pipe=function pipe(){if(arguments.length===0){throw new Error('pipe requires at least one argument');}return _arity(arguments[0].length,reduce(_pipe,arguments[0],tail(arguments)));};var _contains=function _contains(a,list){return _indexOf(list,a,0)>=0;};//  mapPairs :: (Object, [String]) -> [String]
	var _toString=function _toString(x,seen){var recur=function recur(y){var xs=seen.concat([x]);return _contains(y,xs)?'<Circular>':_toString(y,xs);};//  mapPairs :: (Object, [String]) -> [String]
	var mapPairs=function mapPairs(obj,keys){return _map(function(k){return _quote(k)+': '+recur(obj[k]);},keys.slice().sort());};switch(Object.prototype.toString.call(x)){case'[object Arguments]':return'(function() { return arguments; }('+_map(recur,x).join(', ')+'))';case'[object Array]':return'['+_map(recur,x).concat(mapPairs(x,reject(function(k){return /^\d+$/.test(k);},keys(x)))).join(', ')+']';case'[object Boolean]':return(typeof x==='undefined'?'undefined':_typeof(x))==='object'?'new Boolean('+recur(x.valueOf())+')':x.toString();case'[object Date]':return'new Date('+(isNaN(x.valueOf())?recur(NaN):_quote(_toISOString(x)))+')';case'[object Null]':return'null';case'[object Number]':return(typeof x==='undefined'?'undefined':_typeof(x))==='object'?'new Number('+recur(x.valueOf())+')':1/x===-Infinity?'-0':x.toString(10);case'[object String]':return(typeof x==='undefined'?'undefined':_typeof(x))==='object'?'new String('+recur(x.valueOf())+')':_quote(x);case'[object Undefined]':return'undefined';default:if(typeof x.toString==='function'){var repr=x.toString();if(repr!=='[object Object]'){return repr;}}return'{'+mapPairs(x,keys(x)).join(', ')+'}';}};/**
	     * Performs right-to-left function composition. The rightmost function may have
	     * any arity; the remaining functions must be unary.
	     *
	     * **Note:** The result of compose is not automatically curried.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Function
	     * @sig ((y -> z), (x -> y), ..., (o -> p), ((a, b, ..., n) -> o)) -> ((a, b, ..., n) -> z)
	     * @param {...Function} functions
	     * @return {Function}
	     * @see R.pipe
	     * @example
	     *
	     *      var f = R.compose(R.inc, R.negate, Math.pow);
	     *
	     *      f(3, 4); // -(3^4) + 1
	     * @symb R.compose(f, g, h)(a, b) = f(g(h(a, b)))
	     */var compose=function compose(){if(arguments.length===0){throw new Error('compose requires at least one argument');}return pipe.apply(this,reverse(arguments));};/**
	     * Returns `true` if the specified value is equal, in `R.equals` terms, to at
	     * least one element of the given list; `false` otherwise.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig a -> [a] -> Boolean
	     * @param {Object} a The item to compare against.
	     * @param {Array} list The array to consider.
	     * @return {Boolean} `true` if the item is in the list, `false` otherwise.
	     * @see R.any
	     * @example
	     *
	     *      R.contains(3, [1, 2, 3]); //=> true
	     *      R.contains(4, [1, 2, 3]); //=> false
	     *      R.contains([42], [[42]]); //=> true
	     */var contains=_curry2(_contains);/**
	     * Finds the set (i.e. no duplicates) of all elements in the first list not
	     * contained in the second list.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Relation
	     * @sig [*] -> [*] -> [*]
	     * @param {Array} list1 The first list.
	     * @param {Array} list2 The second list.
	     * @return {Array} The elements in `list1` that are not in `list2`.
	     * @see R.differenceWith, R.symmetricDifference, R.symmetricDifferenceWith
	     * @example
	     *
	     *      R.difference([1,2,3,4], [7,6,5,4,3]); //=> [1,2]
	     *      R.difference([7,6,5,4,3], [1,2,3,4]); //=> [7,6,5]
	     */var difference=_curry2(function difference(first,second){var out=[];var idx=0;var firstLen=first.length;while(idx<firstLen){if(!_contains(first[idx],second)&&!_contains(first[idx],out)){out[out.length]=first[idx];}idx+=1;}return out;});/**
	     * "lifts" a function of arity > 1 so that it may "map over" a list, Function or other
	     * object that satisfies the [FantasyLand Apply spec](https://github.com/fantasyland/fantasy-land#apply).
	     *
	     * @func
	     * @memberOf R
	     * @since v0.7.0
	     * @category Function
	     * @sig (*... -> *) -> ([*]... -> [*])
	     * @param {Function} fn The function to lift into higher context
	     * @return {Function} The lifted function.
	     * @see R.liftN
	     * @example
	     *
	     *      var madd3 = R.lift(R.curry((a, b, c) => a + b + c));
	     *
	     *      madd3([1,2,3], [1,2,3], [1]); //=> [3, 4, 5, 4, 5, 6, 5, 6, 7]
	     *
	     *      var madd5 = R.lift(R.curry((a, b, c, d, e) => a + b + c + d + e));
	     *
	     *      madd5([1,2], [3], [4, 5], [6], [7, 8]); //=> [21, 22, 22, 23, 22, 23, 23, 24]
	     */var lift=_curry1(function lift(fn){return liftN(fn.length,fn);});/**
	     * Returns a partial copy of an object omitting the keys specified.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Object
	     * @sig [String] -> {String: *} -> {String: *}
	     * @param {Array} names an array of String property names to omit from the new object
	     * @param {Object} obj The object to copy from
	     * @return {Object} A new object with properties from `names` not on it.
	     * @see R.pick
	     * @example
	     *
	     *      R.omit(['a', 'd'], {a: 1, b: 2, c: 3, d: 4}); //=> {b: 2, c: 3}
	     */var omit=_curry2(function omit(names,obj){var result={};for(var prop in obj){if(!_contains(prop,names)){result[prop]=obj[prop];}}return result;});/**
	     * Returns the string representation of the given value. `eval`'ing the output
	     * should result in a value equivalent to the input value. Many of the built-in
	     * `toString` methods do not satisfy this requirement.
	     *
	     * If the given value is an `[object Object]` with a `toString` method other
	     * than `Object.prototype.toString`, this method is invoked with no arguments
	     * to produce the return value. This means user-defined constructor functions
	     * can provide a suitable `toString` method. For example:
	     *
	     *     function Point(x, y) {
	     *       this.x = x;
	     *       this.y = y;
	     *     }
	     *
	     *     Point.prototype.toString = function() {
	     *       return 'new Point(' + this.x + ', ' + this.y + ')';
	     *     };
	     *
	     *     R.toString(new Point(1, 2)); //=> 'new Point(1, 2)'
	     *
	     * @func
	     * @memberOf R
	     * @since v0.14.0
	     * @category String
	     * @sig * -> String
	     * @param {*} val
	     * @return {String}
	     * @example
	     *
	     *      R.toString(42); //=> '42'
	     *      R.toString('abc'); //=> '"abc"'
	     *      R.toString([1, 2, 3]); //=> '[1, 2, 3]'
	     *      R.toString({foo: 1, bar: 2, baz: 3}); //=> '{"bar": 2, "baz": 3, "foo": 1}'
	     *      R.toString(new Date('2001-02-03T04:05:06Z')); //=> 'new Date("2001-02-03T04:05:06.000Z")'
	     */var toString=_curry1(function toString(val){return _toString(val,[]);});/**
	     * A function wrapping calls to the two functions in an `&&` operation,
	     * returning the result of the first function if it is false-y and the result
	     * of the second function otherwise. Note that this is short-circuited,
	     * meaning that the second function will not be invoked if the first returns a
	     * false-y value.
	     *
	     * In addition to functions, `R.both` also accepts any fantasy-land compatible
	     * applicative functor.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.12.0
	     * @category Logic
	     * @sig (*... -> Boolean) -> (*... -> Boolean) -> (*... -> Boolean)
	     * @param {Function} f a predicate
	     * @param {Function} g another predicate
	     * @return {Function} a function that applies its arguments to `f` and `g` and `&&`s their outputs together.
	     * @see R.and
	     * @example
	     *
	     *      var gt10 = x => x > 10;
	     *      var even = x => x % 2 === 0;
	     *      var f = R.both(gt10, even);
	     *      f(100); //=> true
	     *      f(101); //=> false
	     */var both=_curry2(function both(f,g){return _isFunction(f)?function _both(){return f.apply(this,arguments)&&g.apply(this,arguments);}:lift(and)(f,g);});/**
	     * Takes a function `f` and returns a function `g` such that:
	     *
	     *   - applying `g` to zero or more arguments will give __true__ if applying
	     *     the same arguments to `f` gives a logical __false__ value; and
	     *
	     *   - applying `g` to zero or more arguments will give __false__ if applying
	     *     the same arguments to `f` gives a logical __true__ value.
	     *
	     * `R.complement` will work on all other functors as well.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.12.0
	     * @category Logic
	     * @sig (*... -> *) -> (*... -> Boolean)
	     * @param {Function} f
	     * @return {Function}
	     * @see R.not
	     * @example
	     *
	     *      var isEven = n => n % 2 === 0;
	     *      var isOdd = R.complement(isEven);
	     *      isOdd(21); //=> true
	     *      isOdd(42); //=> false
	     */var complement=lift(not);/**
	     * Returns the result of concatenating the given lists or strings.
	     *
	     * Note: `R.concat` expects both arguments to be of the same type,
	     * unlike the native `Array.prototype.concat` method. It will throw
	     * an error if you `concat` an Array with a non-Array value.
	     *
	     * Dispatches to the `concat` method of the first argument, if present.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig [a] -> [a] -> [a]
	     * @sig String -> String -> String
	     * @param {Array|String} a
	     * @param {Array|String} b
	     * @return {Array|String}
	     *
	     * @example
	     *
	     *      R.concat([], []); //=> []
	     *      R.concat([4, 5, 6], [1, 2, 3]); //=> [4, 5, 6, 1, 2, 3]
	     *      R.concat('ABC', 'DEF'); // 'ABCDEF'
	     */var concat=_curry2(function concat(a,b){if(a==null||!_isFunction(a.concat)){throw new TypeError(toString(a)+' does not have a method named "concat"');}if(_isArray(a)&&!_isArray(b)){throw new TypeError(toString(b)+' is not an array');}return a.concat(b);});/**
	     * Turns a named method with a specified arity into a function that can be
	     * called directly supplied with arguments and a target object.
	     *
	     * The returned function is curried and accepts `arity + 1` parameters where
	     * the final parameter is the target object.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Function
	     * @sig Number -> String -> (a -> b -> ... -> n -> Object -> *)
	     * @param {Number} arity Number of arguments the returned function should take
	     *        before the target object.
	     * @param {String} method Name of the method to call.
	     * @return {Function} A new curried function.
	     * @example
	     *
	     *      var sliceFrom = R.invoker(1, 'slice');
	     *      sliceFrom(6, 'abcdefghijklm'); //=> 'ghijklm'
	     *      var sliceFrom6 = R.invoker(2, 'slice')(6);
	     *      sliceFrom6(8, 'abcdefghijklm'); //=> 'gh'
	     * @symb R.invoker(0, 'method')(o) = o['method']()
	     * @symb R.invoker(1, 'method')(a, o) = o['method'](a)
	     * @symb R.invoker(2, 'method')(a, b, o) = o['method'](a, b)
	     */var invoker=_curry2(function invoker(arity,method){return curryN(arity+1,function(){var target=arguments[arity];if(target!=null&&_isFunction(target[method])){return target[method].apply(target,_slice(arguments,0,arity));}throw new TypeError(toString(target)+' does not have a method named "'+method+'"');});});/**
	     * Returns a string made by inserting the `separator` between each element and
	     * concatenating all the elements into a single string.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig String -> [a] -> String
	     * @param {Number|String} separator The string used to separate the elements.
	     * @param {Array} xs The elements to join into a string.
	     * @return {String} str The string made by concatenating `xs` with `separator`.
	     * @see R.split
	     * @example
	     *
	     *      var spacer = R.join(' ');
	     *      spacer(['a', 2, 3.4]);   //=> 'a 2 3.4'
	     *      R.join('|', [1, 2, 3]);    //=> '1|2|3'
	     */var join=invoker(1,'join');var R={__:__,add:add,addIndex:addIndex,always:always,any:any,apply:apply,assoc:assoc,bind:bind,both:both,call:call,clamp:clamp,complement:complement,compose:compose,concat:concat,contains:contains,converge:converge,curry:curry,curryN:curryN,difference:difference,drop:drop,equals:equals,filter:filter,find:find,flatten:flatten,flip:flip,forEach:forEach,fromPairs:fromPairs,gte:gte,has:has,head:head,identical:identical,identity:identity,invoker:invoker,join:join,keys:keys,last:last,length:length,lt:lt,lte:lte,map:map,mapObjIndexed:mapObjIndexed,max:max,minBy:minBy,negate:negate,nthArg:nthArg,of:of,omit:omit,partial:partial,path:path,pick:pick,pickBy:pickBy,pipe:pipe,prop:prop,propOr:propOr,range:range,reduce:reduce,reject:reject,splitEvery:splitEvery,subtract:subtract,sum:sum,tail:tail,takeWhile:takeWhile,times:times,toPairs:toPairs,trim:trim,type:type,unless:unless,values:values};/* eslint-env amd *//* TEST_ENTRY_POINT */if(( false?'undefined':_typeof(exports))==='object'){module.exports=R;}else if(true){!(__WEBPACK_AMD_DEFINE_RESULT__ = function(){return R;}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));}else{this.R=R;}}).call(undefined);

/***/ },
/* 8 */
/*!************************!*\
  !*** ./lib/r-utils.js ***!
  \************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//---------//
	// Imports //
	//---------//

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	var r = __webpack_require__(/*! ./external/ramda.custom */ 7),
	    isInteger = __webpack_require__(/*! is-integer */ 9);

	//------//
	// Main //
	//------//


	// short

	var betweenI = getBetween('inclusive'),
	    betweenRange = getBetween('range'),
	    _r$map = r.map(r.flip, [r.lte, r.subtract]),
	    _r$map2 = _slicedToArray(_r$map, 2),
	    lte = _r$map2[0],
	    subtract = _r$map2[1],
	    square = function square(x) {
	  return x * x;
	},
	    toBoolean = function toBoolean(val) {
	  return !!val;
	};

	// longer


	// opposite of distribute
	var arrange = function arrange(arr) {
	  var res = [];

	  var outerIdx = 0,
	      i = 0;

	  while (arr.length) {
	    outerIdx = i % arr.length;
	    if (outerIdx === 0) i = 0;

	    res.push(arr[outerIdx].shift());

	    if (!arr[outerIdx].length) arr.splice(outerIdx, 1);else i += 1;
	  }
	  return res;
	};

	var coerceArray = r.unless(r.pipe(r.type, r.identical('Array')), r.of);

	var containsAny = r.curry(function (src, target) {
	  var found = false,
	      i = 0;

	  while (!found && i < target.length) {
	    found = r.contains(target[i], src);
	    i += 1;
	  }

	  return found;
	});

	// opposite of arrange
	var distribute = r.curry(function (n, arr) {
	  return r.addIndex(transform)(function (res, cur, idx) {
	    return res[idx % n].push(cur);
	  }, r.times(function () {
	    return [];
	  }, n), arr);
	});

	var feed = r.curry(function (joiner, feeder, initial, arr) {
	  var res = initial;
	  while (arr.length >= feeder.length) {
	    res = joiner(res, feeder.apply(null, arr.splice(0, feeder.length)));
	  }
	  return res;
	});

	var invoke = r.curry(function (prop, obj) {
	  return r.pipe(r.prop, r.bind(r.__, obj), r.call)(prop, obj);
	});

	var isUndefined = function isUndefined(val) {
	  return typeof val === 'undefined';
	},
	    isDefined = r.complement(isUndefined);

	var size = function size(val) {
	  switch (r.type(val)) {
	    case 'Object':
	      return r.has('length', val) ? val.length : r.keys(val).length;
	    default:
	      if (isInteger(val.length)) return val.length;else throw new Error("Invalid Input: size requires r.type of Object or an integer length property");
	  }
	},
	    isLaden = r.pipe(size, toBoolean);

	var middle = function middle(col) {
	  return col[Math.floor(col.length / 2)];
	};

	var mutableAssoc = r.curry(function (path, val, obj) {
	  obj[path] = val;return obj;
	});

	var mutableDissoc = r.curry(function (path, obj) {
	  delete obj[path];return obj;
	});

	var mutableMerge = r.curry(function (target, src) {
	  for (var key in src) {
	    target[key] = src[key];
	  }
	  return target;
	});

	var _mutableFilterArr = function _mutableFilterArr(predicate, arr) {
	  var idx = arr.length;
	  while (idx--) {
	    if (!predicate(arr[idx])) arr.splice(idx, 1);
	  }
	  return arr;
	};
	var _mutableFilterObj = function _mutableFilterObj(predicate, obj) {
	  for (var key in obj) {
	    if (!predicate(obj[key])) delete obj[key];
	  }
	  return obj;
	};

	var mutableFilter = r.curry(function (predicate, list) {
	  switch (r.type(list)) {
	    case 'Array':
	      return _mutableFilterArr(predicate, list);
	    case 'Object':
	      return _mutableFilterObj(predicate, list);
	    default:
	      throw new Error("Invalid Input: mutableFilter requires r.type of Array or Object");
	  }
	});

	var _mutableMapArr = function _mutableMapArr(transform, arr) {
	  for (var i = 0; i < arr.length; i++) {
	    arr[i] = transform(arr[i], i);
	  }
	  return arr;
	};
	var _mutableMapObj = function _mutableMapObj(transform, obj) {
	  for (var key in obj) {
	    obj[key] = transform(obj[key], key);
	  }
	  return obj;
	};
	var mutableMap = r.curry(function (transform, list) {
	  switch (r.type(list)) {
	    case 'Undefined':
	      return [];
	    case 'Array':
	      return _mutableMapArr(transform, list);
	    case 'Object':
	      return _mutableMapObj(transform, list);
	    default:
	      throw new Error("Invalid Input: mutableMap requires r.type of Array or Object\nr.type: " + r.type(list));
	  }
	});

	var mutableOmit = r.curry(function (propsToOmitArr, obj) {
	  propsToOmitArr.forEach(function (prop) {
	    return delete obj[prop];
	  });
	  return obj;
	});

	var mutablePick = r.curry(function (propsToPickArr, obj) {
	  for (var key in obj) {
	    if (!r.contains(key, propsToPickArr)) {
	      delete obj[key];
	    }
	  }
	  return obj;
	});

	var mutableReject = r.curry(function (predicate, list) {
	  return mutableFilter(r.complement(predicate), list);
	});

	var mutableRotate = r.curry(function (n, arr) {
	  if (n === 0 || arr.length === 0) return arr;

	  var _ref = n > 0 ? ['pop', 'unshift'] : ['shift', 'push'],
	      _ref2 = _slicedToArray(_ref, 2),
	      remove = _ref2[0],
	      attach = _ref2[1];

	  n = Math.abs(n);
	  for (var i = 0; i < n; i += 1) {
	    arr[attach](arr[remove]());
	  }

	  return arr;
	});

	var reduceFirst = r.curry(function (reducer, list) {
	  return r.reduce(reducer, r.head(list), r.tail(list));
	});

	var reduceIndexed = r.addIndex(r.reduce);

	var rswitch = r.curry(function (caseObj, key, args) {
	  return r.apply(r.propOr('default', key, caseObj), args);
	});

	var sample = function sample(list) {
	  // if not an array, then assume it's an object
	  if (!r.type(list) === 'Array') list = r.values(list);
	  return list[Math.floor(Math.random() * list.length)];
	};

	var _cloneList = r.map(r.identity),
	    _cloneCases = {
	  Array: _cloneList,
	  Object: _cloneList,
	  default: function _default(invalidType) {
	    throw new Error("Invalid Input: shallowClone requires an r.type of Array or Object\n" + "r.type(" + invalidType + ") -> " + r.type(invalidType));
	  }
	};
	var shallowClone = function shallowClone(val) {
	  return rswitch(_cloneCases, r.type(val), [val]);
	};

	var staticCond = r.curry(function (conds, val) {
	  return r.pipe(r.find(function (aCond) {
	    return r.head(aCond)(val);
	  }), r.last)(conds);
	});

	var _toNumberCases = {
	  Number: r.identity,
	  String: function String(str) {
	    return parseInt(str, 10);
	  },
	  default: function _default(invalidType) {
	    throw new Error("Invalid Input: toNumber requires an r.type of String or Number\n" + "r.type(" + invalidType + ") -> " + r.type(invalidType));
	  }
	};

	var toNumber = function toNumber(val) {
	  return rswitch(_toNumberCases, r.type(val), [val]);
	};

	var transform = r.curry(function (reducer, start, list) {
	  return r.forEach(r.partial(reducer, [start]), list || []) && start;
	});

	//-------------//
	// Helper Fxns //
	//-------------//

	function getBetween(type) {
	  var ltFn = type === 'inclusive' ? r.lte : r.lt;

	  return r.curry(function (low, high, val) {
	    if (low > high) {
	      ;
	      var _ref3 = [high, low];
	      low = _ref3[0];
	      high = _ref3[1];
	    }return r.gte(val, low) && ltFn(val, high);
	  });
	}

	//---------//
	// Exports //
	//---------//

	module.exports = {
	  arrange: arrange,
	  betweenI: betweenI,
	  betweenRange: betweenRange,
	  coerceArray: coerceArray,
	  containsAny: containsAny,
	  distribute: distribute,
	  feed: feed,
	  invoke: invoke,
	  isDefined: isDefined,
	  isLaden: isLaden,
	  isUndefined: isUndefined,
	  lte: lte,
	  middle: middle,
	  mutableAssoc: mutableAssoc,
	  mutableDissoc: mutableDissoc,
	  mutableFilter: mutableFilter,
	  mutableMap: mutableMap,
	  mutableMerge: mutableMerge,
	  mutablePick: mutablePick,
	  mutableOmit: mutableOmit,
	  mutableReject: mutableReject,
	  mutableRotate: mutableRotate,
	  reduceFirst: reduceFirst,
	  reduceIndexed: reduceIndexed,
	  sample: sample,
	  shallowClone: shallowClone,
	  size: size,
	  square: square,
	  staticCond: staticCond,
	  subtract: subtract,
	  toBoolean: toBoolean,
	  toNumber: toNumber,
	  transform: transform
	};

/***/ },
/* 9 */
/*!*******************************!*\
  !*** ./~/is-integer/index.js ***!
  \*******************************/
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/paulmillr/es6-shim
	// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.isinteger
	var isFinite = __webpack_require__(/*! is-finite */ 10);
	module.exports = Number.isInteger || function(val) {
	  return typeof val === "number" &&
	    isFinite(val) &&
	    Math.floor(val) === val;
	};


/***/ },
/* 10 */
/*!******************************!*\
  !*** ./~/is-finite/index.js ***!
  \******************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var numberIsNan = __webpack_require__(/*! number-is-nan */ 11);

	module.exports = Number.isFinite || function (val) {
		return !(typeof val !== 'number' || numberIsNan(val) || val === Infinity || val === -Infinity);
	};


/***/ },
/* 11 */
/*!**********************************!*\
  !*** ./~/number-is-nan/index.js ***!
  \**********************************/
/***/ function(module, exports) {

	'use strict';
	module.exports = Number.isNaN || function (x) {
		return x !== x;
	};


/***/ },
/* 12 */
/*!********************************!*\
  !*** ./src/client/js/utils.js ***!
  \********************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//---------//
	// Imports //
	//---------//

	var $ = __webpack_require__(/*! ./external/domtastic.custom */ 5),
	    duration = __webpack_require__(/*! ./constants/duration */ 13),
	    hoverIntent = __webpack_require__(/*! hoverintent */ 14),
	    r = __webpack_require__(/*! ../../../lib/external/ramda.custom */ 7),
	    rUtils = __webpack_require__(/*! ../../../lib/r-utils */ 8),
	    velocity = __webpack_require__(/*! velocity-animate */ 16);

	//------//
	// Init //
	//------//

	var hoverIntentWrapper = r.curry(function (el, elDt) {
	  if (!("ontouchstart" in document.documentElement)) hoverIntent(el, onEnter(elDt), onLeave(elDt));
	}),
	    feed = rUtils.feed,
	    size = rUtils.size,
	    screenSizes = {
	  xxsMax: 619,
	  xsMin: 620,
	  xsMax: 767,
	  smMin: 768,
	  smMax: 991,
	  mdMin: 992,
	  mdMax: 1189,
	  lgMin: 1190
	},
	    screenSizesPx = r.map(function (size) {
	  return size + 'px';
	}, screenSizes);

	//------//
	// Main //
	//------//

	var addHovered = function addHovered(el) {
	  return hoverIntentWrapper(el, $(el));
	},
	    addHoveredDt = function addHoveredDt(dt) {
	  return dt.forEach(function (el) {
	    return hoverIntentWrapper(el, $(el));
	  });
	},
	    addHoveredToParent = function addHoveredToParent(el) {
	  return hoverIntentWrapper(el, $(el).parent());
	};

	var directFind = r.curry(function (ctxDt, path) {
	  if (path.length === 1) return ctxDt.children(path[0]);

	  return directFind(ctxDt.children(r.head(path)), r.tail(path));
	});

	var directFindAll = function directFindAll(ctxDt) {
	  return r.pipe(r.map(directFind(ctxDt)), r.filter(size));
	};

	var getRandomIntBetween = r.curry(function (min, max) {
	  return Math.floor(Math.random() * (max - min + 1) + min);
	});

	var joinAdjacentArrays = feed(r.flip(r.append), r.concat, []);

	var pairAdjacentElements = feed(r.flip(r.append), r.pair, []);

	var keycodes = {
	  esc: 27
	};

	var getNumColumns = function getNumColumns() {
	  var res = void 0;
	  if (window.matchMedia("(min-width: " + screenSizesPx.lgMin + ")").matches) {
	    res = 4;
	  } else if (window.matchMedia("(min-width: " + screenSizesPx.xsMin + ")").matches) {
	    res = 2;
	  } else {
	    res = 1;
	  }
	  return res;
	};

	var removeDt = function removeDt(elDt) {
	  return velocity(elDt[0], {
	    'margin-top': 0,
	    'margin-bottom': 0,
	    'padding-top': 0,
	    'padding-bottom': 0,
	    'border-top': 0,
	    'border-bottom': 0,
	    height: 0,
	    opacity: 0
	  }, { duration: duration.medium }).then(elDt.remove.bind(elDt));
	};

	var unwrap = r.map(r.identity);

	//-------------//
	// Helper Fxns //
	//-------------//

	function onEnter(dt) {
	  return function () {
	    return dt.addClass('hovered');
	  };
	}
	function onLeave(dt) {
	  return function () {
	    return dt.removeClass('hovered');
	  };
	}

	//---------//
	// Exports //
	//---------//

	module.exports = {
	  addHovered: addHovered,
	  addHoveredDt: addHoveredDt,
	  addHoveredToParent: addHoveredToParent,
	  directFind: directFind,
	  directFindAll: directFindAll,
	  getNumColumns: getNumColumns,
	  getRandomIntBetween: getRandomIntBetween,
	  joinAdjacentArrays: joinAdjacentArrays,
	  keycodes: keycodes,
	  pairAdjacentElements: pairAdjacentElements,
	  removeDt: removeDt,
	  screenSizesPx: screenSizesPx,
	  unwrap: unwrap
	};

/***/ },
/* 13 */
/*!*********************************************!*\
  !*** ./src/client/js/constants/duration.js ***!
  \*********************************************/
/***/ function(module, exports) {

	'use strict';

	module.exports = {
	  small: 200,
	  medium: 400,
	  long: 1000
	};

/***/ },
/* 14 */
/*!********************************!*\
  !*** ./~/hoverintent/index.js ***!
  \********************************/
/***/ function(module, exports, __webpack_require__) {

	;(function(global) {
	'use strict';

	var extend = __webpack_require__(/*! xtend */ 15);

	var hoverintent = function(el, onOver, onOut) {
	  var x, y, pX, pY;
	  var h = {},
	    state = 0,
	    timer = 0;

	  var options = {
	    sensitivity: 7,
	    interval: 100,
	    timeout: 0
	  };

	  function delay(el, e) {
	    if (timer) timer = clearTimeout(timer);
	    state = 0;
	    return onOut.call(el, e);
	  }

	  function tracker(e) {
	    x = e.clientX;
	    y = e.clientY;
	  }

	  function compare(el, e) {
	    if (timer) timer = clearTimeout(timer);
	    if ((Math.abs(pX - x) + Math.abs(pY - y)) < options.sensitivity) {
	      state = 1;
	      return onOver.call(el, e);
	    } else {
	      pX = x;
	      pY = y;
	      timer = setTimeout(function() {
	        compare(el, e);
	      }, options.interval);
	    }
	  }

	  // Public methods
	  h.options = function(opt) {
	    options = extend({}, options, opt);
	    return h;
	  };

	  function dispatchOver(e) {
	    if (timer) timer = clearTimeout(timer);
	    el.removeEventListener('mousemove', tracker, false);

	    if (state !== 1) {
	      pX = e.clientX;
	      pY = e.clientY;

	      el.addEventListener('mousemove', tracker, false);

	      timer = setTimeout(function() {
	        compare(el, e);
	      }, options.interval);
	    }

	    return this;
	  }

	  function dispatchOut(e) {
	    if (timer) timer = clearTimeout(timer);
	    el.removeEventListener('mousemove', tracker, false);

	    if (state === 1) {
	      timer = setTimeout(function() {
	        delay(el, e);
	      }, options.timeout);
	    }

	    return this;
	  }

	  h.remove = function() {
	    if (!el) return;
	    el.removeEventListener('mouseover', dispatchOver, false);
	    el.removeEventListener('mouseout', dispatchOut, false);
	  };

	  if (el) {
	    el.addEventListener('mouseover', dispatchOver, false);
	    el.addEventListener('mouseout', dispatchOut, false);
	  }

	  return h;
	};

	global.hoverintent = hoverintent;
	if (typeof module !== 'undefined' && module.exports) module.exports = hoverintent;
	})(this);


/***/ },
/* 15 */
/*!******************************!*\
  !*** ./~/xtend/immutable.js ***!
  \******************************/
/***/ function(module, exports) {

	module.exports = extend

	var hasOwnProperty = Object.prototype.hasOwnProperty;

	function extend() {
	    var target = {}

	    for (var i = 0; i < arguments.length; i++) {
	        var source = arguments[i]

	        for (var key in source) {
	            if (hasOwnProperty.call(source, key)) {
	                target[key] = source[key]
	            }
	        }
	    }

	    return target
	}


/***/ },
/* 16 */
/*!****************************************!*\
  !*** ./~/velocity-animate/velocity.js ***!
  \****************************************/
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*! VelocityJS.org (1.3.1). (C) 2014 Julian Shapiro. MIT @license: en.wikipedia.org/wiki/MIT_License */

	/*************************
	 Velocity jQuery Shim
	 *************************/

	/*! VelocityJS.org jQuery Shim (1.0.1). (C) 2014 The jQuery Foundation. MIT @license: en.wikipedia.org/wiki/MIT_License. */

	/* This file contains the jQuery functions that Velocity relies on, thereby removing Velocity's dependency on a full copy of jQuery, and allowing it to work in any environment. */
	/* These shimmed functions are only used if jQuery isn't present. If both this shim and jQuery are loaded, Velocity defaults to jQuery proper. */
	/* Browser support: Using this shim instead of jQuery proper removes support for IE8. */

	(function(window) {
		"use strict";
		/***************
		 Setup
		 ***************/

		/* If jQuery is already loaded, there's no point in loading this shim. */
		if (window.jQuery) {
			return;
		}

		/* jQuery base. */
		var $ = function(selector, context) {
			return new $.fn.init(selector, context);
		};

		/********************
		 Private Methods
		 ********************/

		/* jQuery */
		$.isWindow = function(obj) {
			/* jshint eqeqeq: false */
			return obj && obj === obj.window;
		};

		/* jQuery */
		$.type = function(obj) {
			if (!obj) {
				return obj + "";
			}

			return typeof obj === "object" || typeof obj === "function" ?
					class2type[toString.call(obj)] || "object" :
					typeof obj;
		};

		/* jQuery */
		$.isArray = Array.isArray || function(obj) {
			return $.type(obj) === "array";
		};

		/* jQuery */
		function isArraylike(obj) {
			var length = obj.length,
					type = $.type(obj);

			if (type === "function" || $.isWindow(obj)) {
				return false;
			}

			if (obj.nodeType === 1 && length) {
				return true;
			}

			return type === "array" || length === 0 || typeof length === "number" && length > 0 && (length - 1) in obj;
		}

		/***************
		 $ Methods
		 ***************/

		/* jQuery: Support removed for IE<9. */
		$.isPlainObject = function(obj) {
			var key;

			if (!obj || $.type(obj) !== "object" || obj.nodeType || $.isWindow(obj)) {
				return false;
			}

			try {
				if (obj.constructor &&
						!hasOwn.call(obj, "constructor") &&
						!hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
					return false;
				}
			} catch (e) {
				return false;
			}

			for (key in obj) {
			}

			return key === undefined || hasOwn.call(obj, key);
		};

		/* jQuery */
		$.each = function(obj, callback, args) {
			var value,
					i = 0,
					length = obj.length,
					isArray = isArraylike(obj);

			if (args) {
				if (isArray) {
					for (; i < length; i++) {
						value = callback.apply(obj[i], args);

						if (value === false) {
							break;
						}
					}
				} else {
					for (i in obj) {
						if (!obj.hasOwnProperty(i)) {
							continue;
						}
						value = callback.apply(obj[i], args);

						if (value === false) {
							break;
						}
					}
				}

			} else {
				if (isArray) {
					for (; i < length; i++) {
						value = callback.call(obj[i], i, obj[i]);

						if (value === false) {
							break;
						}
					}
				} else {
					for (i in obj) {
						if (!obj.hasOwnProperty(i)) {
							continue;
						}
						value = callback.call(obj[i], i, obj[i]);

						if (value === false) {
							break;
						}
					}
				}
			}

			return obj;
		};

		/* Custom */
		$.data = function(node, key, value) {
			/* $.getData() */
			if (value === undefined) {
				var getId = node[$.expando],
						store = getId && cache[getId];

				if (key === undefined) {
					return store;
				} else if (store) {
					if (key in store) {
						return store[key];
					}
				}
				/* $.setData() */
			} else if (key !== undefined) {
				var setId = node[$.expando] || (node[$.expando] = ++$.uuid);

				cache[setId] = cache[setId] || {};
				cache[setId][key] = value;

				return value;
			}
		};

		/* Custom */
		$.removeData = function(node, keys) {
			var id = node[$.expando],
					store = id && cache[id];

			if (store) {
				// Cleanup the entire store if no keys are provided.
				if (!keys) {
					delete cache[id];
				} else {
					$.each(keys, function(_, key) {
						delete store[key];
					});
				}
			}
		};

		/* jQuery */
		$.extend = function() {
			var src, copyIsArray, copy, name, options, clone,
					target = arguments[0] || {},
					i = 1,
					length = arguments.length,
					deep = false;

			if (typeof target === "boolean") {
				deep = target;

				target = arguments[i] || {};
				i++;
			}

			if (typeof target !== "object" && $.type(target) !== "function") {
				target = {};
			}

			if (i === length) {
				target = this;
				i--;
			}

			for (; i < length; i++) {
				if ((options = arguments[i])) {
					for (name in options) {
						if (!options.hasOwnProperty(name)) {
							continue;
						}
						src = target[name];
						copy = options[name];

						if (target === copy) {
							continue;
						}

						if (deep && copy && ($.isPlainObject(copy) || (copyIsArray = $.isArray(copy)))) {
							if (copyIsArray) {
								copyIsArray = false;
								clone = src && $.isArray(src) ? src : [];

							} else {
								clone = src && $.isPlainObject(src) ? src : {};
							}

							target[name] = $.extend(deep, clone, copy);

						} else if (copy !== undefined) {
							target[name] = copy;
						}
					}
				}
			}

			return target;
		};

		/* jQuery 1.4.3 */
		$.queue = function(elem, type, data) {
			function $makeArray(arr, results) {
				var ret = results || [];

				if (arr) {
					if (isArraylike(Object(arr))) {
						/* $.merge */
						(function(first, second) {
							var len = +second.length,
									j = 0,
									i = first.length;

							while (j < len) {
								first[i++] = second[j++];
							}

							if (len !== len) {
								while (second[j] !== undefined) {
									first[i++] = second[j++];
								}
							}

							first.length = i;

							return first;
						})(ret, typeof arr === "string" ? [arr] : arr);
					} else {
						[].push.call(ret, arr);
					}
				}

				return ret;
			}

			if (!elem) {
				return;
			}

			type = (type || "fx") + "queue";

			var q = $.data(elem, type);

			if (!data) {
				return q || [];
			}

			if (!q || $.isArray(data)) {
				q = $.data(elem, type, $makeArray(data));
			} else {
				q.push(data);
			}

			return q;
		};

		/* jQuery 1.4.3 */
		$.dequeue = function(elems, type) {
			/* Custom: Embed element iteration. */
			$.each(elems.nodeType ? [elems] : elems, function(i, elem) {
				type = type || "fx";

				var queue = $.queue(elem, type),
						fn = queue.shift();

				if (fn === "inprogress") {
					fn = queue.shift();
				}

				if (fn) {
					if (type === "fx") {
						queue.unshift("inprogress");
					}

					fn.call(elem, function() {
						$.dequeue(elem, type);
					});
				}
			});
		};

		/******************
		 $.fn Methods
		 ******************/

		/* jQuery */
		$.fn = $.prototype = {
			init: function(selector) {
				/* Just return the element wrapped inside an array; don't proceed with the actual jQuery node wrapping process. */
				if (selector.nodeType) {
					this[0] = selector;

					return this;
				} else {
					throw new Error("Not a DOM node.");
				}
			},
			offset: function() {
				/* jQuery altered code: Dropped disconnected DOM node checking. */
				var box = this[0].getBoundingClientRect ? this[0].getBoundingClientRect() : {top: 0, left: 0};

				return {
					top: box.top + (window.pageYOffset || document.scrollTop || 0) - (document.clientTop || 0),
					left: box.left + (window.pageXOffset || document.scrollLeft || 0) - (document.clientLeft || 0)
				};
			},
			position: function() {
				/* jQuery */
				function offsetParentFn(elem) {
					var offsetParent = elem.offsetParent || document;

					while (offsetParent && (offsetParent.nodeType.toLowerCase !== "html" && offsetParent.style.position === "static")) {
						offsetParent = offsetParent.offsetParent;
					}

					return offsetParent || document;
				}

				/* Zepto */
				var elem = this[0],
						offsetParent = offsetParentFn(elem),
						offset = this.offset(),
						parentOffset = /^(?:body|html)$/i.test(offsetParent.nodeName) ? {top: 0, left: 0} : $(offsetParent).offset();

				offset.top -= parseFloat(elem.style.marginTop) || 0;
				offset.left -= parseFloat(elem.style.marginLeft) || 0;

				if (offsetParent.style) {
					parentOffset.top += parseFloat(offsetParent.style.borderTopWidth) || 0;
					parentOffset.left += parseFloat(offsetParent.style.borderLeftWidth) || 0;
				}

				return {
					top: offset.top - parentOffset.top,
					left: offset.left - parentOffset.left
				};
			}
		};

		/**********************
		 Private Variables
		 **********************/

		/* For $.data() */
		var cache = {};
		$.expando = "velocity" + (new Date().getTime());
		$.uuid = 0;

		/* For $.queue() */
		var class2type = {},
				hasOwn = class2type.hasOwnProperty,
				toString = class2type.toString;

		var types = "Boolean Number String Function Array Date RegExp Object Error".split(" ");
		for (var i = 0; i < types.length; i++) {
			class2type["[object " + types[i] + "]"] = types[i].toLowerCase();
		}

		/* Makes $(node) possible, without having to call init. */
		$.fn.init.prototype = $.fn;

		/* Globalize Velocity onto the window, and assign its Utilities property. */
		window.Velocity = {Utilities: $};
	})(window);

	/******************
	 Velocity.js
	 ******************/

	(function(factory) {
		"use strict";
		/* CommonJS module. */
		if (typeof module === "object" && typeof module.exports === "object") {
			module.exports = factory();
			/* AMD module. */
		} else if (true) {
			!(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
			/* Browser globals. */
		} else {
			factory();
		}
	}(function() {
		"use strict";
		return function(global, window, document, undefined) {

			/***************
			 Summary
			 ***************/

			/*
			 - CSS: CSS stack that works independently from the rest of Velocity.
			 - animate(): Core animation method that iterates over the targeted elements and queues the incoming call onto each element individually.
			 - Pre-Queueing: Prepare the element for animation by instantiating its data cache and processing the call's options.
			 - Queueing: The logic that runs once the call has reached its point of execution in the element's $.queue() stack.
			 Most logic is placed here to avoid risking it becoming stale (if the element's properties have changed).
			 - Pushing: Consolidation of the tween data followed by its push onto the global in-progress calls container.
			 - tick(): The single requestAnimationFrame loop responsible for tweening all in-progress calls.
			 - completeCall(): Handles the cleanup process for each Velocity call.
			 */

			/*********************
			 Helper Functions
			 *********************/

			/* IE detection. Gist: https://gist.github.com/julianshapiro/9098609 */
			var IE = (function() {
				if (document.documentMode) {
					return document.documentMode;
				} else {
					for (var i = 7; i > 4; i--) {
						var div = document.createElement("div");

						div.innerHTML = "<!--[if IE " + i + "]><span></span><![endif]-->";

						if (div.getElementsByTagName("span").length) {
							div = null;

							return i;
						}
					}
				}

				return undefined;
			})();

			/* rAF shim. Gist: https://gist.github.com/julianshapiro/9497513 */
			var rAFShim = (function() {
				var timeLast = 0;

				return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
					var timeCurrent = (new Date()).getTime(),
							timeDelta;

					/* Dynamically set delay on a per-tick basis to match 60fps. */
					/* Technique by Erik Moller. MIT license: https://gist.github.com/paulirish/1579671 */
					timeDelta = Math.max(0, 16 - (timeCurrent - timeLast));
					timeLast = timeCurrent + timeDelta;

					return setTimeout(function() {
						callback(timeCurrent + timeDelta);
					}, timeDelta);
				};
			})();

			/* Array compacting. Copyright Lo-Dash. MIT License: https://github.com/lodash/lodash/blob/master/LICENSE.txt */
			function compactSparseArray(array) {
				var index = -1,
						length = array ? array.length : 0,
						result = [];

				while (++index < length) {
					var value = array[index];

					if (value) {
						result.push(value);
					}
				}

				return result;
			}

			function sanitizeElements(elements) {
				/* Unwrap jQuery/Zepto objects. */
				if (Type.isWrapped(elements)) {
					elements = [].slice.call(elements);
					/* Wrap a single element in an array so that $.each() can iterate with the element instead of its node's children. */
				} else if (Type.isNode(elements)) {
					elements = [elements];
				}

				return elements;
			}

			var Type = {
				isString: function(variable) {
					return (typeof variable === "string");
				},
				isArray: Array.isArray || function(variable) {
					return Object.prototype.toString.call(variable) === "[object Array]";
				},
				isFunction: function(variable) {
					return Object.prototype.toString.call(variable) === "[object Function]";
				},
				isNode: function(variable) {
					return variable && variable.nodeType;
				},
				/* Copyright Martin Bohm. MIT License: https://gist.github.com/Tomalak/818a78a226a0738eaade */
				isNodeList: function(variable) {
					return typeof variable === "object" &&
							/^\[object (HTMLCollection|NodeList|Object)\]$/.test(Object.prototype.toString.call(variable)) &&
							variable.length !== undefined &&
							(variable.length === 0 || (typeof variable[0] === "object" && variable[0].nodeType > 0));
				},
				/* Determine if variable is a wrapped jQuery or Zepto element. */
				isWrapped: function(variable) {
					return variable && (variable.jquery || (window.Zepto && window.Zepto.zepto.isZ(variable)));
				},
				isSVG: function(variable) {
					return window.SVGElement && (variable instanceof window.SVGElement);
				},
				isEmptyObject: function(variable) {
					for (var name in variable) {
						if (variable.hasOwnProperty(name)) {
							return false;
						}
					}

					return true;
				}
			};

			/*****************
			 Dependencies
			 *****************/

			var $,
					isJQuery = false;

			if (global.fn && global.fn.jquery) {
				$ = global;
				isJQuery = true;
			} else {
				$ = window.Velocity.Utilities;
			}

			if (IE <= 8 && !isJQuery) {
				throw new Error("Velocity: IE8 and below require jQuery to be loaded before Velocity.");
			} else if (IE <= 7) {
				/* Revert to jQuery's $.animate(), and lose Velocity's extra features. */
				jQuery.fn.velocity = jQuery.fn.animate;

				/* Now that $.fn.velocity is aliased, abort this Velocity declaration. */
				return;
			}

			/*****************
			 Constants
			 *****************/

			var DURATION_DEFAULT = 400,
					EASING_DEFAULT = "swing";

			/*************
			 State
			 *************/

			var Velocity = {
				/* Container for page-wide Velocity state data. */
				State: {
					/* Detect mobile devices to determine if mobileHA should be turned on. */
					isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
					/* The mobileHA option's behavior changes on older Android devices (Gingerbread, versions 2.3.3-2.3.7). */
					isAndroid: /Android/i.test(navigator.userAgent),
					isGingerbread: /Android 2\.3\.[3-7]/i.test(navigator.userAgent),
					isChrome: window.chrome,
					isFirefox: /Firefox/i.test(navigator.userAgent),
					/* Create a cached element for re-use when checking for CSS property prefixes. */
					prefixElement: document.createElement("div"),
					/* Cache every prefix match to avoid repeating lookups. */
					prefixMatches: {},
					/* Cache the anchor used for animating window scrolling. */
					scrollAnchor: null,
					/* Cache the browser-specific property names associated with the scroll anchor. */
					scrollPropertyLeft: null,
					scrollPropertyTop: null,
					/* Keep track of whether our RAF tick is running. */
					isTicking: false,
					/* Container for every in-progress call to Velocity. */
					calls: []
				},
				/* Velocity's custom CSS stack. Made global for unit testing. */
				CSS: { /* Defined below. */},
				/* A shim of the jQuery utility functions used by Velocity -- provided by Velocity's optional jQuery shim. */
				Utilities: $,
				/* Container for the user's custom animation redirects that are referenced by name in place of the properties map argument. */
				Redirects: { /* Manually registered by the user. */},
				Easings: { /* Defined below. */},
				/* Attempt to use ES6 Promises by default. Users can override this with a third-party promises library. */
				Promise: window.Promise,
				/* Velocity option defaults, which can be overriden by the user. */
				defaults: {
					queue: "",
					duration: DURATION_DEFAULT,
					easing: EASING_DEFAULT,
					begin: undefined,
					complete: undefined,
					progress: undefined,
					display: undefined,
					visibility: undefined,
					loop: false,
					delay: false,
					mobileHA: true,
					/* Advanced: Set to false to prevent property values from being cached between consecutive Velocity-initiated chain calls. */
					_cacheValues: true
				},
				/* A design goal of Velocity is to cache data wherever possible in order to avoid DOM requerying. Accordingly, each element has a data cache. */
				init: function(element) {
					$.data(element, "velocity", {
						/* Store whether this is an SVG element, since its properties are retrieved and updated differently than standard HTML elements. */
						isSVG: Type.isSVG(element),
						/* Keep track of whether the element is currently being animated by Velocity.
						 This is used to ensure that property values are not transferred between non-consecutive (stale) calls. */
						isAnimating: false,
						/* A reference to the element's live computedStyle object. Learn more here: https://developer.mozilla.org/en/docs/Web/API/window.getComputedStyle */
						computedStyle: null,
						/* Tween data is cached for each animation on the element so that data can be passed across calls --
						 in particular, end values are used as subsequent start values in consecutive Velocity calls. */
						tweensContainer: null,
						/* The full root property values of each CSS hook being animated on this element are cached so that:
						 1) Concurrently-animating hooks sharing the same root can have their root values' merged into one while tweening.
						 2) Post-hook-injection root values can be transferred over to consecutively chained Velocity calls as starting root values. */
						rootPropertyValueCache: {},
						/* A cache for transform updates, which must be manually flushed via CSS.flushTransformCache(). */
						transformCache: {}
					});
				},
				/* A parallel to jQuery's $.css(), used for getting/setting Velocity's hooked CSS properties. */
				hook: null, /* Defined below. */
				/* Velocity-wide animation time remapping for testing purposes. */
				mock: false,
				version: {major: 1, minor: 3, patch: 1},
				/* Set to 1 or 2 (most verbose) to output debug info to console. */
				debug: false
			};

			/* Retrieve the appropriate scroll anchor and property name for the browser: https://developer.mozilla.org/en-US/docs/Web/API/Window.scrollY */
			if (window.pageYOffset !== undefined) {
				Velocity.State.scrollAnchor = window;
				Velocity.State.scrollPropertyLeft = "pageXOffset";
				Velocity.State.scrollPropertyTop = "pageYOffset";
			} else {
				Velocity.State.scrollAnchor = document.documentElement || document.body.parentNode || document.body;
				Velocity.State.scrollPropertyLeft = "scrollLeft";
				Velocity.State.scrollPropertyTop = "scrollTop";
			}

			/* Shorthand alias for jQuery's $.data() utility. */
			function Data(element) {
				/* Hardcode a reference to the plugin name. */
				var response = $.data(element, "velocity");

				/* jQuery <=1.4.2 returns null instead of undefined when no match is found. We normalize this behavior. */
				return response === null ? undefined : response;
			}

			/**************
			 Easing
			 **************/

			/* Step easing generator. */
			function generateStep(steps) {
				return function(p) {
					return Math.round(p * steps) * (1 / steps);
				};
			}

			/* Bezier curve function generator. Copyright Gaetan Renaudeau. MIT License: http://en.wikipedia.org/wiki/MIT_License */
			function generateBezier(mX1, mY1, mX2, mY2) {
				var NEWTON_ITERATIONS = 4,
						NEWTON_MIN_SLOPE = 0.001,
						SUBDIVISION_PRECISION = 0.0000001,
						SUBDIVISION_MAX_ITERATIONS = 10,
						kSplineTableSize = 11,
						kSampleStepSize = 1.0 / (kSplineTableSize - 1.0),
						float32ArraySupported = "Float32Array" in window;

				/* Must contain four arguments. */
				if (arguments.length !== 4) {
					return false;
				}

				/* Arguments must be numbers. */
				for (var i = 0; i < 4; ++i) {
					if (typeof arguments[i] !== "number" || isNaN(arguments[i]) || !isFinite(arguments[i])) {
						return false;
					}
				}

				/* X values must be in the [0, 1] range. */
				mX1 = Math.min(mX1, 1);
				mX2 = Math.min(mX2, 1);
				mX1 = Math.max(mX1, 0);
				mX2 = Math.max(mX2, 0);

				var mSampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);

				function A(aA1, aA2) {
					return 1.0 - 3.0 * aA2 + 3.0 * aA1;
				}
				function B(aA1, aA2) {
					return 3.0 * aA2 - 6.0 * aA1;
				}
				function C(aA1) {
					return 3.0 * aA1;
				}

				function calcBezier(aT, aA1, aA2) {
					return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
				}

				function getSlope(aT, aA1, aA2) {
					return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
				}

				function newtonRaphsonIterate(aX, aGuessT) {
					for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
						var currentSlope = getSlope(aGuessT, mX1, mX2);

						if (currentSlope === 0.0) {
							return aGuessT;
						}

						var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
						aGuessT -= currentX / currentSlope;
					}

					return aGuessT;
				}

				function calcSampleValues() {
					for (var i = 0; i < kSplineTableSize; ++i) {
						mSampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
					}
				}

				function binarySubdivide(aX, aA, aB) {
					var currentX, currentT, i = 0;

					do {
						currentT = aA + (aB - aA) / 2.0;
						currentX = calcBezier(currentT, mX1, mX2) - aX;
						if (currentX > 0.0) {
							aB = currentT;
						} else {
							aA = currentT;
						}
					} while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);

					return currentT;
				}

				function getTForX(aX) {
					var intervalStart = 0.0,
							currentSample = 1,
							lastSample = kSplineTableSize - 1;

					for (; currentSample !== lastSample && mSampleValues[currentSample] <= aX; ++currentSample) {
						intervalStart += kSampleStepSize;
					}

					--currentSample;

					var dist = (aX - mSampleValues[currentSample]) / (mSampleValues[currentSample + 1] - mSampleValues[currentSample]),
							guessForT = intervalStart + dist * kSampleStepSize,
							initialSlope = getSlope(guessForT, mX1, mX2);

					if (initialSlope >= NEWTON_MIN_SLOPE) {
						return newtonRaphsonIterate(aX, guessForT);
					} else if (initialSlope === 0.0) {
						return guessForT;
					} else {
						return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize);
					}
				}

				var _precomputed = false;

				function precompute() {
					_precomputed = true;
					if (mX1 !== mY1 || mX2 !== mY2) {
						calcSampleValues();
					}
				}

				var f = function(aX) {
					if (!_precomputed) {
						precompute();
					}
					if (mX1 === mY1 && mX2 === mY2) {
						return aX;
					}
					if (aX === 0) {
						return 0;
					}
					if (aX === 1) {
						return 1;
					}

					return calcBezier(getTForX(aX), mY1, mY2);
				};

				f.getControlPoints = function() {
					return [{x: mX1, y: mY1}, {x: mX2, y: mY2}];
				};

				var str = "generateBezier(" + [mX1, mY1, mX2, mY2] + ")";
				f.toString = function() {
					return str;
				};

				return f;
			}

			/* Runge-Kutta spring physics function generator. Adapted from Framer.js, copyright Koen Bok. MIT License: http://en.wikipedia.org/wiki/MIT_License */
			/* Given a tension, friction, and duration, a simulation at 60FPS will first run without a defined duration in order to calculate the full path. A second pass
			 then adjusts the time delta -- using the relation between actual time and duration -- to calculate the path for the duration-constrained animation. */
			var generateSpringRK4 = (function() {
				function springAccelerationForState(state) {
					return (-state.tension * state.x) - (state.friction * state.v);
				}

				function springEvaluateStateWithDerivative(initialState, dt, derivative) {
					var state = {
						x: initialState.x + derivative.dx * dt,
						v: initialState.v + derivative.dv * dt,
						tension: initialState.tension,
						friction: initialState.friction
					};

					return {dx: state.v, dv: springAccelerationForState(state)};
				}

				function springIntegrateState(state, dt) {
					var a = {
						dx: state.v,
						dv: springAccelerationForState(state)
					},
					b = springEvaluateStateWithDerivative(state, dt * 0.5, a),
							c = springEvaluateStateWithDerivative(state, dt * 0.5, b),
							d = springEvaluateStateWithDerivative(state, dt, c),
							dxdt = 1.0 / 6.0 * (a.dx + 2.0 * (b.dx + c.dx) + d.dx),
							dvdt = 1.0 / 6.0 * (a.dv + 2.0 * (b.dv + c.dv) + d.dv);

					state.x = state.x + dxdt * dt;
					state.v = state.v + dvdt * dt;

					return state;
				}

				return function springRK4Factory(tension, friction, duration) {

					var initState = {
						x: -1,
						v: 0,
						tension: null,
						friction: null
					},
					path = [0],
							time_lapsed = 0,
							tolerance = 1 / 10000,
							DT = 16 / 1000,
							have_duration, dt, last_state;

					tension = parseFloat(tension) || 500;
					friction = parseFloat(friction) || 20;
					duration = duration || null;

					initState.tension = tension;
					initState.friction = friction;

					have_duration = duration !== null;

					/* Calculate the actual time it takes for this animation to complete with the provided conditions. */
					if (have_duration) {
						/* Run the simulation without a duration. */
						time_lapsed = springRK4Factory(tension, friction);
						/* Compute the adjusted time delta. */
						dt = time_lapsed / duration * DT;
					} else {
						dt = DT;
					}

					while (true) {
						/* Next/step function .*/
						last_state = springIntegrateState(last_state || initState, dt);
						/* Store the position. */
						path.push(1 + last_state.x);
						time_lapsed += 16;
						/* If the change threshold is reached, break. */
						if (!(Math.abs(last_state.x) > tolerance && Math.abs(last_state.v) > tolerance)) {
							break;
						}
					}

					/* If duration is not defined, return the actual time required for completing this animation. Otherwise, return a closure that holds the
					 computed path and returns a snapshot of the position according to a given percentComplete. */
					return !have_duration ? time_lapsed : function(percentComplete) {
						return path[ (percentComplete * (path.length - 1)) | 0 ];
					};
				};
			}());

			/* jQuery easings. */
			Velocity.Easings = {
				linear: function(p) {
					return p;
				},
				swing: function(p) {
					return 0.5 - Math.cos(p * Math.PI) / 2;
				},
				/* Bonus "spring" easing, which is a less exaggerated version of easeInOutElastic. */
				spring: function(p) {
					return 1 - (Math.cos(p * 4.5 * Math.PI) * Math.exp(-p * 6));
				}
			};

			/* CSS3 and Robert Penner easings. */
			$.each(
					[
						["ease", [0.25, 0.1, 0.25, 1.0]],
						["ease-in", [0.42, 0.0, 1.00, 1.0]],
						["ease-out", [0.00, 0.0, 0.58, 1.0]],
						["ease-in-out", [0.42, 0.0, 0.58, 1.0]],
						["easeInSine", [0.47, 0, 0.745, 0.715]],
						["easeOutSine", [0.39, 0.575, 0.565, 1]],
						["easeInOutSine", [0.445, 0.05, 0.55, 0.95]],
						["easeInQuad", [0.55, 0.085, 0.68, 0.53]],
						["easeOutQuad", [0.25, 0.46, 0.45, 0.94]],
						["easeInOutQuad", [0.455, 0.03, 0.515, 0.955]],
						["easeInCubic", [0.55, 0.055, 0.675, 0.19]],
						["easeOutCubic", [0.215, 0.61, 0.355, 1]],
						["easeInOutCubic", [0.645, 0.045, 0.355, 1]],
						["easeInQuart", [0.895, 0.03, 0.685, 0.22]],
						["easeOutQuart", [0.165, 0.84, 0.44, 1]],
						["easeInOutQuart", [0.77, 0, 0.175, 1]],
						["easeInQuint", [0.755, 0.05, 0.855, 0.06]],
						["easeOutQuint", [0.23, 1, 0.32, 1]],
						["easeInOutQuint", [0.86, 0, 0.07, 1]],
						["easeInExpo", [0.95, 0.05, 0.795, 0.035]],
						["easeOutExpo", [0.19, 1, 0.22, 1]],
						["easeInOutExpo", [1, 0, 0, 1]],
						["easeInCirc", [0.6, 0.04, 0.98, 0.335]],
						["easeOutCirc", [0.075, 0.82, 0.165, 1]],
						["easeInOutCirc", [0.785, 0.135, 0.15, 0.86]]
					], function(i, easingArray) {
				Velocity.Easings[easingArray[0]] = generateBezier.apply(null, easingArray[1]);
			});

			/* Determine the appropriate easing type given an easing input. */
			function getEasing(value, duration) {
				var easing = value;

				/* The easing option can either be a string that references a pre-registered easing,
				 or it can be a two-/four-item array of integers to be converted into a bezier/spring function. */
				if (Type.isString(value)) {
					/* Ensure that the easing has been assigned to jQuery's Velocity.Easings object. */
					if (!Velocity.Easings[value]) {
						easing = false;
					}
				} else if (Type.isArray(value) && value.length === 1) {
					easing = generateStep.apply(null, value);
				} else if (Type.isArray(value) && value.length === 2) {
					/* springRK4 must be passed the animation's duration. */
					/* Note: If the springRK4 array contains non-numbers, generateSpringRK4() returns an easing
					 function generated with default tension and friction values. */
					easing = generateSpringRK4.apply(null, value.concat([duration]));
				} else if (Type.isArray(value) && value.length === 4) {
					/* Note: If the bezier array contains non-numbers, generateBezier() returns false. */
					easing = generateBezier.apply(null, value);
				} else {
					easing = false;
				}

				/* Revert to the Velocity-wide default easing type, or fall back to "swing" (which is also jQuery's default)
				 if the Velocity-wide default has been incorrectly modified. */
				if (easing === false) {
					if (Velocity.Easings[Velocity.defaults.easing]) {
						easing = Velocity.defaults.easing;
					} else {
						easing = EASING_DEFAULT;
					}
				}

				return easing;
			}

			/*****************
			 CSS Stack
			 *****************/

			/* The CSS object is a highly condensed and performant CSS stack that fully replaces jQuery's.
			 It handles the validation, getting, and setting of both standard CSS properties and CSS property hooks. */
			/* Note: A "CSS" shorthand is aliased so that our code is easier to read. */
			var CSS = Velocity.CSS = {
				/*************
				 RegEx
				 *************/

				RegEx: {
					isHex: /^#([A-f\d]{3}){1,2}$/i,
					/* Unwrap a property value's surrounding text, e.g. "rgba(4, 3, 2, 1)" ==> "4, 3, 2, 1" and "rect(4px 3px 2px 1px)" ==> "4px 3px 2px 1px". */
					valueUnwrap: /^[A-z]+\((.*)\)$/i,
					wrappedValueAlreadyExtracted: /[0-9.]+ [0-9.]+ [0-9.]+( [0-9.]+)?/,
					/* Split a multi-value property into an array of subvalues, e.g. "rgba(4, 3, 2, 1) 4px 3px 2px 1px" ==> [ "rgba(4, 3, 2, 1)", "4px", "3px", "2px", "1px" ]. */
					valueSplit: /([A-z]+\(.+\))|(([A-z0-9#-.]+?)(?=\s|$))/ig
				},
				/************
				 Lists
				 ************/

				Lists: {
					colors: ["fill", "stroke", "stopColor", "color", "backgroundColor", "borderColor", "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor", "outlineColor"],
					transformsBase: ["translateX", "translateY", "scale", "scaleX", "scaleY", "skewX", "skewY", "rotateZ"],
					transforms3D: ["transformPerspective", "translateZ", "scaleZ", "rotateX", "rotateY"]
				},
				/************
				 Hooks
				 ************/

				/* Hooks allow a subproperty (e.g. "boxShadowBlur") of a compound-value CSS property
				 (e.g. "boxShadow: X Y Blur Spread Color") to be animated as if it were a discrete property. */
				/* Note: Beyond enabling fine-grained property animation, hooking is necessary since Velocity only
				 tweens properties with single numeric values; unlike CSS transitions, Velocity does not interpolate compound-values. */
				Hooks: {
					/********************
					 Registration
					 ********************/

					/* Templates are a concise way of indicating which subproperties must be individually registered for each compound-value CSS property. */
					/* Each template consists of the compound-value's base name, its constituent subproperty names, and those subproperties' default values. */
					templates: {
						"textShadow": ["Color X Y Blur", "black 0px 0px 0px"],
						"boxShadow": ["Color X Y Blur Spread", "black 0px 0px 0px 0px"],
						"clip": ["Top Right Bottom Left", "0px 0px 0px 0px"],
						"backgroundPosition": ["X Y", "0% 0%"],
						"transformOrigin": ["X Y Z", "50% 50% 0px"],
						"perspectiveOrigin": ["X Y", "50% 50%"]
					},
					/* A "registered" hook is one that has been converted from its template form into a live,
					 tweenable property. It contains data to associate it with its root property. */
					registered: {
						/* Note: A registered hook looks like this ==> textShadowBlur: [ "textShadow", 3 ],
						 which consists of the subproperty's name, the associated root property's name,
						 and the subproperty's position in the root's value. */
					},
					/* Convert the templates into individual hooks then append them to the registered object above. */
					register: function() {
						/* Color hooks registration: Colors are defaulted to white -- as opposed to black -- since colors that are
						 currently set to "transparent" default to their respective template below when color-animated,
						 and white is typically a closer match to transparent than black is. An exception is made for text ("color"),
						 which is almost always set closer to black than white. */
						for (var i = 0; i < CSS.Lists.colors.length; i++) {
							var rgbComponents = (CSS.Lists.colors[i] === "color") ? "0 0 0 1" : "255 255 255 1";
							CSS.Hooks.templates[CSS.Lists.colors[i]] = ["Red Green Blue Alpha", rgbComponents];
						}

						var rootProperty,
								hookTemplate,
								hookNames;

						/* In IE, color values inside compound-value properties are positioned at the end the value instead of at the beginning.
						 Thus, we re-arrange the templates accordingly. */
						if (IE) {
							for (rootProperty in CSS.Hooks.templates) {
								if (!CSS.Hooks.templates.hasOwnProperty(rootProperty)) {
									continue;
								}
								hookTemplate = CSS.Hooks.templates[rootProperty];
								hookNames = hookTemplate[0].split(" ");

								var defaultValues = hookTemplate[1].match(CSS.RegEx.valueSplit);

								if (hookNames[0] === "Color") {
									/* Reposition both the hook's name and its default value to the end of their respective strings. */
									hookNames.push(hookNames.shift());
									defaultValues.push(defaultValues.shift());

									/* Replace the existing template for the hook's root property. */
									CSS.Hooks.templates[rootProperty] = [hookNames.join(" "), defaultValues.join(" ")];
								}
							}
						}

						/* Hook registration. */
						for (rootProperty in CSS.Hooks.templates) {
							if (!CSS.Hooks.templates.hasOwnProperty(rootProperty)) {
								continue;
							}
							hookTemplate = CSS.Hooks.templates[rootProperty];
							hookNames = hookTemplate[0].split(" ");

							for (var j in hookNames) {
								if (!hookNames.hasOwnProperty(j)) {
									continue;
								}
								var fullHookName = rootProperty + hookNames[j],
										hookPosition = j;

								/* For each hook, register its full name (e.g. textShadowBlur) with its root property (e.g. textShadow)
								 and the hook's position in its template's default value string. */
								CSS.Hooks.registered[fullHookName] = [rootProperty, hookPosition];
							}
						}
					},
					/*****************************
					 Injection and Extraction
					 *****************************/

					/* Look up the root property associated with the hook (e.g. return "textShadow" for "textShadowBlur"). */
					/* Since a hook cannot be set directly (the browser won't recognize it), style updating for hooks is routed through the hook's root property. */
					getRoot: function(property) {
						var hookData = CSS.Hooks.registered[property];

						if (hookData) {
							return hookData[0];
						} else {
							/* If there was no hook match, return the property name untouched. */
							return property;
						}
					},
					/* Convert any rootPropertyValue, null or otherwise, into a space-delimited list of hook values so that
					 the targeted hook can be injected or extracted at its standard position. */
					cleanRootPropertyValue: function(rootProperty, rootPropertyValue) {
						/* If the rootPropertyValue is wrapped with "rgb()", "clip()", etc., remove the wrapping to normalize the value before manipulation. */
						if (CSS.RegEx.valueUnwrap.test(rootPropertyValue)) {
							rootPropertyValue = rootPropertyValue.match(CSS.RegEx.valueUnwrap)[1];
						}

						/* If rootPropertyValue is a CSS null-value (from which there's inherently no hook value to extract),
						 default to the root's default value as defined in CSS.Hooks.templates. */
						/* Note: CSS null-values include "none", "auto", and "transparent". They must be converted into their
						 zero-values (e.g. textShadow: "none" ==> textShadow: "0px 0px 0px black") for hook manipulation to proceed. */
						if (CSS.Values.isCSSNullValue(rootPropertyValue)) {
							rootPropertyValue = CSS.Hooks.templates[rootProperty][1];
						}

						return rootPropertyValue;
					},
					/* Extracted the hook's value from its root property's value. This is used to get the starting value of an animating hook. */
					extractValue: function(fullHookName, rootPropertyValue) {
						var hookData = CSS.Hooks.registered[fullHookName];

						if (hookData) {
							var hookRoot = hookData[0],
									hookPosition = hookData[1];

							rootPropertyValue = CSS.Hooks.cleanRootPropertyValue(hookRoot, rootPropertyValue);

							/* Split rootPropertyValue into its constituent hook values then grab the desired hook at its standard position. */
							return rootPropertyValue.toString().match(CSS.RegEx.valueSplit)[hookPosition];
						} else {
							/* If the provided fullHookName isn't a registered hook, return the rootPropertyValue that was passed in. */
							return rootPropertyValue;
						}
					},
					/* Inject the hook's value into its root property's value. This is used to piece back together the root property
					 once Velocity has updated one of its individually hooked values through tweening. */
					injectValue: function(fullHookName, hookValue, rootPropertyValue) {
						var hookData = CSS.Hooks.registered[fullHookName];

						if (hookData) {
							var hookRoot = hookData[0],
									hookPosition = hookData[1],
									rootPropertyValueParts,
									rootPropertyValueUpdated;

							rootPropertyValue = CSS.Hooks.cleanRootPropertyValue(hookRoot, rootPropertyValue);

							/* Split rootPropertyValue into its individual hook values, replace the targeted value with hookValue,
							 then reconstruct the rootPropertyValue string. */
							rootPropertyValueParts = rootPropertyValue.toString().match(CSS.RegEx.valueSplit);
							rootPropertyValueParts[hookPosition] = hookValue;
							rootPropertyValueUpdated = rootPropertyValueParts.join(" ");

							return rootPropertyValueUpdated;
						} else {
							/* If the provided fullHookName isn't a registered hook, return the rootPropertyValue that was passed in. */
							return rootPropertyValue;
						}
					}
				},
				/*******************
				 Normalizations
				 *******************/

				/* Normalizations standardize CSS property manipulation by pollyfilling browser-specific implementations (e.g. opacity)
				 and reformatting special properties (e.g. clip, rgba) to look like standard ones. */
				Normalizations: {
					/* Normalizations are passed a normalization target (either the property's name, its extracted value, or its injected value),
					 the targeted element (which may need to be queried), and the targeted property value. */
					registered: {
						clip: function(type, element, propertyValue) {
							switch (type) {
								case "name":
									return "clip";
									/* Clip needs to be unwrapped and stripped of its commas during extraction. */
								case "extract":
									var extracted;

									/* If Velocity also extracted this value, skip extraction. */
									if (CSS.RegEx.wrappedValueAlreadyExtracted.test(propertyValue)) {
										extracted = propertyValue;
									} else {
										/* Remove the "rect()" wrapper. */
										extracted = propertyValue.toString().match(CSS.RegEx.valueUnwrap);

										/* Strip off commas. */
										extracted = extracted ? extracted[1].replace(/,(\s+)?/g, " ") : propertyValue;
									}

									return extracted;
									/* Clip needs to be re-wrapped during injection. */
								case "inject":
									return "rect(" + propertyValue + ")";
							}
						},
						blur: function(type, element, propertyValue) {
							switch (type) {
								case "name":
									return Velocity.State.isFirefox ? "filter" : "-webkit-filter";
								case "extract":
									var extracted = parseFloat(propertyValue);

									/* If extracted is NaN, meaning the value isn't already extracted. */
									if (!(extracted || extracted === 0)) {
										var blurComponent = propertyValue.toString().match(/blur\(([0-9]+[A-z]+)\)/i);

										/* If the filter string had a blur component, return just the blur value and unit type. */
										if (blurComponent) {
											extracted = blurComponent[1];
											/* If the component doesn't exist, default blur to 0. */
										} else {
											extracted = 0;
										}
									}

									return extracted;
									/* Blur needs to be re-wrapped during injection. */
								case "inject":
									/* For the blur effect to be fully de-applied, it needs to be set to "none" instead of 0. */
									if (!parseFloat(propertyValue)) {
										return "none";
									} else {
										return "blur(" + propertyValue + ")";
									}
							}
						},
						/* <=IE8 do not support the standard opacity property. They use filter:alpha(opacity=INT) instead. */
						opacity: function(type, element, propertyValue) {
							if (IE <= 8) {
								switch (type) {
									case "name":
										return "filter";
									case "extract":
										/* <=IE8 return a "filter" value of "alpha(opacity=\d{1,3})".
										 Extract the value and convert it to a decimal value to match the standard CSS opacity property's formatting. */
										var extracted = propertyValue.toString().match(/alpha\(opacity=(.*)\)/i);

										if (extracted) {
											/* Convert to decimal value. */
											propertyValue = extracted[1] / 100;
										} else {
											/* When extracting opacity, default to 1 since a null value means opacity hasn't been set. */
											propertyValue = 1;
										}

										return propertyValue;
									case "inject":
										/* Opacified elements are required to have their zoom property set to a non-zero value. */
										element.style.zoom = 1;

										/* Setting the filter property on elements with certain font property combinations can result in a
										 highly unappealing ultra-bolding effect. There's no way to remedy this throughout a tween, but dropping the
										 value altogether (when opacity hits 1) at leasts ensures that the glitch is gone post-tweening. */
										if (parseFloat(propertyValue) >= 1) {
											return "";
										} else {
											/* As per the filter property's spec, convert the decimal value to a whole number and wrap the value. */
											return "alpha(opacity=" + parseInt(parseFloat(propertyValue) * 100, 10) + ")";
										}
								}
								/* With all other browsers, normalization is not required; return the same values that were passed in. */
							} else {
								switch (type) {
									case "name":
										return "opacity";
									case "extract":
										return propertyValue;
									case "inject":
										return propertyValue;
								}
							}
						}
					},
					/*****************************
					 Batched Registrations
					 *****************************/

					/* Note: Batched normalizations extend the CSS.Normalizations.registered object. */
					register: function() {

						/*****************
						 Transforms
						 *****************/

						/* Transforms are the subproperties contained by the CSS "transform" property. Transforms must undergo normalization
						 so that they can be referenced in a properties map by their individual names. */
						/* Note: When transforms are "set", they are actually assigned to a per-element transformCache. When all transform
						 setting is complete complete, CSS.flushTransformCache() must be manually called to flush the values to the DOM.
						 Transform setting is batched in this way to improve performance: the transform style only needs to be updated
						 once when multiple transform subproperties are being animated simultaneously. */
						/* Note: IE9 and Android Gingerbread have support for 2D -- but not 3D -- transforms. Since animating unsupported
						 transform properties results in the browser ignoring the *entire* transform string, we prevent these 3D values
						 from being normalized for these browsers so that tweening skips these properties altogether
						 (since it will ignore them as being unsupported by the browser.) */
						if ((!IE || IE > 9) && !Velocity.State.isGingerbread) {
							/* Note: Since the standalone CSS "perspective" property and the CSS transform "perspective" subproperty
							 share the same name, the latter is given a unique token within Velocity: "transformPerspective". */
							CSS.Lists.transformsBase = CSS.Lists.transformsBase.concat(CSS.Lists.transforms3D);
						}

						for (var i = 0; i < CSS.Lists.transformsBase.length; i++) {
							/* Wrap the dynamically generated normalization function in a new scope so that transformName's value is
							 paired with its respective function. (Otherwise, all functions would take the final for loop's transformName.) */
							(function() {
								var transformName = CSS.Lists.transformsBase[i];

								CSS.Normalizations.registered[transformName] = function(type, element, propertyValue) {
									switch (type) {
										/* The normalized property name is the parent "transform" property -- the property that is actually set in CSS. */
										case "name":
											return "transform";
											/* Transform values are cached onto a per-element transformCache object. */
										case "extract":
											/* If this transform has yet to be assigned a value, return its null value. */
											if (Data(element) === undefined || Data(element).transformCache[transformName] === undefined) {
												/* Scale CSS.Lists.transformsBase default to 1 whereas all other transform properties default to 0. */
												return /^scale/i.test(transformName) ? 1 : 0;
												/* When transform values are set, they are wrapped in parentheses as per the CSS spec.
												 Thus, when extracting their values (for tween calculations), we strip off the parentheses. */
											}
											return Data(element).transformCache[transformName].replace(/[()]/g, "");
										case "inject":
											var invalid = false;

											/* If an individual transform property contains an unsupported unit type, the browser ignores the *entire* transform property.
											 Thus, protect users from themselves by skipping setting for transform values supplied with invalid unit types. */
											/* Switch on the base transform type; ignore the axis by removing the last letter from the transform's name. */
											switch (transformName.substr(0, transformName.length - 1)) {
												/* Whitelist unit types for each transform. */
												case "translate":
													invalid = !/(%|px|em|rem|vw|vh|\d)$/i.test(propertyValue);
													break;
													/* Since an axis-free "scale" property is supported as well, a little hack is used here to detect it by chopping off its last letter. */
												case "scal":
												case "scale":
													/* Chrome on Android has a bug in which scaled elements blur if their initial scale
													 value is below 1 (which can happen with forcefeeding). Thus, we detect a yet-unset scale property
													 and ensure that its first value is always 1. More info: http://stackoverflow.com/questions/10417890/css3-animations-with-transform-causes-blurred-elements-on-webkit/10417962#10417962 */
													if (Velocity.State.isAndroid && Data(element).transformCache[transformName] === undefined && propertyValue < 1) {
														propertyValue = 1;
													}

													invalid = !/(\d)$/i.test(propertyValue);
													break;
												case "skew":
													invalid = !/(deg|\d)$/i.test(propertyValue);
													break;
												case "rotate":
													invalid = !/(deg|\d)$/i.test(propertyValue);
													break;
											}

											if (!invalid) {
												/* As per the CSS spec, wrap the value in parentheses. */
												Data(element).transformCache[transformName] = "(" + propertyValue + ")";
											}

											/* Although the value is set on the transformCache object, return the newly-updated value for the calling code to process as normal. */
											return Data(element).transformCache[transformName];
									}
								};
							})();
						}

						/*************
						 Colors
						 *************/

						/* Since Velocity only animates a single numeric value per property, color animation is achieved by hooking the individual RGBA components of CSS color properties.
						 Accordingly, color values must be normalized (e.g. "#ff0000", "red", and "rgb(255, 0, 0)" ==> "255 0 0 1") so that their components can be injected/extracted by CSS.Hooks logic. */
						for (var j = 0; j < CSS.Lists.colors.length; j++) {
							/* Wrap the dynamically generated normalization function in a new scope so that colorName's value is paired with its respective function.
							 (Otherwise, all functions would take the final for loop's colorName.) */
							(function() {
								var colorName = CSS.Lists.colors[j];

								/* Note: In IE<=8, which support rgb but not rgba, color properties are reverted to rgb by stripping off the alpha component. */
								CSS.Normalizations.registered[colorName] = function(type, element, propertyValue) {
									switch (type) {
										case "name":
											return colorName;
											/* Convert all color values into the rgb format. (Old IE can return hex values and color names instead of rgb/rgba.) */
										case "extract":
											var extracted;

											/* If the color is already in its hookable form (e.g. "255 255 255 1") due to having been previously extracted, skip extraction. */
											if (CSS.RegEx.wrappedValueAlreadyExtracted.test(propertyValue)) {
												extracted = propertyValue;
											} else {
												var converted,
														colorNames = {
															black: "rgb(0, 0, 0)",
															blue: "rgb(0, 0, 255)",
															gray: "rgb(128, 128, 128)",
															green: "rgb(0, 128, 0)",
															red: "rgb(255, 0, 0)",
															white: "rgb(255, 255, 255)"
														};

												/* Convert color names to rgb. */
												if (/^[A-z]+$/i.test(propertyValue)) {
													if (colorNames[propertyValue] !== undefined) {
														converted = colorNames[propertyValue];
													} else {
														/* If an unmatched color name is provided, default to black. */
														converted = colorNames.black;
													}
													/* Convert hex values to rgb. */
												} else if (CSS.RegEx.isHex.test(propertyValue)) {
													converted = "rgb(" + CSS.Values.hexToRgb(propertyValue).join(" ") + ")";
													/* If the provided color doesn't match any of the accepted color formats, default to black. */
												} else if (!(/^rgba?\(/i.test(propertyValue))) {
													converted = colorNames.black;
												}

												/* Remove the surrounding "rgb/rgba()" string then replace commas with spaces and strip
												 repeated spaces (in case the value included spaces to begin with). */
												extracted = (converted || propertyValue).toString().match(CSS.RegEx.valueUnwrap)[1].replace(/,(\s+)?/g, " ");
											}

											/* So long as this isn't <=IE8, add a fourth (alpha) component if it's missing and default it to 1 (visible). */
											if ((!IE || IE > 8) && extracted.split(" ").length === 3) {
												extracted += " 1";
											}

											return extracted;
										case "inject":
											/* If this is IE<=8 and an alpha component exists, strip it off. */
											if (IE <= 8) {
												if (propertyValue.split(" ").length === 4) {
													propertyValue = propertyValue.split(/\s+/).slice(0, 3).join(" ");
												}
												/* Otherwise, add a fourth (alpha) component if it's missing and default it to 1 (visible). */
											} else if (propertyValue.split(" ").length === 3) {
												propertyValue += " 1";
											}

											/* Re-insert the browser-appropriate wrapper("rgb/rgba()"), insert commas, and strip off decimal units
											 on all values but the fourth (R, G, and B only accept whole numbers). */
											return (IE <= 8 ? "rgb" : "rgba") + "(" + propertyValue.replace(/\s+/g, ",").replace(/\.(\d)+(?=,)/g, "") + ")";
									}
								};
							})();
						}
					}
				},
				/************************
				 CSS Property Names
				 ************************/

				Names: {
					/* Camelcase a property name into its JavaScript notation (e.g. "background-color" ==> "backgroundColor").
					 Camelcasing is used to normalize property names between and across calls. */
					camelCase: function(property) {
						return property.replace(/-(\w)/g, function(match, subMatch) {
							return subMatch.toUpperCase();
						});
					},
					/* For SVG elements, some properties (namely, dimensional ones) are GET/SET via the element's HTML attributes (instead of via CSS styles). */
					SVGAttribute: function(property) {
						var SVGAttributes = "width|height|x|y|cx|cy|r|rx|ry|x1|x2|y1|y2";

						/* Certain browsers require an SVG transform to be applied as an attribute. (Otherwise, application via CSS is preferable due to 3D support.) */
						if (IE || (Velocity.State.isAndroid && !Velocity.State.isChrome)) {
							SVGAttributes += "|transform";
						}

						return new RegExp("^(" + SVGAttributes + ")$", "i").test(property);
					},
					/* Determine whether a property should be set with a vendor prefix. */
					/* If a prefixed version of the property exists, return it. Otherwise, return the original property name.
					 If the property is not at all supported by the browser, return a false flag. */
					prefixCheck: function(property) {
						/* If this property has already been checked, return the cached value. */
						if (Velocity.State.prefixMatches[property]) {
							return [Velocity.State.prefixMatches[property], true];
						} else {
							var vendors = ["", "Webkit", "Moz", "ms", "O"];

							for (var i = 0, vendorsLength = vendors.length; i < vendorsLength; i++) {
								var propertyPrefixed;

								if (i === 0) {
									propertyPrefixed = property;
								} else {
									/* Capitalize the first letter of the property to conform to JavaScript vendor prefix notation (e.g. webkitFilter). */
									propertyPrefixed = vendors[i] + property.replace(/^\w/, function(match) {
										return match.toUpperCase();
									});
								}

								/* Check if the browser supports this property as prefixed. */
								if (Type.isString(Velocity.State.prefixElement.style[propertyPrefixed])) {
									/* Cache the match. */
									Velocity.State.prefixMatches[property] = propertyPrefixed;

									return [propertyPrefixed, true];
								}
							}

							/* If the browser doesn't support this property in any form, include a false flag so that the caller can decide how to proceed. */
							return [property, false];
						}
					}
				},
				/************************
				 CSS Property Values
				 ************************/

				Values: {
					/* Hex to RGB conversion. Copyright Tim Down: http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb */
					hexToRgb: function(hex) {
						var shortformRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
								longformRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i,
								rgbParts;

						hex = hex.replace(shortformRegex, function(m, r, g, b) {
							return r + r + g + g + b + b;
						});

						rgbParts = longformRegex.exec(hex);

						return rgbParts ? [parseInt(rgbParts[1], 16), parseInt(rgbParts[2], 16), parseInt(rgbParts[3], 16)] : [0, 0, 0];
					},
					isCSSNullValue: function(value) {
						/* The browser defaults CSS values that have not been set to either 0 or one of several possible null-value strings.
						 Thus, we check for both falsiness and these special strings. */
						/* Null-value checking is performed to default the special strings to 0 (for the sake of tweening) or their hook
						 templates as defined as CSS.Hooks (for the sake of hook injection/extraction). */
						/* Note: Chrome returns "rgba(0, 0, 0, 0)" for an undefined color whereas IE returns "transparent". */
						return (!value || /^(none|auto|transparent|(rgba\(0, ?0, ?0, ?0\)))$/i.test(value));
					},
					/* Retrieve a property's default unit type. Used for assigning a unit type when one is not supplied by the user. */
					getUnitType: function(property) {
						if (/^(rotate|skew)/i.test(property)) {
							return "deg";
						} else if (/(^(scale|scaleX|scaleY|scaleZ|alpha|flexGrow|flexHeight|zIndex|fontWeight)$)|((opacity|red|green|blue|alpha)$)/i.test(property)) {
							/* The above properties are unitless. */
							return "";
						} else {
							/* Default to px for all other properties. */
							return "px";
						}
					},
					/* HTML elements default to an associated display type when they're not set to display:none. */
					/* Note: This function is used for correctly setting the non-"none" display value in certain Velocity redirects, such as fadeIn/Out. */
					getDisplayType: function(element) {
						var tagName = element && element.tagName.toString().toLowerCase();

						if (/^(b|big|i|small|tt|abbr|acronym|cite|code|dfn|em|kbd|strong|samp|var|a|bdo|br|img|map|object|q|script|span|sub|sup|button|input|label|select|textarea)$/i.test(tagName)) {
							return "inline";
						} else if (/^(li)$/i.test(tagName)) {
							return "list-item";
						} else if (/^(tr)$/i.test(tagName)) {
							return "table-row";
						} else if (/^(table)$/i.test(tagName)) {
							return "table";
						} else if (/^(tbody)$/i.test(tagName)) {
							return "table-row-group";
							/* Default to "block" when no match is found. */
						} else {
							return "block";
						}
					},
					/* The class add/remove functions are used to temporarily apply a "velocity-animating" class to elements while they're animating. */
					addClass: function(element, className) {
						if (element.classList) {
							element.classList.add(className);
						} else {
							element.className += (element.className.length ? " " : "") + className;
						}
					},
					removeClass: function(element, className) {
						if (element.classList) {
							element.classList.remove(className);
						} else {
							element.className = element.className.toString().replace(new RegExp("(^|\\s)" + className.split(" ").join("|") + "(\\s|$)", "gi"), " ");
						}
					}
				},
				/****************************
				 Style Getting & Setting
				 ****************************/

				/* The singular getPropertyValue, which routes the logic for all normalizations, hooks, and standard CSS properties. */
				getPropertyValue: function(element, property, rootPropertyValue, forceStyleLookup) {
					/* Get an element's computed property value. */
					/* Note: Retrieving the value of a CSS property cannot simply be performed by checking an element's
					 style attribute (which only reflects user-defined values). Instead, the browser must be queried for a property's
					 *computed* value. You can read more about getComputedStyle here: https://developer.mozilla.org/en/docs/Web/API/window.getComputedStyle */
					function computePropertyValue(element, property) {
						/* When box-sizing isn't set to border-box, height and width style values are incorrectly computed when an
						 element's scrollbars are visible (which expands the element's dimensions). Thus, we defer to the more accurate
						 offsetHeight/Width property, which includes the total dimensions for interior, border, padding, and scrollbar.
						 We subtract border and padding to get the sum of interior + scrollbar. */
						var computedValue = 0;

						/* IE<=8 doesn't support window.getComputedStyle, thus we defer to jQuery, which has an extensive array
						 of hacks to accurately retrieve IE8 property values. Re-implementing that logic here is not worth bloating the
						 codebase for a dying browser. The performance repercussions of using jQuery here are minimal since
						 Velocity is optimized to rarely (and sometimes never) query the DOM. Further, the $.css() codepath isn't that slow. */
						if (IE <= 8) {
							computedValue = $.css(element, property); /* GET */
							/* All other browsers support getComputedStyle. The returned live object reference is cached onto its
							 associated element so that it does not need to be refetched upon every GET. */
						} else {
							/* Browsers do not return height and width values for elements that are set to display:"none". Thus, we temporarily
							 toggle display to the element type's default value. */
							var toggleDisplay = false;

							if (/^(width|height)$/.test(property) && CSS.getPropertyValue(element, "display") === 0) {
								toggleDisplay = true;
								CSS.setPropertyValue(element, "display", CSS.Values.getDisplayType(element));
							}

							var revertDisplay = function() {
								if (toggleDisplay) {
									CSS.setPropertyValue(element, "display", "none");
								}
							};

							if (!forceStyleLookup) {
								if (property === "height" && CSS.getPropertyValue(element, "boxSizing").toString().toLowerCase() !== "border-box") {
									var contentBoxHeight = element.offsetHeight - (parseFloat(CSS.getPropertyValue(element, "borderTopWidth")) || 0) - (parseFloat(CSS.getPropertyValue(element, "borderBottomWidth")) || 0) - (parseFloat(CSS.getPropertyValue(element, "paddingTop")) || 0) - (parseFloat(CSS.getPropertyValue(element, "paddingBottom")) || 0);
									revertDisplay();

									return contentBoxHeight;
								} else if (property === "width" && CSS.getPropertyValue(element, "boxSizing").toString().toLowerCase() !== "border-box") {
									var contentBoxWidth = element.offsetWidth - (parseFloat(CSS.getPropertyValue(element, "borderLeftWidth")) || 0) - (parseFloat(CSS.getPropertyValue(element, "borderRightWidth")) || 0) - (parseFloat(CSS.getPropertyValue(element, "paddingLeft")) || 0) - (parseFloat(CSS.getPropertyValue(element, "paddingRight")) || 0);
									revertDisplay();

									return contentBoxWidth;
								}
							}

							var computedStyle;

							/* For elements that Velocity hasn't been called on directly (e.g. when Velocity queries the DOM on behalf
							 of a parent of an element its animating), perform a direct getComputedStyle lookup since the object isn't cached. */
							if (Data(element) === undefined) {
								computedStyle = window.getComputedStyle(element, null); /* GET */
								/* If the computedStyle object has yet to be cached, do so now. */
							} else if (!Data(element).computedStyle) {
								computedStyle = Data(element).computedStyle = window.getComputedStyle(element, null); /* GET */
								/* If computedStyle is cached, use it. */
							} else {
								computedStyle = Data(element).computedStyle;
							}

							/* IE and Firefox do not return a value for the generic borderColor -- they only return individual values for each border side's color.
							 Also, in all browsers, when border colors aren't all the same, a compound value is returned that Velocity isn't setup to parse.
							 So, as a polyfill for querying individual border side colors, we just return the top border's color and animate all borders from that value. */
							if (property === "borderColor") {
								property = "borderTopColor";
							}

							/* IE9 has a bug in which the "filter" property must be accessed from computedStyle using the getPropertyValue method
							 instead of a direct property lookup. The getPropertyValue method is slower than a direct lookup, which is why we avoid it by default. */
							if (IE === 9 && property === "filter") {
								computedValue = computedStyle.getPropertyValue(property); /* GET */
							} else {
								computedValue = computedStyle[property];
							}

							/* Fall back to the property's style value (if defined) when computedValue returns nothing,
							 which can happen when the element hasn't been painted. */
							if (computedValue === "" || computedValue === null) {
								computedValue = element.style[property];
							}

							revertDisplay();
						}

						/* For top, right, bottom, and left (TRBL) values that are set to "auto" on elements of "fixed" or "absolute" position,
						 defer to jQuery for converting "auto" to a numeric value. (For elements with a "static" or "relative" position, "auto" has the same
						 effect as being set to 0, so no conversion is necessary.) */
						/* An example of why numeric conversion is necessary: When an element with "position:absolute" has an untouched "left"
						 property, which reverts to "auto", left's value is 0 relative to its parent element, but is often non-zero relative
						 to its *containing* (not parent) element, which is the nearest "position:relative" ancestor or the viewport (and always the viewport in the case of "position:fixed"). */
						if (computedValue === "auto" && /^(top|right|bottom|left)$/i.test(property)) {
							var position = computePropertyValue(element, "position"); /* GET */

							/* For absolute positioning, jQuery's $.position() only returns values for top and left;
							 right and bottom will have their "auto" value reverted to 0. */
							/* Note: A jQuery object must be created here since jQuery doesn't have a low-level alias for $.position().
							 Not a big deal since we're currently in a GET batch anyway. */
							if (position === "fixed" || (position === "absolute" && /top|left/i.test(property))) {
								/* Note: jQuery strips the pixel unit from its returned values; we re-add it here to conform with computePropertyValue's behavior. */
								computedValue = $(element).position()[property] + "px"; /* GET */
							}
						}

						return computedValue;
					}

					var propertyValue;

					/* If this is a hooked property (e.g. "clipLeft" instead of the root property of "clip"),
					 extract the hook's value from a normalized rootPropertyValue using CSS.Hooks.extractValue(). */
					if (CSS.Hooks.registered[property]) {
						var hook = property,
								hookRoot = CSS.Hooks.getRoot(hook);

						/* If a cached rootPropertyValue wasn't passed in (which Velocity always attempts to do in order to avoid requerying the DOM),
						 query the DOM for the root property's value. */
						if (rootPropertyValue === undefined) {
							/* Since the browser is now being directly queried, use the official post-prefixing property name for this lookup. */
							rootPropertyValue = CSS.getPropertyValue(element, CSS.Names.prefixCheck(hookRoot)[0]); /* GET */
						}

						/* If this root has a normalization registered, peform the associated normalization extraction. */
						if (CSS.Normalizations.registered[hookRoot]) {
							rootPropertyValue = CSS.Normalizations.registered[hookRoot]("extract", element, rootPropertyValue);
						}

						/* Extract the hook's value. */
						propertyValue = CSS.Hooks.extractValue(hook, rootPropertyValue);

						/* If this is a normalized property (e.g. "opacity" becomes "filter" in <=IE8) or "translateX" becomes "transform"),
						 normalize the property's name and value, and handle the special case of transforms. */
						/* Note: Normalizing a property is mutually exclusive from hooking a property since hook-extracted values are strictly
						 numerical and therefore do not require normalization extraction. */
					} else if (CSS.Normalizations.registered[property]) {
						var normalizedPropertyName,
								normalizedPropertyValue;

						normalizedPropertyName = CSS.Normalizations.registered[property]("name", element);

						/* Transform values are calculated via normalization extraction (see below), which checks against the element's transformCache.
						 At no point do transform GETs ever actually query the DOM; initial stylesheet values are never processed.
						 This is because parsing 3D transform matrices is not always accurate and would bloat our codebase;
						 thus, normalization extraction defaults initial transform values to their zero-values (e.g. 1 for scaleX and 0 for translateX). */
						if (normalizedPropertyName !== "transform") {
							normalizedPropertyValue = computePropertyValue(element, CSS.Names.prefixCheck(normalizedPropertyName)[0]); /* GET */

							/* If the value is a CSS null-value and this property has a hook template, use that zero-value template so that hooks can be extracted from it. */
							if (CSS.Values.isCSSNullValue(normalizedPropertyValue) && CSS.Hooks.templates[property]) {
								normalizedPropertyValue = CSS.Hooks.templates[property][1];
							}
						}

						propertyValue = CSS.Normalizations.registered[property]("extract", element, normalizedPropertyValue);
					}

					/* If a (numeric) value wasn't produced via hook extraction or normalization, query the DOM. */
					if (!/^[\d-]/.test(propertyValue)) {
						/* For SVG elements, dimensional properties (which SVGAttribute() detects) are tweened via
						 their HTML attribute values instead of their CSS style values. */
						var data = Data(element);

						if (data && data.isSVG && CSS.Names.SVGAttribute(property)) {
							/* Since the height/width attribute values must be set manually, they don't reflect computed values.
							 Thus, we use use getBBox() to ensure we always get values for elements with undefined height/width attributes. */
							if (/^(height|width)$/i.test(property)) {
								/* Firefox throws an error if .getBBox() is called on an SVG that isn't attached to the DOM. */
								try {
									propertyValue = element.getBBox()[property];
								} catch (error) {
									propertyValue = 0;
								}
								/* Otherwise, access the attribute value directly. */
							} else {
								propertyValue = element.getAttribute(property);
							}
						} else {
							propertyValue = computePropertyValue(element, CSS.Names.prefixCheck(property)[0]); /* GET */
						}
					}

					/* Since property lookups are for animation purposes (which entails computing the numeric delta between start and end values),
					 convert CSS null-values to an integer of value 0. */
					if (CSS.Values.isCSSNullValue(propertyValue)) {
						propertyValue = 0;
					}

					if (Velocity.debug >= 2) {
						console.log("Get " + property + ": " + propertyValue);
					}

					return propertyValue;
				},
				/* The singular setPropertyValue, which routes the logic for all normalizations, hooks, and standard CSS properties. */
				setPropertyValue: function(element, property, propertyValue, rootPropertyValue, scrollData) {
					var propertyName = property;

					/* In order to be subjected to call options and element queueing, scroll animation is routed through Velocity as if it were a standard CSS property. */
					if (property === "scroll") {
						/* If a container option is present, scroll the container instead of the browser window. */
						if (scrollData.container) {
							scrollData.container["scroll" + scrollData.direction] = propertyValue;
							/* Otherwise, Velocity defaults to scrolling the browser window. */
						} else {
							if (scrollData.direction === "Left") {
								window.scrollTo(propertyValue, scrollData.alternateValue);
							} else {
								window.scrollTo(scrollData.alternateValue, propertyValue);
							}
						}
					} else {
						/* Transforms (translateX, rotateZ, etc.) are applied to a per-element transformCache object, which is manually flushed via flushTransformCache().
						 Thus, for now, we merely cache transforms being SET. */
						if (CSS.Normalizations.registered[property] && CSS.Normalizations.registered[property]("name", element) === "transform") {
							/* Perform a normalization injection. */
							/* Note: The normalization logic handles the transformCache updating. */
							CSS.Normalizations.registered[property]("inject", element, propertyValue);

							propertyName = "transform";
							propertyValue = Data(element).transformCache[property];
						} else {
							/* Inject hooks. */
							if (CSS.Hooks.registered[property]) {
								var hookName = property,
										hookRoot = CSS.Hooks.getRoot(property);

								/* If a cached rootPropertyValue was not provided, query the DOM for the hookRoot's current value. */
								rootPropertyValue = rootPropertyValue || CSS.getPropertyValue(element, hookRoot); /* GET */

								propertyValue = CSS.Hooks.injectValue(hookName, propertyValue, rootPropertyValue);
								property = hookRoot;
							}

							/* Normalize names and values. */
							if (CSS.Normalizations.registered[property]) {
								propertyValue = CSS.Normalizations.registered[property]("inject", element, propertyValue);
								property = CSS.Normalizations.registered[property]("name", element);
							}

							/* Assign the appropriate vendor prefix before performing an official style update. */
							propertyName = CSS.Names.prefixCheck(property)[0];

							/* A try/catch is used for IE<=8, which throws an error when "invalid" CSS values are set, e.g. a negative width.
							 Try/catch is avoided for other browsers since it incurs a performance overhead. */
							if (IE <= 8) {
								try {
									element.style[propertyName] = propertyValue;
								} catch (error) {
									if (Velocity.debug) {
										console.log("Browser does not support [" + propertyValue + "] for [" + propertyName + "]");
									}
								}
								/* SVG elements have their dimensional properties (width, height, x, y, cx, etc.) applied directly as attributes instead of as styles. */
								/* Note: IE8 does not support SVG elements, so it's okay that we skip it for SVG animation. */
							} else {
								var data = Data(element);

								if (data && data.isSVG && CSS.Names.SVGAttribute(property)) {
									/* Note: For SVG attributes, vendor-prefixed property names are never used. */
									/* Note: Not all CSS properties can be animated via attributes, but the browser won't throw an error for unsupported properties. */
									element.setAttribute(property, propertyValue);
								} else {
									element.style[propertyName] = propertyValue;
								}
							}

							if (Velocity.debug >= 2) {
								console.log("Set " + property + " (" + propertyName + "): " + propertyValue);
							}
						}
					}

					/* Return the normalized property name and value in case the caller wants to know how these values were modified before being applied to the DOM. */
					return [propertyName, propertyValue];
				},
				/* To increase performance by batching transform updates into a single SET, transforms are not directly applied to an element until flushTransformCache() is called. */
				/* Note: Velocity applies transform properties in the same order that they are chronogically introduced to the element's CSS styles. */
				flushTransformCache: function(element) {
					var transformString = "",
							data = Data(element);

					/* Certain browsers require that SVG transforms be applied as an attribute. However, the SVG transform attribute takes a modified version of CSS's transform string
					 (units are dropped and, except for skewX/Y, subproperties are merged into their master property -- e.g. scaleX and scaleY are merged into scale(X Y). */
					if ((IE || (Velocity.State.isAndroid && !Velocity.State.isChrome)) && data && data.isSVG) {
						/* Since transform values are stored in their parentheses-wrapped form, we use a helper function to strip out their numeric values.
						 Further, SVG transform properties only take unitless (representing pixels) values, so it's okay that parseFloat() strips the unit suffixed to the float value. */
						var getTransformFloat = function(transformProperty) {
							return parseFloat(CSS.getPropertyValue(element, transformProperty));
						};

						/* Create an object to organize all the transforms that we'll apply to the SVG element. To keep the logic simple,
						 we process *all* transform properties -- even those that may not be explicitly applied (since they default to their zero-values anyway). */
						var SVGTransforms = {
							translate: [getTransformFloat("translateX"), getTransformFloat("translateY")],
							skewX: [getTransformFloat("skewX")], skewY: [getTransformFloat("skewY")],
							/* If the scale property is set (non-1), use that value for the scaleX and scaleY values
							 (this behavior mimics the result of animating all these properties at once on HTML elements). */
							scale: getTransformFloat("scale") !== 1 ? [getTransformFloat("scale"), getTransformFloat("scale")] : [getTransformFloat("scaleX"), getTransformFloat("scaleY")],
							/* Note: SVG's rotate transform takes three values: rotation degrees followed by the X and Y values
							 defining the rotation's origin point. We ignore the origin values (default them to 0). */
							rotate: [getTransformFloat("rotateZ"), 0, 0]
						};

						/* Iterate through the transform properties in the user-defined property map order.
						 (This mimics the behavior of non-SVG transform animation.) */
						$.each(Data(element).transformCache, function(transformName) {
							/* Except for with skewX/Y, revert the axis-specific transform subproperties to their axis-free master
							 properties so that they match up with SVG's accepted transform properties. */
							if (/^translate/i.test(transformName)) {
								transformName = "translate";
							} else if (/^scale/i.test(transformName)) {
								transformName = "scale";
							} else if (/^rotate/i.test(transformName)) {
								transformName = "rotate";
							}

							/* Check that we haven't yet deleted the property from the SVGTransforms container. */
							if (SVGTransforms[transformName]) {
								/* Append the transform property in the SVG-supported transform format. As per the spec, surround the space-delimited values in parentheses. */
								transformString += transformName + "(" + SVGTransforms[transformName].join(" ") + ")" + " ";

								/* After processing an SVG transform property, delete it from the SVGTransforms container so we don't
								 re-insert the same master property if we encounter another one of its axis-specific properties. */
								delete SVGTransforms[transformName];
							}
						});
					} else {
						var transformValue,
								perspective;

						/* Transform properties are stored as members of the transformCache object. Concatenate all the members into a string. */
						$.each(Data(element).transformCache, function(transformName) {
							transformValue = Data(element).transformCache[transformName];

							/* Transform's perspective subproperty must be set first in order to take effect. Store it temporarily. */
							if (transformName === "transformPerspective") {
								perspective = transformValue;
								return true;
							}

							/* IE9 only supports one rotation type, rotateZ, which it refers to as "rotate". */
							if (IE === 9 && transformName === "rotateZ") {
								transformName = "rotate";
							}

							transformString += transformName + transformValue + " ";
						});

						/* If present, set the perspective subproperty first. */
						if (perspective) {
							transformString = "perspective" + perspective + " " + transformString;
						}
					}

					CSS.setPropertyValue(element, "transform", transformString);
				}
			};

			/* Register hooks and normalizations. */
			CSS.Hooks.register();
			CSS.Normalizations.register();

			/* Allow hook setting in the same fashion as jQuery's $.css(). */
			Velocity.hook = function(elements, arg2, arg3) {
				var value;

				elements = sanitizeElements(elements);

				$.each(elements, function(i, element) {
					/* Initialize Velocity's per-element data cache if this element hasn't previously been animated. */
					if (Data(element) === undefined) {
						Velocity.init(element);
					}

					/* Get property value. If an element set was passed in, only return the value for the first element. */
					if (arg3 === undefined) {
						if (value === undefined) {
							value = Velocity.CSS.getPropertyValue(element, arg2);
						}
						/* Set property value. */
					} else {
						/* sPV returns an array of the normalized propertyName/propertyValue pair used to update the DOM. */
						var adjustedSet = Velocity.CSS.setPropertyValue(element, arg2, arg3);

						/* Transform properties don't automatically set. They have to be flushed to the DOM. */
						if (adjustedSet[0] === "transform") {
							Velocity.CSS.flushTransformCache(element);
						}

						value = adjustedSet;
					}
				});

				return value;
			};

			/*****************
			 Animation
			 *****************/

			var animate = function() {
				var opts;

				/******************
				 Call Chain
				 ******************/

				/* Logic for determining what to return to the call stack when exiting out of Velocity. */
				function getChain() {
					/* If we are using the utility function, attempt to return this call's promise. If no promise library was detected,
					 default to null instead of returning the targeted elements so that utility function's return value is standardized. */
					if (isUtility) {
						return promiseData.promise || null;
						/* Otherwise, if we're using $.fn, return the jQuery-/Zepto-wrapped element set. */
					} else {
						return elementsWrapped;
					}
				}

				/*************************
				 Arguments Assignment
				 *************************/

				/* To allow for expressive CoffeeScript code, Velocity supports an alternative syntax in which "elements" (or "e"), "properties" (or "p"), and "options" (or "o")
				 objects are defined on a container object that's passed in as Velocity's sole argument. */
				/* Note: Some browsers automatically populate arguments with a "properties" object. We detect it by checking for its default "names" property. */
				var syntacticSugar = (arguments[0] && (arguments[0].p || (($.isPlainObject(arguments[0].properties) && !arguments[0].properties.names) || Type.isString(arguments[0].properties)))),
						/* Whether Velocity was called via the utility function (as opposed to on a jQuery/Zepto object). */
						isUtility,
						/* When Velocity is called via the utility function ($.Velocity()/Velocity()), elements are explicitly
						 passed in as the first parameter. Thus, argument positioning varies. We normalize them here. */
						elementsWrapped,
						argumentIndex;

				var elements,
						propertiesMap,
						options;

				/* Detect jQuery/Zepto elements being animated via the $.fn method. */
				if (Type.isWrapped(this)) {
					isUtility = false;

					argumentIndex = 0;
					elements = this;
					elementsWrapped = this;
					/* Otherwise, raw elements are being animated via the utility function. */
				} else {
					isUtility = true;

					argumentIndex = 1;
					elements = syntacticSugar ? (arguments[0].elements || arguments[0].e) : arguments[0];
				}

				elements = sanitizeElements(elements);

				if (!elements) {
					return;
				}

				if (syntacticSugar) {
					propertiesMap = arguments[0].properties || arguments[0].p;
					options = arguments[0].options || arguments[0].o;
				} else {
					propertiesMap = arguments[argumentIndex];
					options = arguments[argumentIndex + 1];
				}

				/* The length of the element set (in the form of a nodeList or an array of elements) is defaulted to 1 in case a
				 single raw DOM element is passed in (which doesn't contain a length property). */
				var elementsLength = elements.length,
						elementsIndex = 0;

				/***************************
				 Argument Overloading
				 ***************************/

				/* Support is included for jQuery's argument overloading: $.animate(propertyMap [, duration] [, easing] [, complete]).
				 Overloading is detected by checking for the absence of an object being passed into options. */
				/* Note: The stop and finish actions do not accept animation options, and are therefore excluded from this check. */
				if (!/^(stop|finish|finishAll)$/i.test(propertiesMap) && !$.isPlainObject(options)) {
					/* The utility function shifts all arguments one position to the right, so we adjust for that offset. */
					var startingArgumentPosition = argumentIndex + 1;

					options = {};

					/* Iterate through all options arguments */
					for (var i = startingArgumentPosition; i < arguments.length; i++) {
						/* Treat a number as a duration. Parse it out. */
						/* Note: The following RegEx will return true if passed an array with a number as its first item.
						 Thus, arrays are skipped from this check. */
						if (!Type.isArray(arguments[i]) && (/^(fast|normal|slow)$/i.test(arguments[i]) || /^\d/.test(arguments[i]))) {
							options.duration = arguments[i];
							/* Treat strings and arrays as easings. */
						} else if (Type.isString(arguments[i]) || Type.isArray(arguments[i])) {
							options.easing = arguments[i];
							/* Treat a function as a complete callback. */
						} else if (Type.isFunction(arguments[i])) {
							options.complete = arguments[i];
						}
					}
				}

				/***************
				 Promises
				 ***************/

				var promiseData = {
					promise: null,
					resolver: null,
					rejecter: null
				};

				/* If this call was made via the utility function (which is the default method of invocation when jQuery/Zepto are not being used), and if
				 promise support was detected, create a promise object for this call and store references to its resolver and rejecter methods. The resolve
				 method is used when a call completes naturally or is prematurely stopped by the user. In both cases, completeCall() handles the associated
				 call cleanup and promise resolving logic. The reject method is used when an invalid set of arguments is passed into a Velocity call. */
				/* Note: Velocity employs a call-based queueing architecture, which means that stopping an animating element actually stops the full call that
				 triggered it -- not that one element exclusively. Similarly, there is one promise per call, and all elements targeted by a Velocity call are
				 grouped together for the purposes of resolving and rejecting a promise. */
				if (isUtility && Velocity.Promise) {
					promiseData.promise = new Velocity.Promise(function(resolve, reject) {
						promiseData.resolver = resolve;
						promiseData.rejecter = reject;
					});
				}

				/*********************
				 Action Detection
				 *********************/

				/* Velocity's behavior is categorized into "actions": Elements can either be specially scrolled into view,
				 or they can be started, stopped, or reversed. If a literal or referenced properties map is passed in as Velocity's
				 first argument, the associated action is "start". Alternatively, "scroll", "reverse", or "stop" can be passed in instead of a properties map. */
				var action;

				switch (propertiesMap) {
					case "scroll":
						action = "scroll";
						break;

					case "reverse":
						action = "reverse";
						break;

					case "finish":
					case "finishAll":
					case "stop":
						/*******************
						 Action: Stop
						 *******************/

						/* Clear the currently-active delay on each targeted element. */
						$.each(elements, function(i, element) {
							if (Data(element) && Data(element).delayTimer) {
								/* Stop the timer from triggering its cached next() function. */
								clearTimeout(Data(element).delayTimer.setTimeout);

								/* Manually call the next() function so that the subsequent queue items can progress. */
								if (Data(element).delayTimer.next) {
									Data(element).delayTimer.next();
								}

								delete Data(element).delayTimer;
							}

							/* If we want to finish everything in the queue, we have to iterate through it
							 and call each function. This will make them active calls below, which will
							 cause them to be applied via the duration setting. */
							if (propertiesMap === "finishAll" && (options === true || Type.isString(options))) {
								/* Iterate through the items in the element's queue. */
								$.each($.queue(element, Type.isString(options) ? options : ""), function(_, item) {
									/* The queue array can contain an "inprogress" string, which we skip. */
									if (Type.isFunction(item)) {
										item();
									}
								});

								/* Clearing the $.queue() array is achieved by resetting it to []. */
								$.queue(element, Type.isString(options) ? options : "", []);
							}
						});

						var callsToStop = [];

						/* When the stop action is triggered, the elements' currently active call is immediately stopped. The active call might have
						 been applied to multiple elements, in which case all of the call's elements will be stopped. When an element
						 is stopped, the next item in its animation queue is immediately triggered. */
						/* An additional argument may be passed in to clear an element's remaining queued calls. Either true (which defaults to the "fx" queue)
						 or a custom queue string can be passed in. */
						/* Note: The stop command runs prior to Velocity's Queueing phase since its behavior is intended to take effect *immediately*,
						 regardless of the element's current queue state. */

						/* Iterate through every active call. */
						$.each(Velocity.State.calls, function(i, activeCall) {
							/* Inactive calls are set to false by the logic inside completeCall(). Skip them. */
							if (activeCall) {
								/* Iterate through the active call's targeted elements. */
								$.each(activeCall[1], function(k, activeElement) {
									/* If true was passed in as a secondary argument, clear absolutely all calls on this element. Otherwise, only
									 clear calls associated with the relevant queue. */
									/* Call stopping logic works as follows:
									 - options === true --> stop current default queue calls (and queue:false calls), including remaining queued ones.
									 - options === undefined --> stop current queue:"" call and all queue:false calls.
									 - options === false --> stop only queue:false calls.
									 - options === "custom" --> stop current queue:"custom" call, including remaining queued ones (there is no functionality to only clear the currently-running queue:"custom" call). */
									var queueName = (options === undefined) ? "" : options;

									if (queueName !== true && (activeCall[2].queue !== queueName) && !(options === undefined && activeCall[2].queue === false)) {
										return true;
									}

									/* Iterate through the calls targeted by the stop command. */
									$.each(elements, function(l, element) {
										/* Check that this call was applied to the target element. */
										if (element === activeElement) {
											/* Optionally clear the remaining queued calls. If we're doing "finishAll" this won't find anything,
											 due to the queue-clearing above. */
											if (options === true || Type.isString(options)) {
												/* Iterate through the items in the element's queue. */
												$.each($.queue(element, Type.isString(options) ? options : ""), function(_, item) {
													/* The queue array can contain an "inprogress" string, which we skip. */
													if (Type.isFunction(item)) {
														/* Pass the item's callback a flag indicating that we want to abort from the queue call.
														 (Specifically, the queue will resolve the call's associated promise then abort.)  */
														item(null, true);
													}
												});

												/* Clearing the $.queue() array is achieved by resetting it to []. */
												$.queue(element, Type.isString(options) ? options : "", []);
											}

											if (propertiesMap === "stop") {
												/* Since "reverse" uses cached start values (the previous call's endValues), these values must be
												 changed to reflect the final value that the elements were actually tweened to. */
												/* Note: If only queue:false animations are currently running on an element, it won't have a tweensContainer
												 object. Also, queue:false animations can't be reversed. */
												var data = Data(element);
												if (data && data.tweensContainer && queueName !== false) {
													$.each(data.tweensContainer, function(m, activeTween) {
														activeTween.endValue = activeTween.currentValue;
													});
												}

												callsToStop.push(i);
											} else if (propertiesMap === "finish" || propertiesMap === "finishAll") {
												/* To get active tweens to finish immediately, we forcefully shorten their durations to 1ms so that
												 they finish upon the next rAf tick then proceed with normal call completion logic. */
												activeCall[2].duration = 1;
											}
										}
									});
								});
							}
						});

						/* Prematurely call completeCall() on each matched active call. Pass an additional flag for "stop" to indicate
						 that the complete callback and display:none setting should be skipped since we're completing prematurely. */
						if (propertiesMap === "stop") {
							$.each(callsToStop, function(i, j) {
								completeCall(j, true);
							});

							if (promiseData.promise) {
								/* Immediately resolve the promise associated with this stop call since stop runs synchronously. */
								promiseData.resolver(elements);
							}
						}

						/* Since we're stopping, and not proceeding with queueing, exit out of Velocity. */
						return getChain();

					default:
						/* Treat a non-empty plain object as a literal properties map. */
						if ($.isPlainObject(propertiesMap) && !Type.isEmptyObject(propertiesMap)) {
							action = "start";

							/****************
							 Redirects
							 ****************/

							/* Check if a string matches a registered redirect (see Redirects above). */
						} else if (Type.isString(propertiesMap) && Velocity.Redirects[propertiesMap]) {
							opts = $.extend({}, options);

							var durationOriginal = opts.duration,
									delayOriginal = opts.delay || 0;

							/* If the backwards option was passed in, reverse the element set so that elements animate from the last to the first. */
							if (opts.backwards === true) {
								elements = $.extend(true, [], elements).reverse();
							}

							/* Individually trigger the redirect for each element in the set to prevent users from having to handle iteration logic in their redirect. */
							$.each(elements, function(elementIndex, element) {
								/* If the stagger option was passed in, successively delay each element by the stagger value (in ms). Retain the original delay value. */
								if (parseFloat(opts.stagger)) {
									opts.delay = delayOriginal + (parseFloat(opts.stagger) * elementIndex);
								} else if (Type.isFunction(opts.stagger)) {
									opts.delay = delayOriginal + opts.stagger.call(element, elementIndex, elementsLength);
								}

								/* If the drag option was passed in, successively increase/decrease (depending on the presense of opts.backwards)
								 the duration of each element's animation, using floors to prevent producing very short durations. */
								if (opts.drag) {
									/* Default the duration of UI pack effects (callouts and transitions) to 1000ms instead of the usual default duration of 400ms. */
									opts.duration = parseFloat(durationOriginal) || (/^(callout|transition)/.test(propertiesMap) ? 1000 : DURATION_DEFAULT);

									/* For each element, take the greater duration of: A) animation completion percentage relative to the original duration,
									 B) 75% of the original duration, or C) a 200ms fallback (in case duration is already set to a low value).
									 The end result is a baseline of 75% of the redirect's duration that increases/decreases as the end of the element set is approached. */
									opts.duration = Math.max(opts.duration * (opts.backwards ? 1 - elementIndex / elementsLength : (elementIndex + 1) / elementsLength), opts.duration * 0.75, 200);
								}

								/* Pass in the call's opts object so that the redirect can optionally extend it. It defaults to an empty object instead of null to
								 reduce the opts checking logic required inside the redirect. */
								Velocity.Redirects[propertiesMap].call(element, element, opts || {}, elementIndex, elementsLength, elements, promiseData.promise ? promiseData : undefined);
							});

							/* Since the animation logic resides within the redirect's own code, abort the remainder of this call.
							 (The performance overhead up to this point is virtually non-existant.) */
							/* Note: The jQuery call chain is kept intact by returning the complete element set. */
							return getChain();
						} else {
							var abortError = "Velocity: First argument (" + propertiesMap + ") was not a property map, a known action, or a registered redirect. Aborting.";

							if (promiseData.promise) {
								promiseData.rejecter(new Error(abortError));
							} else {
								console.log(abortError);
							}

							return getChain();
						}
				}

				/**************************
				 Call-Wide Variables
				 **************************/

				/* A container for CSS unit conversion ratios (e.g. %, rem, and em ==> px) that is used to cache ratios across all elements
				 being animated in a single Velocity call. Calculating unit ratios necessitates DOM querying and updating, and is therefore
				 avoided (via caching) wherever possible. This container is call-wide instead of page-wide to avoid the risk of using stale
				 conversion metrics across Velocity animations that are not immediately consecutively chained. */
				var callUnitConversionData = {
					lastParent: null,
					lastPosition: null,
					lastFontSize: null,
					lastPercentToPxWidth: null,
					lastPercentToPxHeight: null,
					lastEmToPx: null,
					remToPx: null,
					vwToPx: null,
					vhToPx: null
				};

				/* A container for all the ensuing tween data and metadata associated with this call. This container gets pushed to the page-wide
				 Velocity.State.calls array that is processed during animation ticking. */
				var call = [];

				/************************
				 Element Processing
				 ************************/

				/* Element processing consists of three parts -- data processing that cannot go stale and data processing that *can* go stale (i.e. third-party style modifications):
				 1) Pre-Queueing: Element-wide variables, including the element's data storage, are instantiated. Call options are prepared. If triggered, the Stop action is executed.
				 2) Queueing: The logic that runs once this call has reached its point of execution in the element's $.queue() stack. Most logic is placed here to avoid risking it becoming stale.
				 3) Pushing: Consolidation of the tween data followed by its push onto the global in-progress calls container.
				 `elementArrayIndex` allows passing index of the element in the original array to value functions.
				 If `elementsIndex` were used instead the index would be determined by the elements' per-element queue.
				 */
				function processElement(element, elementArrayIndex) {

					/*************************
					 Part I: Pre-Queueing
					 *************************/

					/***************************
					 Element-Wide Variables
					 ***************************/

					var /* The runtime opts object is the extension of the current call's options and Velocity's page-wide option defaults. */
							opts = $.extend({}, Velocity.defaults, options),
							/* A container for the processed data associated with each property in the propertyMap.
							 (Each property in the map produces its own "tween".) */
							tweensContainer = {},
							elementUnitConversionData;

					/******************
					 Element Init
					 ******************/

					if (Data(element) === undefined) {
						Velocity.init(element);
					}

					/******************
					 Option: Delay
					 ******************/

					/* Since queue:false doesn't respect the item's existing queue, we avoid injecting its delay here (it's set later on). */
					/* Note: Velocity rolls its own delay function since jQuery doesn't have a utility alias for $.fn.delay()
					 (and thus requires jQuery element creation, which we avoid since its overhead includes DOM querying). */
					if (parseFloat(opts.delay) && opts.queue !== false) {
						$.queue(element, opts.queue, function(next) {
							/* This is a flag used to indicate to the upcoming completeCall() function that this queue entry was initiated by Velocity. See completeCall() for further details. */
							Velocity.velocityQueueEntryFlag = true;

							/* The ensuing queue item (which is assigned to the "next" argument that $.queue() automatically passes in) will be triggered after a setTimeout delay.
							 The setTimeout is stored so that it can be subjected to clearTimeout() if this animation is prematurely stopped via Velocity's "stop" command. */
							Data(element).delayTimer = {
								setTimeout: setTimeout(next, parseFloat(opts.delay)),
								next: next
							};
						});
					}

					/*********************
					 Option: Duration
					 *********************/

					/* Support for jQuery's named durations. */
					switch (opts.duration.toString().toLowerCase()) {
						case "fast":
							opts.duration = 200;
							break;

						case "normal":
							opts.duration = DURATION_DEFAULT;
							break;

						case "slow":
							opts.duration = 600;
							break;

						default:
							/* Remove the potential "ms" suffix and default to 1 if the user is attempting to set a duration of 0 (in order to produce an immediate style change). */
							opts.duration = parseFloat(opts.duration) || 1;
					}

					/************************
					 Global Option: Mock
					 ************************/

					if (Velocity.mock !== false) {
						/* In mock mode, all animations are forced to 1ms so that they occur immediately upon the next rAF tick.
						 Alternatively, a multiplier can be passed in to time remap all delays and durations. */
						if (Velocity.mock === true) {
							opts.duration = opts.delay = 1;
						} else {
							opts.duration *= parseFloat(Velocity.mock) || 1;
							opts.delay *= parseFloat(Velocity.mock) || 1;
						}
					}

					/*******************
					 Option: Easing
					 *******************/

					opts.easing = getEasing(opts.easing, opts.duration);

					/**********************
					 Option: Callbacks
					 **********************/

					/* Callbacks must functions. Otherwise, default to null. */
					if (opts.begin && !Type.isFunction(opts.begin)) {
						opts.begin = null;
					}

					if (opts.progress && !Type.isFunction(opts.progress)) {
						opts.progress = null;
					}

					if (opts.complete && !Type.isFunction(opts.complete)) {
						opts.complete = null;
					}

					/*********************************
					 Option: Display & Visibility
					 *********************************/

					/* Refer to Velocity's documentation (VelocityJS.org/#displayAndVisibility) for a description of the display and visibility options' behavior. */
					/* Note: We strictly check for undefined instead of falsiness because display accepts an empty string value. */
					if (opts.display !== undefined && opts.display !== null) {
						opts.display = opts.display.toString().toLowerCase();

						/* Users can pass in a special "auto" value to instruct Velocity to set the element to its default display value. */
						if (opts.display === "auto") {
							opts.display = Velocity.CSS.Values.getDisplayType(element);
						}
					}

					if (opts.visibility !== undefined && opts.visibility !== null) {
						opts.visibility = opts.visibility.toString().toLowerCase();
					}

					/**********************
					 Option: mobileHA
					 **********************/

					/* When set to true, and if this is a mobile device, mobileHA automatically enables hardware acceleration (via a null transform hack)
					 on animating elements. HA is removed from the element at the completion of its animation. */
					/* Note: Android Gingerbread doesn't support HA. If a null transform hack (mobileHA) is in fact set, it will prevent other tranform subproperties from taking effect. */
					/* Note: You can read more about the use of mobileHA in Velocity's documentation: VelocityJS.org/#mobileHA. */
					opts.mobileHA = (opts.mobileHA && Velocity.State.isMobile && !Velocity.State.isGingerbread);

					/***********************
					 Part II: Queueing
					 ***********************/

					/* When a set of elements is targeted by a Velocity call, the set is broken up and each element has the current Velocity call individually queued onto it.
					 In this way, each element's existing queue is respected; some elements may already be animating and accordingly should not have this current Velocity call triggered immediately. */
					/* In each queue, tween data is processed for each animating property then pushed onto the call-wide calls array. When the last element in the set has had its tweens processed,
					 the call array is pushed to Velocity.State.calls for live processing by the requestAnimationFrame tick. */
					function buildQueue(next) {
						var data, lastTweensContainer;

						/*******************
						 Option: Begin
						 *******************/

						/* The begin callback is fired once per call -- not once per elemenet -- and is passed the full raw DOM element set as both its context and its first argument. */
						if (opts.begin && elementsIndex === 0) {
							/* We throw callbacks in a setTimeout so that thrown errors don't halt the execution of Velocity itself. */
							try {
								opts.begin.call(elements, elements);
							} catch (error) {
								setTimeout(function() {
									throw error;
								}, 1);
							}
						}

						/*****************************************
						 Tween Data Construction (for Scroll)
						 *****************************************/

						/* Note: In order to be subjected to chaining and animation options, scroll's tweening is routed through Velocity as if it were a standard CSS property animation. */
						if (action === "scroll") {
							/* The scroll action uniquely takes an optional "offset" option -- specified in pixels -- that offsets the targeted scroll position. */
							var scrollDirection = (/^x$/i.test(opts.axis) ? "Left" : "Top"),
									scrollOffset = parseFloat(opts.offset) || 0,
									scrollPositionCurrent,
									scrollPositionCurrentAlternate,
									scrollPositionEnd;

							/* Scroll also uniquely takes an optional "container" option, which indicates the parent element that should be scrolled --
							 as opposed to the browser window itself. This is useful for scrolling toward an element that's inside an overflowing parent element. */
							if (opts.container) {
								/* Ensure that either a jQuery object or a raw DOM element was passed in. */
								if (Type.isWrapped(opts.container) || Type.isNode(opts.container)) {
									/* Extract the raw DOM element from the jQuery wrapper. */
									opts.container = opts.container[0] || opts.container;
									/* Note: Unlike other properties in Velocity, the browser's scroll position is never cached since it so frequently changes
									 (due to the user's natural interaction with the page). */
									scrollPositionCurrent = opts.container["scroll" + scrollDirection]; /* GET */

									/* $.position() values are relative to the container's currently viewable area (without taking into account the container's true dimensions
									 -- say, for example, if the container was not overflowing). Thus, the scroll end value is the sum of the child element's position *and*
									 the scroll container's current scroll position. */
									scrollPositionEnd = (scrollPositionCurrent + $(element).position()[scrollDirection.toLowerCase()]) + scrollOffset; /* GET */
									/* If a value other than a jQuery object or a raw DOM element was passed in, default to null so that this option is ignored. */
								} else {
									opts.container = null;
								}
							} else {
								/* If the window itself is being scrolled -- not a containing element -- perform a live scroll position lookup using
								 the appropriate cached property names (which differ based on browser type). */
								scrollPositionCurrent = Velocity.State.scrollAnchor[Velocity.State["scrollProperty" + scrollDirection]]; /* GET */
								/* When scrolling the browser window, cache the alternate axis's current value since window.scrollTo() doesn't let us change only one value at a time. */
								scrollPositionCurrentAlternate = Velocity.State.scrollAnchor[Velocity.State["scrollProperty" + (scrollDirection === "Left" ? "Top" : "Left")]]; /* GET */

								/* Unlike $.position(), $.offset() values are relative to the browser window's true dimensions -- not merely its currently viewable area --
								 and therefore end values do not need to be compounded onto current values. */
								scrollPositionEnd = $(element).offset()[scrollDirection.toLowerCase()] + scrollOffset; /* GET */
							}

							/* Since there's only one format that scroll's associated tweensContainer can take, we create it manually. */
							tweensContainer = {
								scroll: {
									rootPropertyValue: false,
									startValue: scrollPositionCurrent,
									currentValue: scrollPositionCurrent,
									endValue: scrollPositionEnd,
									unitType: "",
									easing: opts.easing,
									scrollData: {
										container: opts.container,
										direction: scrollDirection,
										alternateValue: scrollPositionCurrentAlternate
									}
								},
								element: element
							};

							if (Velocity.debug) {
								console.log("tweensContainer (scroll): ", tweensContainer.scroll, element);
							}

							/******************************************
							 Tween Data Construction (for Reverse)
							 ******************************************/

							/* Reverse acts like a "start" action in that a property map is animated toward. The only difference is
							 that the property map used for reverse is the inverse of the map used in the previous call. Thus, we manipulate
							 the previous call to construct our new map: use the previous map's end values as our new map's start values. Copy over all other data. */
							/* Note: Reverse can be directly called via the "reverse" parameter, or it can be indirectly triggered via the loop option. (Loops are composed of multiple reverses.) */
							/* Note: Reverse calls do not need to be consecutively chained onto a currently-animating element in order to operate on cached values;
							 there is no harm to reverse being called on a potentially stale data cache since reverse's behavior is simply defined
							 as reverting to the element's values as they were prior to the previous *Velocity* call. */
						} else if (action === "reverse") {
							data = Data(element);

							/* Abort if there is no prior animation data to reverse to. */
							if (!data) {
								return;
							}

							if (!data.tweensContainer) {
								/* Dequeue the element so that this queue entry releases itself immediately, allowing subsequent queue entries to run. */
								$.dequeue(element, opts.queue);

								return;
							} else {
								/*********************
								 Options Parsing
								 *********************/

								/* If the element was hidden via the display option in the previous call,
								 revert display to "auto" prior to reversal so that the element is visible again. */
								if (data.opts.display === "none") {
									data.opts.display = "auto";
								}

								if (data.opts.visibility === "hidden") {
									data.opts.visibility = "visible";
								}

								/* If the loop option was set in the previous call, disable it so that "reverse" calls aren't recursively generated.
								 Further, remove the previous call's callback options; typically, users do not want these to be refired. */
								data.opts.loop = false;
								data.opts.begin = null;
								data.opts.complete = null;

								/* Since we're extending an opts object that has already been extended with the defaults options object,
								 we remove non-explicitly-defined properties that are auto-assigned values. */
								if (!options.easing) {
									delete opts.easing;
								}

								if (!options.duration) {
									delete opts.duration;
								}

								/* The opts object used for reversal is an extension of the options object optionally passed into this
								 reverse call plus the options used in the previous Velocity call. */
								opts = $.extend({}, data.opts, opts);

								/*************************************
								 Tweens Container Reconstruction
								 *************************************/

								/* Create a deepy copy (indicated via the true flag) of the previous call's tweensContainer. */
								lastTweensContainer = $.extend(true, {}, data ? data.tweensContainer : null);

								/* Manipulate the previous tweensContainer by replacing its end values and currentValues with its start values. */
								for (var lastTween in lastTweensContainer) {
									/* In addition to tween data, tweensContainers contain an element property that we ignore here. */
									if (lastTweensContainer.hasOwnProperty(lastTween) && lastTween !== "element") {
										var lastStartValue = lastTweensContainer[lastTween].startValue;

										lastTweensContainer[lastTween].startValue = lastTweensContainer[lastTween].currentValue = lastTweensContainer[lastTween].endValue;
										lastTweensContainer[lastTween].endValue = lastStartValue;

										/* Easing is the only option that embeds into the individual tween data (since it can be defined on a per-property basis).
										 Accordingly, every property's easing value must be updated when an options object is passed in with a reverse call.
										 The side effect of this extensibility is that all per-property easing values are forcefully reset to the new value. */
										if (!Type.isEmptyObject(options)) {
											lastTweensContainer[lastTween].easing = opts.easing;
										}

										if (Velocity.debug) {
											console.log("reverse tweensContainer (" + lastTween + "): " + JSON.stringify(lastTweensContainer[lastTween]), element);
										}
									}
								}

								tweensContainer = lastTweensContainer;
							}

							/*****************************************
							 Tween Data Construction (for Start)
							 *****************************************/

						} else if (action === "start") {

							/*************************
							 Value Transferring
							 *************************/

							/* If this queue entry follows a previous Velocity-initiated queue entry *and* if this entry was created
							 while the element was in the process of being animated by Velocity, then this current call is safe to use
							 the end values from the prior call as its start values. Velocity attempts to perform this value transfer
							 process whenever possible in order to avoid requerying the DOM. */
							/* If values aren't transferred from a prior call and start values were not forcefed by the user (more on this below),
							 then the DOM is queried for the element's current values as a last resort. */
							/* Note: Conversely, animation reversal (and looping) *always* perform inter-call value transfers; they never requery the DOM. */

							data = Data(element);

							/* The per-element isAnimating flag is used to indicate whether it's safe (i.e. the data isn't stale)
							 to transfer over end values to use as start values. If it's set to true and there is a previous
							 Velocity call to pull values from, do so. */
							if (data && data.tweensContainer && data.isAnimating === true) {
								lastTweensContainer = data.tweensContainer;
							}

							/***************************
							 Tween Data Calculation
							 ***************************/

							/* This function parses property data and defaults endValue, easing, and startValue as appropriate. */
							/* Property map values can either take the form of 1) a single value representing the end value,
							 or 2) an array in the form of [ endValue, [, easing] [, startValue] ].
							 The optional third parameter is a forcefed startValue to be used instead of querying the DOM for
							 the element's current value. Read Velocity's docmentation to learn more about forcefeeding: VelocityJS.org/#forcefeeding */
							var parsePropertyValue = function(valueData, skipResolvingEasing) {
								var endValue, easing, startValue;

								/* Handle the array format, which can be structured as one of three potential overloads:
								 A) [ endValue, easing, startValue ], B) [ endValue, easing ], or C) [ endValue, startValue ] */
								if (Type.isArray(valueData)) {
									/* endValue is always the first item in the array. Don't bother validating endValue's value now
									 since the ensuing property cycling logic does that. */
									endValue = valueData[0];

									/* Two-item array format: If the second item is a number, function, or hex string, treat it as a
									 start value since easings can only be non-hex strings or arrays. */
									if ((!Type.isArray(valueData[1]) && /^[\d-]/.test(valueData[1])) || Type.isFunction(valueData[1]) || CSS.RegEx.isHex.test(valueData[1])) {
										startValue = valueData[1];
										/* Two or three-item array: If the second item is a non-hex string or an array, treat it as an easing. */
									} else if ((Type.isString(valueData[1]) && !CSS.RegEx.isHex.test(valueData[1])) || Type.isArray(valueData[1])) {
										easing = skipResolvingEasing ? valueData[1] : getEasing(valueData[1], opts.duration);

										/* Don't bother validating startValue's value now since the ensuing property cycling logic inherently does that. */
										if (valueData[2] !== undefined) {
											startValue = valueData[2];
										}
									}
									/* Handle the single-value format. */
								} else {
									endValue = valueData;
								}

								/* Default to the call's easing if a per-property easing type was not defined. */
								if (!skipResolvingEasing) {
									easing = easing || opts.easing;
								}

								/* If functions were passed in as values, pass the function the current element as its context,
								 plus the element's index and the element set's size as arguments. Then, assign the returned value. */
								if (Type.isFunction(endValue)) {
									endValue = endValue.call(element, elementArrayIndex, elementsLength);
								}

								if (Type.isFunction(startValue)) {
									startValue = startValue.call(element, elementArrayIndex, elementsLength);
								}

								/* Allow startValue to be left as undefined to indicate to the ensuing code that its value was not forcefed. */
								return [endValue || 0, easing, startValue];
							};

							/* Cycle through each property in the map, looking for shorthand color properties (e.g. "color" as opposed to "colorRed"). Inject the corresponding
							 colorRed, colorGreen, and colorBlue RGB component tweens into the propertiesMap (which Velocity understands) and remove the shorthand property. */
							$.each(propertiesMap, function(property, value) {
								/* Find shorthand color properties that have been passed a hex string. */
								if (RegExp("^" + CSS.Lists.colors.join("$|^") + "$").test(CSS.Names.camelCase(property))) {
									/* Parse the value data for each shorthand. */
									var valueData = parsePropertyValue(value, true),
											endValue = valueData[0],
											easing = valueData[1],
											startValue = valueData[2];

									if (CSS.RegEx.isHex.test(endValue)) {
										/* Convert the hex strings into their RGB component arrays. */
										var colorComponents = ["Red", "Green", "Blue"],
												endValueRGB = CSS.Values.hexToRgb(endValue),
												startValueRGB = startValue ? CSS.Values.hexToRgb(startValue) : undefined;

										/* Inject the RGB component tweens into propertiesMap. */
										for (var i = 0; i < colorComponents.length; i++) {
											var dataArray = [endValueRGB[i]];

											if (easing) {
												dataArray.push(easing);
											}

											if (startValueRGB !== undefined) {
												dataArray.push(startValueRGB[i]);
											}

											propertiesMap[CSS.Names.camelCase(property) + colorComponents[i]] = dataArray;
										}

										/* Remove the intermediary shorthand property entry now that we've processed it. */
										delete propertiesMap[property];
									}
								}
							});

							/* Create a tween out of each property, and append its associated data to tweensContainer. */
							for (var property in propertiesMap) {

								if (!propertiesMap.hasOwnProperty(property)) {
									continue;
								}
								/**************************
								 Start Value Sourcing
								 **************************/

								/* Parse out endValue, easing, and startValue from the property's data. */
								var valueData = parsePropertyValue(propertiesMap[property]),
										endValue = valueData[0],
										easing = valueData[1],
										startValue = valueData[2];

								/* Now that the original property name's format has been used for the parsePropertyValue() lookup above,
								 we force the property to its camelCase styling to normalize it for manipulation. */
								property = CSS.Names.camelCase(property);

								/* In case this property is a hook, there are circumstances where we will intend to work on the hook's root property and not the hooked subproperty. */
								var rootProperty = CSS.Hooks.getRoot(property),
										rootPropertyValue = false;

								/* Other than for the dummy tween property, properties that are not supported by the browser (and do not have an associated normalization) will
								 inherently produce no style changes when set, so they are skipped in order to decrease animation tick overhead.
								 Property support is determined via prefixCheck(), which returns a false flag when no supported is detected. */
								/* Note: Since SVG elements have some of their properties directly applied as HTML attributes,
								 there is no way to check for their explicit browser support, and so we skip skip this check for them. */
								if ((!data || !data.isSVG) && rootProperty !== "tween" && CSS.Names.prefixCheck(rootProperty)[1] === false && CSS.Normalizations.registered[rootProperty] === undefined) {
									if (Velocity.debug) {
										console.log("Skipping [" + rootProperty + "] due to a lack of browser support.");
									}
									continue;
								}

								/* If the display option is being set to a non-"none" (e.g. "block") and opacity (filter on IE<=8) is being
								 animated to an endValue of non-zero, the user's intention is to fade in from invisible, thus we forcefeed opacity
								 a startValue of 0 if its startValue hasn't already been sourced by value transferring or prior forcefeeding. */
								if (((opts.display !== undefined && opts.display !== null && opts.display !== "none") || (opts.visibility !== undefined && opts.visibility !== "hidden")) && /opacity|filter/.test(property) && !startValue && endValue !== 0) {
									startValue = 0;
								}

								/* If values have been transferred from the previous Velocity call, extract the endValue and rootPropertyValue
								 for all of the current call's properties that were *also* animated in the previous call. */
								/* Note: Value transferring can optionally be disabled by the user via the _cacheValues option. */
								if (opts._cacheValues && lastTweensContainer && lastTweensContainer[property]) {
									if (startValue === undefined) {
										startValue = lastTweensContainer[property].endValue + lastTweensContainer[property].unitType;
									}

									/* The previous call's rootPropertyValue is extracted from the element's data cache since that's the
									 instance of rootPropertyValue that gets freshly updated by the tweening process, whereas the rootPropertyValue
									 attached to the incoming lastTweensContainer is equal to the root property's value prior to any tweening. */
									rootPropertyValue = data.rootPropertyValueCache[rootProperty];
									/* If values were not transferred from a previous Velocity call, query the DOM as needed. */
								} else {
									/* Handle hooked properties. */
									if (CSS.Hooks.registered[property]) {
										if (startValue === undefined) {
											rootPropertyValue = CSS.getPropertyValue(element, rootProperty); /* GET */
											/* Note: The following getPropertyValue() call does not actually trigger a DOM query;
											 getPropertyValue() will extract the hook from rootPropertyValue. */
											startValue = CSS.getPropertyValue(element, property, rootPropertyValue);
											/* If startValue is already defined via forcefeeding, do not query the DOM for the root property's value;
											 just grab rootProperty's zero-value template from CSS.Hooks. This overwrites the element's actual
											 root property value (if one is set), but this is acceptable since the primary reason users forcefeed is
											 to avoid DOM queries, and thus we likewise avoid querying the DOM for the root property's value. */
										} else {
											/* Grab this hook's zero-value template, e.g. "0px 0px 0px black". */
											rootPropertyValue = CSS.Hooks.templates[rootProperty][1];
										}
										/* Handle non-hooked properties that haven't already been defined via forcefeeding. */
									} else if (startValue === undefined) {
										startValue = CSS.getPropertyValue(element, property); /* GET */
									}
								}

								/**************************
								 Value Data Extraction
								 **************************/

								var separatedValue,
										endValueUnitType,
										startValueUnitType,
										operator = false;

								/* Separates a property value into its numeric value and its unit type. */
								var separateValue = function(property, value) {
									var unitType,
											numericValue;

									numericValue = (value || "0")
											.toString()
											.toLowerCase()
											/* Match the unit type at the end of the value. */
											.replace(/[%A-z]+$/, function(match) {
												/* Grab the unit type. */
												unitType = match;

												/* Strip the unit type off of value. */
												return "";
											});

									/* If no unit type was supplied, assign one that is appropriate for this property (e.g. "deg" for rotateZ or "px" for width). */
									if (!unitType) {
										unitType = CSS.Values.getUnitType(property);
									}

									return [numericValue, unitType];
								};

								/* Separate startValue. */
								separatedValue = separateValue(property, startValue);
								startValue = separatedValue[0];
								startValueUnitType = separatedValue[1];

								/* Separate endValue, and extract a value operator (e.g. "+=", "-=") if one exists. */
								separatedValue = separateValue(property, endValue);
								endValue = separatedValue[0].replace(/^([+-\/*])=/, function(match, subMatch) {
									operator = subMatch;

									/* Strip the operator off of the value. */
									return "";
								});
								endValueUnitType = separatedValue[1];

								/* Parse float values from endValue and startValue. Default to 0 if NaN is returned. */
								startValue = parseFloat(startValue) || 0;
								endValue = parseFloat(endValue) || 0;

								/***************************************
								 Property-Specific Value Conversion
								 ***************************************/

								/* Custom support for properties that don't actually accept the % unit type, but where pollyfilling is trivial and relatively foolproof. */
								if (endValueUnitType === "%") {
									/* A %-value fontSize/lineHeight is relative to the parent's fontSize (as opposed to the parent's dimensions),
									 which is identical to the em unit's behavior, so we piggyback off of that. */
									if (/^(fontSize|lineHeight)$/.test(property)) {
										/* Convert % into an em decimal value. */
										endValue = endValue / 100;
										endValueUnitType = "em";
										/* For scaleX and scaleY, convert the value into its decimal format and strip off the unit type. */
									} else if (/^scale/.test(property)) {
										endValue = endValue / 100;
										endValueUnitType = "";
										/* For RGB components, take the defined percentage of 255 and strip off the unit type. */
									} else if (/(Red|Green|Blue)$/i.test(property)) {
										endValue = (endValue / 100) * 255;
										endValueUnitType = "";
									}
								}

								/***************************
								 Unit Ratio Calculation
								 ***************************/

								/* When queried, the browser returns (most) CSS property values in pixels. Therefore, if an endValue with a unit type of
								 %, em, or rem is animated toward, startValue must be converted from pixels into the same unit type as endValue in order
								 for value manipulation logic (increment/decrement) to proceed. Further, if the startValue was forcefed or transferred
								 from a previous call, startValue may also not be in pixels. Unit conversion logic therefore consists of two steps:
								 1) Calculating the ratio of %/em/rem/vh/vw relative to pixels
								 2) Converting startValue into the same unit of measurement as endValue based on these ratios. */
								/* Unit conversion ratios are calculated by inserting a sibling node next to the target node, copying over its position property,
								 setting values with the target unit type then comparing the returned pixel value. */
								/* Note: Even if only one of these unit types is being animated, all unit ratios are calculated at once since the overhead
								 of batching the SETs and GETs together upfront outweights the potential overhead
								 of layout thrashing caused by re-querying for uncalculated ratios for subsequently-processed properties. */
								/* Todo: Shift this logic into the calls' first tick instance so that it's synced with RAF. */
								var calculateUnitRatios = function() {

									/************************
									 Same Ratio Checks
									 ************************/

									/* The properties below are used to determine whether the element differs sufficiently from this call's
									 previously iterated element to also differ in its unit conversion ratios. If the properties match up with those
									 of the prior element, the prior element's conversion ratios are used. Like most optimizations in Velocity,
									 this is done to minimize DOM querying. */
									var sameRatioIndicators = {
										myParent: element.parentNode || document.body, /* GET */
										position: CSS.getPropertyValue(element, "position"), /* GET */
										fontSize: CSS.getPropertyValue(element, "fontSize") /* GET */
									},
									/* Determine if the same % ratio can be used. % is based on the element's position value and its parent's width and height dimensions. */
									samePercentRatio = ((sameRatioIndicators.position === callUnitConversionData.lastPosition) && (sameRatioIndicators.myParent === callUnitConversionData.lastParent)),
											/* Determine if the same em ratio can be used. em is relative to the element's fontSize. */
											sameEmRatio = (sameRatioIndicators.fontSize === callUnitConversionData.lastFontSize);

									/* Store these ratio indicators call-wide for the next element to compare against. */
									callUnitConversionData.lastParent = sameRatioIndicators.myParent;
									callUnitConversionData.lastPosition = sameRatioIndicators.position;
									callUnitConversionData.lastFontSize = sameRatioIndicators.fontSize;

									/***************************
									 Element-Specific Units
									 ***************************/

									/* Note: IE8 rounds to the nearest pixel when returning CSS values, thus we perform conversions using a measurement
									 of 100 (instead of 1) to give our ratios a precision of at least 2 decimal values. */
									var measurement = 100,
											unitRatios = {};

									if (!sameEmRatio || !samePercentRatio) {
										var dummy = data && data.isSVG ? document.createElementNS("http://www.w3.org/2000/svg", "rect") : document.createElement("div");

										Velocity.init(dummy);
										sameRatioIndicators.myParent.appendChild(dummy);

										/* To accurately and consistently calculate conversion ratios, the element's cascaded overflow and box-sizing are stripped.
										 Similarly, since width/height can be artificially constrained by their min-/max- equivalents, these are controlled for as well. */
										/* Note: Overflow must be also be controlled for per-axis since the overflow property overwrites its per-axis values. */
										$.each(["overflow", "overflowX", "overflowY"], function(i, property) {
											Velocity.CSS.setPropertyValue(dummy, property, "hidden");
										});
										Velocity.CSS.setPropertyValue(dummy, "position", sameRatioIndicators.position);
										Velocity.CSS.setPropertyValue(dummy, "fontSize", sameRatioIndicators.fontSize);
										Velocity.CSS.setPropertyValue(dummy, "boxSizing", "content-box");

										/* width and height act as our proxy properties for measuring the horizontal and vertical % ratios. */
										$.each(["minWidth", "maxWidth", "width", "minHeight", "maxHeight", "height"], function(i, property) {
											Velocity.CSS.setPropertyValue(dummy, property, measurement + "%");
										});
										/* paddingLeft arbitrarily acts as our proxy property for the em ratio. */
										Velocity.CSS.setPropertyValue(dummy, "paddingLeft", measurement + "em");

										/* Divide the returned value by the measurement to get the ratio between 1% and 1px. Default to 1 since working with 0 can produce Infinite. */
										unitRatios.percentToPxWidth = callUnitConversionData.lastPercentToPxWidth = (parseFloat(CSS.getPropertyValue(dummy, "width", null, true)) || 1) / measurement; /* GET */
										unitRatios.percentToPxHeight = callUnitConversionData.lastPercentToPxHeight = (parseFloat(CSS.getPropertyValue(dummy, "height", null, true)) || 1) / measurement; /* GET */
										unitRatios.emToPx = callUnitConversionData.lastEmToPx = (parseFloat(CSS.getPropertyValue(dummy, "paddingLeft")) || 1) / measurement; /* GET */

										sameRatioIndicators.myParent.removeChild(dummy);
									} else {
										unitRatios.emToPx = callUnitConversionData.lastEmToPx;
										unitRatios.percentToPxWidth = callUnitConversionData.lastPercentToPxWidth;
										unitRatios.percentToPxHeight = callUnitConversionData.lastPercentToPxHeight;
									}

									/***************************
									 Element-Agnostic Units
									 ***************************/

									/* Whereas % and em ratios are determined on a per-element basis, the rem unit only needs to be checked
									 once per call since it's exclusively dependant upon document.body's fontSize. If this is the first time
									 that calculateUnitRatios() is being run during this call, remToPx will still be set to its default value of null,
									 so we calculate it now. */
									if (callUnitConversionData.remToPx === null) {
										/* Default to browsers' default fontSize of 16px in the case of 0. */
										callUnitConversionData.remToPx = parseFloat(CSS.getPropertyValue(document.body, "fontSize")) || 16; /* GET */
									}

									/* Similarly, viewport units are %-relative to the window's inner dimensions. */
									if (callUnitConversionData.vwToPx === null) {
										callUnitConversionData.vwToPx = parseFloat(window.innerWidth) / 100; /* GET */
										callUnitConversionData.vhToPx = parseFloat(window.innerHeight) / 100; /* GET */
									}

									unitRatios.remToPx = callUnitConversionData.remToPx;
									unitRatios.vwToPx = callUnitConversionData.vwToPx;
									unitRatios.vhToPx = callUnitConversionData.vhToPx;

									if (Velocity.debug >= 1) {
										console.log("Unit ratios: " + JSON.stringify(unitRatios), element);
									}
									return unitRatios;
								};

								/********************
								 Unit Conversion
								 ********************/

								/* The * and / operators, which are not passed in with an associated unit, inherently use startValue's unit. Skip value and unit conversion. */
								if (/[\/*]/.test(operator)) {
									endValueUnitType = startValueUnitType;
									/* If startValue and endValue differ in unit type, convert startValue into the same unit type as endValue so that if endValueUnitType
									 is a relative unit (%, em, rem), the values set during tweening will continue to be accurately relative even if the metrics they depend
									 on are dynamically changing during the course of the animation. Conversely, if we always normalized into px and used px for setting values, the px ratio
									 would become stale if the original unit being animated toward was relative and the underlying metrics change during the animation. */
									/* Since 0 is 0 in any unit type, no conversion is necessary when startValue is 0 -- we just start at 0 with endValueUnitType. */
								} else if ((startValueUnitType !== endValueUnitType) && startValue !== 0) {
									/* Unit conversion is also skipped when endValue is 0, but *startValueUnitType* must be used for tween values to remain accurate. */
									/* Note: Skipping unit conversion here means that if endValueUnitType was originally a relative unit, the animation won't relatively
									 match the underlying metrics if they change, but this is acceptable since we're animating toward invisibility instead of toward visibility,
									 which remains past the point of the animation's completion. */
									if (endValue === 0) {
										endValueUnitType = startValueUnitType;
									} else {
										/* By this point, we cannot avoid unit conversion (it's undesirable since it causes layout thrashing).
										 If we haven't already, we trigger calculateUnitRatios(), which runs once per element per call. */
										elementUnitConversionData = elementUnitConversionData || calculateUnitRatios();

										/* The following RegEx matches CSS properties that have their % values measured relative to the x-axis. */
										/* Note: W3C spec mandates that all of margin and padding's properties (even top and bottom) are %-relative to the *width* of the parent element. */
										var axis = (/margin|padding|left|right|width|text|word|letter/i.test(property) || /X$/.test(property) || property === "x") ? "x" : "y";

										/* In order to avoid generating n^2 bespoke conversion functions, unit conversion is a two-step process:
										 1) Convert startValue into pixels. 2) Convert this new pixel value into endValue's unit type. */
										switch (startValueUnitType) {
											case "%":
												/* Note: translateX and translateY are the only properties that are %-relative to an element's own dimensions -- not its parent's dimensions.
												 Velocity does not include a special conversion process to account for this behavior. Therefore, animating translateX/Y from a % value
												 to a non-% value will produce an incorrect start value. Fortunately, this sort of cross-unit conversion is rarely done by users in practice. */
												startValue *= (axis === "x" ? elementUnitConversionData.percentToPxWidth : elementUnitConversionData.percentToPxHeight);
												break;

											case "px":
												/* px acts as our midpoint in the unit conversion process; do nothing. */
												break;

											default:
												startValue *= elementUnitConversionData[startValueUnitType + "ToPx"];
										}

										/* Invert the px ratios to convert into to the target unit. */
										switch (endValueUnitType) {
											case "%":
												startValue *= 1 / (axis === "x" ? elementUnitConversionData.percentToPxWidth : elementUnitConversionData.percentToPxHeight);
												break;

											case "px":
												/* startValue is already in px, do nothing; we're done. */
												break;

											default:
												startValue *= 1 / elementUnitConversionData[endValueUnitType + "ToPx"];
										}
									}
								}

								/*********************
								 Relative Values
								 *********************/

								/* Operator logic must be performed last since it requires unit-normalized start and end values. */
								/* Note: Relative *percent values* do not behave how most people think; while one would expect "+=50%"
								 to increase the property 1.5x its current value, it in fact increases the percent units in absolute terms:
								 50 points is added on top of the current % value. */
								switch (operator) {
									case "+":
										endValue = startValue + endValue;
										break;

									case "-":
										endValue = startValue - endValue;
										break;

									case "*":
										endValue = startValue * endValue;
										break;

									case "/":
										endValue = startValue / endValue;
										break;
								}

								/**************************
								 tweensContainer Push
								 **************************/

								/* Construct the per-property tween object, and push it to the element's tweensContainer. */
								tweensContainer[property] = {
									rootPropertyValue: rootPropertyValue,
									startValue: startValue,
									currentValue: startValue,
									endValue: endValue,
									unitType: endValueUnitType,
									easing: easing
								};

								if (Velocity.debug) {
									console.log("tweensContainer (" + property + "): " + JSON.stringify(tweensContainer[property]), element);
								}
							}

							/* Along with its property data, store a reference to the element itself onto tweensContainer. */
							tweensContainer.element = element;
						}

						/*****************
						 Call Push
						 *****************/

						/* Note: tweensContainer can be empty if all of the properties in this call's property map were skipped due to not
						 being supported by the browser. The element property is used for checking that the tweensContainer has been appended to. */
						if (tweensContainer.element) {
							/* Apply the "velocity-animating" indicator class. */
							CSS.Values.addClass(element, "velocity-animating");

							/* The call array houses the tweensContainers for each element being animated in the current call. */
							call.push(tweensContainer);

							data = Data(element);

							if (data) {
								/* Store the tweensContainer and options if we're working on the default effects queue, so that they can be used by the reverse command. */
								if (opts.queue === "") {

									data.tweensContainer = tweensContainer;
									data.opts = opts;
								}

								/* Switch on the element's animating flag. */
								data.isAnimating = true;
							}

							/* Once the final element in this call's element set has been processed, push the call array onto
							 Velocity.State.calls for the animation tick to immediately begin processing. */
							if (elementsIndex === elementsLength - 1) {
								/* Add the current call plus its associated metadata (the element set and the call's options) onto the global call container.
								 Anything on this call container is subjected to tick() processing. */
								Velocity.State.calls.push([call, elements, opts, null, promiseData.resolver]);

								/* If the animation tick isn't running, start it. (Velocity shuts it off when there are no active calls to process.) */
								if (Velocity.State.isTicking === false) {
									Velocity.State.isTicking = true;

									/* Start the tick loop. */
									tick();
								}
							} else {
								elementsIndex++;
							}
						}
					}

					/* When the queue option is set to false, the call skips the element's queue and fires immediately. */
					if (opts.queue === false) {
						/* Since this buildQueue call doesn't respect the element's existing queue (which is where a delay option would have been appended),
						 we manually inject the delay property here with an explicit setTimeout. */
						if (opts.delay) {
							setTimeout(buildQueue, opts.delay);
						} else {
							buildQueue();
						}
						/* Otherwise, the call undergoes element queueing as normal. */
						/* Note: To interoperate with jQuery, Velocity uses jQuery's own $.queue() stack for queuing logic. */
					} else {
						$.queue(element, opts.queue, function(next, clearQueue) {
							/* If the clearQueue flag was passed in by the stop command, resolve this call's promise. (Promises can only be resolved once,
							 so it's fine if this is repeatedly triggered for each element in the associated call.) */
							if (clearQueue === true) {
								if (promiseData.promise) {
									promiseData.resolver(elements);
								}

								/* Do not continue with animation queueing. */
								return true;
							}

							/* This flag indicates to the upcoming completeCall() function that this queue entry was initiated by Velocity.
							 See completeCall() for further details. */
							Velocity.velocityQueueEntryFlag = true;

							buildQueue(next);
						});
					}

					/*********************
					 Auto-Dequeuing
					 *********************/

					/* As per jQuery's $.queue() behavior, to fire the first non-custom-queue entry on an element, the element
					 must be dequeued if its queue stack consists *solely* of the current call. (This can be determined by checking
					 for the "inprogress" item that jQuery prepends to active queue stack arrays.) Regardless, whenever the element's
					 queue is further appended with additional items -- including $.delay()'s or even $.animate() calls, the queue's
					 first entry is automatically fired. This behavior contrasts that of custom queues, which never auto-fire. */
					/* Note: When an element set is being subjected to a non-parallel Velocity call, the animation will not begin until
					 each one of the elements in the set has reached the end of its individually pre-existing queue chain. */
					/* Note: Unfortunately, most people don't fully grasp jQuery's powerful, yet quirky, $.queue() function.
					 Lean more here: http://stackoverflow.com/questions/1058158/can-somebody-explain-jquery-queue-to-me */
					if ((opts.queue === "" || opts.queue === "fx") && $.queue(element)[0] !== "inprogress") {
						$.dequeue(element);
					}
				}

				/**************************
				 Element Set Iteration
				 **************************/

				/* If the "nodeType" property exists on the elements variable, we're animating a single element.
				 Place it in an array so that $.each() can iterate over it. */
				$.each(elements, function(i, element) {
					/* Ensure each element in a set has a nodeType (is a real element) to avoid throwing errors. */
					if (Type.isNode(element)) {
						processElement(element, i);
					}
				});

				/******************
				 Option: Loop
				 ******************/

				/* The loop option accepts an integer indicating how many times the element should loop between the values in the
				 current call's properties map and the element's property values prior to this call. */
				/* Note: The loop option's logic is performed here -- after element processing -- because the current call needs
				 to undergo its queue insertion prior to the loop option generating its series of constituent "reverse" calls,
				 which chain after the current call. Two reverse calls (two "alternations") constitute one loop. */
				opts = $.extend({}, Velocity.defaults, options);
				opts.loop = parseInt(opts.loop, 10);
				var reverseCallsCount = (opts.loop * 2) - 1;

				if (opts.loop) {
					/* Double the loop count to convert it into its appropriate number of "reverse" calls.
					 Subtract 1 from the resulting value since the current call is included in the total alternation count. */
					for (var x = 0; x < reverseCallsCount; x++) {
						/* Since the logic for the reverse action occurs inside Queueing and therefore this call's options object
						 isn't parsed until then as well, the current call's delay option must be explicitly passed into the reverse
						 call so that the delay logic that occurs inside *Pre-Queueing* can process it. */
						var reverseOptions = {
							delay: opts.delay,
							progress: opts.progress
						};

						/* If a complete callback was passed into this call, transfer it to the loop redirect's final "reverse" call
						 so that it's triggered when the entire redirect is complete (and not when the very first animation is complete). */
						if (x === reverseCallsCount - 1) {
							reverseOptions.display = opts.display;
							reverseOptions.visibility = opts.visibility;
							reverseOptions.complete = opts.complete;
						}

						animate(elements, "reverse", reverseOptions);
					}
				}

				/***************
				 Chaining
				 ***************/

				/* Return the elements back to the call chain, with wrapped elements taking precedence in case Velocity was called via the $.fn. extension. */
				return getChain();
			};

			/* Turn Velocity into the animation function, extended with the pre-existing Velocity object. */
			Velocity = $.extend(animate, Velocity);
			/* For legacy support, also expose the literal animate method. */
			Velocity.animate = animate;

			/**************
			 Timing
			 **************/

			/* Ticker function. */
			var ticker = window.requestAnimationFrame || rAFShim;

			/* Inactive browser tabs pause rAF, which results in all active animations immediately sprinting to their completion states when the tab refocuses.
			 To get around this, we dynamically switch rAF to setTimeout (which the browser *doesn't* pause) when the tab loses focus. We skip this for mobile
			 devices to avoid wasting battery power on inactive tabs. */
			/* Note: Tab focus detection doesn't work on older versions of IE, but that's okay since they don't support rAF to begin with. */
			if (!Velocity.State.isMobile && document.hidden !== undefined) {
				document.addEventListener("visibilitychange", function() {
					/* Reassign the rAF function (which the global tick() function uses) based on the tab's focus state. */
					if (document.hidden) {
						ticker = function(callback) {
							/* The tick function needs a truthy first argument in order to pass its internal timestamp check. */
							return setTimeout(function() {
								callback(true);
							}, 16);
						};

						/* The rAF loop has been paused by the browser, so we manually restart the tick. */
						tick();
					} else {
						ticker = window.requestAnimationFrame || rAFShim;
					}
				});
			}

			/************
			 Tick
			 ************/

			/* Note: All calls to Velocity are pushed to the Velocity.State.calls array, which is fully iterated through upon each tick. */
			function tick(timestamp) {
				/* An empty timestamp argument indicates that this is the first tick occurence since ticking was turned on.
				 We leverage this metadata to fully ignore the first tick pass since RAF's initial pass is fired whenever
				 the browser's next tick sync time occurs, which results in the first elements subjected to Velocity
				 calls being animated out of sync with any elements animated immediately thereafter. In short, we ignore
				 the first RAF tick pass so that elements being immediately consecutively animated -- instead of simultaneously animated
				 by the same Velocity call -- are properly batched into the same initial RAF tick and consequently remain in sync thereafter. */
				if (timestamp) {
					/* We ignore RAF's high resolution timestamp since it can be significantly offset when the browser is
					 under high stress; we opt for choppiness over allowing the browser to drop huge chunks of frames. */
					var timeCurrent = (new Date()).getTime();

					/********************
					 Call Iteration
					 ********************/

					var callsLength = Velocity.State.calls.length;

					/* To speed up iterating over this array, it is compacted (falsey items -- calls that have completed -- are removed)
					 when its length has ballooned to a point that can impact tick performance. This only becomes necessary when animation
					 has been continuous with many elements over a long period of time; whenever all active calls are completed, completeCall() clears Velocity.State.calls. */
					if (callsLength > 10000) {
						Velocity.State.calls = compactSparseArray(Velocity.State.calls);
						callsLength = Velocity.State.calls.length;
					}

					/* Iterate through each active call. */
					for (var i = 0; i < callsLength; i++) {
						/* When a Velocity call is completed, its Velocity.State.calls entry is set to false. Continue on to the next call. */
						if (!Velocity.State.calls[i]) {
							continue;
						}

						/************************
						 Call-Wide Variables
						 ************************/

						var callContainer = Velocity.State.calls[i],
								call = callContainer[0],
								opts = callContainer[2],
								timeStart = callContainer[3],
								firstTick = !!timeStart,
								tweenDummyValue = null;

						/* If timeStart is undefined, then this is the first time that this call has been processed by tick().
						 We assign timeStart now so that its value is as close to the real animation start time as possible.
						 (Conversely, had timeStart been defined when this call was added to Velocity.State.calls, the delay
						 between that time and now would cause the first few frames of the tween to be skipped since
						 percentComplete is calculated relative to timeStart.) */
						/* Further, subtract 16ms (the approximate resolution of RAF) from the current time value so that the
						 first tick iteration isn't wasted by animating at 0% tween completion, which would produce the
						 same style value as the element's current value. */
						if (!timeStart) {
							timeStart = Velocity.State.calls[i][3] = timeCurrent - 16;
						}

						/* The tween's completion percentage is relative to the tween's start time, not the tween's start value
						 (which would result in unpredictable tween durations since JavaScript's timers are not particularly accurate).
						 Accordingly, we ensure that percentComplete does not exceed 1. */
						var percentComplete = Math.min((timeCurrent - timeStart) / opts.duration, 1);

						/**********************
						 Element Iteration
						 **********************/

						/* For every call, iterate through each of the elements in its set. */
						for (var j = 0, callLength = call.length; j < callLength; j++) {
							var tweensContainer = call[j],
									element = tweensContainer.element;

							/* Check to see if this element has been deleted midway through the animation by checking for the
							 continued existence of its data cache. If it's gone, skip animating this element. */
							if (!Data(element)) {
								continue;
							}

							var transformPropertyExists = false;

							/**********************************
							 Display & Visibility Toggling
							 **********************************/

							/* If the display option is set to non-"none", set it upfront so that the element can become visible before tweening begins.
							 (Otherwise, display's "none" value is set in completeCall() once the animation has completed.) */
							if (opts.display !== undefined && opts.display !== null && opts.display !== "none") {
								if (opts.display === "flex") {
									var flexValues = ["-webkit-box", "-moz-box", "-ms-flexbox", "-webkit-flex"];

									$.each(flexValues, function(i, flexValue) {
										CSS.setPropertyValue(element, "display", flexValue);
									});
								}

								CSS.setPropertyValue(element, "display", opts.display);
							}

							/* Same goes with the visibility option, but its "none" equivalent is "hidden". */
							if (opts.visibility !== undefined && opts.visibility !== "hidden") {
								CSS.setPropertyValue(element, "visibility", opts.visibility);
							}

							/************************
							 Property Iteration
							 ************************/

							/* For every element, iterate through each property. */
							for (var property in tweensContainer) {
								/* Note: In addition to property tween data, tweensContainer contains a reference to its associated element. */
								if (tweensContainer.hasOwnProperty(property) && property !== "element") {
									var tween = tweensContainer[property],
											currentValue,
											/* Easing can either be a pre-genereated function or a string that references a pre-registered easing
											 on the Velocity.Easings object. In either case, return the appropriate easing *function*. */
											easing = Type.isString(tween.easing) ? Velocity.Easings[tween.easing] : tween.easing;

									/******************************
									 Current Value Calculation
									 ******************************/

									/* If this is the last tick pass (if we've reached 100% completion for this tween),
									 ensure that currentValue is explicitly set to its target endValue so that it's not subjected to any rounding. */
									if (percentComplete === 1) {
										currentValue = tween.endValue;
										/* Otherwise, calculate currentValue based on the current delta from startValue. */
									} else {
										var tweenDelta = tween.endValue - tween.startValue;
										currentValue = tween.startValue + (tweenDelta * easing(percentComplete, opts, tweenDelta));

										/* If no value change is occurring, don't proceed with DOM updating. */
										if (!firstTick && (currentValue === tween.currentValue)) {
											continue;
										}
									}

									tween.currentValue = currentValue;

									/* If we're tweening a fake 'tween' property in order to log transition values, update the one-per-call variable so that
									 it can be passed into the progress callback. */
									if (property === "tween") {
										tweenDummyValue = currentValue;
									} else {
										/******************
										 Hooks: Part I
										 ******************/
										var hookRoot;

										/* For hooked properties, the newly-updated rootPropertyValueCache is cached onto the element so that it can be used
										 for subsequent hooks in this call that are associated with the same root property. If we didn't cache the updated
										 rootPropertyValue, each subsequent update to the root property in this tick pass would reset the previous hook's
										 updates to rootPropertyValue prior to injection. A nice performance byproduct of rootPropertyValue caching is that
										 subsequently chained animations using the same hookRoot but a different hook can use this cached rootPropertyValue. */
										if (CSS.Hooks.registered[property]) {
											hookRoot = CSS.Hooks.getRoot(property);

											var rootPropertyValueCache = Data(element).rootPropertyValueCache[hookRoot];

											if (rootPropertyValueCache) {
												tween.rootPropertyValue = rootPropertyValueCache;
											}
										}

										/*****************
										 DOM Update
										 *****************/

										/* setPropertyValue() returns an array of the property name and property value post any normalization that may have been performed. */
										/* Note: To solve an IE<=8 positioning bug, the unit type is dropped when setting a property value of 0. */
										var adjustedSetData = CSS.setPropertyValue(element, /* SET */
												property,
												tween.currentValue + (parseFloat(currentValue) === 0 ? "" : tween.unitType),
												tween.rootPropertyValue,
												tween.scrollData);

										/*******************
										 Hooks: Part II
										 *******************/

										/* Now that we have the hook's updated rootPropertyValue (the post-processed value provided by adjustedSetData), cache it onto the element. */
										if (CSS.Hooks.registered[property]) {
											/* Since adjustedSetData contains normalized data ready for DOM updating, the rootPropertyValue needs to be re-extracted from its normalized form. ?? */
											if (CSS.Normalizations.registered[hookRoot]) {
												Data(element).rootPropertyValueCache[hookRoot] = CSS.Normalizations.registered[hookRoot]("extract", null, adjustedSetData[1]);
											} else {
												Data(element).rootPropertyValueCache[hookRoot] = adjustedSetData[1];
											}
										}

										/***************
										 Transforms
										 ***************/

										/* Flag whether a transform property is being animated so that flushTransformCache() can be triggered once this tick pass is complete. */
										if (adjustedSetData[0] === "transform") {
											transformPropertyExists = true;
										}

									}
								}
							}

							/****************
							 mobileHA
							 ****************/

							/* If mobileHA is enabled, set the translate3d transform to null to force hardware acceleration.
							 It's safe to override this property since Velocity doesn't actually support its animation (hooks are used in its place). */
							if (opts.mobileHA) {
								/* Don't set the null transform hack if we've already done so. */
								if (Data(element).transformCache.translate3d === undefined) {
									/* All entries on the transformCache object are later concatenated into a single transform string via flushTransformCache(). */
									Data(element).transformCache.translate3d = "(0px, 0px, 0px)";

									transformPropertyExists = true;
								}
							}

							if (transformPropertyExists) {
								CSS.flushTransformCache(element);
							}
						}

						/* The non-"none" display value is only applied to an element once -- when its associated call is first ticked through.
						 Accordingly, it's set to false so that it isn't re-processed by this call in the next tick. */
						if (opts.display !== undefined && opts.display !== "none") {
							Velocity.State.calls[i][2].display = false;
						}
						if (opts.visibility !== undefined && opts.visibility !== "hidden") {
							Velocity.State.calls[i][2].visibility = false;
						}

						/* Pass the elements and the timing data (percentComplete, msRemaining, timeStart, tweenDummyValue) into the progress callback. */
						if (opts.progress) {
							opts.progress.call(callContainer[1],
									callContainer[1],
									percentComplete,
									Math.max(0, (timeStart + opts.duration) - timeCurrent),
									timeStart,
									tweenDummyValue);
						}

						/* If this call has finished tweening, pass its index to completeCall() to handle call cleanup. */
						if (percentComplete === 1) {
							completeCall(i);
						}
					}
				}

				/* Note: completeCall() sets the isTicking flag to false when the last call on Velocity.State.calls has completed. */
				if (Velocity.State.isTicking) {
					ticker(tick);
				}
			}

			/**********************
			 Call Completion
			 **********************/

			/* Note: Unlike tick(), which processes all active calls at once, call completion is handled on a per-call basis. */
			function completeCall(callIndex, isStopped) {
				/* Ensure the call exists. */
				if (!Velocity.State.calls[callIndex]) {
					return false;
				}

				/* Pull the metadata from the call. */
				var call = Velocity.State.calls[callIndex][0],
						elements = Velocity.State.calls[callIndex][1],
						opts = Velocity.State.calls[callIndex][2],
						resolver = Velocity.State.calls[callIndex][4];

				var remainingCallsExist = false;

				/*************************
				 Element Finalization
				 *************************/

				for (var i = 0, callLength = call.length; i < callLength; i++) {
					var element = call[i].element;

					/* If the user set display to "none" (intending to hide the element), set it now that the animation has completed. */
					/* Note: display:none isn't set when calls are manually stopped (via Velocity("stop"). */
					/* Note: Display gets ignored with "reverse" calls and infinite loops, since this behavior would be undesirable. */
					if (!isStopped && !opts.loop) {
						if (opts.display === "none") {
							CSS.setPropertyValue(element, "display", opts.display);
						}

						if (opts.visibility === "hidden") {
							CSS.setPropertyValue(element, "visibility", opts.visibility);
						}
					}

					/* If the element's queue is empty (if only the "inprogress" item is left at position 0) or if its queue is about to run
					 a non-Velocity-initiated entry, turn off the isAnimating flag. A non-Velocity-initiatied queue entry's logic might alter
					 an element's CSS values and thereby cause Velocity's cached value data to go stale. To detect if a queue entry was initiated by Velocity,
					 we check for the existence of our special Velocity.queueEntryFlag declaration, which minifiers won't rename since the flag
					 is assigned to jQuery's global $ object and thus exists out of Velocity's own scope. */
					var data = Data(element);

					if (opts.loop !== true && ($.queue(element)[1] === undefined || !/\.velocityQueueEntryFlag/i.test($.queue(element)[1]))) {
						/* The element may have been deleted. Ensure that its data cache still exists before acting on it. */
						if (data) {
							data.isAnimating = false;
							/* Clear the element's rootPropertyValueCache, which will become stale. */
							data.rootPropertyValueCache = {};

							var transformHAPropertyExists = false;
							/* If any 3D transform subproperty is at its default value (regardless of unit type), remove it. */
							$.each(CSS.Lists.transforms3D, function(i, transformName) {
								var defaultValue = /^scale/.test(transformName) ? 1 : 0,
										currentValue = data.transformCache[transformName];

								if (data.transformCache[transformName] !== undefined && new RegExp("^\\(" + defaultValue + "[^.]").test(currentValue)) {
									transformHAPropertyExists = true;

									delete data.transformCache[transformName];
								}
							});

							/* Mobile devices have hardware acceleration removed at the end of the animation in order to avoid hogging the GPU's memory. */
							if (opts.mobileHA) {
								transformHAPropertyExists = true;
								delete data.transformCache.translate3d;
							}

							/* Flush the subproperty removals to the DOM. */
							if (transformHAPropertyExists) {
								CSS.flushTransformCache(element);
							}

							/* Remove the "velocity-animating" indicator class. */
							CSS.Values.removeClass(element, "velocity-animating");
						}
					}

					/*********************
					 Option: Complete
					 *********************/

					/* Complete is fired once per call (not once per element) and is passed the full raw DOM element set as both its context and its first argument. */
					/* Note: Callbacks aren't fired when calls are manually stopped (via Velocity("stop"). */
					if (!isStopped && opts.complete && !opts.loop && (i === callLength - 1)) {
						/* We throw callbacks in a setTimeout so that thrown errors don't halt the execution of Velocity itself. */
						try {
							opts.complete.call(elements, elements);
						} catch (error) {
							setTimeout(function() {
								throw error;
							}, 1);
						}
					}

					/**********************
					 Promise Resolving
					 **********************/

					/* Note: Infinite loops don't return promises. */
					if (resolver && opts.loop !== true) {
						resolver(elements);
					}

					/****************************
					 Option: Loop (Infinite)
					 ****************************/

					if (data && opts.loop === true && !isStopped) {
						/* If a rotateX/Y/Z property is being animated by 360 deg with loop:true, swap tween start/end values to enable
						 continuous iterative rotation looping. (Otherise, the element would just rotate back and forth.) */
						$.each(data.tweensContainer, function(propertyName, tweenContainer) {
							if (/^rotate/.test(propertyName) && ((parseFloat(tweenContainer.startValue) - parseFloat(tweenContainer.endValue)) % 360 === 0)) {
								var oldStartValue = tweenContainer.startValue;

								tweenContainer.startValue = tweenContainer.endValue;
								tweenContainer.endValue = oldStartValue;
							}

							if (/^backgroundPosition/.test(propertyName) && parseFloat(tweenContainer.endValue) === 100 && tweenContainer.unitType === "%") {
								tweenContainer.endValue = 0;
								tweenContainer.startValue = 100;
							}
						});

						Velocity(element, "reverse", {loop: true, delay: opts.delay});
					}

					/***************
					 Dequeueing
					 ***************/

					/* Fire the next call in the queue so long as this call's queue wasn't set to false (to trigger a parallel animation),
					 which would have already caused the next call to fire. Note: Even if the end of the animation queue has been reached,
					 $.dequeue() must still be called in order to completely clear jQuery's animation queue. */
					if (opts.queue !== false) {
						$.dequeue(element, opts.queue);
					}
				}

				/************************
				 Calls Array Cleanup
				 ************************/

				/* Since this call is complete, set it to false so that the rAF tick skips it. This array is later compacted via compactSparseArray().
				 (For performance reasons, the call is set to false instead of being deleted from the array: http://www.html5rocks.com/en/tutorials/speed/v8/) */
				Velocity.State.calls[callIndex] = false;

				/* Iterate through the calls array to determine if this was the final in-progress animation.
				 If so, set a flag to end ticking and clear the calls array. */
				for (var j = 0, callsLength = Velocity.State.calls.length; j < callsLength; j++) {
					if (Velocity.State.calls[j] !== false) {
						remainingCallsExist = true;

						break;
					}
				}

				if (remainingCallsExist === false) {
					/* tick() will detect this flag upon its next iteration and subsequently turn itself off. */
					Velocity.State.isTicking = false;

					/* Clear the calls array so that its length is reset. */
					delete Velocity.State.calls;
					Velocity.State.calls = [];
				}
			}

			/******************
			 Frameworks
			 ******************/

			/* Both jQuery and Zepto allow their $.fn object to be extended to allow wrapped elements to be subjected to plugin calls.
			 If either framework is loaded, register a "velocity" extension pointing to Velocity's core animate() method.  Velocity
			 also registers itself onto a global container (window.jQuery || window.Zepto || window) so that certain features are
			 accessible beyond just a per-element scope. This master object contains an .animate() method, which is later assigned to $.fn
			 (if jQuery or Zepto are present). Accordingly, Velocity can both act on wrapped DOM elements and stand alone for targeting raw DOM elements. */
			global.Velocity = Velocity;

			if (global !== window) {
				/* Assign the element function to Velocity's core animate() method. */
				global.fn.velocity = animate;
				/* Assign the object function's defaults to Velocity's global defaults object. */
				global.fn.velocity.defaults = Velocity.defaults;
			}

			/***********************
			 Packaged Redirects
			 ***********************/

			/* slideUp, slideDown */
			$.each(["Down", "Up"], function(i, direction) {
				Velocity.Redirects["slide" + direction] = function(element, options, elementsIndex, elementsSize, elements, promiseData) {
					var opts = $.extend({}, options),
							begin = opts.begin,
							complete = opts.complete,
							computedValues = {height: "", marginTop: "", marginBottom: "", paddingTop: "", paddingBottom: ""},
					inlineValues = {};

					if (opts.display === undefined) {
						/* Show the element before slideDown begins and hide the element after slideUp completes. */
						/* Note: Inline elements cannot have dimensions animated, so they're reverted to inline-block. */
						opts.display = (direction === "Down" ? (Velocity.CSS.Values.getDisplayType(element) === "inline" ? "inline-block" : "block") : "none");
					}

					opts.begin = function() {
						/* If the user passed in a begin callback, fire it now. */
						if (begin) {
							begin.call(elements, elements);
						}

						/* Cache the elements' original vertical dimensional property values so that we can animate back to them. */
						for (var property in computedValues) {
							if (!computedValues.hasOwnProperty(property)) {
								continue;
							}
							inlineValues[property] = element.style[property];

							/* For slideDown, use forcefeeding to animate all vertical properties from 0. For slideUp,
							 use forcefeeding to start from computed values and animate down to 0. */
							var propertyValue = Velocity.CSS.getPropertyValue(element, property);
							computedValues[property] = (direction === "Down") ? [propertyValue, 0] : [0, propertyValue];
						}

						/* Force vertical overflow content to clip so that sliding works as expected. */
						inlineValues.overflow = element.style.overflow;
						element.style.overflow = "hidden";
					};

					opts.complete = function() {
						/* Reset element to its pre-slide inline values once its slide animation is complete. */
						for (var property in inlineValues) {
							if (inlineValues.hasOwnProperty(property)) {
								element.style[property] = inlineValues[property];
							}
						}

						/* If the user passed in a complete callback, fire it now. */
						if (complete) {
							complete.call(elements, elements);
						}
						if (promiseData) {
							promiseData.resolver(elements);
						}
					};

					Velocity(element, computedValues, opts);
				};
			});

			/* fadeIn, fadeOut */
			$.each(["In", "Out"], function(i, direction) {
				Velocity.Redirects["fade" + direction] = function(element, options, elementsIndex, elementsSize, elements, promiseData) {
					var opts = $.extend({}, options),
							originalComplete = opts.complete,
							propertiesMap = {opacity: (direction === "In") ? 1 : 0};

					/* Since redirects are triggered individually for each element in the animated set, avoid repeatedly triggering
					 callbacks by firing them only when the final element has been reached. */
					if (elementsIndex !== elementsSize - 1) {
						opts.complete = opts.begin = null;
					} else {
						opts.complete = function() {
							if (originalComplete) {
								originalComplete.call(elements, elements);
							}

							if (promiseData) {
								promiseData.resolver(elements);
							}
						};
					}

					/* If a display was passed in, use it. Otherwise, default to "none" for fadeOut or the element-specific default for fadeIn. */
					/* Note: We allow users to pass in "null" to skip display setting altogether. */
					if (opts.display === undefined) {
						opts.display = (direction === "In" ? "auto" : "none");
					}

					Velocity(this, propertiesMap, opts);
				};
			});

			return Velocity;
		}((window.jQuery || window.Zepto || window), window, document);
	}));

	/******************
	 Known Issues
	 ******************/

	/* The CSS spec mandates that the translateX/Y/Z transforms are %-relative to the element itself -- not its parent.
	 Velocity, however, doesn't make this distinction. Thus, converting to or from the % unit with these subproperties
	 will produce an inaccurate conversion value. The same issue exists with the cx/cy attributes of SVG circles and ellipses. */


/***/ },
/* 17 */
/*!*****************************************!*\
  !*** ./src/client/js/services/modal.js ***!
  \*****************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//---------//
	// Imports //
	//---------//

	var $ = __webpack_require__(/*! ../external/domtastic.custom */ 5),
	    duration = __webpack_require__(/*! ../constants/duration */ 13),
	    r = __webpack_require__(/*! ../../../../lib/external/ramda.custom */ 7),
	    render = __webpack_require__(/*! ../services/render */ 18),
	    tabbable = __webpack_require__(/*! tabbable */ 21),
	    utils = __webpack_require__(/*! ../utils */ 12),
	    velocity = __webpack_require__(/*! velocity-animate */ 16);

	//------//
	// Init //
	//------//

	var modalBacklightDt = $('#modal-backlight'),
	    modalBacklight = modalBacklightDt[0],
	    addHoveredDt = utils.addHoveredDt,
	    getNumColumns = utils.getNumColumns,
	    keycodes = utils.keycodes,
	    postModalRender = {
	  form: postFormRender,
	  dialog: r.always(undefined)
	};

	//------//
	// Main //
	//------//

	var exportMe = {
	  form: createModal('form'),
	  dialog: createModal('dialog')
	};

	//-------------//
	// Helper Fxns //
	//-------------//

	function createModal(type) {
	  var aModalDt = $('#modal-' + type),
	      renderModal = getRenderer(type, aModalDt);

	  aModalDt.type = type;

	  return {
	    show: function show(_ref) {
	      var ctx = _ref.ctx,
	          cbs = _ref.cbs;

	      var myself = this;

	      modalBacklightDt.css('display', 'block');
	      aModalDt.css('display', 'block');
	      renderModal(ctx);

	      aModalDt.find('button').forEach(assignCb(cbs));

	      var escapableTargets = aModalDt.find('input, textbox, button').map(r.identity);

	      aModalDt.on('keyup', function (e) {
	        if (r.contains(e.target, escapableTargets) && e.keyCode === keycodes.esc) myself.hide();
	      });

	      return velocity([aModalDt[0], modalBacklight], { opacity: 1 }, { duration: duration.small }).then(function () {
	        modalBacklightDt.on('click', function (e) {
	          if (e.target === modalBacklight) {
	            var backlightClickEmulatesButton = aModalDt.find('button[action="cancel"]')[0] || aModalDt.find('button:last-of-type')[0];

	            backlightClickEmulatesButton.click();
	          }
	        });
	      });
	    },
	    hide: function hide() {
	      modalBacklightDt.off('click');

	      return velocity([aModalDt[0], modalBacklight], { opacity: 0 }, { duration: duration.small }).then(function () {
	        aModalDt.css('display', 'none').html('');

	        modalBacklightDt.css('display', 'none');
	      });
	    },
	    dt: aModalDt
	  };
	}

	function verticallyPosition(modalDt) {
	  var modal = modalDt[0],
	      numCols = getNumColumns();

	  var yOffset = window.scrollY + (numCols === 1 && modalDt.type === 'form' ? Math.round(document.documentElement.clientWidth * 0.05) : Math.round((document.documentElement.clientHeight - modal.clientHeight) / 3));

	  modalDt.css('top', yOffset + 'px');
	  return modalDt;
	}

	function horizontallyCenter(modalDt) {
	  var modal = modalDt[0];
	  var xOffset = Math.round((document.documentElement.clientWidth - modal.clientWidth) / 2);
	  modalDt.css('left', xOffset + 'px');
	  return modalDt;
	}

	var center = {
	  form: verticallyPosition,
	  dialog: r.pipe(verticallyPosition, horizontallyCenter)
	};

	function getRenderer(type, modalDt) {
	  return function (ctx) {
	    modalDt.html(render('modal-' + type, ctx));
	    center[type](modalDt);
	    addHoveredDt(modalDt.find('button'));
	    if (type === 'form') {
	      tabbable(modalDt[0])[0].focus();
	    } else {
	      modalDt.find('button:not([data-action="delete"])')[0].focus();
	    }
	    postModalRender[type](modalDt);
	  };
	}

	function postFormRender(modalDt) {
	  modalDt.find('form')[0].onsubmit = function (e) {
	    e.preventDefault();
	    return false;
	  };
	}

	function assignCb(cbs) {
	  return function (button) {
	    button.addEventListener('click', cbs[$(button).attr('data-action')]);
	  };
	}

	//---------//
	// Exports //
	//---------//

	module.exports = exportMe;

/***/ },
/* 18 */
/*!******************************************!*\
  !*** ./src/client/js/services/render.js ***!
  \******************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//---------//
	// Imports //
	//---------//

	var nunjucksSlim = __webpack_require__(/*! nunjucks/browser/nunjucks-slim */ 19),
	    precompiledTemplates = __webpack_require__(/*! ../precompiled-templates */ 20),
	    r = __webpack_require__(/*! ../../../../lib/external/ramda.custom */ 7);

	//------//
	// Main //
	//------//

	var env = initiateNunjucks(),
	    render = r.curryN(2, env.render.bind(env));

	//-------------//
	// Helper Fxns //
	//-------------//

	function initiateNunjucks() {
	  var env = nunjucksSlim.configure();
	  env.loaders.length = 0;
	  var precompiledTemplatesLoader = new nunjucksSlim.PrecompiledLoader(precompiledTemplates);
	  precompiledTemplatesLoader.cache = {};
	  env.loaders.push(precompiledTemplatesLoader);

	  return env;
	}

	//---------//
	// Exports //
	//---------//

	module.exports = render;

/***/ },
/* 19 */
/*!*********************************************!*\
  !*** ./~/nunjucks/browser/nunjucks-slim.js ***!
  \*********************************************/
/***/ function(module, exports, __webpack_require__) {

	/*! Browser bundle of nunjucks 2.5.2 (slim, only works with precompiled templates) */
	(function webpackUniversalModuleDefinition(root, factory) {
		if(true)
			module.exports = factory();
		else if(typeof define === 'function' && define.amd)
			define([], factory);
		else if(typeof exports === 'object')
			exports["nunjucks"] = factory();
		else
			root["nunjucks"] = factory();
	})(this, function() {
	return /******/ (function(modules) { // webpackBootstrap
	/******/ 	// The module cache
	/******/ 	var installedModules = {};

	/******/ 	// The require function
	/******/ 	function __webpack_require__(moduleId) {

	/******/ 		// Check if module is in cache
	/******/ 		if(installedModules[moduleId])
	/******/ 			return installedModules[moduleId].exports;

	/******/ 		// Create a new module (and put it into the cache)
	/******/ 		var module = installedModules[moduleId] = {
	/******/ 			exports: {},
	/******/ 			id: moduleId,
	/******/ 			loaded: false
	/******/ 		};

	/******/ 		// Execute the module function
	/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

	/******/ 		// Flag the module as loaded
	/******/ 		module.loaded = true;

	/******/ 		// Return the exports of the module
	/******/ 		return module.exports;
	/******/ 	}


	/******/ 	// expose the modules object (__webpack_modules__)
	/******/ 	__webpack_require__.m = modules;

	/******/ 	// expose the module cache
	/******/ 	__webpack_require__.c = installedModules;

	/******/ 	// __webpack_public_path__
	/******/ 	__webpack_require__.p = "";

	/******/ 	// Load entry module and return exports
	/******/ 	return __webpack_require__(0);
	/******/ })
	/************************************************************************/
	/******/ ([
	/* 0 */
	/***/ function(module, exports, __webpack_require__) {

		'use strict';

		var lib = __webpack_require__(1);
		var env = __webpack_require__(2);
		var Loader = __webpack_require__(11);
		var loaders = __webpack_require__(3);
		var precompile = __webpack_require__(3);

		module.exports = {};
		module.exports.Environment = env.Environment;
		module.exports.Template = env.Template;

		module.exports.Loader = Loader;
		module.exports.FileSystemLoader = loaders.FileSystemLoader;
		module.exports.PrecompiledLoader = loaders.PrecompiledLoader;
		module.exports.WebLoader = loaders.WebLoader;

		module.exports.compiler = __webpack_require__(3);
		module.exports.parser = __webpack_require__(3);
		module.exports.lexer = __webpack_require__(3);
		module.exports.runtime = __webpack_require__(8);
		module.exports.lib = lib;
		module.exports.nodes = __webpack_require__(3);

		module.exports.installJinjaCompat = __webpack_require__(12);

		// A single instance of an environment, since this is so commonly used

		var e;
		module.exports.configure = function(templatesPath, opts) {
		    opts = opts || {};
		    if(lib.isObject(templatesPath)) {
		        opts = templatesPath;
		        templatesPath = null;
		    }

		    var TemplateLoader;
		    if(loaders.FileSystemLoader) {
		        TemplateLoader = new loaders.FileSystemLoader(templatesPath, {
		            watch: opts.watch,
		            noCache: opts.noCache
		        });
		    }
		    else if(loaders.WebLoader) {
		        TemplateLoader = new loaders.WebLoader(templatesPath, {
		            useCache: opts.web && opts.web.useCache,
		            async: opts.web && opts.web.async
		        });
		    }

		    e = new env.Environment(TemplateLoader, opts);

		    if(opts && opts.express) {
		        e.express(opts.express);
		    }

		    return e;
		};

		module.exports.compile = function(src, env, path, eagerCompile) {
		    if(!e) {
		        module.exports.configure();
		    }
		    return new module.exports.Template(src, env, path, eagerCompile);
		};

		module.exports.render = function(name, ctx, cb) {
		    if(!e) {
		        module.exports.configure();
		    }

		    return e.render(name, ctx, cb);
		};

		module.exports.renderString = function(src, ctx, cb) {
		    if(!e) {
		        module.exports.configure();
		    }

		    return e.renderString(src, ctx, cb);
		};

		if(precompile) {
		    module.exports.precompile = precompile.precompile;
		    module.exports.precompileString = precompile.precompileString;
		}


	/***/ },
	/* 1 */
	/***/ function(module, exports) {

		'use strict';

		var ArrayProto = Array.prototype;
		var ObjProto = Object.prototype;

		var escapeMap = {
		    '&': '&amp;',
		    '"': '&quot;',
		    '\'': '&#39;',
		    '<': '&lt;',
		    '>': '&gt;'
		};

		var escapeRegex = /[&"'<>]/g;

		var lookupEscape = function(ch) {
		    return escapeMap[ch];
		};

		var exports = module.exports = {};

		exports.prettifyError = function(path, withInternals, err) {
		    // jshint -W022
		    // http://jslinterrors.com/do-not-assign-to-the-exception-parameter
		    if (!err.Update) {
		        // not one of ours, cast it
		        err = new exports.TemplateError(err);
		    }
		    err.Update(path);

		    // Unless they marked the dev flag, show them a trace from here
		    if (!withInternals) {
		        var old = err;
		        err = new Error(old.message);
		        err.name = old.name;
		    }

		    return err;
		};

		exports.TemplateError = function(message, lineno, colno) {
		    var err = this;

		    if (message instanceof Error) { // for casting regular js errors
		        err = message;
		        message = message.name + ': ' + message.message;

		        try {
		            if(err.name = '') {}
		        }
		        catch(e) {
		            // If we can't set the name of the error object in this
		            // environment, don't use it
		            err = this;
		        }
		    } else {
		        if(Error.captureStackTrace) {
		            Error.captureStackTrace(err);
		        }
		    }

		    err.name = 'Template render error';
		    err.message = message;
		    err.lineno = lineno;
		    err.colno = colno;
		    err.firstUpdate = true;

		    err.Update = function(path) {
		        var message = '(' + (path || 'unknown path') + ')';

		        // only show lineno + colno next to path of template
		        // where error occurred
		        if (this.firstUpdate) {
		            if(this.lineno && this.colno) {
		                message += ' [Line ' + this.lineno + ', Column ' + this.colno + ']';
		            }
		            else if(this.lineno) {
		                message += ' [Line ' + this.lineno + ']';
		            }
		        }

		        message += '\n ';
		        if (this.firstUpdate) {
		            message += ' ';
		        }

		        this.message = message + (this.message || '');
		        this.firstUpdate = false;
		        return this;
		    };

		    return err;
		};

		exports.TemplateError.prototype = Error.prototype;

		exports.escape = function(val) {
		  return val.replace(escapeRegex, lookupEscape);
		};

		exports.isFunction = function(obj) {
		    return ObjProto.toString.call(obj) === '[object Function]';
		};

		exports.isArray = Array.isArray || function(obj) {
		    return ObjProto.toString.call(obj) === '[object Array]';
		};

		exports.isString = function(obj) {
		    return ObjProto.toString.call(obj) === '[object String]';
		};

		exports.isObject = function(obj) {
		    return ObjProto.toString.call(obj) === '[object Object]';
		};

		exports.groupBy = function(obj, val) {
		    var result = {};
		    var iterator = exports.isFunction(val) ? val : function(obj) { return obj[val]; };
		    for(var i=0; i<obj.length; i++) {
		        var value = obj[i];
		        var key = iterator(value, i);
		        (result[key] || (result[key] = [])).push(value);
		    }
		    return result;
		};

		exports.toArray = function(obj) {
		    return Array.prototype.slice.call(obj);
		};

		exports.without = function(array) {
		    var result = [];
		    if (!array) {
		        return result;
		    }
		    var index = -1,
		    length = array.length,
		    contains = exports.toArray(arguments).slice(1);

		    while(++index < length) {
		        if(exports.indexOf(contains, array[index]) === -1) {
		            result.push(array[index]);
		        }
		    }
		    return result;
		};

		exports.extend = function(obj, obj2) {
		    for(var k in obj2) {
		        obj[k] = obj2[k];
		    }
		    return obj;
		};

		exports.repeat = function(char_, n) {
		    var str = '';
		    for(var i=0; i<n; i++) {
		        str += char_;
		    }
		    return str;
		};

		exports.each = function(obj, func, context) {
		    if(obj == null) {
		        return;
		    }

		    if(ArrayProto.each && obj.each === ArrayProto.each) {
		        obj.forEach(func, context);
		    }
		    else if(obj.length === +obj.length) {
		        for(var i=0, l=obj.length; i<l; i++) {
		            func.call(context, obj[i], i, obj);
		        }
		    }
		};

		exports.map = function(obj, func) {
		    var results = [];
		    if(obj == null) {
		        return results;
		    }

		    if(ArrayProto.map && obj.map === ArrayProto.map) {
		        return obj.map(func);
		    }

		    for(var i=0; i<obj.length; i++) {
		        results[results.length] = func(obj[i], i);
		    }

		    if(obj.length === +obj.length) {
		        results.length = obj.length;
		    }

		    return results;
		};

		exports.asyncIter = function(arr, iter, cb) {
		    var i = -1;

		    function next() {
		        i++;

		        if(i < arr.length) {
		            iter(arr[i], i, next, cb);
		        }
		        else {
		            cb();
		        }
		    }

		    next();
		};

		exports.asyncFor = function(obj, iter, cb) {
		    var keys = exports.keys(obj);
		    var len = keys.length;
		    var i = -1;

		    function next() {
		        i++;
		        var k = keys[i];

		        if(i < len) {
		            iter(k, obj[k], i, len, next);
		        }
		        else {
		            cb();
		        }
		    }

		    next();
		};

		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf#Polyfill
		exports.indexOf = Array.prototype.indexOf ?
		    function (arr, searchElement, fromIndex) {
		        return Array.prototype.indexOf.call(arr, searchElement, fromIndex);
		    } :
		    function (arr, searchElement, fromIndex) {
		        var length = this.length >>> 0; // Hack to convert object.length to a UInt32

		        fromIndex = +fromIndex || 0;

		        if(Math.abs(fromIndex) === Infinity) {
		            fromIndex = 0;
		        }

		        if(fromIndex < 0) {
		            fromIndex += length;
		            if (fromIndex < 0) {
		                fromIndex = 0;
		            }
		        }

		        for(;fromIndex < length; fromIndex++) {
		            if (arr[fromIndex] === searchElement) {
		                return fromIndex;
		            }
		        }

		        return -1;
		    };

		if(!Array.prototype.map) {
		    Array.prototype.map = function() {
		        throw new Error('map is unimplemented for this js engine');
		    };
		}

		exports.keys = function(obj) {
		    if(Object.prototype.keys) {
		        return obj.keys();
		    }
		    else {
		        var keys = [];
		        for(var k in obj) {
		            if(obj.hasOwnProperty(k)) {
		                keys.push(k);
		            }
		        }
		        return keys;
		    }
		};

		exports.inOperator = function (key, val) {
		    if (exports.isArray(val)) {
		        return exports.indexOf(val, key) !== -1;
		    } else if (exports.isObject(val)) {
		        return key in val;
		    } else if (exports.isString(val)) {
		        return val.indexOf(key) !== -1;
		    } else {
		        throw new Error('Cannot use "in" operator to search for "'
		            + key + '" in unexpected types.');
		    }
		};


	/***/ },
	/* 2 */
	/***/ function(module, exports, __webpack_require__) {

		'use strict';

		var path = __webpack_require__(3);
		var asap = __webpack_require__(4);
		var lib = __webpack_require__(1);
		var Obj = __webpack_require__(6);
		var compiler = __webpack_require__(3);
		var builtin_filters = __webpack_require__(7);
		var builtin_loaders = __webpack_require__(3);
		var runtime = __webpack_require__(8);
		var globals = __webpack_require__(9);
		var Frame = runtime.Frame;
		var Template;

		// Unconditionally load in this loader, even if no other ones are
		// included (possible in the slim browser build)
		builtin_loaders.PrecompiledLoader = __webpack_require__(10);

		// If the user is using the async API, *always* call it
		// asynchronously even if the template was synchronous.
		function callbackAsap(cb, err, res) {
		    asap(function() { cb(err, res); });
		}

		var Environment = Obj.extend({
		    init: function(loaders, opts) {
		        // The dev flag determines the trace that'll be shown on errors.
		        // If set to true, returns the full trace from the error point,
		        // otherwise will return trace starting from Template.render
		        // (the full trace from within nunjucks may confuse developers using
		        //  the library)
		        // defaults to false
		        opts = this.opts = opts || {};
		        this.opts.dev = !!opts.dev;

		        // The autoescape flag sets global autoescaping. If true,
		        // every string variable will be escaped by default.
		        // If false, strings can be manually escaped using the `escape` filter.
		        // defaults to true
		        this.opts.autoescape = opts.autoescape != null ? opts.autoescape : true;

		        // If true, this will make the system throw errors if trying
		        // to output a null or undefined value
		        this.opts.throwOnUndefined = !!opts.throwOnUndefined;
		        this.opts.trimBlocks = !!opts.trimBlocks;
		        this.opts.lstripBlocks = !!opts.lstripBlocks;

		        this.loaders = [];

		        if(!loaders) {
		            // The filesystem loader is only available server-side
		            if(builtin_loaders.FileSystemLoader) {
		                this.loaders = [new builtin_loaders.FileSystemLoader('views')];
		            }
		            else if(builtin_loaders.WebLoader) {
		                this.loaders = [new builtin_loaders.WebLoader('/views')];
		            }
		        }
		        else {
		            this.loaders = lib.isArray(loaders) ? loaders : [loaders];
		        }

		        // It's easy to use precompiled templates: just include them
		        // before you configure nunjucks and this will automatically
		        // pick it up and use it
		        if((true) && window.nunjucksPrecompiled) {
		            this.loaders.unshift(
		                new builtin_loaders.PrecompiledLoader(window.nunjucksPrecompiled)
		            );
		        }

		        this.initCache();

		        this.globals = globals();
		        this.filters = {};
		        this.asyncFilters = [];
		        this.extensions = {};
		        this.extensionsList = [];

		        for(var name in builtin_filters) {
		            this.addFilter(name, builtin_filters[name]);
		        }
		    },

		    initCache: function() {
		        // Caching and cache busting
		        lib.each(this.loaders, function(loader) {
		            loader.cache = {};

		            if(typeof loader.on === 'function') {
		                loader.on('update', function(template) {
		                    loader.cache[template] = null;
		                });
		            }
		        });
		    },

		    addExtension: function(name, extension) {
		        extension._name = name;
		        this.extensions[name] = extension;
		        this.extensionsList.push(extension);
		        return this;
		    },

		    removeExtension: function(name) {
		        var extension = this.getExtension(name);
		        if (!extension) return;

		        this.extensionsList = lib.without(this.extensionsList, extension);
		        delete this.extensions[name];
		    },

		    getExtension: function(name) {
		        return this.extensions[name];
		    },

		    hasExtension: function(name) {
		        return !!this.extensions[name];
		    },

		    addGlobal: function(name, value) {
		        this.globals[name] = value;
		        return this;
		    },

		    getGlobal: function(name) {
		        if(typeof this.globals[name] === 'undefined') {
		            throw new Error('global not found: ' + name);
		        }
		        return this.globals[name];
		    },

		    addFilter: function(name, func, async) {
		        var wrapped = func;

		        if(async) {
		            this.asyncFilters.push(name);
		        }
		        this.filters[name] = wrapped;
		        return this;
		    },

		    getFilter: function(name) {
		        if(!this.filters[name]) {
		            throw new Error('filter not found: ' + name);
		        }
		        return this.filters[name];
		    },

		    resolveTemplate: function(loader, parentName, filename) {
		        var isRelative = (loader.isRelative && parentName)? loader.isRelative(filename) : false;
		        return (isRelative && loader.resolve)? loader.resolve(parentName, filename) : filename;
		    },

		    getTemplate: function(name, eagerCompile, parentName, ignoreMissing, cb) {
		        var that = this;
		        var tmpl = null;
		        if(name && name.raw) {
		            // this fixes autoescape for templates referenced in symbols
		            name = name.raw;
		        }

		        if(lib.isFunction(parentName)) {
		            cb = parentName;
		            parentName = null;
		            eagerCompile = eagerCompile || false;
		        }

		        if(lib.isFunction(eagerCompile)) {
		            cb = eagerCompile;
		            eagerCompile = false;
		        }

		        if (name instanceof Template) {
		             tmpl = name;
		        }
		        else if(typeof name !== 'string') {
		            throw new Error('template names must be a string: ' + name);
		        }
		        else {
		            for (var i = 0; i < this.loaders.length; i++) {
		                var _name = this.resolveTemplate(this.loaders[i], parentName, name);
		                tmpl = this.loaders[i].cache[_name];
		                if (tmpl) break;
		            }
		        }

		        if(tmpl) {
		            if(eagerCompile) {
		                tmpl.compile();
		            }

		            if(cb) {
		                cb(null, tmpl);
		            }
		            else {
		                return tmpl;
		            }
		        } else {
		            var syncResult;
		            var _this = this;

		            var createTemplate = function(err, info) {
		                if(!info && !err) {
		                    if(!ignoreMissing) {
		                        err = new Error('template not found: ' + name);
		                    }
		                }

		                if (err) {
		                    if(cb) {
		                        cb(err);
		                    }
		                    else {
		                        throw err;
		                    }
		                }
		                else {
		                    var tmpl;
		                    if(info) {
		                        tmpl = new Template(info.src, _this,
		                                            info.path, eagerCompile);

		                        if(!info.noCache) {
		                            info.loader.cache[name] = tmpl;
		                        }
		                    }
		                    else {
		                        tmpl = new Template('', _this,
		                                            '', eagerCompile);
		                    }

		                    if(cb) {
		                        cb(null, tmpl);
		                    }
		                    else {
		                        syncResult = tmpl;
		                    }
		                }
		            };

		            lib.asyncIter(this.loaders, function(loader, i, next, done) {
		                function handle(err, src) {
		                    if(err) {
		                        done(err);
		                    }
		                    else if(src) {
		                        src.loader = loader;
		                        done(null, src);
		                    }
		                    else {
		                        next();
		                    }
		                }

		                // Resolve name relative to parentName
		                name = that.resolveTemplate(loader, parentName, name);

		                if(loader.async) {
		                    loader.getSource(name, handle);
		                }
		                else {
		                    handle(null, loader.getSource(name));
		                }
		            }, createTemplate);

		            return syncResult;
		        }
		    },

		    express: function(app) {
		        var env = this;

		        function NunjucksView(name, opts) {
		            this.name          = name;
		            this.path          = name;
		            this.defaultEngine = opts.defaultEngine;
		            this.ext           = path.extname(name);
		            if (!this.ext && !this.defaultEngine) throw new Error('No default engine was specified and no extension was provided.');
		            if (!this.ext) this.name += (this.ext = ('.' !== this.defaultEngine[0] ? '.' : '') + this.defaultEngine);
		        }

		        NunjucksView.prototype.render = function(opts, cb) {
		          env.render(this.name, opts, cb);
		        };

		        app.set('view', NunjucksView);
		        app.set('nunjucksEnv', this);
		        return this;
		    },

		    render: function(name, ctx, cb) {
		        if(lib.isFunction(ctx)) {
		            cb = ctx;
		            ctx = null;
		        }

		        // We support a synchronous API to make it easier to migrate
		        // existing code to async. This works because if you don't do
		        // anything async work, the whole thing is actually run
		        // synchronously.
		        var syncResult = null;

		        this.getTemplate(name, function(err, tmpl) {
		            if(err && cb) {
		                callbackAsap(cb, err);
		            }
		            else if(err) {
		                throw err;
		            }
		            else {
		                syncResult = tmpl.render(ctx, cb);
		            }
		        });

		        return syncResult;
		    },

		    renderString: function(src, ctx, opts, cb) {
		        if(lib.isFunction(opts)) {
		            cb = opts;
		            opts = {};
		        }
		        opts = opts || {};

		        var tmpl = new Template(src, this, opts.path);
		        return tmpl.render(ctx, cb);
		    }
		});

		var Context = Obj.extend({
		    init: function(ctx, blocks, env) {
		        // Has to be tied to an environment so we can tap into its globals.
		        this.env = env || new Environment();

		        // Make a duplicate of ctx
		        this.ctx = {};
		        for(var k in ctx) {
		            if(ctx.hasOwnProperty(k)) {
		                this.ctx[k] = ctx[k];
		            }
		        }

		        this.blocks = {};
		        this.exported = [];

		        for(var name in blocks) {
		            this.addBlock(name, blocks[name]);
		        }
		    },

		    lookup: function(name) {
		        // This is one of the most called functions, so optimize for
		        // the typical case where the name isn't in the globals
		        if(name in this.env.globals && !(name in this.ctx)) {
		            return this.env.globals[name];
		        }
		        else {
		            return this.ctx[name];
		        }
		    },

		    setVariable: function(name, val) {
		        this.ctx[name] = val;
		    },

		    getVariables: function() {
		        return this.ctx;
		    },

		    addBlock: function(name, block) {
		        this.blocks[name] = this.blocks[name] || [];
		        this.blocks[name].push(block);
		        return this;
		    },

		    getBlock: function(name) {
		        if(!this.blocks[name]) {
		            throw new Error('unknown block "' + name + '"');
		        }

		        return this.blocks[name][0];
		    },

		    getSuper: function(env, name, block, frame, runtime, cb) {
		        var idx = lib.indexOf(this.blocks[name] || [], block);
		        var blk = this.blocks[name][idx + 1];
		        var context = this;

		        if(idx === -1 || !blk) {
		            throw new Error('no super block available for "' + name + '"');
		        }

		        blk(env, context, frame, runtime, cb);
		    },

		    addExport: function(name) {
		        this.exported.push(name);
		    },

		    getExported: function() {
		        var exported = {};
		        for(var i=0; i<this.exported.length; i++) {
		            var name = this.exported[i];
		            exported[name] = this.ctx[name];
		        }
		        return exported;
		    }
		});

		Template = Obj.extend({
		    init: function (src, env, path, eagerCompile) {
		        this.env = env || new Environment();

		        if(lib.isObject(src)) {
		            switch(src.type) {
		            case 'code': this.tmplProps = src.obj; break;
		            case 'string': this.tmplStr = src.obj; break;
		            }
		        }
		        else if(lib.isString(src)) {
		            this.tmplStr = src;
		        }
		        else {
		            throw new Error('src must be a string or an object describing ' +
		                            'the source');
		        }

		        this.path = path;

		        if(eagerCompile) {
		            var _this = this;
		            try {
		                _this._compile();
		            }
		            catch(err) {
		                throw lib.prettifyError(this.path, this.env.opts.dev, err);
		            }
		        }
		        else {
		            this.compiled = false;
		        }
		    },

		    render: function(ctx, parentFrame, cb) {
		        if (typeof ctx === 'function') {
		            cb = ctx;
		            ctx = {};
		        }
		        else if (typeof parentFrame === 'function') {
		            cb = parentFrame;
		            parentFrame = null;
		        }

		        var forceAsync = true;
		        if(parentFrame) {
		            // If there is a frame, we are being called from internal
		            // code of another template, and the internal system
		            // depends on the sync/async nature of the parent template
		            // to be inherited, so force an async callback
		            forceAsync = false;
		        }

		        var _this = this;
		        // Catch compile errors for async rendering
		        try {
		            _this.compile();
		        } catch (_err) {
		            var err = lib.prettifyError(this.path, this.env.opts.dev, _err);
		            if (cb) return callbackAsap(cb, err);
		            else throw err;
		        }

		        var context = new Context(ctx || {}, _this.blocks, _this.env);
		        var frame = parentFrame ? parentFrame.push(true) : new Frame();
		        frame.topLevel = true;
		        var syncResult = null;

		        _this.rootRenderFunc(
		            _this.env,
		            context,
		            frame || new Frame(),
		            runtime,
		            function(err, res) {
		                if(err) {
		                    err = lib.prettifyError(_this.path, _this.env.opts.dev, err);
		                }

		                if(cb) {
		                    if(forceAsync) {
		                        callbackAsap(cb, err, res);
		                    }
		                    else {
		                        cb(err, res);
		                    }
		                }
		                else {
		                    if(err) { throw err; }
		                    syncResult = res;
		                }
		            }
		        );

		        return syncResult;
		    },


		    getExported: function(ctx, parentFrame, cb) {
		        if (typeof ctx === 'function') {
		            cb = ctx;
		            ctx = {};
		        }

		        if (typeof parentFrame === 'function') {
		            cb = parentFrame;
		            parentFrame = null;
		        }

		        // Catch compile errors for async rendering
		        try {
		            this.compile();
		        } catch (e) {
		            if (cb) return cb(e);
		            else throw e;
		        }

		        var frame = parentFrame ? parentFrame.push() : new Frame();
		        frame.topLevel = true;

		        // Run the rootRenderFunc to populate the context with exported vars
		        var context = new Context(ctx || {}, this.blocks, this.env);
		        this.rootRenderFunc(this.env,
		                            context,
		                            frame,
		                            runtime,
		                            function(err) {
		        		        if ( err ) {
		        			    cb(err, null);
		        		        } else {
		        			    cb(null, context.getExported());
		        		        }
		                            });
		    },

		    compile: function() {
		        if(!this.compiled) {
		            this._compile();
		        }
		    },

		    _compile: function() {
		        var props;

		        if(this.tmplProps) {
		            props = this.tmplProps;
		        }
		        else {
		            var source = compiler.compile(this.tmplStr,
		                                          this.env.asyncFilters,
		                                          this.env.extensionsList,
		                                          this.path,
		                                          this.env.opts);

		            /* jslint evil: true */
		            var func = new Function(source);
		            props = func();
		        }

		        this.blocks = this._getBlocks(props);
		        this.rootRenderFunc = props.root;
		        this.compiled = true;
		    },

		    _getBlocks: function(props) {
		        var blocks = {};

		        for(var k in props) {
		            if(k.slice(0, 2) === 'b_') {
		                blocks[k.slice(2)] = props[k];
		            }
		        }

		        return blocks;
		    }
		});

		module.exports = {
		    Environment: Environment,
		    Template: Template
		};


	/***/ },
	/* 3 */
	/***/ function(module, exports) {

		

	/***/ },
	/* 4 */
	/***/ function(module, exports, __webpack_require__) {

		"use strict";

		// rawAsap provides everything we need except exception management.
		var rawAsap = __webpack_require__(5);
		// RawTasks are recycled to reduce GC churn.
		var freeTasks = [];
		// We queue errors to ensure they are thrown in right order (FIFO).
		// Array-as-queue is good enough here, since we are just dealing with exceptions.
		var pendingErrors = [];
		var requestErrorThrow = rawAsap.makeRequestCallFromTimer(throwFirstError);

		function throwFirstError() {
		    if (pendingErrors.length) {
		        throw pendingErrors.shift();
		    }
		}

		/**
		 * Calls a task as soon as possible after returning, in its own event, with priority
		 * over other events like animation, reflow, and repaint. An error thrown from an
		 * event will not interrupt, nor even substantially slow down the processing of
		 * other events, but will be rather postponed to a lower priority event.
		 * @param {{call}} task A callable object, typically a function that takes no
		 * arguments.
		 */
		module.exports = asap;
		function asap(task) {
		    var rawTask;
		    if (freeTasks.length) {
		        rawTask = freeTasks.pop();
		    } else {
		        rawTask = new RawTask();
		    }
		    rawTask.task = task;
		    rawAsap(rawTask);
		}

		// We wrap tasks with recyclable task objects.  A task object implements
		// `call`, just like a function.
		function RawTask() {
		    this.task = null;
		}

		// The sole purpose of wrapping the task is to catch the exception and recycle
		// the task object after its single use.
		RawTask.prototype.call = function () {
		    try {
		        this.task.call();
		    } catch (error) {
		        if (asap.onerror) {
		            // This hook exists purely for testing purposes.
		            // Its name will be periodically randomized to break any code that
		            // depends on its existence.
		            asap.onerror(error);
		        } else {
		            // In a web browser, exceptions are not fatal. However, to avoid
		            // slowing down the queue of pending tasks, we rethrow the error in a
		            // lower priority turn.
		            pendingErrors.push(error);
		            requestErrorThrow();
		        }
		    } finally {
		        this.task = null;
		        freeTasks[freeTasks.length] = this;
		    }
		};


	/***/ },
	/* 5 */
	/***/ function(module, exports) {

		/* WEBPACK VAR INJECTION */(function(global) {"use strict";

		// Use the fastest means possible to execute a task in its own turn, with
		// priority over other events including IO, animation, reflow, and redraw
		// events in browsers.
		//
		// An exception thrown by a task will permanently interrupt the processing of
		// subsequent tasks. The higher level `asap` function ensures that if an
		// exception is thrown by a task, that the task queue will continue flushing as
		// soon as possible, but if you use `rawAsap` directly, you are responsible to
		// either ensure that no exceptions are thrown from your task, or to manually
		// call `rawAsap.requestFlush` if an exception is thrown.
		module.exports = rawAsap;
		function rawAsap(task) {
		    if (!queue.length) {
		        requestFlush();
		        flushing = true;
		    }
		    // Equivalent to push, but avoids a function call.
		    queue[queue.length] = task;
		}

		var queue = [];
		// Once a flush has been requested, no further calls to `requestFlush` are
		// necessary until the next `flush` completes.
		var flushing = false;
		// `requestFlush` is an implementation-specific method that attempts to kick
		// off a `flush` event as quickly as possible. `flush` will attempt to exhaust
		// the event queue before yielding to the browser's own event loop.
		var requestFlush;
		// The position of the next task to execute in the task queue. This is
		// preserved between calls to `flush` so that it can be resumed if
		// a task throws an exception.
		var index = 0;
		// If a task schedules additional tasks recursively, the task queue can grow
		// unbounded. To prevent memory exhaustion, the task queue will periodically
		// truncate already-completed tasks.
		var capacity = 1024;

		// The flush function processes all tasks that have been scheduled with
		// `rawAsap` unless and until one of those tasks throws an exception.
		// If a task throws an exception, `flush` ensures that its state will remain
		// consistent and will resume where it left off when called again.
		// However, `flush` does not make any arrangements to be called again if an
		// exception is thrown.
		function flush() {
		    while (index < queue.length) {
		        var currentIndex = index;
		        // Advance the index before calling the task. This ensures that we will
		        // begin flushing on the next task the task throws an error.
		        index = index + 1;
		        queue[currentIndex].call();
		        // Prevent leaking memory for long chains of recursive calls to `asap`.
		        // If we call `asap` within tasks scheduled by `asap`, the queue will
		        // grow, but to avoid an O(n) walk for every task we execute, we don't
		        // shift tasks off the queue after they have been executed.
		        // Instead, we periodically shift 1024 tasks off the queue.
		        if (index > capacity) {
		            // Manually shift all values starting at the index back to the
		            // beginning of the queue.
		            for (var scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
		                queue[scan] = queue[scan + index];
		            }
		            queue.length -= index;
		            index = 0;
		        }
		    }
		    queue.length = 0;
		    index = 0;
		    flushing = false;
		}

		// `requestFlush` is implemented using a strategy based on data collected from
		// every available SauceLabs Selenium web driver worker at time of writing.
		// https://docs.google.com/spreadsheets/d/1mG-5UYGup5qxGdEMWkhP6BWCz053NUb2E1QoUTU16uA/edit#gid=783724593

		// Safari 6 and 6.1 for desktop, iPad, and iPhone are the only browsers that
		// have WebKitMutationObserver but not un-prefixed MutationObserver.
		// Must use `global` instead of `window` to work in both frames and web
		// workers. `global` is a provision of Browserify, Mr, Mrs, or Mop.
		var BrowserMutationObserver = global.MutationObserver || global.WebKitMutationObserver;

		// MutationObservers are desirable because they have high priority and work
		// reliably everywhere they are implemented.
		// They are implemented in all modern browsers.
		//
		// - Android 4-4.3
		// - Chrome 26-34
		// - Firefox 14-29
		// - Internet Explorer 11
		// - iPad Safari 6-7.1
		// - iPhone Safari 7-7.1
		// - Safari 6-7
		if (typeof BrowserMutationObserver === "function") {
		    requestFlush = makeRequestCallFromMutationObserver(flush);

		// MessageChannels are desirable because they give direct access to the HTML
		// task queue, are implemented in Internet Explorer 10, Safari 5.0-1, and Opera
		// 11-12, and in web workers in many engines.
		// Although message channels yield to any queued rendering and IO tasks, they
		// would be better than imposing the 4ms delay of timers.
		// However, they do not work reliably in Internet Explorer or Safari.

		// Internet Explorer 10 is the only browser that has setImmediate but does
		// not have MutationObservers.
		// Although setImmediate yields to the browser's renderer, it would be
		// preferrable to falling back to setTimeout since it does not have
		// the minimum 4ms penalty.
		// Unfortunately there appears to be a bug in Internet Explorer 10 Mobile (and
		// Desktop to a lesser extent) that renders both setImmediate and
		// MessageChannel useless for the purposes of ASAP.
		// https://github.com/kriskowal/q/issues/396

		// Timers are implemented universally.
		// We fall back to timers in workers in most engines, and in foreground
		// contexts in the following browsers.
		// However, note that even this simple case requires nuances to operate in a
		// broad spectrum of browsers.
		//
		// - Firefox 3-13
		// - Internet Explorer 6-9
		// - iPad Safari 4.3
		// - Lynx 2.8.7
		} else {
		    requestFlush = makeRequestCallFromTimer(flush);
		}

		// `requestFlush` requests that the high priority event queue be flushed as
		// soon as possible.
		// This is useful to prevent an error thrown in a task from stalling the event
		// queue if the exception handled by Node.js’s
		// `process.on("uncaughtException")` or by a domain.
		rawAsap.requestFlush = requestFlush;

		// To request a high priority event, we induce a mutation observer by toggling
		// the text of a text node between "1" and "-1".
		function makeRequestCallFromMutationObserver(callback) {
		    var toggle = 1;
		    var observer = new BrowserMutationObserver(callback);
		    var node = document.createTextNode("");
		    observer.observe(node, {characterData: true});
		    return function requestCall() {
		        toggle = -toggle;
		        node.data = toggle;
		    };
		}

		// The message channel technique was discovered by Malte Ubl and was the
		// original foundation for this library.
		// http://www.nonblocking.io/2011/06/windownexttick.html

		// Safari 6.0.5 (at least) intermittently fails to create message ports on a
		// page's first load. Thankfully, this version of Safari supports
		// MutationObservers, so we don't need to fall back in that case.

		// function makeRequestCallFromMessageChannel(callback) {
		//     var channel = new MessageChannel();
		//     channel.port1.onmessage = callback;
		//     return function requestCall() {
		//         channel.port2.postMessage(0);
		//     };
		// }

		// For reasons explained above, we are also unable to use `setImmediate`
		// under any circumstances.
		// Even if we were, there is another bug in Internet Explorer 10.
		// It is not sufficient to assign `setImmediate` to `requestFlush` because
		// `setImmediate` must be called *by name* and therefore must be wrapped in a
		// closure.
		// Never forget.

		// function makeRequestCallFromSetImmediate(callback) {
		//     return function requestCall() {
		//         setImmediate(callback);
		//     };
		// }

		// Safari 6.0 has a problem where timers will get lost while the user is
		// scrolling. This problem does not impact ASAP because Safari 6.0 supports
		// mutation observers, so that implementation is used instead.
		// However, if we ever elect to use timers in Safari, the prevalent work-around
		// is to add a scroll event listener that calls for a flush.

		// `setTimeout` does not call the passed callback if the delay is less than
		// approximately 7 in web workers in Firefox 8 through 18, and sometimes not
		// even then.

		function makeRequestCallFromTimer(callback) {
		    return function requestCall() {
		        // We dispatch a timeout with a specified delay of 0 for engines that
		        // can reliably accommodate that request. This will usually be snapped
		        // to a 4 milisecond delay, but once we're flushing, there's no delay
		        // between events.
		        var timeoutHandle = setTimeout(handleTimer, 0);
		        // However, since this timer gets frequently dropped in Firefox
		        // workers, we enlist an interval handle that will try to fire
		        // an event 20 times per second until it succeeds.
		        var intervalHandle = setInterval(handleTimer, 50);

		        function handleTimer() {
		            // Whichever timer succeeds will cancel both timers and
		            // execute the callback.
		            clearTimeout(timeoutHandle);
		            clearInterval(intervalHandle);
		            callback();
		        }
		    };
		}

		// This is for `asap.js` only.
		// Its name will be periodically randomized to break any code that depends on
		// its existence.
		rawAsap.makeRequestCallFromTimer = makeRequestCallFromTimer;

		// ASAP was originally a nextTick shim included in Q. This was factored out
		// into this ASAP package. It was later adapted to RSVP which made further
		// amendments. These decisions, particularly to marginalize MessageChannel and
		// to capture the MutationObserver implementation in a closure, were integrated
		// back into ASAP proper.
		// https://github.com/tildeio/rsvp.js/blob/cddf7232546a9cf858524b75cde6f9edf72620a7/lib/rsvp/asap.js

		/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

	/***/ },
	/* 6 */
	/***/ function(module, exports) {

		'use strict';

		// A simple class system, more documentation to come

		function extend(cls, name, props) {
		    // This does that same thing as Object.create, but with support for IE8
		    var F = function() {};
		    F.prototype = cls.prototype;
		    var prototype = new F();

		    // jshint undef: false
		    var fnTest = /xyz/.test(function(){ xyz; }) ? /\bparent\b/ : /.*/;
		    props = props || {};

		    for(var k in props) {
		        var src = props[k];
		        var parent = prototype[k];

		        if(typeof parent === 'function' &&
		           typeof src === 'function' &&
		           fnTest.test(src)) {
		            /*jshint -W083 */
		            prototype[k] = (function (src, parent) {
		                return function() {
		                    // Save the current parent method
		                    var tmp = this.parent;

		                    // Set parent to the previous method, call, and restore
		                    this.parent = parent;
		                    var res = src.apply(this, arguments);
		                    this.parent = tmp;

		                    return res;
		                };
		            })(src, parent);
		        }
		        else {
		            prototype[k] = src;
		        }
		    }

		    prototype.typename = name;

		    var new_cls = function() {
		        if(prototype.init) {
		            prototype.init.apply(this, arguments);
		        }
		    };

		    new_cls.prototype = prototype;
		    new_cls.prototype.constructor = new_cls;

		    new_cls.extend = function(name, props) {
		        if(typeof name === 'object') {
		            props = name;
		            name = 'anonymous';
		        }
		        return extend(new_cls, name, props);
		    };

		    return new_cls;
		}

		module.exports = extend(Object, 'Object', {});


	/***/ },
	/* 7 */
	/***/ function(module, exports, __webpack_require__) {

		'use strict';

		var lib = __webpack_require__(1);
		var r = __webpack_require__(8);

		function normalize(value, defaultValue) {
		    if(value === null || value === undefined || value === false) {
		        return defaultValue;
		    }
		    return value;
		}

		var filters = {
		    abs: function(n) {
		        return Math.abs(n);
		    },

		    batch: function(arr, linecount, fill_with) {
		        var i;
		        var res = [];
		        var tmp = [];

		        for(i = 0; i < arr.length; i++) {
		            if(i % linecount === 0 && tmp.length) {
		                res.push(tmp);
		                tmp = [];
		            }

		            tmp.push(arr[i]);
		        }

		        if(tmp.length) {
		            if(fill_with) {
		                for(i = tmp.length; i < linecount; i++) {
		                    tmp.push(fill_with);
		                }
		            }

		            res.push(tmp);
		        }

		        return res;
		    },

		    capitalize: function(str) {
		        str = normalize(str, '');
		        var ret = str.toLowerCase();
		        return r.copySafeness(str, ret.charAt(0).toUpperCase() + ret.slice(1));
		    },

		    center: function(str, width) {
		        str = normalize(str, '');
		        width = width || 80;

		        if(str.length >= width) {
		            return str;
		        }

		        var spaces = width - str.length;
		        var pre = lib.repeat(' ', spaces/2 - spaces % 2);
		        var post = lib.repeat(' ', spaces/2);
		        return r.copySafeness(str, pre + str + post);
		    },

		    'default': function(val, def, bool) {
		        if(bool) {
		            return val ? val : def;
		        }
		        else {
		            return (val !== undefined) ? val : def;
		        }
		    },

		    dictsort: function(val, case_sensitive, by) {
		        if (!lib.isObject(val)) {
		            throw new lib.TemplateError('dictsort filter: val must be an object');
		        }

		        var array = [];
		        for (var k in val) {
		            // deliberately include properties from the object's prototype
		            array.push([k,val[k]]);
		        }

		        var si;
		        if (by === undefined || by === 'key') {
		            si = 0;
		        } else if (by === 'value') {
		            si = 1;
		        } else {
		            throw new lib.TemplateError(
		                'dictsort filter: You can only sort by either key or value');
		        }

		        array.sort(function(t1, t2) {
		            var a = t1[si];
		            var b = t2[si];

		            if (!case_sensitive) {
		                if (lib.isString(a)) {
		                    a = a.toUpperCase();
		                }
		                if (lib.isString(b)) {
		                    b = b.toUpperCase();
		                }
		            }

		            return a > b ? 1 : (a === b ? 0 : -1);
		        });

		        return array;
		    },

		    dump: function(obj) {
		        return JSON.stringify(obj);
		    },

		    escape: function(str) {
		        if(str instanceof r.SafeString) {
		            return str;
		        }
		        str = (str === null || str === undefined) ? '' : str;
		        return r.markSafe(lib.escape(str.toString()));
		    },

		    safe: function(str) {
		        if (str instanceof r.SafeString) {
		            return str;
		        }
		        str = (str === null || str === undefined) ? '' : str;
		        return r.markSafe(str.toString());
		    },

		    first: function(arr) {
		        return arr[0];
		    },

		    groupby: function(arr, attr) {
		        return lib.groupBy(arr, attr);
		    },

		    indent: function(str, width, indentfirst) {
		        str = normalize(str, '');

		        if (str === '') return '';

		        width = width || 4;
		        var res = '';
		        var lines = str.split('\n');
		        var sp = lib.repeat(' ', width);

		        for(var i=0; i<lines.length; i++) {
		            if(i === 0 && !indentfirst) {
		                res += lines[i] + '\n';
		            }
		            else {
		                res += sp + lines[i] + '\n';
		            }
		        }

		        return r.copySafeness(str, res);
		    },

		    join: function(arr, del, attr) {
		        del = del || '';

		        if(attr) {
		            arr = lib.map(arr, function(v) {
		                return v[attr];
		            });
		        }

		        return arr.join(del);
		    },

		    last: function(arr) {
		        return arr[arr.length-1];
		    },

		    length: function(val) {
		        var value = normalize(val, '');

		        if(value !== undefined) {
		            if(
		                (typeof Map === 'function' && value instanceof Map) ||
		                (typeof Set === 'function' && value instanceof Set)
		            ) {
		                // ECMAScript 2015 Maps and Sets
		                return value.size;
		            }
		            if(lib.isObject(value) && !(value instanceof r.SafeString)) {
		                // Objects (besides SafeStrings), non-primative Arrays
		                return Object.keys(value).length;
		            }
		            return value.length;
		        }
		        return 0;
		    },

		    list: function(val) {
		        if(lib.isString(val)) {
		            return val.split('');
		        }
		        else if(lib.isObject(val)) {
		            var keys = [];

		            if(Object.keys) {
		                keys = Object.keys(val);
		            }
		            else {
		                for(var k in val) {
		                    keys.push(k);
		                }
		            }

		            return lib.map(keys, function(k) {
		                return { key: k,
		                         value: val[k] };
		            });
		        }
		        else if(lib.isArray(val)) {
		          return val;
		        }
		        else {
		            throw new lib.TemplateError('list filter: type not iterable');
		        }
		    },

		    lower: function(str) {
		        str = normalize(str, '');
		        return str.toLowerCase();
		    },

		    random: function(arr) {
		        return arr[Math.floor(Math.random() * arr.length)];
		    },

		    rejectattr: function(arr, attr) {
		      return arr.filter(function (item) {
		        return !item[attr];
		      });
		    },

		    selectattr: function(arr, attr) {
		      return arr.filter(function (item) {
		        return !!item[attr];
		      });
		    },

		    replace: function(str, old, new_, maxCount) {
		        var originalStr = str;

		        if (old instanceof RegExp) {
		            return str.replace(old, new_);
		        }

		        if(typeof maxCount === 'undefined'){
		            maxCount = -1;
		        }

		        var res = '';  // Output

		        // Cast Numbers in the search term to string
		        if(typeof old === 'number'){
		            old = old + '';
		        }
		        else if(typeof old !== 'string') {
		            // If it is something other than number or string,
		            // return the original string
		            return str;
		        }

		        // Cast numbers in the replacement to string
		        if(typeof str === 'number'){
		            str = str + '';
		        }

		        // If by now, we don't have a string, throw it back
		        if(typeof str !== 'string' && !(str instanceof r.SafeString)){
		            return str;
		        }

		        // ShortCircuits
		        if(old === ''){
		            // Mimic the python behaviour: empty string is replaced
		            // by replacement e.g. "abc"|replace("", ".") -> .a.b.c.
		            res = new_ + str.split('').join(new_) + new_;
		            return r.copySafeness(str, res);
		        }

		        var nextIndex = str.indexOf(old);
		        // if # of replacements to perform is 0, or the string to does
		        // not contain the old value, return the string
		        if(maxCount === 0 || nextIndex === -1){
		            return str;
		        }

		        var pos = 0;
		        var count = 0; // # of replacements made

		        while(nextIndex  > -1 && (maxCount === -1 || count < maxCount)){
		            // Grab the next chunk of src string and add it with the
		            // replacement, to the result
		            res += str.substring(pos, nextIndex) + new_;
		            // Increment our pointer in the src string
		            pos = nextIndex + old.length;
		            count++;
		            // See if there are any more replacements to be made
		            nextIndex = str.indexOf(old, pos);
		        }

		        // We've either reached the end, or done the max # of
		        // replacements, tack on any remaining string
		        if(pos < str.length) {
		            res += str.substring(pos);
		        }

		        return r.copySafeness(originalStr, res);
		    },

		    reverse: function(val) {
		        var arr;
		        if(lib.isString(val)) {
		            arr = filters.list(val);
		        }
		        else {
		            // Copy it
		            arr = lib.map(val, function(v) { return v; });
		        }

		        arr.reverse();

		        if(lib.isString(val)) {
		            return r.copySafeness(val, arr.join(''));
		        }
		        return arr;
		    },

		    round: function(val, precision, method) {
		        precision = precision || 0;
		        var factor = Math.pow(10, precision);
		        var rounder;

		        if(method === 'ceil') {
		            rounder = Math.ceil;
		        }
		        else if(method === 'floor') {
		            rounder = Math.floor;
		        }
		        else {
		            rounder = Math.round;
		        }

		        return rounder(val * factor) / factor;
		    },

		    slice: function(arr, slices, fillWith) {
		        var sliceLength = Math.floor(arr.length / slices);
		        var extra = arr.length % slices;
		        var offset = 0;
		        var res = [];

		        for(var i=0; i<slices; i++) {
		            var start = offset + i * sliceLength;
		            if(i < extra) {
		                offset++;
		            }
		            var end = offset + (i + 1) * sliceLength;

		            var slice = arr.slice(start, end);
		            if(fillWith && i >= extra) {
		                slice.push(fillWith);
		            }
		            res.push(slice);
		        }

		        return res;
		    },

		    sum: function(arr, attr, start) {
		        var sum = 0;

		        if(typeof start === 'number'){
		            sum += start;
		        }

		        if(attr) {
		            arr = lib.map(arr, function(v) {
		                return v[attr];
		            });
		        }

		        for(var i = 0; i < arr.length; i++) {
		            sum += arr[i];
		        }

		        return sum;
		    },

		    sort: r.makeMacro(['value', 'reverse', 'case_sensitive', 'attribute'], [], function(arr, reverse, caseSens, attr) {
		         // Copy it
		        arr = lib.map(arr, function(v) { return v; });

		        arr.sort(function(a, b) {
		            var x, y;

		            if(attr) {
		                x = a[attr];
		                y = b[attr];
		            }
		            else {
		                x = a;
		                y = b;
		            }

		            if(!caseSens && lib.isString(x) && lib.isString(y)) {
		                x = x.toLowerCase();
		                y = y.toLowerCase();
		            }

		            if(x < y) {
		                return reverse ? 1 : -1;
		            }
		            else if(x > y) {
		                return reverse ? -1: 1;
		            }
		            else {
		                return 0;
		            }
		        });

		        return arr;
		    }),

		    string: function(obj) {
		        return r.copySafeness(obj, obj);
		    },

		    striptags: function(input, preserve_linebreaks) {
		        input = normalize(input, '');
		        preserve_linebreaks = preserve_linebreaks || false;
		        var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>|<!--[\s\S]*?-->/gi;
		        var trimmedInput = filters.trim(input.replace(tags, ''));
		        var res = '';
		        if (preserve_linebreaks) {
		            res = trimmedInput
		                .replace(/^ +| +$/gm, '')     // remove leading and trailing spaces
		                .replace(/ +/g, ' ')          // squash adjacent spaces
		                .replace(/(\r\n)/g, '\n')     // normalize linebreaks (CRLF -> LF)
		                .replace(/\n\n\n+/g, '\n\n'); // squash abnormal adjacent linebreaks
		        } else {
		            res = trimmedInput.replace(/\s+/gi, ' ');
		        }
		        return r.copySafeness(input, res);
		    },

		    title: function(str) {
		        str = normalize(str, '');
		        var words = str.split(' ');
		        for(var i = 0; i < words.length; i++) {
		            words[i] = filters.capitalize(words[i]);
		        }
		        return r.copySafeness(str, words.join(' '));
		    },

		    trim: function(str) {
		        return r.copySafeness(str, str.replace(/^\s*|\s*$/g, ''));
		    },

		    truncate: function(input, length, killwords, end) {
		        var orig = input;
		        input = normalize(input, '');
		        length = length || 255;

		        if (input.length <= length)
		            return input;

		        if (killwords) {
		            input = input.substring(0, length);
		        } else {
		            var idx = input.lastIndexOf(' ', length);
		            if(idx === -1) {
		                idx = length;
		            }

		            input = input.substring(0, idx);
		        }

		        input += (end !== undefined && end !== null) ? end : '...';
		        return r.copySafeness(orig, input);
		    },

		    upper: function(str) {
		        str = normalize(str, '');
		        return str.toUpperCase();
		    },

		    urlencode: function(obj) {
		        var enc = encodeURIComponent;
		        if (lib.isString(obj)) {
		            return enc(obj);
		        } else {
		            var parts;
		            if (lib.isArray(obj)) {
		                parts = obj.map(function(item) {
		                    return enc(item[0]) + '=' + enc(item[1]);
		                });
		            } else {
		                parts = [];
		                for (var k in obj) {
		                    if (obj.hasOwnProperty(k)) {
		                        parts.push(enc(k) + '=' + enc(obj[k]));
		                    }
		                }
		            }
		            return parts.join('&');
		        }
		    },

		    urlize: function(str, length, nofollow) {
		        if (isNaN(length)) length = Infinity;

		        var noFollowAttr = (nofollow === true ? ' rel="nofollow"' : '');

		        // For the jinja regexp, see
		        // https://github.com/mitsuhiko/jinja2/blob/f15b814dcba6aa12bc74d1f7d0c881d55f7126be/jinja2/utils.py#L20-L23
		        var puncRE = /^(?:\(|<|&lt;)?(.*?)(?:\.|,|\)|\n|&gt;)?$/;
		        // from http://blog.gerv.net/2011/05/html5_email_address_regexp/
		        var emailRE = /^[\w.!#$%&'*+\-\/=?\^`{|}~]+@[a-z\d\-]+(\.[a-z\d\-]+)+$/i;
		        var httpHttpsRE = /^https?:\/\/.*$/;
		        var wwwRE = /^www\./;
		        var tldRE = /\.(?:org|net|com)(?:\:|\/|$)/;

		        var words = str.split(/(\s+)/).filter(function(word) {
		          // If the word has no length, bail. This can happen for str with
		          // trailing whitespace.
		          return word && word.length;
		        }).map(function(word) {
		          var matches = word.match(puncRE);
		          var possibleUrl = matches && matches[1] || word;

		          // url that starts with http or https
		          if (httpHttpsRE.test(possibleUrl))
		            return '<a href="' + possibleUrl + '"' + noFollowAttr + '>' + possibleUrl.substr(0, length) + '</a>';

		          // url that starts with www.
		          if (wwwRE.test(possibleUrl))
		            return '<a href="http://' + possibleUrl + '"' + noFollowAttr + '>' + possibleUrl.substr(0, length) + '</a>';

		          // an email address of the form username@domain.tld
		          if (emailRE.test(possibleUrl))
		            return '<a href="mailto:' + possibleUrl + '">' + possibleUrl + '</a>';

		          // url that ends in .com, .org or .net that is not an email address
		          if (tldRE.test(possibleUrl))
		            return '<a href="http://' + possibleUrl + '"' + noFollowAttr + '>' + possibleUrl.substr(0, length) + '</a>';

		          return word;

		        });

		        return words.join('');
		    },

		    wordcount: function(str) {
		        str = normalize(str, '');
		        var words = (str) ? str.match(/\w+/g) : null;
		        return (words) ? words.length : null;
		    },

		    'float': function(val, def) {
		        var res = parseFloat(val);
		        return isNaN(res) ? def : res;
		    },

		    'int': function(val, def) {
		        var res = parseInt(val, 10);
		        return isNaN(res) ? def : res;
		    }
		};

		// Aliases
		filters.d = filters['default'];
		filters.e = filters.escape;

		module.exports = filters;


	/***/ },
	/* 8 */
	/***/ function(module, exports, __webpack_require__) {

		'use strict';

		var lib = __webpack_require__(1);
		var Obj = __webpack_require__(6);

		// Frames keep track of scoping both at compile-time and run-time so
		// we know how to access variables. Block tags can introduce special
		// variables, for example.
		var Frame = Obj.extend({
		    init: function(parent, isolateWrites) {
		        this.variables = {};
		        this.parent = parent;
		        this.topLevel = false;
		        // if this is true, writes (set) should never propagate upwards past
		        // this frame to its parent (though reads may).
		        this.isolateWrites = isolateWrites;
		    },

		    set: function(name, val, resolveUp) {
		        // Allow variables with dots by automatically creating the
		        // nested structure
		        var parts = name.split('.');
		        var obj = this.variables;
		        var frame = this;

		        if(resolveUp) {
		            if((frame = this.resolve(parts[0], true))) {
		                frame.set(name, val);
		                return;
		            }
		        }

		        for(var i=0; i<parts.length - 1; i++) {
		            var id = parts[i];

		            if(!obj[id]) {
		                obj[id] = {};
		            }
		            obj = obj[id];
		        }

		        obj[parts[parts.length - 1]] = val;
		    },

		    get: function(name) {
		        var val = this.variables[name];
		        if(val !== undefined && val !== null) {
		            return val;
		        }
		        return null;
		    },

		    lookup: function(name) {
		        var p = this.parent;
		        var val = this.variables[name];
		        if(val !== undefined && val !== null) {
		            return val;
		        }
		        return p && p.lookup(name);
		    },

		    resolve: function(name, forWrite) {
		        var p = (forWrite && this.isolateWrites) ? undefined : this.parent;
		        var val = this.variables[name];
		        if(val !== undefined && val !== null) {
		            return this;
		        }
		        return p && p.resolve(name);
		    },

		    push: function(isolateWrites) {
		        return new Frame(this, isolateWrites);
		    },

		    pop: function() {
		        return this.parent;
		    }
		});

		function makeMacro(argNames, kwargNames, func) {
		    return function() {
		        var argCount = numArgs(arguments);
		        var args;
		        var kwargs = getKeywordArgs(arguments);
		        var i;

		        if(argCount > argNames.length) {
		            args = Array.prototype.slice.call(arguments, 0, argNames.length);

		            // Positional arguments that should be passed in as
		            // keyword arguments (essentially default values)
		            var vals = Array.prototype.slice.call(arguments, args.length, argCount);
		            for(i = 0; i < vals.length; i++) {
		                if(i < kwargNames.length) {
		                    kwargs[kwargNames[i]] = vals[i];
		                }
		            }

		            args.push(kwargs);
		        }
		        else if(argCount < argNames.length) {
		            args = Array.prototype.slice.call(arguments, 0, argCount);

		            for(i = argCount; i < argNames.length; i++) {
		                var arg = argNames[i];

		                // Keyword arguments that should be passed as
		                // positional arguments, i.e. the caller explicitly
		                // used the name of a positional arg
		                args.push(kwargs[arg]);
		                delete kwargs[arg];
		            }

		            args.push(kwargs);
		        }
		        else {
		            args = arguments;
		        }

		        return func.apply(this, args);
		    };
		}

		function makeKeywordArgs(obj) {
		    obj.__keywords = true;
		    return obj;
		}

		function getKeywordArgs(args) {
		    var len = args.length;
		    if(len) {
		        var lastArg = args[len - 1];
		        if(lastArg && lastArg.hasOwnProperty('__keywords')) {
		            return lastArg;
		        }
		    }
		    return {};
		}

		function numArgs(args) {
		    var len = args.length;
		    if(len === 0) {
		        return 0;
		    }

		    var lastArg = args[len - 1];
		    if(lastArg && lastArg.hasOwnProperty('__keywords')) {
		        return len - 1;
		    }
		    else {
		        return len;
		    }
		}

		// A SafeString object indicates that the string should not be
		// autoescaped. This happens magically because autoescaping only
		// occurs on primitive string objects.
		function SafeString(val) {
		    if(typeof val !== 'string') {
		        return val;
		    }

		    this.val = val;
		    this.length = val.length;
		}

		SafeString.prototype = Object.create(String.prototype, {
		    length: { writable: true, configurable: true, value: 0 }
		});
		SafeString.prototype.valueOf = function() {
		    return this.val;
		};
		SafeString.prototype.toString = function() {
		    return this.val;
		};

		function copySafeness(dest, target) {
		    if(dest instanceof SafeString) {
		        return new SafeString(target);
		    }
		    return target.toString();
		}

		function markSafe(val) {
		    var type = typeof val;

		    if(type === 'string') {
		        return new SafeString(val);
		    }
		    else if(type !== 'function') {
		        return val;
		    }
		    else {
		        return function() {
		            var ret = val.apply(this, arguments);

		            if(typeof ret === 'string') {
		                return new SafeString(ret);
		            }

		            return ret;
		        };
		    }
		}

		function suppressValue(val, autoescape) {
		    val = (val !== undefined && val !== null) ? val : '';

		    if(autoescape && !(val instanceof SafeString)) {
		        val = lib.escape(val.toString());
		    }

		    return val;
		}

		function ensureDefined(val, lineno, colno) {
		    if(val === null || val === undefined) {
		        throw new lib.TemplateError(
		            'attempted to output null or undefined value',
		            lineno + 1,
		            colno + 1
		        );
		    }
		    return val;
		}

		function memberLookup(obj, val) {
		    obj = obj || {};

		    if(typeof obj[val] === 'function') {
		        return function() {
		            return obj[val].apply(obj, arguments);
		        };
		    }

		    return obj[val];
		}

		function callWrap(obj, name, context, args) {
		    if(!obj) {
		        throw new Error('Unable to call `' + name + '`, which is undefined or falsey');
		    }
		    else if(typeof obj !== 'function') {
		        throw new Error('Unable to call `' + name + '`, which is not a function');
		    }

		    // jshint validthis: true
		    return obj.apply(context, args);
		}

		function contextOrFrameLookup(context, frame, name) {
		    var val = frame.lookup(name);
		    return (val !== undefined && val !== null) ?
		        val :
		        context.lookup(name);
		}

		function handleError(error, lineno, colno) {
		    if(error.lineno) {
		        return error;
		    }
		    else {
		        return new lib.TemplateError(error, lineno, colno);
		    }
		}

		function asyncEach(arr, dimen, iter, cb) {
		    if(lib.isArray(arr)) {
		        var len = arr.length;

		        lib.asyncIter(arr, function(item, i, next) {
		            switch(dimen) {
		            case 1: iter(item, i, len, next); break;
		            case 2: iter(item[0], item[1], i, len, next); break;
		            case 3: iter(item[0], item[1], item[2], i, len, next); break;
		            default:
		                item.push(i, next);
		                iter.apply(this, item);
		            }
		        }, cb);
		    }
		    else {
		        lib.asyncFor(arr, function(key, val, i, len, next) {
		            iter(key, val, i, len, next);
		        }, cb);
		    }
		}

		function asyncAll(arr, dimen, func, cb) {
		    var finished = 0;
		    var len, i;
		    var outputArr;

		    function done(i, output) {
		        finished++;
		        outputArr[i] = output;

		        if(finished === len) {
		            cb(null, outputArr.join(''));
		        }
		    }

		    if(lib.isArray(arr)) {
		        len = arr.length;
		        outputArr = new Array(len);

		        if(len === 0) {
		            cb(null, '');
		        }
		        else {
		            for(i = 0; i < arr.length; i++) {
		                var item = arr[i];

		                switch(dimen) {
		                case 1: func(item, i, len, done); break;
		                case 2: func(item[0], item[1], i, len, done); break;
		                case 3: func(item[0], item[1], item[2], i, len, done); break;
		                default:
		                    item.push(i, done);
		                    // jshint validthis: true
		                    func.apply(this, item);
		                }
		            }
		        }
		    }
		    else {
		        var keys = lib.keys(arr);
		        len = keys.length;
		        outputArr = new Array(len);

		        if(len === 0) {
		            cb(null, '');
		        }
		        else {
		            for(i = 0; i < keys.length; i++) {
		                var k = keys[i];
		                func(k, arr[k], i, len, done);
		            }
		        }
		    }
		}

		module.exports = {
		    Frame: Frame,
		    makeMacro: makeMacro,
		    makeKeywordArgs: makeKeywordArgs,
		    numArgs: numArgs,
		    suppressValue: suppressValue,
		    ensureDefined: ensureDefined,
		    memberLookup: memberLookup,
		    contextOrFrameLookup: contextOrFrameLookup,
		    callWrap: callWrap,
		    handleError: handleError,
		    isArray: lib.isArray,
		    keys: lib.keys,
		    SafeString: SafeString,
		    copySafeness: copySafeness,
		    markSafe: markSafe,
		    asyncEach: asyncEach,
		    asyncAll: asyncAll,
		    inOperator: lib.inOperator
		};


	/***/ },
	/* 9 */
	/***/ function(module, exports) {

		'use strict';

		function cycler(items) {
		    var index = -1;

		    return {
		        current: null,
		        reset: function() {
		            index = -1;
		            this.current = null;
		        },

		        next: function() {
		            index++;
		            if(index >= items.length) {
		                index = 0;
		            }

		            this.current = items[index];
		            return this.current;
		        },
		    };

		}

		function joiner(sep) {
		    sep = sep || ',';
		    var first = true;

		    return function() {
		        var val = first ? '' : sep;
		        first = false;
		        return val;
		    };
		}

		// Making this a function instead so it returns a new object
		// each time it's called. That way, if something like an environment
		// uses it, they will each have their own copy.
		function globals() {
		    return {
		        range: function(start, stop, step) {
		            if(typeof stop === 'undefined') {
		                stop = start;
		                start = 0;
		                step = 1;
		            }
		            else if(!step) {
		                step = 1;
		            }

		            var arr = [];
		            var i;
		            if (step > 0) {
		                for (i=start; i<stop; i+=step) {
		                    arr.push(i);
		                }
		            } else {
		                for (i=start; i>stop; i+=step) {
		                    arr.push(i);
		                }
		            }
		            return arr;
		        },

		        // lipsum: function(n, html, min, max) {
		        // },

		        cycler: function() {
		            return cycler(Array.prototype.slice.call(arguments));
		        },

		        joiner: function(sep) {
		            return joiner(sep);
		        }
		    };
		}

		module.exports = globals;


	/***/ },
	/* 10 */
	/***/ function(module, exports, __webpack_require__) {

		'use strict';

		var Loader = __webpack_require__(11);

		var PrecompiledLoader = Loader.extend({
		    init: function(compiledTemplates) {
		        this.precompiled = compiledTemplates || {};
		    },

		    getSource: function(name) {
		        if (this.precompiled[name]) {
		            return {
		                src: { type: 'code',
		                       obj: this.precompiled[name] },
		                path: name
		            };
		        }
		        return null;
		    }
		});

		module.exports = PrecompiledLoader;


	/***/ },
	/* 11 */
	/***/ function(module, exports, __webpack_require__) {

		'use strict';

		var path = __webpack_require__(3);
		var Obj = __webpack_require__(6);
		var lib = __webpack_require__(1);

		var Loader = Obj.extend({
		    on: function(name, func) {
		        this.listeners = this.listeners || {};
		        this.listeners[name] = this.listeners[name] || [];
		        this.listeners[name].push(func);
		    },

		    emit: function(name /*, arg1, arg2, ...*/) {
		        var args = Array.prototype.slice.call(arguments, 1);

		        if(this.listeners && this.listeners[name]) {
		            lib.each(this.listeners[name], function(listener) {
		                listener.apply(null, args);
		            });
		        }
		    },

		    resolve: function(from, to) {
		        return path.resolve(path.dirname(from), to);
		    },

		    isRelative: function(filename) {
		        return (filename.indexOf('./') === 0 || filename.indexOf('../') === 0);
		    }
		});

		module.exports = Loader;


	/***/ },
	/* 12 */
	/***/ function(module, exports) {

		function installCompat() {
		  'use strict';

		  // This must be called like `nunjucks.installCompat` so that `this`
		  // references the nunjucks instance
		  var runtime = this.runtime; // jshint ignore:line
		  var lib = this.lib; // jshint ignore:line

		  var orig_contextOrFrameLookup = runtime.contextOrFrameLookup;
		  runtime.contextOrFrameLookup = function(context, frame, key) {
		    var val = orig_contextOrFrameLookup.apply(this, arguments);
		    if (val === undefined) {
		      switch (key) {
		      case 'True':
		        return true;
		      case 'False':
		        return false;
		      case 'None':
		        return null;
		      }
		    }

		    return val;
		  };

		  var orig_memberLookup = runtime.memberLookup;
		  var ARRAY_MEMBERS = {
		    pop: function(index) {
		      if (index === undefined) {
		        return this.pop();
		      }
		      if (index >= this.length || index < 0) {
		        throw new Error('KeyError');
		      }
		      return this.splice(index, 1);
		    },
		    remove: function(element) {
		      for (var i = 0; i < this.length; i++) {
		        if (this[i] === element) {
		          return this.splice(i, 1);
		        }
		      }
		      throw new Error('ValueError');
		    },
		    count: function(element) {
		      var count = 0;
		      for (var i = 0; i < this.length; i++) {
		        if (this[i] === element) {
		          count++;
		        }
		      }
		      return count;
		    },
		    index: function(element) {
		      var i;
		      if ((i = this.indexOf(element)) === -1) {
		        throw new Error('ValueError');
		      }
		      return i;
		    },
		    find: function(element) {
		      return this.indexOf(element);
		    },
		    insert: function(index, elem) {
		      return this.splice(index, 0, elem);
		    }
		  };
		  var OBJECT_MEMBERS = {
		    items: function() {
		      var ret = [];
		      for(var k in this) {
		        ret.push([k, this[k]]);
		      }
		      return ret;
		    },
		    values: function() {
		      var ret = [];
		      for(var k in this) {
		        ret.push(this[k]);
		      }
		      return ret;
		    },
		    keys: function() {
		      var ret = [];
		      for(var k in this) {
		        ret.push(k);
		      }
		      return ret;
		    },
		    get: function(key, def) {
		      var output = this[key];
		      if (output === undefined) {
		        output = def;
		      }
		      return output;
		    },
		    has_key: function(key) {
		      return this.hasOwnProperty(key);
		    },
		    pop: function(key, def) {
		      var output = this[key];
		      if (output === undefined && def !== undefined) {
		        output = def;
		      } else if (output === undefined) {
		        throw new Error('KeyError');
		      } else {
		        delete this[key];
		      }
		      return output;
		    },
		    popitem: function() {
		      for (var k in this) {
		        // Return the first object pair.
		        var val = this[k];
		        delete this[k];
		        return [k, val];
		      }
		      throw new Error('KeyError');
		    },
		    setdefault: function(key, def) {
		      if (key in this) {
		        return this[key];
		      }
		      if (def === undefined) {
		        def = null;
		      }
		      return this[key] = def;
		    },
		    update: function(kwargs) {
		      for (var k in kwargs) {
		        this[k] = kwargs[k];
		      }
		      return null;  // Always returns None
		    }
		  };
		  OBJECT_MEMBERS.iteritems = OBJECT_MEMBERS.items;
		  OBJECT_MEMBERS.itervalues = OBJECT_MEMBERS.values;
		  OBJECT_MEMBERS.iterkeys = OBJECT_MEMBERS.keys;
		  runtime.memberLookup = function(obj, val, autoescape) { // jshint ignore:line
		    obj = obj || {};

		    // If the object is an object, return any of the methods that Python would
		    // otherwise provide.
		    if (lib.isArray(obj) && ARRAY_MEMBERS.hasOwnProperty(val)) {
		      return function() {return ARRAY_MEMBERS[val].apply(obj, arguments);};
		    }

		    if (lib.isObject(obj) && OBJECT_MEMBERS.hasOwnProperty(val)) {
		      return function() {return OBJECT_MEMBERS[val].apply(obj, arguments);};
		    }

		    return orig_memberLookup.apply(this, arguments);
		  };
		}

		module.exports = installCompat;


	/***/ }
	/******/ ])
	});
	;

/***/ },
/* 20 */
/*!************************************************!*\
  !*** ./src/client/js/precompiled-templates.js ***!
  \************************************************/
/***/ function(module, exports) {

	"use strict";

	module.exports["bubble-style"] = function () {
	  function root(env, context, frame, runtime, cb) {
	    var lineno = null;
	    var colno = null;
	    var output = "";
	    try {
	      var parentTemplate = null;
	      output += "width: ";
	      output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "diameter"), env.opts.autoescape);
	      output += "px; height: ";
	      output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "diameter"), env.opts.autoescape);
	      output += "px; left: ";
	      output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "x"), env.opts.autoescape);
	      output += "px; top: ";
	      output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "y"), env.opts.autoescape);
	      output += "px;\n";
	      if (parentTemplate) {
	        parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
	      } else {
	        cb(null, output);
	      }
	      ;
	    } catch (e) {
	      cb(runtime.handleError(e, lineno, colno));
	    }
	  }
	  return {
	    root: root
	  };
	}();
	module.exports["global"] = function () {
	  function root(env, context, frame, runtime, cb) {
	    var lineno = null;
	    var colno = null;
	    var output = "";
	    try {
	      var parentTemplate = null;
	      var macro_t_1 = runtime.makeMacro(["text", "href"], [], function (l_text, l_href, kwargs) {
	        frame = frame.push(true);
	        kwargs = kwargs || {};
	        if (kwargs.hasOwnProperty("caller")) {
	          frame.set("caller", kwargs.caller);
	        }
	        frame.set("text", l_text);
	        frame.set("href", l_href);
	        var t_2 = "";t_2 += "\n  <a href=\"";
	        t_2 += runtime.suppressValue(l_href, env.opts.autoescape);
	        t_2 += "\" target=\"_blank\">";
	        t_2 += runtime.suppressValue(l_text, env.opts.autoescape);
	        t_2 += "</a>\n";
	        ;
	        frame = frame.pop();
	        return new runtime.SafeString(t_2);
	      });
	      context.addExport("link");
	      context.setVariable("link", macro_t_1);
	      var macro_t_3 = runtime.makeMacro(["item"], [], function (l_item, kwargs) {
	        frame = frame.push(true);
	        kwargs = kwargs || {};
	        if (kwargs.hasOwnProperty("caller")) {
	          frame.set("caller", kwargs.caller);
	        }
	        frame.set("item", l_item);
	        var t_4 = "";t_4 += "\n  <ul class=\"options\">\n    <li data-action=\"delete\">\n      <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 268.476 268.476\">\n        <path d=\"M63.119 250.254s3.999 18.222 24.583 18.222h93.072c20.583 0 24.582-18.222 24.582-18.222l18.374-178.66H44.746l18.373 178.66zM170.035 98.442a8.948 8.948 0 0 1 8.949-8.949 8.95 8.95 0 0 1 8.95 8.949l-8.95 134.238a8.949 8.949 0 1 1-17.898 0l8.949-134.238zm-44.746 0a8.949 8.949 0 0 1 8.949-8.949 8.948 8.948 0 0 1 8.949 8.949V232.68a8.948 8.948 0 0 1-8.949 8.949 8.949 8.949 0 0 1-8.949-8.949V98.442zm-35.797-8.95a8.948 8.948 0 0 1 8.949 8.949l8.95 134.238a8.95 8.95 0 0 1-17.899 0L80.543 98.442a8.95 8.95 0 0 1 8.949-8.95zM218.36 35.811h-39.376V17.899C178.984 4.322 174.593 0 161.086 0H107.39C95.001 0 89.492 6.001 89.492 17.899v17.913H50.116c-7.914 0-14.319 6.007-14.319 13.43 0 7.424 6.405 13.431 14.319 13.431H218.36c7.914 0 14.319-6.007 14.319-13.431 0-7.423-6.405-13.431-14.319-13.431zm-57.274 0h-53.695l.001-17.913h53.695v17.913z\" />\n      </svg>\n    </li>";
	        if (l_item == "brewery") {
	          t_4 += "<li data-action=\"add-beer\">\n        <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 35 34\">\n          <path d=\"M8.04.88C10.8-.38 20.29-.41 22.89.88 24.52 1.92 24.89 2.7 26 4H4C5.43 2.42 5.92 1.59 8.04.88zm15.92 32.99c-9.6 0-8.07.18-18 .09-3.7-.22-2.96-.31-2.96-13.9C0 18.17.11 19 .04 14c.5-1.91 2-8.83 3.53-9.04 4.65 0 21.42.04 23.4.03.03 1.34.02.33.03 2.01 4.29 0 4.78-.52 8.03 3 0 4.65-.09 10.91-.03 12.91-3.13 3.22-.96 3.05-8.04 3.05.47 8.82-.48 7.56-3 7.91zm7.13-17.35c-.09-6.13.88-5.49-4.12-5.52L27 21.96c5 .06 3.96.13 4.09-5.44zM13 12v5H8v4h5v5h4v-5h5v-4h-5v-5h-4z\" />\n        </svg>\n      </li>";
	          ;
	        }
	        t_4 += "<li data-action=\"edit\">\n      <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 528.899 528.899\">\n        <path d=\"M328.883 89.125l107.59 107.589-272.34 272.34L56.604 361.465l272.279-272.34zm189.23-25.948l-47.981-47.981c-18.543-18.543-48.653-18.543-67.259 0l-45.961 45.961 107.59 107.59 53.611-53.611c14.382-14.383 14.382-37.577 0-51.959zM.3 512.69c-1.958 8.812 5.998 16.708 14.811 14.565l119.891-29.069L27.473 390.597.3 512.69z\" />\n      </svg>\n    </li>\n  </ul>\n";
	        ;
	        frame = frame.pop();
	        return new runtime.SafeString(t_4);
	      });
	      context.addExport("options");
	      context.setVariable("options", macro_t_3);
	      output += "\n";
	      if (parentTemplate) {
	        parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
	      } else {
	        cb(null, output);
	      }
	      ;
	    } catch (e) {
	      cb(runtime.handleError(e, lineno, colno));
	    }
	  }
	  return {
	    root: root
	  };
	}();
	module.exports["input-fields/input"] = function () {
	  function root(env, context, frame, runtime, cb) {
	    var lineno = null;
	    var colno = null;
	    var output = "";
	    try {
	      var parentTemplate = null;
	      output += "<div class=\"label-container\">\n  <label for=\"";
	      output += runtime.suppressValue(runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "input"), "id"), env.opts.autoescape);
	      output += "\">";
	      output += runtime.suppressValue(runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "input"), "label"), env.opts.autoescape);
	      output += "</label>\n  <span class=\"error\" data-for=\"";
	      output += runtime.suppressValue(runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "input"), "id"), env.opts.autoescape);
	      output += "\"></span>\n</div>\n";
	      (parentTemplate ? function (e, c, f, r, cb) {
	        cb("");
	      } : context.getBlock("content"))(env, context, frame, runtime, function (t_2, t_1) {
	        if (t_2) {
	          cb(t_2);return;
	        }
	        output += t_1;
	        output += "\n";
	        if (parentTemplate) {
	          parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
	        } else {
	          cb(null, output);
	        }
	      });
	    } catch (e) {
	      cb(runtime.handleError(e, lineno, colno));
	    }
	  }
	  function b_content(env, context, frame, runtime, cb) {
	    var lineno = null;
	    var colno = null;
	    var output = "";
	    try {
	      cb(null, output);
	      ;
	    } catch (e) {
	      cb(runtime.handleError(e, lineno, colno));
	    }
	  }
	  return {
	    b_content: b_content,
	    root: root
	  };
	}();
	module.exports["input-fields/select"] = function () {
	  function root(env, context, frame, runtime, cb) {
	    var lineno = null;
	    var colno = null;
	    var output = "";
	    try {
	      var parentTemplate = null;
	      env.getTemplate("input-fields/input", true, "input-fields/select.njk", false, function (t_2, _parentTemplate) {
	        if (t_2) {
	          cb(t_2);return;
	        }
	        parentTemplate = _parentTemplate;
	        for (var t_1 in parentTemplate.blocks) {
	          context.addBlock(t_1, parentTemplate.blocks[t_1]);
	        }
	        output += "\n\n";
	        (parentTemplate ? function (e, c, f, r, cb) {
	          cb("");
	        } : context.getBlock("content"))(env, context, frame, runtime, function (t_4, t_3) {
	          if (t_4) {
	            cb(t_4);return;
	          }
	          output += t_3;
	          output += "\n";
	          if (parentTemplate) {
	            parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
	          } else {
	            cb(null, output);
	          }
	        });
	      });
	    } catch (e) {
	      cb(runtime.handleError(e, lineno, colno));
	    }
	  }
	  function b_content(env, context, frame, runtime, cb) {
	    var lineno = null;
	    var colno = null;
	    var output = "";
	    try {
	      output += "\n  <select id=\"";
	      output += runtime.suppressValue(runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "input"), "id"), env.opts.autoescape);
	      output += "\" data-form>\n    <option value=\"\">--</option>\n    ";
	      frame = frame.push();
	      var t_7 = runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "input"), "list");
	      if (t_7) {
	        var t_6 = t_7.length;
	        for (var t_5 = 0; t_5 < t_7.length; t_5++) {
	          var t_8 = t_7[t_5];
	          frame.set("item", t_8);
	          frame.set("loop.index", t_5 + 1);
	          frame.set("loop.index0", t_5);
	          frame.set("loop.revindex", t_6 - t_5);
	          frame.set("loop.revindex0", t_6 - t_5 - 1);
	          frame.set("loop.first", t_5 === 0);
	          frame.set("loop.last", t_5 === t_6 - 1);
	          frame.set("loop.length", t_6);
	          output += "\n      <option ";
	          if (runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "input"), "selected") === t_8) {
	            output += "selected";
	            ;
	          }
	          output += ">\n        ";
	          output += runtime.suppressValue(t_8, env.opts.autoescape);
	          output += "\n      </option>\n    ";
	          ;
	        }
	      }
	      frame = frame.pop();
	      output += "\n  </select>\n";
	      cb(null, output);
	      ;
	    } catch (e) {
	      cb(runtime.handleError(e, lineno, colno));
	    }
	  }
	  return {
	    b_content: b_content,
	    root: root
	  };
	}();
	module.exports["input-fields/text-area"] = function () {
	  function root(env, context, frame, runtime, cb) {
	    var lineno = null;
	    var colno = null;
	    var output = "";
	    try {
	      var parentTemplate = null;
	      env.getTemplate("input-fields/input", true, "input-fields/text-area.njk", false, function (t_2, _parentTemplate) {
	        if (t_2) {
	          cb(t_2);return;
	        }
	        parentTemplate = _parentTemplate;
	        for (var t_1 in parentTemplate.blocks) {
	          context.addBlock(t_1, parentTemplate.blocks[t_1]);
	        }
	        output += "\n\n";
	        (parentTemplate ? function (e, c, f, r, cb) {
	          cb("");
	        } : context.getBlock("content"))(env, context, frame, runtime, function (t_4, t_3) {
	          if (t_4) {
	            cb(t_4);return;
	          }
	          output += t_3;
	          output += "\n";
	          if (parentTemplate) {
	            parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
	          } else {
	            cb(null, output);
	          }
	        });
	      });
	    } catch (e) {
	      cb(runtime.handleError(e, lineno, colno));
	    }
	  }
	  function b_content(env, context, frame, runtime, cb) {
	    var lineno = null;
	    var colno = null;
	    var output = "";
	    try {
	      output += "\n  <textarea id=\"";
	      output += runtime.suppressValue(runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "input"), "id"), env.opts.autoescape);
	      output += "\" data-form>";
	      output += runtime.suppressValue(runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "input"), "value"), env.opts.autoescape);
	      output += "</textarea>\n";
	      cb(null, output);
	      ;
	    } catch (e) {
	      cb(runtime.handleError(e, lineno, colno));
	    }
	  }
	  return {
	    b_content: b_content,
	    root: root
	  };
	}();
	module.exports["input-fields/text"] = function () {
	  function root(env, context, frame, runtime, cb) {
	    var lineno = null;
	    var colno = null;
	    var output = "";
	    try {
	      var parentTemplate = null;
	      env.getTemplate("input-fields/input", true, "input-fields/text.njk", false, function (t_2, _parentTemplate) {
	        if (t_2) {
	          cb(t_2);return;
	        }
	        parentTemplate = _parentTemplate;
	        for (var t_1 in parentTemplate.blocks) {
	          context.addBlock(t_1, parentTemplate.blocks[t_1]);
	        }
	        output += "\n\n";
	        (parentTemplate ? function (e, c, f, r, cb) {
	          cb("");
	        } : context.getBlock("content"))(env, context, frame, runtime, function (t_4, t_3) {
	          if (t_4) {
	            cb(t_4);return;
	          }
	          output += t_3;
	          output += "\n";
	          if (parentTemplate) {
	            parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
	          } else {
	            cb(null, output);
	          }
	        });
	      });
	    } catch (e) {
	      cb(runtime.handleError(e, lineno, colno));
	    }
	  }
	  function b_content(env, context, frame, runtime, cb) {
	    var lineno = null;
	    var colno = null;
	    var output = "";
	    try {
	      output += "\n  <input id=\"";
	      output += runtime.suppressValue(runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "input"), "id"), env.opts.autoescape);
	      output += "\" type=\"text\" value=\"";
	      output += runtime.suppressValue(runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "input"), "value"), env.opts.autoescape);
	      output += "\" data-form>\n";
	      cb(null, output);
	      ;
	    } catch (e) {
	      cb(runtime.handleError(e, lineno, colno));
	    }
	  }
	  return {
	    b_content: b_content,
	    root: root
	  };
	}();
	module.exports["modal-dialog"] = function () {
	  function root(env, context, frame, runtime, cb) {
	    var lineno = null;
	    var colno = null;
	    var output = "";
	    try {
	      var parentTemplate = null;
	      output += "<h2>";
	      output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "title"), env.opts.autoescape);
	      output += "</h2>\n";
	      output += runtime.suppressValue(env.getFilter("safe").call(context, runtime.contextOrFrameLookup(context, frame, "content")), env.opts.autoescape);
	      output += "\n";
	      frame = frame.push();
	      var t_3 = runtime.contextOrFrameLookup(context, frame, "btns");
	      if (t_3) {
	        var t_2 = t_3.length;
	        for (var t_1 = 0; t_1 < t_3.length; t_1++) {
	          var t_4 = t_3[t_1];
	          frame.set("btn", t_4);
	          frame.set("loop.index", t_1 + 1);
	          frame.set("loop.index0", t_1);
	          frame.set("loop.revindex", t_2 - t_1);
	          frame.set("loop.revindex0", t_2 - t_1 - 1);
	          frame.set("loop.first", t_1 === 0);
	          frame.set("loop.last", t_1 === t_2 - 1);
	          frame.set("loop.length", t_2);
	          output += "<button data-action=\"";
	          output += runtime.suppressValue(runtime.memberLookup(t_4, "action"), env.opts.autoescape);
	          output += "\" type=\"button\">\n    ";
	          output += runtime.suppressValue(runtime.memberLookup(t_4, "text"), env.opts.autoescape);
	          output += "\n  </button>";
	          ;
	        }
	      }
	      frame = frame.pop();
	      output += "\n";
	      if (parentTemplate) {
	        parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
	      } else {
	        cb(null, output);
	      }
	      ;
	    } catch (e) {
	      cb(runtime.handleError(e, lineno, colno));
	    }
	  }
	  return {
	    root: root
	  };
	}();
	module.exports["modal-form"] = function () {
	  function root(env, context, frame, runtime, cb) {
	    var lineno = null;
	    var colno = null;
	    var output = "";
	    try {
	      var parentTemplate = null;
	      output += "<h2>";
	      output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "title"), env.opts.autoescape);
	      output += "</h2>\n<form novalidate>\n  ";
	      frame = frame.push();
	      var t_3 = runtime.contextOrFrameLookup(context, frame, "inputFields");
	      if (t_3) {
	        var t_2 = t_3.length;
	        for (var t_1 = 0; t_1 < t_3.length; t_1++) {
	          var t_4 = t_3[t_1];
	          frame.set("input", t_4);
	          frame.set("loop.index", t_1 + 1);
	          frame.set("loop.index0", t_1);
	          frame.set("loop.revindex", t_2 - t_1);
	          frame.set("loop.revindex0", t_2 - t_1 - 1);
	          frame.set("loop.first", t_1 === 0);
	          frame.set("loop.last", t_1 === t_2 - 1);
	          frame.set("loop.length", t_2);
	          env.getTemplate(runtime.memberLookup(t_4, "tpl"), false, "modal-form.njk", null, function (t_7, t_5) {
	            if (t_7) {
	              cb(t_7);return;
	            }
	            t_5.render(context.getVariables(), frame, function (t_8, t_6) {
	              if (t_8) {
	                cb(t_8);return;
	              }
	              output += t_6;
	            });
	          });
	        }
	      }
	      frame = frame.pop();
	      output += "\n\n  <button data-action=\"submit\">\n    Submit\n  </button>\n  <button data-action=\"cancel\" type=\"button\">\n    Cancel\n  </button>\n</form>\n";
	      if (parentTemplate) {
	        parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
	      } else {
	        cb(null, output);
	      }
	      ;
	    } catch (e) {
	      cb(runtime.handleError(e, lineno, colno));
	    }
	  }
	  return {
	    root: root
	  };
	}();
	module.exports["new-beer"] = function () {
	  function root(env, context, frame, runtime, cb) {
	    var lineno = null;
	    var colno = null;
	    var output = "";
	    try {
	      var parentTemplate = null;
	      env.getTemplate("global", false, "new-beer.njk", false, function (t_2, t_1) {
	        if (t_2) {
	          cb(t_2);return;
	        }
	        t_1.getExported(function (t_3, t_1) {
	          if (t_3) {
	            cb(t_3);return;
	          }
	          context.setVariable("gm", t_1);
	          output += "\n\n<li data-item-id=\"";
	          output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "id"), env.opts.autoescape);
	          output += "\" class=\"collapsed\">\n  <h3>\n    <span data-prop=\"name\">";
	          output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "name"), env.opts.autoescape);
	          output += "</span><span class=\"collapse-indicator\"></span>\n  </h3>\n  <div class=\"shadow\"></div>\n  <div class=\"panel\">\n    <div class=\"more-data\">\n      <p data-prop=\"style\">";
	          output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "style"), env.opts.autoescape);
	          output += "</p>\n      <p data-prop=\"description\">";
	          output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "description"), env.opts.autoescape);
	          output += "</p>\n    </div>\n    ";
	          output += runtime.suppressValue((lineno = 12, colno = 15, runtime.callWrap(runtime.memberLookup(t_1, "options"), "gm[\"options\"]", context, ["beer"])), env.opts.autoescape);
	          output += "\n  </div>\n</li>\n";
	          if (parentTemplate) {
	            parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
	          } else {
	            cb(null, output);
	          }
	        });
	      });
	    } catch (e) {
	      cb(runtime.handleError(e, lineno, colno));
	    }
	  }
	  return {
	    root: root
	  };
	}();
	module.exports["new-brewery"] = function () {
	  function root(env, context, frame, runtime, cb) {
	    var lineno = null;
	    var colno = null;
	    var output = "";
	    try {
	      var parentTemplate = null;
	      env.getTemplate("global", false, "new-brewery.njk", false, function (t_2, t_1) {
	        if (t_2) {
	          cb(t_2);return;
	        }
	        t_1.getExported(function (t_3, t_1) {
	          if (t_3) {
	            cb(t_3);return;
	          }
	          context.setVariable("gm", t_1);
	          output += "\n\n<li data-item-id=\"";
	          output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "id"), env.opts.autoescape);
	          output += "\" class=\"collapsed\">\n  <h2>\n    <span data-prop=\"name\">";
	          output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "name"), env.opts.autoescape);
	          output += "</span><span class=\"collapse-indicator\"></span>\n  </h2>\n  <div class=\"shadow\"></div>\n  <div class=\"panel\">\n    <div class=\"more-data\">\n      <p>\n        <span data-prop=\"city_name\">";
	          output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "city_name"), env.opts.autoescape);
	          output += "</span>,\n        <span data-prop=\"state\">";
	          output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "state"), env.opts.autoescape);
	          output += "</span>\n      </p>\n    </div>\n    ";
	          output += runtime.suppressValue((lineno = 14, colno = 15, runtime.callWrap(runtime.memberLookup(t_1, "options"), "gm[\"options\"]", context, ["brewery"])), env.opts.autoescape);
	          output += "\n\n    <ul data-items=\"beer\"></ul>\n  </div>\n</li>\n";
	          if (parentTemplate) {
	            parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
	          } else {
	            cb(null, output);
	          }
	        });
	      });
	    } catch (e) {
	      cb(runtime.handleError(e, lineno, colno));
	    }
	  }
	  return {
	    root: root
	  };
	}();

/***/ },
/* 21 */
/*!*****************************!*\
  !*** ./~/tabbable/index.js ***!
  \*****************************/
/***/ function(module, exports) {

	module.exports = function(el) {
	  var basicTabbables = [];
	  var orderedTabbables = [];
	  var isHidden = createIsHidden();

	  var candidates = el.querySelectorAll('input, select, a[href], textarea, button, [tabindex]');

	  var candidate, candidateIndex;
	  for (var i = 0, l = candidates.length; i < l; i++) {
	    candidate = candidates[i];
	    candidateIndex = candidate.tabIndex;

	    if (
	      candidateIndex < 0
	      || (candidate.tagName === 'INPUT' && candidate.type === 'hidden')
	      || candidate.disabled
	      || isHidden(candidate)
	    ) {
	      continue;
	    }

	    if (candidateIndex === 0) {
	      basicTabbables.push(candidate);
	    } else {
	      orderedTabbables.push({
	        tabIndex: candidateIndex,
	        node: candidate,
	      });
	    }
	  }

	  var tabbableNodes = orderedTabbables
	    .sort(function(a, b) {
	      return a.tabIndex - b.tabIndex;
	    })
	    .map(function(a) {
	      return a.node
	    });

	  Array.prototype.push.apply(tabbableNodes, basicTabbables);

	  return tabbableNodes;
	}

	function createIsHidden() {
	  // Node cache must be refreshed on every check, in case
	  // the content of the element has changed
	  var nodeCache = [];

	  return function isHidden(node) {
	    if (node === document.documentElement) return false;

	    // Find the cached node (Array.prototype.find not available in IE9)
	    for (var i = 0, length = nodeCache.length; i < length; i++) {
	      if (nodeCache[i][0] === node) return nodeCache[i][1];
	    }

	    var result = false;
	    var style = window.getComputedStyle(node);
	    if (style.visibility === 'hidden' || style.display === 'none') {
	      result = true;
	    } else if (node.parentNode) {
	      result = isHidden(node.parentNode);
	    }

	    nodeCache.push([node, result]);

	    return result;
	  }
	}


/***/ },
/* 22 */
/*!**************************************!*\
  !*** ./src/client/js/views/index.js ***!
  \**************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//
	// TODO
	// - This file should be built.  Aint nobody got time fo dat dough.
	//


	//---------//
	// Imports //
	//---------//

	var r = __webpack_require__(/*! ../../../../lib/external/ramda.custom */ 7),
	    rUtils = __webpack_require__(/*! ../../../../lib/r-utils */ 8);

	//------//
	// Init //
	//------//

	var mutableMerge = rUtils.mutableMerge;


	var views = {
	  home: __webpack_require__(/*! ./home.js */ 23)
	};

	//------//
	// Main //
	//------//

	var exportMe = mutableMerge({ contains: contains }, views);

	//-------------//
	// Helper Fxns //
	//-------------//

	function contains(viewName) {
	  return r.contains(viewName, r.keys(views));
	}

	//---------//
	// Exports //
	//---------//

	module.exports = exportMe;

/***/ },
/* 23 */
/*!*************************************!*\
  !*** ./src/client/js/views/home.js ***!
  \*************************************/
/***/ function(module, exports, __webpack_require__) {

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

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var $ = __webpack_require__(/*! ../external/domtastic.custom */ 5),
	    duration = __webpack_require__(/*! ../constants/duration */ 13),
	    formData = __webpack_require__(/*! ../services/form-data */ 24),
	    modal = __webpack_require__(/*! ../services/modal */ 17),
	    modalForms = __webpack_require__(/*! ../modal-forms */ 25),
	    request = __webpack_require__(/*! ../services/request */ 36),
	    r = __webpack_require__(/*! ../../../../lib/external/ramda.custom */ 7),
	    render = __webpack_require__(/*! ../services/render */ 18),
	    rUtils = __webpack_require__(/*! ../../../../lib/r-utils */ 8),
	    schemas = __webpack_require__(/*! ../../../shared/schemas */ 29),
	    utils = __webpack_require__(/*! ../utils */ 12),
	    velocity = __webpack_require__(/*! velocity-animate */ 16);

	//------//
	// Init //
	//------//

	var addToVm = getAddToVm(),
	    optionData = getOptionData(),
	    mutableMerge = rUtils.mutableMerge,
	    size = rUtils.size,
	    addHovered = utils.addHovered,
	    addHoveredDt = utils.addHoveredDt,
	    addHoveredToParent = utils.addHoveredToParent,
	    directFind = utils.directFind,
	    directFindAll = utils.directFindAll,
	    getNumColumns = utils.getNumColumns,
	    pairAdjacentElements = utils.pairAdjacentElements,
	    removeDt = utils.removeDt,
	    unwrap = utils.unwrap,
	    schemaErrorMessages = {
	  inStyleList: 'Required',
	  inStateList: 'Required',
	  isLaden: 'Required',
	  startsWithUppercase: 'The first letter must be uppercase',
	  lte30: 'Limit 30 characters',
	  lte50: 'Limit 50 characters',
	  lte500: 'Limit 500 characters'
	},
	    sendRequest = getSendRequest(),
	    updateVm = getUpdateVm(),
	    viewDt = $('#view-home');


	var vm = void 0,
	    numColumns = getNumColumns();

	var isOdd = function isOdd(n) {
	  return n % 2;
	},
	    elIsOdd = function elIsOdd(el, idx) {
	  return isOdd(idx);
	},
	    elIsEven = r.complement(elIsOdd);

	var columnsToGetFilterFn = {
	  4: function _(col) {
	    return isOdd(col) ? elIsOdd : elIsEven;
	  },
	  2: function _(col) {
	    return col === 1 ? elIsOdd : elIsEven;
	  },
	  1: function _() {
	    return elIsEven;
	  }
	};

	var shouldTruncateName = function shouldTruncateName(el) {
	  return el.getBoundingClientRect().width > 200;
	};

	var truncateName = function truncateName(el) {
	  var fullNameText = el.textContent;
	  // must recursively remove characters and test width until the string
	  //   reaches a proper truncation length
	  _truncateName(el);

	  // then we need to add the full name into the panel
	  var moreDataDt = directFind($(el).parent().siblings('.panel'), ['.more-data']),
	      fullNameDt = directFind(moreDataDt, ['.full-name']);
	  if (fullNameDt.length) {
	    fullNameDt.text(fullNameText);
	  } else {
	    moreDataDt.prepend($(document.createElement('span')).addClass('full-name').text(fullNameText));
	  }
	};
	var _truncateName = function _truncateName(el) {
	  el.textContent = el.textContent.slice(0, -1);
	  if (!shouldTruncateName(el)) {
	    el.textContent += '...';
	  } else _truncateName(el);
	};

	setBreweryColors();
	initTruncations();

	window.addEventListener('resize', handleWindowResize);

	//------//
	// Main //
	//------//

	var run = function run(vm_) {
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
	  var newBrewery = newBreweryDt[0];
	  addHovered(newBrewery);
	  newBrewery.onclick = function () {
	    var ctx = mutableMerge({
	      title: 'Add A Brewery'
	    }, modalForms.brewery({}));

	    return modal.form.show({
	      ctx: ctx,
	      cbs: {
	        submit: function submit() {
	          var breweryData = formData.get(modal.form.dt),
	              errors = schemas.brewery.validate(schemaErrorMessages, breweryData);

	          if (size(errors)) return handleErrors(modal.form.dt, errors);

	          return modal.form.hide().then(function () {
	            return sendRequest.create('brewery', breweryData);
	          });
	        },
	        cancel: function cancel() {
	          console.log('cancelled new brewery');
	          return modal.form.hide();
	        }
	      }
	    });
	  };
	}

	function handleOptions(option) {
	  var optionDt = $(option);
	  addHoveredDt(optionDt);
	  option.onclick = createOptionOnClick(optionDt);
	}

	function createOptionOnClick(optionDt) {
	  return function () {
	    var action = optionDt.attr('data-action'),
	        itemDt = optionDt.closest('[data-item-id]'),
	        itemParentDt = itemDt.parent(),
	        itemType = itemParentDt.attr('data-items'),
	        data = {
	      id: itemDt.attr('data-item-id'),
	      itemType: itemType,
	      itemDt: itemDt
	    };

	    if (itemType === 'beer') {
	      data.brewery_id = itemParentDt.closest('[data-item-id]').attr('data-item-id');
	    }

	    var option = optionData[action],
	        showArgs = option.getShowArgs(data);

	    option.modal.show(showArgs);
	  };
	}

	function handleItemEl(itemEl) {
	  var itemDt = $(itemEl),
	      itemHeaderDt = itemDt.children('h2, h3'),
	      itemHeader = itemHeaderDt[0];

	  directFind(itemDt, ['.panel', 'ul.options', 'li']).forEach(handleOptions);
	  addHoveredToParent(itemHeader);
	  itemHeader.onclick = createItemOnClick(itemDt);
	}

	function createItemOnClick(itemDt) {
	  return function () {
	    // just return if animating
	    if (itemDt.hasClass('expanding') || itemDt.hasClass('collapsing')) {
	      return;
	    }

	    $('li[data-item-id].last-clicked').removeClass('last-clicked');

	    var action = itemDt.hasClass('collapsed') ? showPanel : hidePanel;

	    action(itemDt);
	  };
	}

	function getOptionData() {
	  return {
	    delete: {
	      modal: modal.dialog,
	      getShowArgs: function getShowArgs(_ref) {
	        var id = _ref.id,
	            brewery_id = _ref.brewery_id,
	            itemType = _ref.itemType,
	            itemDt = _ref.itemDt;

	        var myself = this;

	        var itemData = getItemData({ id: id, brewery_id: brewery_id, itemType: itemType }),
	            content = '<p>Are you sure you want to delete ' + spanItem(itemData.name) + '?</p>',
	            title = 'Delete ' + itemData.name;

	        return {
	          ctx: {
	            title: title,
	            content: content,
	            btns: [{ text: 'You Bet', action: 'delete' }, { text: 'Cancel', action: 'cancel' }]
	          },
	          cbs: {
	            delete: function _delete() {
	              return myself.modal.hide().then(function () {
	                return request.delete[itemType](id);
	              }).catch(function (res) {
	                if (r.path(['response', 'status'], res) !== 404) throw res;
	              }).then(deleteItem.bind(null, itemDt, itemType, id, brewery_id)).catch(handleRequestError(itemData.name, 'deleting'));
	            },
	            cancel: function cancel() {
	              myself.modal.hide();
	            }
	          }
	        };
	      }
	    },
	    edit: {
	      modal: modal.form,
	      getShowArgs: function getShowArgs(_ref2) {
	        var id = _ref2.id,
	            brewery_id = _ref2.brewery_id,
	            itemType = _ref2.itemType,
	            itemDt = _ref2.itemDt;

	        var myself = this,
	            itemData = getItemData({ id: id, brewery_id: brewery_id, itemType: itemType }),
	            ctx = mutableMerge({
	          title: 'Edit ' + itemData.name
	        }, modalForms[itemType](itemData));

	        return {
	          ctx: ctx,
	          cbs: {
	            submit: function submit() {
	              var newData = formData.get(myself.modal.dt);
	              var errors = schemas[itemType].validate(schemaErrorMessages, newData);

	              if (size(errors)) return handleErrors(myself.modal.dt, errors);

	              return myself.modal.hide().then(function () {
	                var oldDataWithFormKeys = r.pick(r.keys(newData), itemData),
	                    changed = !r.equals(newData, oldDataWithFormKeys);

	                if (!changed) return;

	                newData = mutableMerge(newData, { brewery_id: brewery_id });
	                return sendRequest.edit(itemType, newData, itemData.name, brewery_id, id, itemDt);
	              });
	            },
	            cancel: function cancel() {
	              return myself.modal.hide();
	            }
	          }
	        };
	      }
	    },
	    'add-beer': {
	      modal: modal.form,
	      getShowArgs: function getShowArgs(_ref3) {
	        var id = _ref3.id;

	        var brewery_id = id,
	            myself = this,
	            itemData = vm.brewery[brewery_id],
	            title = 'Add A Beer To ' + itemData.name;

	        var getCtx = mutableMerge({ title: title });

	        return {
	          ctx: getCtx(modalForms.beer({})),
	          cbs: {
	            submit: function submit() {
	              var beerData = formData.get(myself.modal.dt),
	                  errors = schemas.beer.validate(schemaErrorMessages, beerData);

	              if (size(errors)) return handleErrors(myself.modal.dt, errors);

	              return myself.modal.hide().then(function () {
	                return sendRequest.create('beer', mutableMerge(beerData, { brewery_id: brewery_id }));
	              });
	            },
	            cancel: function cancel() {
	              return myself.modal.hide();
	            }
	          }
	        };
	      }
	    }
	  };
	}

	function getItemData(_ref4) {
	  var id = _ref4.id,
	      brewery_id = _ref4.brewery_id,
	      itemType = _ref4.itemType;

	  return itemType === 'brewery' ? vm.brewery[id] : vm.brewery[brewery_id].beer[id];
	}

	function showPanel(itemDt) {
	  itemDt.addClass('last-clicked');

	  var collapseIndicator = directFindAll(itemDt)([['h2', '.collapse-indicator'], ['h3', '.collapse-indicator']])[0],
	      panel = itemDt.children('.panel')[0];

	  itemDt.removeClass('collapsed');
	  itemDt.addClass('expanding');
	  panel.style.display = 'block';
	  panel.style['margin-top'] = -panel.clientHeight + 'px';
	  panel.style.display = '';

	  return Promise.all([_showPanel(), rotateIndicator()]);

	  function _showPanel() {
	    return velocity(panel, { 'margin-top': 0 }, {
	      duration: duration.medium,
	      complete: function complete() {
	        itemDt.removeClass('expanding');
	      }
	    });
	  }

	  function rotateIndicator() {
	    return velocity(collapseIndicator, { rotateZ: '90deg' }, { duration: duration.medium });
	  }
	}

	function hidePanel(itemDt) {
	  var collapseIndicator = directFindAll(itemDt)([['h2', '.collapse-indicator'], ['h3', '.collapse-indicator']])[0],
	      panel = itemDt.children('.panel')[0];

	  itemDt.addClass('collapsing');
	  return Promise.all([collapsePanel(), rotateIndicator()]);

	  // scoped helper fxns
	  function collapsePanel() {
	    return velocity(panel, { 'margin-top': -panel.clientHeight + 'px' }, { duration: duration.medium }).then(function () {
	      itemDt.removeClass('collapsing');
	      itemDt.addClass('collapsed');
	    });
	  }
	  function rotateIndicator() {
	    return velocity(collapseIndicator, { rotateZ: 0 }, { duration: duration.medium });
	  }
	}

	function handleErrors(modalDt, errors) {
	  var errorKeys = r.keys(errors),
	      hasError = function hasError(el) {
	    return r.contains(el.getAttribute('data-for'), errorKeys);
	  },
	      allErrorEls = modalDt.find('.error[data-for]'),
	      activeErrorEls = allErrorEls.filter(hasError),
	      inactiveErrorEls = allErrorEls.filter(r.complement(hasError));

	  // set error text to the first error
	  activeErrorEls.forEach(function (el) {
	    return el.innerHTML = errors[el.getAttribute('data-for')][0];
	  });

	  var velocityPromises = activeErrorEls.map(function (el) {
	    return velocity(el, { opacity: 1 }, { duration: duration.small });
	  }).concat(inactiveErrorEls.map(function (el) {
	    return velocity(el, { opacity: 0 }, { duration: duration.small });
	  }));

	  return Promise.all(velocityPromises);
	}

	var itemSelector = {
	  beer: function beer(brewery_id, id) {
	    return 'ul[data-items="brewery"] > li[data-item-id="' + brewery_id + '"] ' + 'ul[data-items="beer"] > li[data-item-id="' + id + '"]';
	  },
	  brewery: function brewery(id) {
	    return 'ul[data-items="brewery"] > li[data-item-id="' + id + '"]';
	  }
	};

	var propCtx = [['h2'], ['h3'], ['.panel', '.more-data']];

	var propSelectors = r.reduce(function (res, cur) {
	  return r.assoc(cur, getPropSelectors(cur), res);
	}, {}, ['beer', 'brewery']);

	function getPropSelectors(itemType) {
	  return r.pipe(r.path([itemType, 'keys']), r.map(function (prop) {
	    return '*[data-prop="' + prop + '"]';
	  }), r.join(', '))(schemas);
	}

	var addToDom = {
	  beer: function beer(beerList, data) {
	    var collection = beerList[0];

	    beerList.append(render('new-beer', data));

	    var newItem = beerList.children().pop(),
	        newItemDt = $(newItem),
	        newHeight = collection.clientHeight;

	    handleItemEl(newItem);
	    var name = directFind(newItemDt, ['h3', '[data-prop="name"]'])[0];
	    if (shouldTruncateName(name)) {
	      truncateName(name);
	    }
	    newItemDt.css('display', 'none');

	    return velocity(collection, { height: newHeight }, { duration: duration.medium }).then(function () {
	      beerList.css('height', 'auto');
	      newItemDt.css({ display: 'block', opacity: 0 });

	      return velocity(newItem, { opacity: 1 }, { duration: duration.small });
	    });
	  },
	  brewery: function brewery(breweryList, data) {
	    breweryList.append(render('new-brewery', data));

	    // from stackoverflow - removes whitespace.  This would be unnecessary if
	    //   I designed the code properly and re-rendered upon a data change
	    breweryList.contents().forEach(function (el) {
	      if (el.nodeType === 3 && !r.trim(el.nodeValue)) {
	        $(el).remove();
	      }
	    });

	    var newItem = breweryList.children().pop(),
	        newItemDt = $(newItem);

	    handleItemEl(newItem);
	    newItemDt.css('opacity', '0');

	    setBreweryColors();

	    var name = directFind(newItemDt, ['h2', '[data-prop="name"]'])[0];
	    if (shouldTruncateName(name)) {
	      truncateName(name);
	    }

	    return Promise.all([velocity(newItem, { opacity: 1 }, { duration: duration.medium }), velocity(newItem, 'scroll', { duration: duration.long })]);
	  }
	};

	function updateDom(itemDt, data, itemType) {
	  r.pipe(directFindAll(itemDt), r.map(function (dt) {
	    return dt.find(propSelectors[itemType]);
	  }), r.forEach(function (dt) {
	    return dt.forEach(updateProp(data));
	  }))(propCtx);

	  var name = directFindAll(itemDt)([['h2', '[data-prop="name"]'], ['h3', '[data-prop="name"]']])[0][0];

	  if (shouldTruncateName(name)) {
	    truncateName(name);
	  } else {
	    directFind(itemDt, ['.panel', '.more-data', '.full-name']).remove();
	  }
	}

	function updateProp(data) {
	  return function (el) {
	    var elDt = $(el),
	        newText = data[elDt.attr('data-prop')];

	    elDt.text(newText);
	  };
	}

	function getAddToVm() {
	  return {
	    beer: function beer(data) {
	      var vmData = r.omit(['id', 'brewery_id'], data);
	      vm.brewery[data.brewery_id].beer[data.id] = vmData;
	      return addToDom.beer(viewDt.find('ul[data-items="brewery"] > li[data-item-id="' + data.brewery_id + '"] ul[data-items="beer"]'), data);
	    },
	    brewery: function brewery(data) {
	      var vmData = r.pipe(r.omit(['id']), r.assoc('beer', {}))(data);

	      vm.brewery[data.id] = vmData;

	      return addToDom.brewery(findColumnToAddBrewery(), data);
	    }
	  };
	}

	function getUpdateVm() {
	  return {
	    beer: function beer(_ref5) {
	      var data = _ref5.data,
	          brewery_id = _ref5.brewery_id,
	          id = _ref5.id;

	      mutableMerge(vm.brewery[brewery_id].beer[id], data);
	      updateDom(viewDt.find(itemSelector.beer(brewery_id, id)), data, 'beer');
	    },
	    brewery: function brewery(_ref6) {
	      var data = _ref6.data,
	          id = _ref6.id;

	      mutableMerge(vm.brewery[id], data);
	      updateDom(viewDt.find(itemSelector.brewery(id)), data, 'brewery');
	    }
	  };
	}

	function getErrorContent(name, methoding) {
	  return '<p>Very sorry, but an error occurred preventing you from ' + methoding + ' ' + name + '.</p>';
	}

	function handleRequestError(name, methoding) {
	  return function (err) {
	    console.error(err);

	    return modal.dialog.show({
	      ctx: {
	        title: 'Error',
	        content: getErrorContent(name, methoding),
	        btns: [{ action: 'ok', text: 'I forgive you' }]
	      },
	      cbs: {
	        ok: function ok() {
	          return modal.dialog.hide();
	        }
	      }
	    });
	  };
	}

	function getSendRequest() {
	  return {
	    edit: function edit(itemType, data, oldName, brewery_id, id, itemDt) {
	      return request.edit[itemType](data, id).then(function (res) {
	        return updateVm[itemType]({
	          data: r.pick(r.keys(data), res.data) // the server provides keys we don't need such as 'id'
	          , brewery_id: brewery_id,
	          id: id
	        });
	      }).catch(function (err) {
	        if (r.path(['response', 'data', 'id'], err) === 'brewery_no_longer_exists') {
	          var _ret = function () {
	            var breweryData = getItemData({ id: brewery_id, itemType: 'brewery' }),
	                breweryDt = viewDt.find('[data-item-id="' + brewery_id + '"]');

	            return {
	              v: modal.dialog.show({
	                ctx: {
	                  title: 'No Longer Exists',
	                  content: '<p>The brewery ' + spanItem(breweryData.name) + ' has been deleted ' + 'by someone else so you are unable to edit its beer.  This ' + 'application doesn\'t support real-time notifications, so a ' + 'page refresh is necessary to see edits made by others.</p><p>' + 'The brewery ' + spanItem(breweryData.name) + ' will now be deleted.</p>',
	                  btns: [{ text: 'Sounds good', action: 'ok' }]
	                },
	                cbs: {
	                  ok: function ok() {
	                    return modal.dialog.hide().then(function () {
	                      return deleteItem(breweryDt, 'brewery', brewery_id);
	                    });
	                  }
	                }
	              })
	            };
	          }();

	          if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
	        } else if (r.path(['response', 'status'], err) === 404) {
	          return modal.dialog.show({
	            ctx: {
	              title: 'No Longer Exists',
	              content: '<p>' + spanItem(oldName) + ' has been deleted by someone else so ' + 'you are unable to edit it.  This application doesn\'t support ' + 'real-time notifications, so a page refresh is necessary to see ' + 'edits made by others.</p><p>' + spanItem(oldName) + ' will now ' + 'be deleted.</p>',
	              btns: [{ text: 'Sounds good', action: 'ok' }]
	            },
	            cbs: {
	              ok: function ok() {
	                return modal.dialog.hide().then(function () {
	                  return deleteItem(itemDt, itemType, id, brewery_id);
	                });
	              }
	            }
	          });
	        } else throw err;
	      }).catch(handleRequestError(oldName || data.name, 'editing'));
	    },
	    create: function create(itemType, data) {
	      return request.create[itemType](data).then(function (res) {
	        return addToVm[itemType](res.data);
	      }).catch(function (err) {
	        if (r.path(['response', 'data', 'id'], err) !== 'brewery_no_longer_exists') throw err;

	        var breweryData = getItemData({ id: data.brewery_id, itemType: 'brewery' }),
	            breweryDt = viewDt.find('[data-item-id="' + data.brewery_id + '"]');

	        return modal.dialog.show({
	          ctx: {
	            title: 'No Longer Exists',
	            content: '<p>The brewery ' + spanItem(breweryData.name) + ' has been deleted ' + 'by someone else so you are unable to add a beer to it.  This ' + 'application doesn\'t support real-time notifications, so a ' + 'page refresh is necessary to see edits made by others.</p><p>' + 'The brewery ' + spanItem(breweryData.name) + ' will now be deleted.</p>',
	            btns: [{ text: 'Sounds good', action: 'ok' }]
	          },
	          cbs: {
	            ok: function ok() {
	              return modal.dialog.hide().then(function () {
	                return deleteItem(breweryDt, 'brewery', data.brewery_id);
	              });
	            }
	          }
	        });
	      }).catch(handleRequestError(data.name, 'creating'));
	    }
	  };
	}

	function getBreweriesPerColumn() {
	  switch (numColumns) {
	    case 4:
	      return $('ul[data-items="brewery"]').map(function (el) {
	        return $(el).children();
	      });
	    case 2:
	      return r.pipe(unwrap, pairAdjacentElements, r.map(r.reduce(function (res, cur) {
	        return r.concat(res, unwrap($(cur).children()));
	      }, [])), r.map($))($('ul[data-items="brewery"]'));
	    case 1:
	      return [$($('ul[data-items="brewery"]').map(function (el) {
	        return unwrap($(el).children());
	      }).reduce(r.concat))];
	  }
	}

	function setBreweryColors() {
	  var getFilterFn = columnsToGetFilterFn[numColumns];

	  getBreweriesPerColumn().forEach(function (breweries, col) {
	    breweries.filter(getFilterFn(col)).filter(':not(.add-one)').removeClass('dark');

	    breweries.filter(r.complement(getFilterFn(col))).filter(':not(.add-one):not(.dark)').addClass('dark');
	  });
	}

	function findColumnToAddBrewery() {
	  var breweries = viewDt.find('ul[data-items="brewery"]'),
	      breweryColumn = findEmptyBreweryColumn(breweries);

	  if (breweryColumn) {
	    return $(breweryColumn);
	  }

	  if (numColumns === 4) {
	    breweryColumn = breweries.map(function (el) {
	      return directFind($(el), ['li']);
	    }).reduce(r.minBy(r.prop('length'))).parent()[0];
	  } else if (numColumns === 2) {
	    breweryColumn = breweries.filter(elIsOdd).map(function (el) {
	      return directFind($(el), ['li']);
	    }).reduce(r.minBy(r.prop('length'))).parent()[0];
	  } else {
	    // numColumns === 1
	    breweryColumn = $(viewDt.find('ul[data-items="brewery"]').pop());
	  }

	  return $(breweryColumn);
	}

	function findEmptyBreweryColumn(breweries) {
	  return breweries.filter(function (el) {
	    return !$(el).children().length;
	  })[0];
	}

	function handleWindowResize() {
	  if (numColumns !== getNumColumns()) {
	    numColumns = getNumColumns();
	    setBreweryColors();
	  }
	}

	function initTruncations() {
	  $('.panel').addClass('show');

	  directFindAll($('li[data-item-id]'))([['h2', '[data-prop="name"]'], ['h3', '[data-prop="name"]']]).map(unwrap).reduce(r.concat, []).filter(shouldTruncateName).forEach(truncateName);

	  $('.panel').removeClass('show');
	}

	function deleteItem(itemDt, itemType, id, brewery_id) {
	  if (itemType === 'brewery') delete vm.brewery[id];else delete vm.brewery[brewery_id].beer[id];
	  return removeDt(itemDt);
	}

	function spanItem(name) {
	  return '<span class="item">' + name + '</span>';
	}

	//---------//
	// Exports //
	//---------//

	module.exports = { run: run };

/***/ },
/* 24 */
/*!*********************************************!*\
  !*** ./src/client/js/services/form-data.js ***!
  \*********************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//---------//
	// Imports //
	//---------//

	var rUtils = __webpack_require__(/*! ../../../../lib/r-utils */ 8);

	//------//
	// Init //
	//------//

	var mutableAssoc = rUtils.mutableAssoc;

	//------//
	// Main //
	//------//

	var exportMe = {
	  get: get
	};

	//-------------//
	// Helper Fxns //
	//-------------//

	function get(ctxDt) {
	  return ctxDt.find('[data-form]').reduce(function (res, _ref) {
	    var id = _ref.id,
	        value = _ref.value;
	    return mutableAssoc(id, value, res);
	  }, {});
	}

	//---------//
	// Exports //
	//---------//

	module.exports = exportMe;

/***/ },
/* 25 */
/*!********************************************!*\
  !*** ./src/client/js/modal-forms/index.js ***!
  \********************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = {
	  beer: __webpack_require__(/*! ./beer */ 26),
	  brewery: __webpack_require__(/*! ./brewery */ 35)
	};

/***/ },
/* 26 */
/*!*******************************************!*\
  !*** ./src/client/js/modal-forms/beer.js ***!
  \*******************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//---------//
	// Imports //
	//---------//

	var styleList = __webpack_require__(/*! ../../../shared/style-list */ 27),
	    helpers = __webpack_require__(/*! ./helpers */ 28);

	//------//
	// Main //
	//------//

	var keyToTpl = {
	  name: 'text',
	  description: 'text-area',
	  style: 'select'
	},
	    keyToValue = ['name', 'description'],
	    keyToList = {
	  style: styleList
	};

	module.exports = function (aBeer, keyToErrors) {
	  return {
	    inputFields: helpers.buildInputFields({
	      keyToTpl: keyToTpl, keyToValue: keyToValue, keyToList: keyToList, keyToErrors: keyToErrors, item: aBeer, type: 'beer'
	    })
	  };
	};

/***/ },
/* 27 */
/*!************************************!*\
  !*** ./src/shared/style-list.json ***!
  \************************************/
/***/ function(module, exports) {

	module.exports = [
		"Ale",
		"Amber",
		"Belgian",
		"Blonde",
		"Bock",
		"Brown",
		"Cream",
		"Golden",
		"Hefeweizen",
		"IPA",
		"Kolsch",
		"Lager",
		"Light",
		"Oktoberfest",
		"Pale Ale",
		"Pilsner",
		"Porter",
		"Rauchbier",
		"Red",
		"Saison",
		"Stout",
		"Witbier"
	];

/***/ },
/* 28 */
/*!**********************************************!*\
  !*** ./src/client/js/modal-forms/helpers.js ***!
  \**********************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//---------//
	// Imports //
	//---------//

	var r = __webpack_require__(/*! ../../../../lib/external/ramda.custom */ 7),
	    rUtils = __webpack_require__(/*! ../../../../lib/r-utils */ 8),
	    schemas = __webpack_require__(/*! ../../../shared/schemas */ 29),
	    startCase = __webpack_require__(/*! lodash.startcase */ 34);

	//------//
	// Init //
	//------//

	var isDefined = rUtils.isDefined,
	    isLaden = rUtils.isLaden,
	    keys = {
	  beer: schemas.beer.keys,
	  brewery: schemas.brewery.keys
	};

	//------//
	// Main //
	//------//

	module.exports = {
	  buildInputFields: function buildInputFields(_ref) {
	    var keyToTpl = _ref.keyToTpl,
	        keyToValue = _ref.keyToValue,
	        keyToList = _ref.keyToList,
	        _ref$keyToLabel = _ref.keyToLabel,
	        keyToLabel = _ref$keyToLabel === undefined ? {} : _ref$keyToLabel,
	        _ref$keyToId = _ref.keyToId,
	        keyToId = _ref$keyToId === undefined ? {} : _ref$keyToId,
	        _ref$keyToErrors = _ref.keyToErrors,
	        keyToErrors = _ref$keyToErrors === undefined ? {} : _ref$keyToErrors,
	        item = _ref.item,
	        type = _ref.type;


	    return r.pipe(r.map(function (key) {
	      return {
	        tpl: 'input-fields/' + keyToTpl[key],
	        value: r.contains(key, keyToValue) ? item[key] : undefined,
	        list: keyToList[key],
	        selected: keyToList[key] && item[key],
	        errors: keyToErrors[key],
	        label: keyToLabel[key] || startCase(key),
	        id: keyToId[key] || key
	      };
	    }), r.map(r.pickBy(isDefined)), r.filter(isLaden))(keys[type]);
	  }
	};

/***/ },
/* 29 */
/*!*************************************!*\
  !*** ./src/shared/schemas/index.js ***!
  \*************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = {
	  beer: __webpack_require__(/*! ./beer */ 30),
	  brewery: __webpack_require__(/*! ./brewery */ 32)
	};

/***/ },
/* 30 */
/*!************************************!*\
  !*** ./src/shared/schemas/beer.js ***!
  \************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//---------//
	// Imports //
	//---------//

	var schema = __webpack_require__(/*! ../schema */ 31),
	    r = __webpack_require__(/*! ../../../lib/external/ramda.custom */ 7),
	    styleList = __webpack_require__(/*! ../style-list */ 27);

	//------//
	// Init //
	//------//

	var _schema$fns = schema.fns,
	    isLaden = _schema$fns.isLaden,
	    startsWithUppercase = _schema$fns.startsWithUppercase,
	    inStyleList = r.contains(r.__, styleList),
	    lte30 = r.pipe(r.length, r.lte(r.__, 30)),
	    lte500 = r.pipe(r.length, r.lte(r.__, 500));


	schema.assignName({ inStyleList: inStyleList, lte30: lte30, lte500: lte500 });

	//------//
	// Main //
	//------//

	var definition = {
	  name: {
	    namedValidationFns: [isLaden, startsWithUppercase, lte30]
	  },
	  style: {
	    namedValidationFns: [inStyleList]
	  },
	  description: {
	    namedValidationFns: [isLaden, startsWithUppercase, lte500]
	  }
	};

	//---------//
	// Exports //
	//---------//

	module.exports = {
	  validate: schema.validate(definition),
	  keys: r.keys(definition)
	};

/***/ },
/* 31 */
/*!******************************!*\
  !*** ./src/shared/schema.js ***!
  \******************************/
/***/ function(module, exports, __webpack_require__) {

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

	var r = __webpack_require__(/*! ../../lib/external/ramda.custom */ 7),
	    rUtils = __webpack_require__(/*! ../../lib/r-utils */ 8);

	//------//
	// Init //
	//------//

	var coerceArray = rUtils.coerceArray,
	    containsAny = rUtils.containsAny,
	    isLaden = rUtils.isLaden,
	    mutableAssoc = rUtils.mutableAssoc,
	    mutableMap = rUtils.mutableMap,
	    size = rUtils.size;

	//------//
	// Main //
	//------//


	var invoke = r.curry(function (str, obj) {
	  return r.invoker(0, str)(obj);
	}),
	    equalsSelfAfter = r.curry(function (fn, obj) {
	  return r.converge(r.identical, [fn, r.identity])(obj);
	}),
	    notEqualsSelfAfter = r.complement(equalsSelfAfter),
	    charIsUppercase = r.both(equalsSelfAfter(invoke('toUpperCase')), notEqualsSelfAfter(invoke('toLowerCase')));

	var assignName = mutableMap(function (fn, name) {
	  return mutableAssoc('_name', name, fn);
	});

	var startsWithUppercase = r.pipe(r.head, charIsUppercase),
	    isString = r.pipe(r.type, r.identical('String'));

	var validate = r.curry(function (schema, errs, obj) {
	  var sKeys = r.keys(schema),
	      requiredKeys = getRequiredKeys(schema),
	      oKeys = r.keys(obj);

	  var extraProps = r.difference(oKeys, sKeys),
	      missingProps = r.difference(requiredKeys, oKeys);

	  var errMsg = '';

	  if (extraProps.length) errMsg += 'The following properties are not in the schema: ' + extraProps.join(', ') + '\n';
	  if (missingProps.length) errMsg += 'The following required properties are missing: ' + missingProps.join(', ') + '\n';
	  if (errMsg) throw new Error(errMsg);

	  return r.pipe(r.reject(isIgnored), r.mapObjIndexed(toFailedValidations(obj)), r.map(toErrorMessageList(errs)), r.filter(size))(schema);
	});

	//-----------//
	// Post-Main //
	//-----------//

	var fns = {
	  isLaden: isLaden,
	  isString: isString,
	  startsWithUppercase: startsWithUppercase
	};

	assignName(fns);

	//-------------//
	// Helper Fxns //
	//-------------//

	function toFailedValidations(obj) {
	  return function (def, prop) {
	    return r.reject(r.apply(r.__, [obj[prop]]), def.namedValidationFns);
	  };
	}

	function toErrorMessageList(errs) {
	  return r.map(function (failedValidationFn) {
	    var name = failedValidationFn._name;
	    return r.propOr(name, name, errs);
	  });
	}

	function isIgnored(val) {
	  return r.contains('ignore', coerceArray(val.flags));
	}

	function getRequiredKeys(schema) {
	  return r.pipe(r.reject(r.pipe(r.prop('flags'), coerceArray, containsAny(['isOptional', 'ignore']))), r.keys)(schema);
	}

	//---------//
	// Exports //
	//---------//

	module.exports = {
	  validate: validate,
	  assignName: assignName,
	  isIgnored: isIgnored,
	  fns: fns
	};

/***/ },
/* 32 */
/*!***************************************!*\
  !*** ./src/shared/schemas/brewery.js ***!
  \***************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//---------//
	// Imports //
	//---------//

	var schema = __webpack_require__(/*! ../schema */ 31),
	    r = __webpack_require__(/*! ../../../lib/external/ramda.custom */ 7),
	    stateList = __webpack_require__(/*! ../state-list */ 33);

	//------//
	// Init //
	//------//

	var _schema$fns = schema.fns,
	    isLaden = _schema$fns.isLaden,
	    startsWithUppercase = _schema$fns.startsWithUppercase,
	    inStateList = r.contains(r.__, stateList),
	    lte30 = r.pipe(r.length, r.lte(r.__, 30)),
	    lte50 = r.pipe(r.length, r.lte(r.__, 50));


	schema.assignName({ inStateList: inStateList, lte30: lte30, lte50: lte50 });

	//------//
	// Main //
	//------//

	var definition = {
	  name: {
	    namedValidationFns: [isLaden, startsWithUppercase, lte30]
	  },
	  state: {
	    namedValidationFns: [inStateList]
	  },
	  city_name: {
	    namedValidationFns: [isLaden, startsWithUppercase, lte50]
	  },
	  beer: { flags: ['ignore'] }
	};

	module.exports = {
	  validate: schema.validate(definition),
	  keys: r.pipe(r.reject(schema.isIgnored), r.keys)(definition)
	};

/***/ },
/* 33 */
/*!************************************!*\
  !*** ./src/shared/state-list.json ***!
  \************************************/
/***/ function(module, exports) {

	module.exports = [
		"AL",
		"AK",
		"AZ",
		"AR",
		"CA",
		"CO",
		"CT",
		"DE",
		"DC",
		"FL",
		"GA",
		"HI",
		"ID",
		"IL",
		"IN",
		"IA",
		"KS",
		"KY",
		"LA",
		"ME",
		"MD",
		"MA",
		"MI",
		"MN",
		"MS",
		"MO",
		"MT",
		"NE",
		"NV",
		"NH",
		"NJ",
		"NM",
		"NY",
		"NC",
		"ND",
		"OH",
		"OK",
		"OR",
		"PA",
		"RI",
		"SC",
		"SD",
		"TN",
		"TX",
		"UT",
		"VT",
		"VA",
		"WA",
		"WV",
		"WI",
		"WY"
	];

/***/ },
/* 34 */
/*!*************************************!*\
  !*** ./~/lodash.startcase/index.js ***!
  \*************************************/
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * lodash (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
	 * Released under MIT license <https://lodash.com/license>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 */

	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0;

	/** `Object#toString` result references. */
	var symbolTag = '[object Symbol]';

	/** Used to match words composed of alphanumeric characters. */
	var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;

	/** Used to match Latin Unicode letters (excluding mathematical operators). */
	var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;

	/** Used to compose unicode character classes. */
	var rsAstralRange = '\\ud800-\\udfff',
	    rsComboMarksRange = '\\u0300-\\u036f\\ufe20-\\ufe23',
	    rsComboSymbolsRange = '\\u20d0-\\u20f0',
	    rsDingbatRange = '\\u2700-\\u27bf',
	    rsLowerRange = 'a-z\\xdf-\\xf6\\xf8-\\xff',
	    rsMathOpRange = '\\xac\\xb1\\xd7\\xf7',
	    rsNonCharRange = '\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf',
	    rsPunctuationRange = '\\u2000-\\u206f',
	    rsSpaceRange = ' \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000',
	    rsUpperRange = 'A-Z\\xc0-\\xd6\\xd8-\\xde',
	    rsVarRange = '\\ufe0e\\ufe0f',
	    rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;

	/** Used to compose unicode capture groups. */
	var rsApos = "['\u2019]",
	    rsAstral = '[' + rsAstralRange + ']',
	    rsBreak = '[' + rsBreakRange + ']',
	    rsCombo = '[' + rsComboMarksRange + rsComboSymbolsRange + ']',
	    rsDigits = '\\d+',
	    rsDingbat = '[' + rsDingbatRange + ']',
	    rsLower = '[' + rsLowerRange + ']',
	    rsMisc = '[^' + rsAstralRange + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + ']',
	    rsFitz = '\\ud83c[\\udffb-\\udfff]',
	    rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
	    rsNonAstral = '[^' + rsAstralRange + ']',
	    rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
	    rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
	    rsUpper = '[' + rsUpperRange + ']',
	    rsZWJ = '\\u200d';

	/** Used to compose unicode regexes. */
	var rsLowerMisc = '(?:' + rsLower + '|' + rsMisc + ')',
	    rsUpperMisc = '(?:' + rsUpper + '|' + rsMisc + ')',
	    rsOptLowerContr = '(?:' + rsApos + '(?:d|ll|m|re|s|t|ve))?',
	    rsOptUpperContr = '(?:' + rsApos + '(?:D|LL|M|RE|S|T|VE))?',
	    reOptMod = rsModifier + '?',
	    rsOptVar = '[' + rsVarRange + ']?',
	    rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
	    rsSeq = rsOptVar + reOptMod + rsOptJoin,
	    rsEmoji = '(?:' + [rsDingbat, rsRegional, rsSurrPair].join('|') + ')' + rsSeq,
	    rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

	/** Used to match apostrophes. */
	var reApos = RegExp(rsApos, 'g');

	/**
	 * Used to match [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks) and
	 * [combining diacritical marks for symbols](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks_for_Symbols).
	 */
	var reComboMark = RegExp(rsCombo, 'g');

	/** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
	var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

	/** Used to match complex or compound words. */
	var reUnicodeWord = RegExp([
	  rsUpper + '?' + rsLower + '+' + rsOptLowerContr + '(?=' + [rsBreak, rsUpper, '$'].join('|') + ')',
	  rsUpperMisc + '+' + rsOptUpperContr + '(?=' + [rsBreak, rsUpper + rsLowerMisc, '$'].join('|') + ')',
	  rsUpper + '?' + rsLowerMisc + '+' + rsOptLowerContr,
	  rsUpper + '+' + rsOptUpperContr,
	  rsDigits,
	  rsEmoji
	].join('|'), 'g');

	/** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
	var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange  + rsComboMarksRange + rsComboSymbolsRange + rsVarRange + ']');

	/** Used to detect strings that need a more robust regexp to match words. */
	var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2,}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;

	/** Used to map Latin Unicode letters to basic Latin letters. */
	var deburredLetters = {
	  // Latin-1 Supplement block.
	  '\xc0': 'A',  '\xc1': 'A', '\xc2': 'A', '\xc3': 'A', '\xc4': 'A', '\xc5': 'A',
	  '\xe0': 'a',  '\xe1': 'a', '\xe2': 'a', '\xe3': 'a', '\xe4': 'a', '\xe5': 'a',
	  '\xc7': 'C',  '\xe7': 'c',
	  '\xd0': 'D',  '\xf0': 'd',
	  '\xc8': 'E',  '\xc9': 'E', '\xca': 'E', '\xcb': 'E',
	  '\xe8': 'e',  '\xe9': 'e', '\xea': 'e', '\xeb': 'e',
	  '\xcc': 'I',  '\xcd': 'I', '\xce': 'I', '\xcf': 'I',
	  '\xec': 'i',  '\xed': 'i', '\xee': 'i', '\xef': 'i',
	  '\xd1': 'N',  '\xf1': 'n',
	  '\xd2': 'O',  '\xd3': 'O', '\xd4': 'O', '\xd5': 'O', '\xd6': 'O', '\xd8': 'O',
	  '\xf2': 'o',  '\xf3': 'o', '\xf4': 'o', '\xf5': 'o', '\xf6': 'o', '\xf8': 'o',
	  '\xd9': 'U',  '\xda': 'U', '\xdb': 'U', '\xdc': 'U',
	  '\xf9': 'u',  '\xfa': 'u', '\xfb': 'u', '\xfc': 'u',
	  '\xdd': 'Y',  '\xfd': 'y', '\xff': 'y',
	  '\xc6': 'Ae', '\xe6': 'ae',
	  '\xde': 'Th', '\xfe': 'th',
	  '\xdf': 'ss',
	  // Latin Extended-A block.
	  '\u0100': 'A',  '\u0102': 'A', '\u0104': 'A',
	  '\u0101': 'a',  '\u0103': 'a', '\u0105': 'a',
	  '\u0106': 'C',  '\u0108': 'C', '\u010a': 'C', '\u010c': 'C',
	  '\u0107': 'c',  '\u0109': 'c', '\u010b': 'c', '\u010d': 'c',
	  '\u010e': 'D',  '\u0110': 'D', '\u010f': 'd', '\u0111': 'd',
	  '\u0112': 'E',  '\u0114': 'E', '\u0116': 'E', '\u0118': 'E', '\u011a': 'E',
	  '\u0113': 'e',  '\u0115': 'e', '\u0117': 'e', '\u0119': 'e', '\u011b': 'e',
	  '\u011c': 'G',  '\u011e': 'G', '\u0120': 'G', '\u0122': 'G',
	  '\u011d': 'g',  '\u011f': 'g', '\u0121': 'g', '\u0123': 'g',
	  '\u0124': 'H',  '\u0126': 'H', '\u0125': 'h', '\u0127': 'h',
	  '\u0128': 'I',  '\u012a': 'I', '\u012c': 'I', '\u012e': 'I', '\u0130': 'I',
	  '\u0129': 'i',  '\u012b': 'i', '\u012d': 'i', '\u012f': 'i', '\u0131': 'i',
	  '\u0134': 'J',  '\u0135': 'j',
	  '\u0136': 'K',  '\u0137': 'k', '\u0138': 'k',
	  '\u0139': 'L',  '\u013b': 'L', '\u013d': 'L', '\u013f': 'L', '\u0141': 'L',
	  '\u013a': 'l',  '\u013c': 'l', '\u013e': 'l', '\u0140': 'l', '\u0142': 'l',
	  '\u0143': 'N',  '\u0145': 'N', '\u0147': 'N', '\u014a': 'N',
	  '\u0144': 'n',  '\u0146': 'n', '\u0148': 'n', '\u014b': 'n',
	  '\u014c': 'O',  '\u014e': 'O', '\u0150': 'O',
	  '\u014d': 'o',  '\u014f': 'o', '\u0151': 'o',
	  '\u0154': 'R',  '\u0156': 'R', '\u0158': 'R',
	  '\u0155': 'r',  '\u0157': 'r', '\u0159': 'r',
	  '\u015a': 'S',  '\u015c': 'S', '\u015e': 'S', '\u0160': 'S',
	  '\u015b': 's',  '\u015d': 's', '\u015f': 's', '\u0161': 's',
	  '\u0162': 'T',  '\u0164': 'T', '\u0166': 'T',
	  '\u0163': 't',  '\u0165': 't', '\u0167': 't',
	  '\u0168': 'U',  '\u016a': 'U', '\u016c': 'U', '\u016e': 'U', '\u0170': 'U', '\u0172': 'U',
	  '\u0169': 'u',  '\u016b': 'u', '\u016d': 'u', '\u016f': 'u', '\u0171': 'u', '\u0173': 'u',
	  '\u0174': 'W',  '\u0175': 'w',
	  '\u0176': 'Y',  '\u0177': 'y', '\u0178': 'Y',
	  '\u0179': 'Z',  '\u017b': 'Z', '\u017d': 'Z',
	  '\u017a': 'z',  '\u017c': 'z', '\u017e': 'z',
	  '\u0132': 'IJ', '\u0133': 'ij',
	  '\u0152': 'Oe', '\u0153': 'oe',
	  '\u0149': "'n", '\u017f': 'ss'
	};

	/** Detect free variable `global` from Node.js. */
	var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || Function('return this')();

	/**
	 * A specialized version of `_.reduce` for arrays without support for
	 * iteratee shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {*} [accumulator] The initial value.
	 * @param {boolean} [initAccum] Specify using the first element of `array` as
	 *  the initial value.
	 * @returns {*} Returns the accumulated value.
	 */
	function arrayReduce(array, iteratee, accumulator, initAccum) {
	  var index = -1,
	      length = array ? array.length : 0;

	  if (initAccum && length) {
	    accumulator = array[++index];
	  }
	  while (++index < length) {
	    accumulator = iteratee(accumulator, array[index], index, array);
	  }
	  return accumulator;
	}

	/**
	 * Converts an ASCII `string` to an array.
	 *
	 * @private
	 * @param {string} string The string to convert.
	 * @returns {Array} Returns the converted array.
	 */
	function asciiToArray(string) {
	  return string.split('');
	}

	/**
	 * Splits an ASCII `string` into an array of its words.
	 *
	 * @private
	 * @param {string} The string to inspect.
	 * @returns {Array} Returns the words of `string`.
	 */
	function asciiWords(string) {
	  return string.match(reAsciiWord) || [];
	}

	/**
	 * The base implementation of `_.propertyOf` without support for deep paths.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Function} Returns the new accessor function.
	 */
	function basePropertyOf(object) {
	  return function(key) {
	    return object == null ? undefined : object[key];
	  };
	}

	/**
	 * Used by `_.deburr` to convert Latin-1 Supplement and Latin Extended-A
	 * letters to basic Latin letters.
	 *
	 * @private
	 * @param {string} letter The matched letter to deburr.
	 * @returns {string} Returns the deburred letter.
	 */
	var deburrLetter = basePropertyOf(deburredLetters);

	/**
	 * Checks if `string` contains Unicode symbols.
	 *
	 * @private
	 * @param {string} string The string to inspect.
	 * @returns {boolean} Returns `true` if a symbol is found, else `false`.
	 */
	function hasUnicode(string) {
	  return reHasUnicode.test(string);
	}

	/**
	 * Checks if `string` contains a word composed of Unicode symbols.
	 *
	 * @private
	 * @param {string} string The string to inspect.
	 * @returns {boolean} Returns `true` if a word is found, else `false`.
	 */
	function hasUnicodeWord(string) {
	  return reHasUnicodeWord.test(string);
	}

	/**
	 * Converts `string` to an array.
	 *
	 * @private
	 * @param {string} string The string to convert.
	 * @returns {Array} Returns the converted array.
	 */
	function stringToArray(string) {
	  return hasUnicode(string)
	    ? unicodeToArray(string)
	    : asciiToArray(string);
	}

	/**
	 * Converts a Unicode `string` to an array.
	 *
	 * @private
	 * @param {string} string The string to convert.
	 * @returns {Array} Returns the converted array.
	 */
	function unicodeToArray(string) {
	  return string.match(reUnicode) || [];
	}

	/**
	 * Splits a Unicode `string` into an array of its words.
	 *
	 * @private
	 * @param {string} The string to inspect.
	 * @returns {Array} Returns the words of `string`.
	 */
	function unicodeWords(string) {
	  return string.match(reUnicodeWord) || [];
	}

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/** Built-in value references. */
	var Symbol = root.Symbol;

	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : undefined,
	    symbolToString = symbolProto ? symbolProto.toString : undefined;

	/**
	 * The base implementation of `_.slice` without an iteratee call guard.
	 *
	 * @private
	 * @param {Array} array The array to slice.
	 * @param {number} [start=0] The start position.
	 * @param {number} [end=array.length] The end position.
	 * @returns {Array} Returns the slice of `array`.
	 */
	function baseSlice(array, start, end) {
	  var index = -1,
	      length = array.length;

	  if (start < 0) {
	    start = -start > length ? 0 : (length + start);
	  }
	  end = end > length ? length : end;
	  if (end < 0) {
	    end += length;
	  }
	  length = start > end ? 0 : ((end - start) >>> 0);
	  start >>>= 0;

	  var result = Array(length);
	  while (++index < length) {
	    result[index] = array[index + start];
	  }
	  return result;
	}

	/**
	 * The base implementation of `_.toString` which doesn't convert nullish
	 * values to empty strings.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 */
	function baseToString(value) {
	  // Exit early for strings to avoid a performance hit in some environments.
	  if (typeof value == 'string') {
	    return value;
	  }
	  if (isSymbol(value)) {
	    return symbolToString ? symbolToString.call(value) : '';
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
	}

	/**
	 * Casts `array` to a slice if it's needed.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {number} start The start position.
	 * @param {number} [end=array.length] The end position.
	 * @returns {Array} Returns the cast slice.
	 */
	function castSlice(array, start, end) {
	  var length = array.length;
	  end = end === undefined ? length : end;
	  return (!start && end >= length) ? array : baseSlice(array, start, end);
	}

	/**
	 * Creates a function like `_.lowerFirst`.
	 *
	 * @private
	 * @param {string} methodName The name of the `String` case method to use.
	 * @returns {Function} Returns the new case function.
	 */
	function createCaseFirst(methodName) {
	  return function(string) {
	    string = toString(string);

	    var strSymbols = hasUnicode(string)
	      ? stringToArray(string)
	      : undefined;

	    var chr = strSymbols
	      ? strSymbols[0]
	      : string.charAt(0);

	    var trailing = strSymbols
	      ? castSlice(strSymbols, 1).join('')
	      : string.slice(1);

	    return chr[methodName]() + trailing;
	  };
	}

	/**
	 * Creates a function like `_.camelCase`.
	 *
	 * @private
	 * @param {Function} callback The function to combine each word.
	 * @returns {Function} Returns the new compounder function.
	 */
	function createCompounder(callback) {
	  return function(string) {
	    return arrayReduce(words(deburr(string).replace(reApos, '')), callback, '');
	  };
	}

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}

	/**
	 * Checks if `value` is classified as a `Symbol` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
	 * @example
	 *
	 * _.isSymbol(Symbol.iterator);
	 * // => true
	 *
	 * _.isSymbol('abc');
	 * // => false
	 */
	function isSymbol(value) {
	  return typeof value == 'symbol' ||
	    (isObjectLike(value) && objectToString.call(value) == symbolTag);
	}

	/**
	 * Converts `value` to a string. An empty string is returned for `null`
	 * and `undefined` values. The sign of `-0` is preserved.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 * @example
	 *
	 * _.toString(null);
	 * // => ''
	 *
	 * _.toString(-0);
	 * // => '-0'
	 *
	 * _.toString([1, 2, 3]);
	 * // => '1,2,3'
	 */
	function toString(value) {
	  return value == null ? '' : baseToString(value);
	}

	/**
	 * Deburrs `string` by converting
	 * [Latin-1 Supplement](https://en.wikipedia.org/wiki/Latin-1_Supplement_(Unicode_block)#Character_table)
	 * and [Latin Extended-A](https://en.wikipedia.org/wiki/Latin_Extended-A)
	 * letters to basic Latin letters and removing
	 * [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks).
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category String
	 * @param {string} [string=''] The string to deburr.
	 * @returns {string} Returns the deburred string.
	 * @example
	 *
	 * _.deburr('déjà vu');
	 * // => 'deja vu'
	 */
	function deburr(string) {
	  string = toString(string);
	  return string && string.replace(reLatin, deburrLetter).replace(reComboMark, '');
	}

	/**
	 * Converts `string` to
	 * [start case](https://en.wikipedia.org/wiki/Letter_case#Stylistic_or_specialised_usage).
	 *
	 * @static
	 * @memberOf _
	 * @since 3.1.0
	 * @category String
	 * @param {string} [string=''] The string to convert.
	 * @returns {string} Returns the start cased string.
	 * @example
	 *
	 * _.startCase('--foo-bar--');
	 * // => 'Foo Bar'
	 *
	 * _.startCase('fooBar');
	 * // => 'Foo Bar'
	 *
	 * _.startCase('__FOO_BAR__');
	 * // => 'FOO BAR'
	 */
	var startCase = createCompounder(function(result, word, index) {
	  return result + (index ? ' ' : '') + upperFirst(word);
	});

	/**
	 * Converts the first character of `string` to upper case.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category String
	 * @param {string} [string=''] The string to convert.
	 * @returns {string} Returns the converted string.
	 * @example
	 *
	 * _.upperFirst('fred');
	 * // => 'Fred'
	 *
	 * _.upperFirst('FRED');
	 * // => 'FRED'
	 */
	var upperFirst = createCaseFirst('toUpperCase');

	/**
	 * Splits `string` into an array of its words.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category String
	 * @param {string} [string=''] The string to inspect.
	 * @param {RegExp|string} [pattern] The pattern to match words.
	 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
	 * @returns {Array} Returns the words of `string`.
	 * @example
	 *
	 * _.words('fred, barney, & pebbles');
	 * // => ['fred', 'barney', 'pebbles']
	 *
	 * _.words('fred, barney, & pebbles', /[^, ]+/g);
	 * // => ['fred', 'barney', '&', 'pebbles']
	 */
	function words(string, pattern, guard) {
	  string = toString(string);
	  pattern = guard ? undefined : pattern;

	  if (pattern === undefined) {
	    return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
	  }
	  return string.match(pattern) || [];
	}

	module.exports = startCase;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 35 */
/*!**********************************************!*\
  !*** ./src/client/js/modal-forms/brewery.js ***!
  \**********************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//---------//
	// Imports //
	//---------//

	var stateList = __webpack_require__(/*! ../../../shared/state-list */ 33),
	    helpers = __webpack_require__(/*! ./helpers */ 28);

	//------//
	// Main //
	//------//

	var keyToTpl = {
	  city_name: 'text',
	  name: 'text',
	  state: 'select'
	},
	    keyToValue = ['city_name', 'name'],
	    keyToList = {
	  state: stateList
	};

	module.exports = function (aBrewery, keyToErrors) {
	  return {
	    inputFields: helpers.buildInputFields({
	      keyToTpl: keyToTpl, keyToValue: keyToValue, keyToList: keyToList, keyToErrors: keyToErrors, item: aBrewery, type: 'brewery'
	    })
	  };
	};

/***/ },
/* 36 */
/*!*******************************************!*\
  !*** ./src/client/js/services/request.js ***!
  \*******************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//---------//
	// Imports //
	//---------//

	var axios = __webpack_require__(/*! axios */ 37),
	    r = __webpack_require__(/*! ../../../../lib/external/ramda.custom */ 7),
	    rUtils = __webpack_require__(/*! ../../../../lib/r-utils */ 8);

	//------//
	// Init //
	//------//

	var items = ['beer', 'brewery'],
	    axiosInst = axios.create({
	  baseURL: window.location.origin + '/api/'
	}),
	    itemMethods = getItemMethods(),
	    transform = rUtils.transform;

	//------//
	// Main //
	//------//

	var exportMe = createBeerAndBreweryMethods(items);

	//-------------//
	// Helper Fxns //
	//-------------//

	function getItemMethods() {
	  return {
	    delete: r.curry(function (itemType, id) {
	      return axiosInst.delete(itemType, { params: { id: id } });
	    }),
	    edit: r.curry(function (itemType, data, id) {
	      return axiosInst({
	        method: 'post',
	        url: itemType,
	        params: { id: id },
	        data: data
	      });
	    }),
	    create: r.curry(function (itemType, data) {
	      return axiosInst.post(itemType, data);
	    })
	  };
	}

	function createBeerAndBreweryMethods(items) {
	  return r.map(function (anItemMethod) {
	    return transform(function (res, cur) {
	      return res[cur] = anItemMethod(cur);
	    }, {}, items);
	  }, itemMethods);
	}

	//---------//
	// Exports //
	//---------//

	module.exports = exportMe;

/***/ },
/* 37 */
/*!**************************!*\
  !*** ./~/axios/index.js ***!
  \**************************/
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(/*! ./lib/axios */ 38);

/***/ },
/* 38 */
/*!******************************!*\
  !*** ./~/axios/lib/axios.js ***!
  \******************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(/*! ./utils */ 39);
	var bind = __webpack_require__(/*! ./helpers/bind */ 40);
	var Axios = __webpack_require__(/*! ./core/Axios */ 41);

	/**
	 * Create an instance of Axios
	 *
	 * @param {Object} defaultConfig The default config for the instance
	 * @return {Axios} A new instance of Axios
	 */
	function createInstance(defaultConfig) {
	  var context = new Axios(defaultConfig);
	  var instance = bind(Axios.prototype.request, context);

	  // Copy axios.prototype to instance
	  utils.extend(instance, Axios.prototype, context);

	  // Copy context to instance
	  utils.extend(instance, context);

	  return instance;
	}

	// Create the default instance to be exported
	var axios = createInstance();

	// Expose Axios class to allow class inheritance
	axios.Axios = Axios;

	// Factory for creating new instances
	axios.create = function create(defaultConfig) {
	  return createInstance(defaultConfig);
	};

	// Expose all/spread
	axios.all = function all(promises) {
	  return Promise.all(promises);
	};
	axios.spread = __webpack_require__(/*! ./helpers/spread */ 58);

	module.exports = axios;

	// Allow use of default import syntax in TypeScript
	module.exports.default = axios;


/***/ },
/* 39 */
/*!******************************!*\
  !*** ./~/axios/lib/utils.js ***!
  \******************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bind = __webpack_require__(/*! ./helpers/bind */ 40);

	/*global toString:true*/

	// utils is a library of generic helper functions non-specific to axios

	var toString = Object.prototype.toString;

	/**
	 * Determine if a value is an Array
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an Array, otherwise false
	 */
	function isArray(val) {
	  return toString.call(val) === '[object Array]';
	}

	/**
	 * Determine if a value is an ArrayBuffer
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
	 */
	function isArrayBuffer(val) {
	  return toString.call(val) === '[object ArrayBuffer]';
	}

	/**
	 * Determine if a value is a FormData
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an FormData, otherwise false
	 */
	function isFormData(val) {
	  return (typeof FormData !== 'undefined') && (val instanceof FormData);
	}

	/**
	 * Determine if a value is a view on an ArrayBuffer
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
	 */
	function isArrayBufferView(val) {
	  var result;
	  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
	    result = ArrayBuffer.isView(val);
	  } else {
	    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
	  }
	  return result;
	}

	/**
	 * Determine if a value is a String
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a String, otherwise false
	 */
	function isString(val) {
	  return typeof val === 'string';
	}

	/**
	 * Determine if a value is a Number
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Number, otherwise false
	 */
	function isNumber(val) {
	  return typeof val === 'number';
	}

	/**
	 * Determine if a value is undefined
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if the value is undefined, otherwise false
	 */
	function isUndefined(val) {
	  return typeof val === 'undefined';
	}

	/**
	 * Determine if a value is an Object
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an Object, otherwise false
	 */
	function isObject(val) {
	  return val !== null && typeof val === 'object';
	}

	/**
	 * Determine if a value is a Date
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Date, otherwise false
	 */
	function isDate(val) {
	  return toString.call(val) === '[object Date]';
	}

	/**
	 * Determine if a value is a File
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a File, otherwise false
	 */
	function isFile(val) {
	  return toString.call(val) === '[object File]';
	}

	/**
	 * Determine if a value is a Blob
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Blob, otherwise false
	 */
	function isBlob(val) {
	  return toString.call(val) === '[object Blob]';
	}

	/**
	 * Determine if a value is a Function
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Function, otherwise false
	 */
	function isFunction(val) {
	  return toString.call(val) === '[object Function]';
	}

	/**
	 * Determine if a value is a Stream
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Stream, otherwise false
	 */
	function isStream(val) {
	  return isObject(val) && isFunction(val.pipe);
	}

	/**
	 * Determine if a value is a URLSearchParams object
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
	 */
	function isURLSearchParams(val) {
	  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
	}

	/**
	 * Trim excess whitespace off the beginning and end of a string
	 *
	 * @param {String} str The String to trim
	 * @returns {String} The String freed of excess whitespace
	 */
	function trim(str) {
	  return str.replace(/^\s*/, '').replace(/\s*$/, '');
	}

	/**
	 * Determine if we're running in a standard browser environment
	 *
	 * This allows axios to run in a web worker, and react-native.
	 * Both environments support XMLHttpRequest, but not fully standard globals.
	 *
	 * web workers:
	 *  typeof window -> undefined
	 *  typeof document -> undefined
	 *
	 * react-native:
	 *  typeof document.createElement -> undefined
	 */
	function isStandardBrowserEnv() {
	  return (
	    typeof window !== 'undefined' &&
	    typeof document !== 'undefined' &&
	    typeof document.createElement === 'function'
	  );
	}

	/**
	 * Iterate over an Array or an Object invoking a function for each item.
	 *
	 * If `obj` is an Array callback will be called passing
	 * the value, index, and complete array for each item.
	 *
	 * If 'obj' is an Object callback will be called passing
	 * the value, key, and complete object for each property.
	 *
	 * @param {Object|Array} obj The object to iterate
	 * @param {Function} fn The callback to invoke for each item
	 */
	function forEach(obj, fn) {
	  // Don't bother if no value provided
	  if (obj === null || typeof obj === 'undefined') {
	    return;
	  }

	  // Force an array if not already something iterable
	  if (typeof obj !== 'object' && !isArray(obj)) {
	    /*eslint no-param-reassign:0*/
	    obj = [obj];
	  }

	  if (isArray(obj)) {
	    // Iterate over array values
	    for (var i = 0, l = obj.length; i < l; i++) {
	      fn.call(null, obj[i], i, obj);
	    }
	  } else {
	    // Iterate over object keys
	    for (var key in obj) {
	      if (obj.hasOwnProperty(key)) {
	        fn.call(null, obj[key], key, obj);
	      }
	    }
	  }
	}

	/**
	 * Accepts varargs expecting each argument to be an object, then
	 * immutably merges the properties of each object and returns result.
	 *
	 * When multiple objects contain the same key the later object in
	 * the arguments list will take precedence.
	 *
	 * Example:
	 *
	 * ```js
	 * var result = merge({foo: 123}, {foo: 456});
	 * console.log(result.foo); // outputs 456
	 * ```
	 *
	 * @param {Object} obj1 Object to merge
	 * @returns {Object} Result of all merge properties
	 */
	function merge(/* obj1, obj2, obj3, ... */) {
	  var result = {};
	  function assignValue(val, key) {
	    if (typeof result[key] === 'object' && typeof val === 'object') {
	      result[key] = merge(result[key], val);
	    } else {
	      result[key] = val;
	    }
	  }

	  for (var i = 0, l = arguments.length; i < l; i++) {
	    forEach(arguments[i], assignValue);
	  }
	  return result;
	}

	/**
	 * Extends object a by mutably adding to it the properties of object b.
	 *
	 * @param {Object} a The object to be extended
	 * @param {Object} b The object to copy properties from
	 * @param {Object} thisArg The object to bind function to
	 * @return {Object} The resulting value of object a
	 */
	function extend(a, b, thisArg) {
	  forEach(b, function assignValue(val, key) {
	    if (thisArg && typeof val === 'function') {
	      a[key] = bind(val, thisArg);
	    } else {
	      a[key] = val;
	    }
	  });
	  return a;
	}

	module.exports = {
	  isArray: isArray,
	  isArrayBuffer: isArrayBuffer,
	  isFormData: isFormData,
	  isArrayBufferView: isArrayBufferView,
	  isString: isString,
	  isNumber: isNumber,
	  isObject: isObject,
	  isUndefined: isUndefined,
	  isDate: isDate,
	  isFile: isFile,
	  isBlob: isBlob,
	  isFunction: isFunction,
	  isStream: isStream,
	  isURLSearchParams: isURLSearchParams,
	  isStandardBrowserEnv: isStandardBrowserEnv,
	  forEach: forEach,
	  merge: merge,
	  extend: extend,
	  trim: trim
	};


/***/ },
/* 40 */
/*!*************************************!*\
  !*** ./~/axios/lib/helpers/bind.js ***!
  \*************************************/
/***/ function(module, exports) {

	'use strict';

	module.exports = function bind(fn, thisArg) {
	  return function wrap() {
	    var args = new Array(arguments.length);
	    for (var i = 0; i < args.length; i++) {
	      args[i] = arguments[i];
	    }
	    return fn.apply(thisArg, args);
	  };
	};


/***/ },
/* 41 */
/*!***********************************!*\
  !*** ./~/axios/lib/core/Axios.js ***!
  \***********************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var defaults = __webpack_require__(/*! ./../defaults */ 42);
	var utils = __webpack_require__(/*! ./../utils */ 39);
	var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ 44);
	var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ 45);
	var isAbsoluteURL = __webpack_require__(/*! ./../helpers/isAbsoluteURL */ 56);
	var combineURLs = __webpack_require__(/*! ./../helpers/combineURLs */ 57);

	/**
	 * Create a new instance of Axios
	 *
	 * @param {Object} defaultConfig The default config for the instance
	 */
	function Axios(defaultConfig) {
	  this.defaults = utils.merge(defaults, defaultConfig);
	  this.interceptors = {
	    request: new InterceptorManager(),
	    response: new InterceptorManager()
	  };
	}

	/**
	 * Dispatch a request
	 *
	 * @param {Object} config The config specific for this request (merged with this.defaults)
	 */
	Axios.prototype.request = function request(config) {
	  /*eslint no-param-reassign:0*/
	  // Allow for axios('example/url'[, config]) a la fetch API
	  if (typeof config === 'string') {
	    config = utils.merge({
	      url: arguments[0]
	    }, arguments[1]);
	  }

	  config = utils.merge(defaults, this.defaults, { method: 'get' }, config);

	  // Support baseURL config
	  if (config.baseURL && !isAbsoluteURL(config.url)) {
	    config.url = combineURLs(config.baseURL, config.url);
	  }

	  // Hook up interceptors middleware
	  var chain = [dispatchRequest, undefined];
	  var promise = Promise.resolve(config);

	  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
	    chain.unshift(interceptor.fulfilled, interceptor.rejected);
	  });

	  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
	    chain.push(interceptor.fulfilled, interceptor.rejected);
	  });

	  while (chain.length) {
	    promise = promise.then(chain.shift(), chain.shift());
	  }

	  return promise;
	};

	// Provide aliases for supported request methods
	utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
	  /*eslint func-names:0*/
	  Axios.prototype[method] = function(url, config) {
	    return this.request(utils.merge(config || {}, {
	      method: method,
	      url: url
	    }));
	  };
	});

	utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
	  /*eslint func-names:0*/
	  Axios.prototype[method] = function(url, data, config) {
	    return this.request(utils.merge(config || {}, {
	      method: method,
	      url: url,
	      data: data
	    }));
	  };
	});

	module.exports = Axios;


/***/ },
/* 42 */
/*!*********************************!*\
  !*** ./~/axios/lib/defaults.js ***!
  \*********************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(/*! ./utils */ 39);
	var normalizeHeaderName = __webpack_require__(/*! ./helpers/normalizeHeaderName */ 43);

	var PROTECTION_PREFIX = /^\)\]\}',?\n/;
	var DEFAULT_CONTENT_TYPE = {
	  'Content-Type': 'application/x-www-form-urlencoded'
	};

	function setContentTypeIfUnset(headers, value) {
	  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
	    headers['Content-Type'] = value;
	  }
	}

	module.exports = {
	  transformRequest: [function transformRequest(data, headers) {
	    normalizeHeaderName(headers, 'Content-Type');
	    if (utils.isFormData(data) ||
	      utils.isArrayBuffer(data) ||
	      utils.isStream(data) ||
	      utils.isFile(data) ||
	      utils.isBlob(data)
	    ) {
	      return data;
	    }
	    if (utils.isArrayBufferView(data)) {
	      return data.buffer;
	    }
	    if (utils.isURLSearchParams(data)) {
	      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
	      return data.toString();
	    }
	    if (utils.isObject(data)) {
	      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
	      return JSON.stringify(data);
	    }
	    return data;
	  }],

	  transformResponse: [function transformResponse(data) {
	    /*eslint no-param-reassign:0*/
	    if (typeof data === 'string') {
	      data = data.replace(PROTECTION_PREFIX, '');
	      try {
	        data = JSON.parse(data);
	      } catch (e) { /* Ignore */ }
	    }
	    return data;
	  }],

	  headers: {
	    common: {
	      'Accept': 'application/json, text/plain, */*'
	    },
	    patch: utils.merge(DEFAULT_CONTENT_TYPE),
	    post: utils.merge(DEFAULT_CONTENT_TYPE),
	    put: utils.merge(DEFAULT_CONTENT_TYPE)
	  },

	  timeout: 0,

	  xsrfCookieName: 'XSRF-TOKEN',
	  xsrfHeaderName: 'X-XSRF-TOKEN',

	  maxContentLength: -1,

	  validateStatus: function validateStatus(status) {
	    return status >= 200 && status < 300;
	  }
	};


/***/ },
/* 43 */
/*!****************************************************!*\
  !*** ./~/axios/lib/helpers/normalizeHeaderName.js ***!
  \****************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(/*! ../utils */ 39);

	module.exports = function normalizeHeaderName(headers, normalizedName) {
	  utils.forEach(headers, function processHeader(value, name) {
	    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
	      headers[normalizedName] = value;
	      delete headers[name];
	    }
	  });
	};


/***/ },
/* 44 */
/*!************************************************!*\
  !*** ./~/axios/lib/core/InterceptorManager.js ***!
  \************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(/*! ./../utils */ 39);

	function InterceptorManager() {
	  this.handlers = [];
	}

	/**
	 * Add a new interceptor to the stack
	 *
	 * @param {Function} fulfilled The function to handle `then` for a `Promise`
	 * @param {Function} rejected The function to handle `reject` for a `Promise`
	 *
	 * @return {Number} An ID used to remove interceptor later
	 */
	InterceptorManager.prototype.use = function use(fulfilled, rejected) {
	  this.handlers.push({
	    fulfilled: fulfilled,
	    rejected: rejected
	  });
	  return this.handlers.length - 1;
	};

	/**
	 * Remove an interceptor from the stack
	 *
	 * @param {Number} id The ID that was returned by `use`
	 */
	InterceptorManager.prototype.eject = function eject(id) {
	  if (this.handlers[id]) {
	    this.handlers[id] = null;
	  }
	};

	/**
	 * Iterate over all the registered interceptors
	 *
	 * This method is particularly useful for skipping over any
	 * interceptors that may have become `null` calling `eject`.
	 *
	 * @param {Function} fn The function to call for each interceptor
	 */
	InterceptorManager.prototype.forEach = function forEach(fn) {
	  utils.forEach(this.handlers, function forEachHandler(h) {
	    if (h !== null) {
	      fn(h);
	    }
	  });
	};

	module.exports = InterceptorManager;


/***/ },
/* 45 */
/*!*********************************************!*\
  !*** ./~/axios/lib/core/dispatchRequest.js ***!
  \*********************************************/
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	var utils = __webpack_require__(/*! ./../utils */ 39);
	var transformData = __webpack_require__(/*! ./transformData */ 46);

	/**
	 * Dispatch a request to the server using whichever adapter
	 * is supported by the current environment.
	 *
	 * @param {object} config The config that is to be used for the request
	 * @returns {Promise} The Promise to be fulfilled
	 */
	module.exports = function dispatchRequest(config) {
	  // Ensure headers exist
	  config.headers = config.headers || {};

	  // Transform request data
	  config.data = transformData(
	    config.data,
	    config.headers,
	    config.transformRequest
	  );

	  // Flatten headers
	  config.headers = utils.merge(
	    config.headers.common || {},
	    config.headers[config.method] || {},
	    config.headers || {}
	  );

	  utils.forEach(
	    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
	    function cleanHeaderConfig(method) {
	      delete config.headers[method];
	    }
	  );

	  var adapter;

	  if (typeof config.adapter === 'function') {
	    // For custom adapter support
	    adapter = config.adapter;
	  } else if (typeof XMLHttpRequest !== 'undefined') {
	    // For browsers use XHR adapter
	    adapter = __webpack_require__(/*! ../adapters/xhr */ 47);
	  } else if (typeof process !== 'undefined') {
	    // For node use HTTP adapter
	    adapter = __webpack_require__(/*! ../adapters/http */ 47);
	  }

	  return Promise.resolve(config)
	    // Wrap synchronous adapter errors and pass configuration
	    .then(adapter)
	    .then(function onFulfilled(response) {
	      // Transform response data
	      response.data = transformData(
	        response.data,
	        response.headers,
	        config.transformResponse
	      );

	      return response;
	    }, function onRejected(error) {
	      // Transform response data
	      if (error && error.response) {
	        error.response.data = transformData(
	          error.response.data,
	          error.response.headers,
	          config.transformResponse
	        );
	      }

	      return Promise.reject(error);
	    });
	};

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(/*! ./~/process/browser.js */ 3)))

/***/ },
/* 46 */
/*!*******************************************!*\
  !*** ./~/axios/lib/core/transformData.js ***!
  \*******************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(/*! ./../utils */ 39);

	/**
	 * Transform the data for a request or a response
	 *
	 * @param {Object|String} data The data to be transformed
	 * @param {Array} headers The headers for the request or response
	 * @param {Array|Function} fns A single function or Array of functions
	 * @returns {*} The resulting transformed data
	 */
	module.exports = function transformData(data, headers, fns) {
	  /*eslint no-param-reassign:0*/
	  utils.forEach(fns, function transform(fn) {
	    data = fn(data, headers);
	  });

	  return data;
	};


/***/ },
/* 47 */
/*!*************************************!*\
  !*** ./~/axios/lib/adapters/xhr.js ***!
  \*************************************/
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	var utils = __webpack_require__(/*! ./../utils */ 39);
	var settle = __webpack_require__(/*! ./../core/settle */ 48);
	var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ 51);
	var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ 52);
	var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ 53);
	var createError = __webpack_require__(/*! ../core/createError */ 49);
	var btoa = (typeof window !== 'undefined' && window.btoa) || __webpack_require__(/*! ./../helpers/btoa */ 54);

	module.exports = function xhrAdapter(config) {
	  return new Promise(function dispatchXhrRequest(resolve, reject) {
	    var requestData = config.data;
	    var requestHeaders = config.headers;

	    if (utils.isFormData(requestData)) {
	      delete requestHeaders['Content-Type']; // Let the browser set it
	    }

	    var request = new XMLHttpRequest();
	    var loadEvent = 'onreadystatechange';
	    var xDomain = false;

	    // For IE 8/9 CORS support
	    // Only supports POST and GET calls and doesn't returns the response headers.
	    // DON'T do this for testing b/c XMLHttpRequest is mocked, not XDomainRequest.
	    if (process.env.NODE_ENV !== 'test' &&
	        typeof window !== 'undefined' &&
	        window.XDomainRequest && !('withCredentials' in request) &&
	        !isURLSameOrigin(config.url)) {
	      request = new window.XDomainRequest();
	      loadEvent = 'onload';
	      xDomain = true;
	      request.onprogress = function handleProgress() {};
	      request.ontimeout = function handleTimeout() {};
	    }

	    // HTTP basic authentication
	    if (config.auth) {
	      var username = config.auth.username || '';
	      var password = config.auth.password || '';
	      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
	    }

	    request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

	    // Set the request timeout in MS
	    request.timeout = config.timeout;

	    // Listen for ready state
	    request[loadEvent] = function handleLoad() {
	      if (!request || (request.readyState !== 4 && !xDomain)) {
	        return;
	      }

	      // The request errored out and we didn't get a response, this will be
	      // handled by onerror instead
	      if (request.status === 0) {
	        return;
	      }

	      // Prepare the response
	      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
	      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
	      var response = {
	        data: responseData,
	        // IE sends 1223 instead of 204 (https://github.com/mzabriskie/axios/issues/201)
	        status: request.status === 1223 ? 204 : request.status,
	        statusText: request.status === 1223 ? 'No Content' : request.statusText,
	        headers: responseHeaders,
	        config: config,
	        request: request
	      };

	      settle(resolve, reject, response);

	      // Clean up request
	      request = null;
	    };

	    // Handle low level network errors
	    request.onerror = function handleError() {
	      // Real errors are hidden from us by the browser
	      // onerror should only fire if it's a network error
	      reject(createError('Network Error', config));

	      // Clean up request
	      request = null;
	    };

	    // Handle timeout
	    request.ontimeout = function handleTimeout() {
	      reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED'));

	      // Clean up request
	      request = null;
	    };

	    // Add xsrf header
	    // This is only done if running in a standard browser environment.
	    // Specifically not if we're in a web worker, or react-native.
	    if (utils.isStandardBrowserEnv()) {
	      var cookies = __webpack_require__(/*! ./../helpers/cookies */ 55);

	      // Add xsrf header
	      var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
	          cookies.read(config.xsrfCookieName) :
	          undefined;

	      if (xsrfValue) {
	        requestHeaders[config.xsrfHeaderName] = xsrfValue;
	      }
	    }

	    // Add headers to the request
	    if ('setRequestHeader' in request) {
	      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
	        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
	          // Remove Content-Type if data is undefined
	          delete requestHeaders[key];
	        } else {
	          // Otherwise add header to the request
	          request.setRequestHeader(key, val);
	        }
	      });
	    }

	    // Add withCredentials to request if needed
	    if (config.withCredentials) {
	      request.withCredentials = true;
	    }

	    // Add responseType to request if needed
	    if (config.responseType) {
	      try {
	        request.responseType = config.responseType;
	      } catch (e) {
	        if (request.responseType !== 'json') {
	          throw e;
	        }
	      }
	    }

	    // Handle progress if needed
	    if (typeof config.onDownloadProgress === 'function') {
	      request.addEventListener('progress', config.onDownloadProgress);
	    }

	    // Not all browsers support upload events
	    if (typeof config.onUploadProgress === 'function' && request.upload) {
	      request.upload.addEventListener('progress', config.onUploadProgress);
	    }


	    if (requestData === undefined) {
	      requestData = null;
	    }

	    // Send the request
	    request.send(requestData);
	  });
	};

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(/*! ./~/process/browser.js */ 3)))

/***/ },
/* 48 */
/*!************************************!*\
  !*** ./~/axios/lib/core/settle.js ***!
  \************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var createError = __webpack_require__(/*! ./createError */ 49);

	/**
	 * Resolve or reject a Promise based on response status.
	 *
	 * @param {Function} resolve A function that resolves the promise.
	 * @param {Function} reject A function that rejects the promise.
	 * @param {object} response The response.
	 */
	module.exports = function settle(resolve, reject, response) {
	  var validateStatus = response.config.validateStatus;
	  // Note: status is not exposed by XDomainRequest
	  if (!response.status || !validateStatus || validateStatus(response.status)) {
	    resolve(response);
	  } else {
	    reject(createError(
	      'Request failed with status code ' + response.status,
	      response.config,
	      null,
	      response
	    ));
	  }
	};


/***/ },
/* 49 */
/*!*****************************************!*\
  !*** ./~/axios/lib/core/createError.js ***!
  \*****************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var enhanceError = __webpack_require__(/*! ./enhanceError */ 50);

	/**
	 * Create an Error with the specified message, config, error code, and response.
	 *
	 * @param {string} message The error message.
	 * @param {Object} config The config.
	 * @param {string} [code] The error code (for example, 'ECONNABORTED').
	 @ @param {Object} [response] The response.
	 * @returns {Error} The created error.
	 */
	module.exports = function createError(message, config, code, response) {
	  var error = new Error(message);
	  return enhanceError(error, config, code, response);
	};


/***/ },
/* 50 */
/*!******************************************!*\
  !*** ./~/axios/lib/core/enhanceError.js ***!
  \******************************************/
/***/ function(module, exports) {

	'use strict';

	/**
	 * Update an Error with the specified config, error code, and response.
	 *
	 * @param {Error} error The error to update.
	 * @param {Object} config The config.
	 * @param {string} [code] The error code (for example, 'ECONNABORTED').
	 @ @param {Object} [response] The response.
	 * @returns {Error} The error.
	 */
	module.exports = function enhanceError(error, config, code, response) {
	  error.config = config;
	  if (code) {
	    error.code = code;
	  }
	  error.response = response;
	  return error;
	};


/***/ },
/* 51 */
/*!*****************************************!*\
  !*** ./~/axios/lib/helpers/buildURL.js ***!
  \*****************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(/*! ./../utils */ 39);

	function encode(val) {
	  return encodeURIComponent(val).
	    replace(/%40/gi, '@').
	    replace(/%3A/gi, ':').
	    replace(/%24/g, '$').
	    replace(/%2C/gi, ',').
	    replace(/%20/g, '+').
	    replace(/%5B/gi, '[').
	    replace(/%5D/gi, ']');
	}

	/**
	 * Build a URL by appending params to the end
	 *
	 * @param {string} url The base of the url (e.g., http://www.google.com)
	 * @param {object} [params] The params to be appended
	 * @returns {string} The formatted url
	 */
	module.exports = function buildURL(url, params, paramsSerializer) {
	  /*eslint no-param-reassign:0*/
	  if (!params) {
	    return url;
	  }

	  var serializedParams;
	  if (paramsSerializer) {
	    serializedParams = paramsSerializer(params);
	  } else if (utils.isURLSearchParams(params)) {
	    serializedParams = params.toString();
	  } else {
	    var parts = [];

	    utils.forEach(params, function serialize(val, key) {
	      if (val === null || typeof val === 'undefined') {
	        return;
	      }

	      if (utils.isArray(val)) {
	        key = key + '[]';
	      }

	      if (!utils.isArray(val)) {
	        val = [val];
	      }

	      utils.forEach(val, function parseValue(v) {
	        if (utils.isDate(v)) {
	          v = v.toISOString();
	        } else if (utils.isObject(v)) {
	          v = JSON.stringify(v);
	        }
	        parts.push(encode(key) + '=' + encode(v));
	      });
	    });

	    serializedParams = parts.join('&');
	  }

	  if (serializedParams) {
	    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
	  }

	  return url;
	};


/***/ },
/* 52 */
/*!*********************************************!*\
  !*** ./~/axios/lib/helpers/parseHeaders.js ***!
  \*********************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(/*! ./../utils */ 39);

	/**
	 * Parse headers into an object
	 *
	 * ```
	 * Date: Wed, 27 Aug 2014 08:58:49 GMT
	 * Content-Type: application/json
	 * Connection: keep-alive
	 * Transfer-Encoding: chunked
	 * ```
	 *
	 * @param {String} headers Headers needing to be parsed
	 * @returns {Object} Headers parsed into an object
	 */
	module.exports = function parseHeaders(headers) {
	  var parsed = {};
	  var key;
	  var val;
	  var i;

	  if (!headers) { return parsed; }

	  utils.forEach(headers.split('\n'), function parser(line) {
	    i = line.indexOf(':');
	    key = utils.trim(line.substr(0, i)).toLowerCase();
	    val = utils.trim(line.substr(i + 1));

	    if (key) {
	      parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
	    }
	  });

	  return parsed;
	};


/***/ },
/* 53 */
/*!************************************************!*\
  !*** ./~/axios/lib/helpers/isURLSameOrigin.js ***!
  \************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(/*! ./../utils */ 39);

	module.exports = (
	  utils.isStandardBrowserEnv() ?

	  // Standard browser envs have full support of the APIs needed to test
	  // whether the request URL is of the same origin as current location.
	  (function standardBrowserEnv() {
	    var msie = /(msie|trident)/i.test(navigator.userAgent);
	    var urlParsingNode = document.createElement('a');
	    var originURL;

	    /**
	    * Parse a URL to discover it's components
	    *
	    * @param {String} url The URL to be parsed
	    * @returns {Object}
	    */
	    function resolveURL(url) {
	      var href = url;

	      if (msie) {
	        // IE needs attribute set twice to normalize properties
	        urlParsingNode.setAttribute('href', href);
	        href = urlParsingNode.href;
	      }

	      urlParsingNode.setAttribute('href', href);

	      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
	      return {
	        href: urlParsingNode.href,
	        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
	        host: urlParsingNode.host,
	        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
	        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
	        hostname: urlParsingNode.hostname,
	        port: urlParsingNode.port,
	        pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
	                  urlParsingNode.pathname :
	                  '/' + urlParsingNode.pathname
	      };
	    }

	    originURL = resolveURL(window.location.href);

	    /**
	    * Determine if a URL shares the same origin as the current location
	    *
	    * @param {String} requestURL The URL to test
	    * @returns {boolean} True if URL shares the same origin, otherwise false
	    */
	    return function isURLSameOrigin(requestURL) {
	      var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
	      return (parsed.protocol === originURL.protocol &&
	            parsed.host === originURL.host);
	    };
	  })() :

	  // Non standard browser envs (web workers, react-native) lack needed support.
	  (function nonStandardBrowserEnv() {
	    return function isURLSameOrigin() {
	      return true;
	    };
	  })()
	);


/***/ },
/* 54 */
/*!*************************************!*\
  !*** ./~/axios/lib/helpers/btoa.js ***!
  \*************************************/
/***/ function(module, exports) {

	'use strict';

	// btoa polyfill for IE<10 courtesy https://github.com/davidchambers/Base64.js

	var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

	function E() {
	  this.message = 'String contains an invalid character';
	}
	E.prototype = new Error;
	E.prototype.code = 5;
	E.prototype.name = 'InvalidCharacterError';

	function btoa(input) {
	  var str = String(input);
	  var output = '';
	  for (
	    // initialize result and counter
	    var block, charCode, idx = 0, map = chars;
	    // if the next str index does not exist:
	    //   change the mapping table to "="
	    //   check if d has no fractional digits
	    str.charAt(idx | 0) || (map = '=', idx % 1);
	    // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
	    output += map.charAt(63 & block >> 8 - idx % 1 * 8)
	  ) {
	    charCode = str.charCodeAt(idx += 3 / 4);
	    if (charCode > 0xFF) {
	      throw new E();
	    }
	    block = block << 8 | charCode;
	  }
	  return output;
	}

	module.exports = btoa;


/***/ },
/* 55 */
/*!****************************************!*\
  !*** ./~/axios/lib/helpers/cookies.js ***!
  \****************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(/*! ./../utils */ 39);

	module.exports = (
	  utils.isStandardBrowserEnv() ?

	  // Standard browser envs support document.cookie
	  (function standardBrowserEnv() {
	    return {
	      write: function write(name, value, expires, path, domain, secure) {
	        var cookie = [];
	        cookie.push(name + '=' + encodeURIComponent(value));

	        if (utils.isNumber(expires)) {
	          cookie.push('expires=' + new Date(expires).toGMTString());
	        }

	        if (utils.isString(path)) {
	          cookie.push('path=' + path);
	        }

	        if (utils.isString(domain)) {
	          cookie.push('domain=' + domain);
	        }

	        if (secure === true) {
	          cookie.push('secure');
	        }

	        document.cookie = cookie.join('; ');
	      },

	      read: function read(name) {
	        var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
	        return (match ? decodeURIComponent(match[3]) : null);
	      },

	      remove: function remove(name) {
	        this.write(name, '', Date.now() - 86400000);
	      }
	    };
	  })() :

	  // Non standard browser env (web workers, react-native) lack needed support.
	  (function nonStandardBrowserEnv() {
	    return {
	      write: function write() {},
	      read: function read() { return null; },
	      remove: function remove() {}
	    };
	  })()
	);


/***/ },
/* 56 */
/*!**********************************************!*\
  !*** ./~/axios/lib/helpers/isAbsoluteURL.js ***!
  \**********************************************/
/***/ function(module, exports) {

	'use strict';

	/**
	 * Determines whether the specified URL is absolute
	 *
	 * @param {string} url The URL to test
	 * @returns {boolean} True if the specified URL is absolute, otherwise false
	 */
	module.exports = function isAbsoluteURL(url) {
	  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
	  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
	  // by any combination of letters, digits, plus, period, or hyphen.
	  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
	};


/***/ },
/* 57 */
/*!********************************************!*\
  !*** ./~/axios/lib/helpers/combineURLs.js ***!
  \********************************************/
/***/ function(module, exports) {

	'use strict';

	/**
	 * Creates a new URL by combining the specified URLs
	 *
	 * @param {string} baseURL The base URL
	 * @param {string} relativeURL The relative URL
	 * @returns {string} The combined URL
	 */
	module.exports = function combineURLs(baseURL, relativeURL) {
	  return baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '');
	};


/***/ },
/* 58 */
/*!***************************************!*\
  !*** ./~/axios/lib/helpers/spread.js ***!
  \***************************************/
/***/ function(module, exports) {

	'use strict';

	/**
	 * Syntactic sugar for invoking a function and expanding an array for arguments.
	 *
	 * Common use case would be to use `Function.prototype.apply`.
	 *
	 *  ```js
	 *  function f(x, y, z) {}
	 *  var args = [1, 2, 3];
	 *  f.apply(null, args);
	 *  ```
	 *
	 * With `spread` this example can be re-written.
	 *
	 *  ```js
	 *  spread(function(x, y, z) {})([1, 2, 3]);
	 *  ```
	 *
	 * @param {Function} callback
	 * @returns {Function}
	 */
	module.exports = function spread(callback) {
	  return function wrap(arr) {
	    return callback.apply(null, arr);
	  };
	};


/***/ }
/******/ ]);
//# sourceMappingURL=index.js.map