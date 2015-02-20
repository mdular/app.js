# app.js
## lightweight application manager
Because sometimes it's the best way to keep it *real* simple, but still have structure and execution efficiency.

## Usage

### Prepare your body tag
`<body id="controller" data-modules="module1 module2 ...">`
* Modules in data-modules will be initialised before the controller
* The controller to run will be chosen based on id

### Choose trigger event
* DOMContentLoaded or load
* check bottom of app.js `app.listen(event)`

### Register a module

```javascript
app.registerModule('modulename', function () {
  var init = function () {
    console.log('module initialised!');
  }
  
  return {
    init  : init
  }
});
```

* Registered modules, whose names appear in `<body data-modules="">` attribute, will be initilised
* Optionally, a module can be registered to _always_ run: `app.registerModule('modulename', function, true);`

### Register a controller

```javascript
app.registerController('index', function () {
  var init = function () {
    console.log('controller initialised!');
  }
  
  return {
    init  : init
  }
});
```
