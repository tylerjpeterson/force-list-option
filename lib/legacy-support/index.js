'use strict';

var toArray = require('to-array');
var closest = require('closest');
var isEl = require('is-el');

var selectTpl = document.createElement('select');
var optionTpl = document.createElement('option');

/**
 * Converts a collection of `<input>` elements with corresponding `<datalist>` elements
 * into a traditional `<select>` field with HTML5 `<form "required">` support
 * @module legacySupport
 *
 * @param  {array|nodelist} elements - Elements to convert
 * @return {array} - Collection of `<select>` inputs that replaced "elements"
 */
module.exports = function (elements) {
	var selectElements = [];
	var selectElement = null;
	var defaultOpt = null;
	var datalist = null;
	var option = null;
	var forms = null;
	var form = null;
	var opts = null;

	/**
	 * Mock enforce disabling of a form when inputs are not valid
	 *
	 * @param  {event} e - Original submit event
	 * @return {null}
	 */
	var legacyRequireSupport = function (e) {
		if (!this.checkValidity()) {
			e.preventDefault();
		}
	};

	elements = elements || null;

	if (!elements) {
		return selectElements;
	}

	// cast to array
	elements = Array.isArray(elements) ? elements : toArray(elements);

	elements.forEach(function (element) {
		if (!isEl(element)) {
			return;
		}

		// Get form element belongs to and implement "required" functionality
		forms = forms || [];
		form = closest(element, 'form');

		if (forms.indexOf(form) === -1) {
			form.addEventListener('submit', legacyRequireSupport);
			forms.push(form);
		}

		// Create a `<select>` element to replace the `<input>` element
		selectElement = selectTpl.cloneNode(true);
		defaultOpt = optionTpl.cloneNode(true);

		selectElement.setAttribute('name', element.getAttribute('name'));
		selectElement.setAttribute('id', element.getAttribute('id'));

		if (element.hasAttribute('required')) {
			selectElement.setAttribute('required', 'required');
		}

		// Create the `<select>` element's default `<option>` element
		defaultOpt.textContent = element.getAttribute('placeholder') || '';
		defaultOpt.value = '';
		selectElement.appendChild(defaultOpt);

		// Retrieve the input's `<datalist>` element
		datalist = document.getElementById(element.getAttribute('list'));

		if (datalist) {
			opts = toArray(datalist.querySelectorAll('option'));

			// Convert the `<datalist>'s `<option>` tags into
			// traditional select `<option>` elements
			if (opts.length > 0) {
				opts.forEach(function (opt) {
					option = optionTpl.cloneNode(true);
					option.textContent = opt.value;
					option.value = opt.value;

					// "Select" the option if it matches the field's value
					if (element.value.toLowerCase() === opt.value.toLowerCase()) {
						option.setAttribute('selected', 'selected');
					}

					// Add the `<option>` to the `<select>` element
					selectElement.appendChild(option);
				});
			}

			// Replace the `<input>` with the `<select>`
			element.parentNode.replaceChild(selectElement, element);
			// Remove the `<datalist>` from the DOM
			datalist.parentNode.removeChild(datalist);
		}

		selectElements.push(selectElement);
	});

	// remove references for GC
	forms = null;
	form = null;

	return selectElements;
};
