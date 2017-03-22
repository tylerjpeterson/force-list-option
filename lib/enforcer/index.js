'use strict';

var esc = require('lodash/escapeRegExp');
var merge = require('lodash/merge');
var toArray = require('to-array');
var isEl = require('is-el');
var tabbable = require('./../tabbable-elements');

/**
 * Constructor parses DOM and keeps reference to DOM data required for functionality
 *
 * @class
 * Enforcer
 *
 * @classdesc
 * Forces selection of a value from an input's datalist options.
 * Also provides functionality to improve datalist UI such as:
 *
 *  - `autotab`: automatically focus the next tabbable element after valid value is entered
 *  - `autofill`: whether or not to autofill the input if only one option matches the value
 *  - `fromstart`: requires that matches are determined from the beginning of the option
 *  - `minlength`: implement a minimum length before autofill'ing the input
 *
 *
 * @param {element} input - Input element to enforce
 * @param {object} options - Object instantiation options
 * @param {string} [errorMessage="Please select a value from the list."] - Form validation error message
 * @param {object} [options.attributes=""] - Collection of data attributes to inform functionality on a per-field basis
 * @param {string} [options.attributes.tab="data-autotab"] - Attribute to enable auto tabbing
 * @param {string} [options.attributes.min="data-minlength"] - Attribute to set minlength property
 * @param {string} [options.attributes.fill="data-autofill"] - Attribute to enable autofill
 * @param {string} [options.attributes.start="data-fromstart"] - Attribute to enable fromstart requirement
 */
function Enforcer(input, options) {
	this.options = merge({}, Enforcer.DEFAULTS, options || {});
	this.element = input;
	this.choices = null;

	if (!isEl(this.element)) {
		return;
	}

	if (typeof this.element.list === 'undefined') {
		return;
	}

	this.choices = toArray(this.element.list.options);

	this.choices = this.choices.map(function (c) {
		return c.value;
	});

	this.nextField = tabbable[tabbable.indexOf(this.element) + 1];

	if (typeof this.nextField === 'undefined') {
		this.nextField = tabbable[0];
	}

	this.minlength = parseInt((this.element.getAttribute(this.options.attributes.min) || 1), 10);
	this.fromstart = this.element.hasAttribute(this.options.attributes.start);
	this.autofill = this.element.hasAttribute(this.options.attributes.fill);
	this.autotab = this.element.hasAttribute(this.options.attributes.tab);
	this.constrain = this.constrain.bind(this);
	this.changed = this.changed.bind(this);

	this.element.addEventListener('keydown', this.constrain);
	this.element.addEventListener('input', this.changed);
	this.element.setCustomValidity(this.options.errorMessage);
}

Enforcer.DEFAULTS = {
	attributes: {
		start: 'data-fromstart',
		min: 'data-minlength',
		fill: 'data-autofill',
		tab: 'data-autotab'
	},
	errorMessage: 'Please select a value from the list.'
};

module.exports = Enforcer;

/**
 * `input` event callback to set the validity state based on element's value
 * @return {null}
 */
Enforcer.prototype.changed = function () {
	// enforce form validation by setting a custom validity
	if (this.choices.indexOf(this.element.value) === -1) {
		this.element.setCustomValidity(this.options.errorMessage);
	} else {
		// otherwise remove the validation on the input
		this.element.setCustomValidity('');
		// and tab to the next input if auto-tab is enabled
		if (this.autotab) {
			this.nextField.focus();
		} else {
			// otherwise leave (restore) focus on the current input
			this.element.focus();
		}
	}
};

/**
 * Fires a synthetic event for auto-tabbing Enforcers to that any existing listeners are notified properly.
 *
 * @param  {string} event - Type of event to fire
 * @param  {element} element - Element that will fire the event
 * @return {boolean}
 */
Enforcer.prototype.fireEvent = function (event, element) {
	var evt = null;

	if (document.createEventObject) {
		evt = document.createEventObject();
		return element.fireEvent('on' + event, evt);
	}

	evt = document.createEvent('HTMLEvents');
	evt.initEvent(event, true, true);
	return !element.dispatchEvent(evt);
};

/**
 * `keydown` listener that prevents user from entering invalid value and
 * implements optional functionality such as auto-tabbing.
 *
 * @param  {event} e - Original keydown event
 * @return {null}
 */
Enforcer.prototype.constrain = function (e) {
	// determine what the next value of the input would be if we allow this character to be written
	var next = (this.element.value + e.key).toLowerCase();
	var reg = new RegExp(esc(next), 'i');
	var found = [];

	// if the meta key is pressed, or the pressed key is not a single character
	if (e.metaKey || e.key.toString().length > 1) {
		return;
	}

	// iterate through all data list options
	this.choices.forEach(function (val) {
		if (!this.autofill) {
			return;
		}

		// iterate through all data list options
		if (reg.test(val)) {
			// enforce from start option
			if (this.fromstart && val.toLowerCase().indexOf(next) !== 0) {
				return null;
			}

			// add all matching items to a collection
			found.push(val);
		}
	}.bind(this));

	// if no match is found, block the entry of the character into the input
	if (found.length > 0) {
		// if only one matching option remains, auto-fill
		if (this.autofill && found.length < 2) {
			if (next.length < this.minlength) {
				return;
			}

			e.preventDefault();

			if (!this.autotab) {
				this.element.blur();
			}

			// update the form's value on the next tick
			window.requestAnimationFrame(function () {
				this.element.value = found[0];
				this.fireEvent('change', this.element);
				this.changed();
			}.bind(this));
		}
	} else {
		e.preventDefault();
	}
};
