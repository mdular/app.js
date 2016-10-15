# app.js
## lightweight application manager
Because sometimes it's the best way to keep it *real* simple, but still have structure and execution efficiency.

Compatible IE8 and higher

You can read about the thought process in [Organize javascript code for standard websites with app.js](https://mdular.com/post/16-organize-javascript-code-on-standard-websites)

## Usage

### Prepare your body tag
`<body id="controller" data-modules="module1 module2 ...">`
* Modules in data-modules will be initialized before the controller
* The controller to run will be chosen based on the `<body> id` attribute

### Choose trigger event
* `DOMContentLoaded` or `load`
* check at the bottom of app.js `app.listen(event)`

### Register a controller
Run a specific set of code based on the current page by defining a controller

```javascript
app.registerController('index', function () {
  var init = function () {
    console.log('controller initialized!');
    // your code goes here
  }

  return {
    init  : init
  }
});
```

* The 'index' controller will be run when `<body id="index">`
* Note that we're passing the controller object in the form of a return function closure, which provides a closed scope and will be lazily executed only when needed
* Instead of registering the 'index' controller as a function closure, a plain object can also be used: `{init:function}`

### Register a module
To create modules of code that can be shared between multiple pages, create a module

```js
app.registerModule('moduleName', function () {
  var init = function () {
    console.log('module initialized!');
    // module code goes here
  }

  // the init function needs to be accessible from the 'outside' of this function closure
  return {
    init  : init
  }
});
```

* Registered modules, whose names appear in `<body data-modules="">` attribute, will be initialized
* Optionally, a module can be registered to _always_ run: `app.registerModule('moduleName', function, true);`
* Note that instead of registering the module as a function closure, a plain object can also be used: `{init:function}`


## Caveats
This is intended to organize and improve projects with UI enhancements & application logic being added on page load in a simple but professional form. Sophisticated (single page) applications demand a more complex application architecture and toolchain.

## TODOs
- [ ] Implement optional window.load callback for controllers (to simplify lazy loading scripting)
- [ ] Inject module references into the controller instead of relying on `app.getModule()`
