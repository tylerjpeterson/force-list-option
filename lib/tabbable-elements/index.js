'use strict';

var tabbable = require('tabbable');

/**
 * Collection of all "tabbable" elements on the page
 * (elements that could receive focus via the tab key)
 * @type {array}
 */
var tabbableElements = tabbable(document.documentElement);

module.exports = tabbableElements;
