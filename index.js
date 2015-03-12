
/**
 * Module dependencies.
 */

var eql = require('mongo-eql');
var type = require('component-type');
var debug = require('debug')('mongo-diff');

/**
 * Module exports.
 */

module.exports = diff;

/**
 * Differ.
 *
 * @param {Object} a
 * @param {Object} b
 * @param {Object} options
 * @return {Array} operations
 * @api public
 */

function diff(a, b, opts){
  var at = type(a);
  var bt = type(b);

  try {
    if ('number' == bt && (null == a || 'number' == at)) {
      debug('trying inc diff');
      return diff.inc(a, b, opts);
    }

    if ('array' == type(a) || 'array' == type(b)) {
      debug('trying ordered_set diff');
      return diff.ordered_set(a, b, opts);
    }
  } catch(e){
    debug('error: %s. falling back', e.message);
  }

  debug('value diff');
  return diff.val(a, b, opts);
}

/**
 * Value diff strategy.
 *
 * @api public
 */

diff.val = function(a, b){
  if (eql(a,b)) return [];

  if (null == b) {
    return [['unset', 1]];
  }

  return [['set', b]];
};

/**
 * Inc diff strategy.
 *
 * @api public
 */

diff.inc = function(a, b, opts){
  a = a || 0;

  opts = opts || {};

  var diff = b - a;
  var interval = opts.interval || diff;

  if (diff % interval) {
    throw new Error('Invalid interval');
  }

  var ops = [];
  for (var i = 0; i < Math.abs(diff) / interval; i++) {
    ops.push(['inc', interval * (diff < 0 ? -1 : 1)]);
  }

  return ops;
};

/**
 * Ordered set strategy.
 *
 * @api public
 */

diff.ordered_set = function(a, b){
  a = a || [];
  b = b || [];

  var ops = [];
  var lastIndex;

  // go through all the items in `a`
  // to populate pull operations
  for (var i = 0, v, l = a.length; i < l; i++) {
    v =  a[i];
    var index = indexOf(b, v);
    if (index > -1) {
      if (lastIndex && index < lastIndex) {
        throw new Error('Order exception (' + v + ')');
      }
      lastIndex = index;
    } else {
      ops.push(['pull', v]);
    }
  }

  // go through all the items in `b`
  // to populate push operations
  for (var i = 0, v, l = b.length; i < l; i++) {
    v = b[i];
    var index = indexOf(a, v);
    if (index > -1) continue;
    ops.push(['push', v]);
  }

  return ops;
};

/**
 * indexOf with mongo semantics
 *
 * @param {Array} haystack
 * @param {Object} needle
 * @api private
 */

function indexOf(arr, obj){
  for (var i = 0, l = arr.length; i < l; i++) {
    if (eql(arr[i], obj)) return i;
  }
  return -1;
}
