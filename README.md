# forceListOption
> Forces an input's value to match the value of one of its datalist options, and then some.

Forces an input's value to match the value of one of its `<datalist>` options. 
It also provides opt-in functionality via data attributes to improve the default browser behavior for users.
 - `data-constrain` - prevents submission of any form value that does not match a datalist option
 - `data-autotab` - automatically focus the next focusable element in the DOM when valid data is entered
 - `data-autofill` - whether or not to autofill the input if only one option matches the value
 - `data-fromstart` - requires that matches are determined from the beginning of the entered input
 - `data-minlength` - implements a minimum length requirement before autofill'ing the input field

View a basic [demo](http://kettle-modules.s3.amazonaws.com/force-list-option/index.html).

## Safari
Safari has minimal HTML5 input validation support. 
Most notably:

- it has a bug that allows for submission of a form with empty "required" `<inputs>`
- it does not support the `<datalist>` element

This module addresses the "required" bug, preventing the form from submitting with empty "required" inputs.

It will also convert `<input>` elements with a `<datalist>` into traditional `<select>` elements. 


## Installation
Install via npm:

```sh
$ npm i force-list-option --save
```


## Usage
Requiring the module exposes a factory method that will create an `Enforcer` instance for each matching input in the DOM.

For use within a browserified bundle:

```javascript
var forceListOption = require('force-list-option');
forceListOption(selector, options);

// designed to work well with defaults
forceListOption();
```

Or include the dist script on the page and call the now-global `forceListOption` function:

```html
<script src="path/to/dist/script.js"></script>
<script>
  forceListOption(selector, options);	
</script>
```

## Enforcer class
An instance of the enforcer class is created for each input.
It provides the element-specific functionality as determined by its data attributes.
To use the `Enforcer` constructor directly:

```javascript
var Enforcer = require('force-list-option/lib/enforcer');
var enforcer = new Enforcer(element, options);
```

## Documentation
Docs can be generated with JSDoc:

```sh
$ npm run docs
```
