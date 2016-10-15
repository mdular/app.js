/**
 * lightweight application manager
 * @author Markus J Doetsch
 *
 * Info:
 *
 * https://github.com/mdular/app.js
 *
 *
 * Usage:
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
 */
/* global app:true */

var app = (function () {
    "use strict";

    var modules = [];
    var globalModules = [];

    // 'load' or 'DOMContentLoaded'
    var listen = function (event) {

        window.addEventListener(event, function () {
            start();
        });

        // solve 'DOMContentLoaded' for IE < 8
        if (
            event === 'DOMContentLoaded'
            && typeof document.documentMode !== 'undefined'
            && document.documentMode === 8
        ) {
            // doScroll test method
            var t = window.setInterval(function() {
                if (window.document.body) {
                    // Check for doScroll success
                    try {
                        window.document.createElement('div').doScroll('left');
                        window.clearInterval(t);
                    } catch(e) {
                        return;
                    }
                    start();
                }
            }, 10);
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
        modulesToRun = modulesToRun.concat(globalModules);

        for (var i = 0, count = modulesToRun.length; i < count; i++) {
            invoke(modulesToRun[i]);
        }
    };

    var run = function (controllerName) {
        // fail nonexisting controllers silently
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
            throw new Error('Trying to reset non-existing module: ' + moduleName);
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
            throw new Error('invalid style: no init() found in: ' + identifier);
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
        if (arguments[2] === true) {
            globalModules.push(moduleName);
        }

        modules[moduleName] = {
            module  : module,
            init    : false
        };
    };

    var getModule = function (moduleName) {
        return modules[moduleName];
    };

    return {
        listen              : listen,
        reset               : reset,
        registerController  : registerController,
        registerModule      : registerModule,
        getModule           : getModule
    };
}());

// 'DOMContentLoaded' or 'load'
app.listen('DOMContentLoaded');
