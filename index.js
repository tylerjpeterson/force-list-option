'use strict';

var toArray = require('to-array');
var Enforcer = require('./lib/enforcer');
var legacySupport = require('./lib/legacy-support');

var elements = null;

/**
 * Factory to automatically implement enforcer objects for all datalist inputs with additional
 * functionality informed by data attributes. By default, the factory will run against all appropriate
 * elements on the page. This can be controlled by the passing the selector parameter.
 * Enforcers can be configured by passing the factory an options object which is in turn sent to the
 * constructor for each enforcer object. See the Enforcer class documentation for a list of available options.
 * @module forceListOption
 * @see  Enforcer
 *
 * @param  {string} [selector="input[list][data-constrain]"] - Selector to match inputs with datalists
 * @param  {object} [options={}] - Options that are transparently passed to the Enforcer constructor
 * @return {array} Collection of created enforcer instances
 */
module.exports = function (selector, options) {
	selector = selector || 'input[list][data-constrain]';
	elements = toArray(document.querySelectorAll(selector));
	options = options || {};

	if (!('options' in document.createElement('datalist'))) {
		return legacySupport(elements);
	}

	return elements.map(function (element) {
		return new Enforcer(element, options);
	});
};
