/**
 * lightweight application manager
 * @author Markus J Doetsch mdular.com
 *
 * register page controllers like this:
 * app.registerController('myController, myModule[FunctionWrapper]);
 * <body id="myController">
 *
 * register modules like this:
 * app.registerModule('myModule', myModule[FunctionWrapper] [, boolean alwaysRun = false]);
 * <body data-modules="myModule myOtherModule"> (not required when alwaysRun = true)
 *
 * declare dependencies in body-tag.
 * id = controller (use server-side mvc controller or controller-action, depending on required granularity)
 * data-modules = module dependencies, separated by space
 *
 * modules are invoked before the controller
 *
 * TODO: implement a window.load trigger for controllers and initialize on dom ready.. needs IE8-safe implementation -> this is currently solved using aight.js
 * TODO: inject module references into the controller
 */
/* global app:true, aight */

var app = (function () {
    "use strict";

    var modules = [];
    var globalModules = [];

    var listen = function (event) {
        // 'load' or 'DOMContentLoaded'

        window.addEventListener(event, function () {
            app.start.call(app);
        });

        // TODO: remove aight.js dependency for version check
        // 'DOMContentLoaded' for IE < 9, depends on aight.js for version detection
        if (event === 'DOMContentLoaded' && typeof aight !== 'undefined') {
            if (aight.browser.ie && aight.browser.version < 9) {
                var explorerTimer = window.setInterval(function() {
                    if (window.document.body) {
                        // Check for doScroll success
                        try {
                            window.document.createElement('div').doScroll('left');
                            window.clearInterval(explorerTimer);
                        } catch(e) {
                            return;
                        }

                        app.start.call(app);
                    }
                }, 10);
            }
        }
    };

    var start = function () {
        var body = document.getElementsByTagName('body')[0],
            modules = body.getAttribute('data-modules') || '',
            controller = body.getAttribute('id') || '';

        init(modules.split(' '));
        run([controller]);
    };

    var init = function (modulesToRun) {
        for (var k = 0; k < globalModules.length; k++) {
            modulesToRun.push(globalModules[k]);
        }

        for (var i = 0; i < modulesToRun.length; i++) {
            invoke(modulesToRun[i]);
        }
    };

    var run = function (controllerName) {
        if (modules[controllerName] === undefined) {
            return;
        }

        // skip if already initialized
        if (modules[controllerName].init) {
            return;
        }

        invoke(controllerName);
    };

    var reset = function (moduleName) {
        if (modules[moduleName] === undefined) {
            return;
        }

        modules[moduleName].init = false;

        // has reset function? call it
        if(typeof modules[moduleName].reset === 'function') {
            modules[moduleName].reset();
        }

        // set state
        modules[moduleName].init = false;
    };

    var invoke = function (identifier) {
        if (modules[identifier] === undefined) {
            return;
        }

        // get module
        var module = modules[identifier].module;

        // invoke module function wrapper if there is one
        if (typeof module === 'function') {
            module = module();
        }

        // init present?
        if (typeof module.init !== 'function') {
            throw new Error('invalid style: no init() found in ' + identifier);
        }

        // finally, run it
        module.init.call(module);
        modules[identifier].module = module;
        modules[identifier].init = true;
    };

    // there is no internal difference between modules and controllers
    var registerController = function (controllerName, module) {
        registerModule(controllerName, module);

    };

    var registerModule = function (moduleName, module) {
        if (modules[moduleName] !== undefined) {
            throw new Error('module already registered: ' + moduleName);
        }

        // module should always be invoked
        if (arguments[2]) {
            globalModules.push(moduleName);
        }

        modules[moduleName] = {
            module  : module,
            init    : false
            //run     : false
        };
    };

    var getModule = function (moduleName) {
        return modules[moduleName];
    };

    return {
        listen              : listen,
        start               : start,
        init                : init,
        run                 : run,
        reset               : reset,
        modules             : modules,
        registerController  : registerController,
        registerModule      : registerModule,
        getModule           : getModule
    };
}());

app.listen('DOMContentLoaded');
