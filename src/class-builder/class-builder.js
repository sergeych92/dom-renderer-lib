function validateParent(parent) {
    if (parent && (typeof parent !== 'function' || typeof parent.prototype.internalConstructor !== 'function')) {
        throw new TypeError('Parent must be a constructor function with an internal constructor on the prototype.');
    }
}

function validateConstructor(constructor) {
    if (constructor && typeof constructor !== 'function') {
        throw new TypeError('Constructor must be a function.');
    }
}

function validateDeclaredName(accessObj, name, isVar) {
    const entityName = isVar ? 'variable' : 'method';
    if (accessObj.private.hasOwnProperty(name)
        || accessObj.protected.hasOwnProperty(name)
        || accessObj.public.hasOwnProperty(name)) {
            throw new TypeError('A ' + entityName + ' with the name ' + name + ' has already been declared.');
    }
}

function assignVars(target, vars) {
    Object.keys(vars).forEach(function (name) {
        target[name] = vars[name]; // Set configurable to true to allow same variable overriding
    });
}

function assignSeeThroughVars(target, vars) {
    var publicState = Object.getPrototypeOf(target);
    Object.keys(vars).forEach(function (name) {
        Object.defineProperty(target, name, {
            get: function () { return publicState[name]; },
            set: function (value) { publicState[name] = value; },
            enumerable: true
        });
    });
}

function forEachOwnMethod(target, cb) {
    Object.getOwnPropertyNames(target)
        .filter(function (method) { return typeof target[method] === 'function'; })
        .forEach(function (method) { cb(method, target[method])});
}

function assignMethods(target, methods, privateState) {
    forEachOwnMethod(methods, function (name, fn) {
        Object.defineProperty(target, name, {
            value: function () {
                'use strict';
                if (this.hasOwnProperty(IS_PRIVATE_STATE)) {
                    return fn.apply(privateState.get(Object.getPrototypeOf(this)), arguments);
                } else {
                    return fn.apply(privateState.get(this), arguments);
                }
            }
        });
    });
}


var IS_PRIVATE_STATE = '__$is_private_state$__';
var internalState = new WeakMap(); // WeakMap can be easily polyfilled for ES5.
// Example: https://github.com/polygonplanet/weakmap-polyfill/blob/master/weakmap-polyfill.js

export function ClassBuilder(params) {
    'use strict';

    if (!this || Object.getPrototypeOf(this) !== ClassBuilder.prototype) {
        return new ClassBuilder(params);
    }

    params = params || {};

    var parent = params.parent;
    this._constructor = params.hasOwnProperty('constructor') ? params.constructor : void 0;

    validateParent(parent);
    validateConstructor(this._constructor);
    this._parent = parent ? parent.prototype.internalConstructor : null;
    this._publicParent = parent;

    this._variables = {
        private: {},
        protected: {},
        public: {}
    };
    this._methods = {
        private: {},
        protected: {},
        public: {}
    };
    this._base = {};
}

Object.defineProperties(ClassBuilder.prototype, Object.getOwnPropertyDescriptors({
    private: function(defs) {
        this._saveDefinitions(defs, 'private');
        return this;
    },
    protected: function(defs) {
        this._saveDefinitions(defs, 'protected');
        return this;
    },
    public: function(defs) {
        this._saveDefinitions(defs, 'public');
        return this;
    },
    build: function() {
        this._createInnerClass();
        return this._createPublicClass();
    },

    _saveDefinitions: function(defs, access) {
        if (typeof defs === 'function') {
            defs = defs(this._base);
        }
        Object.keys(defs || {}).forEach(function (key) {
            if (typeof defs[key] === 'function') {
                validateDeclaredName(this._methods, key, false);
                this._methods[access][key] = defs[key];
            } else {
                validateDeclaredName(this._variables, key, true);
                this._variables[access][key] = defs[key];
            }
        }.bind(this));
    },
    
    _setBaseMethods: function() {
        var parentRef = this._parent.prototype;
        var methodHost = parentRef;
        var base = this._base;
        while (methodHost !== Object.prototype) {
            forEachOwnMethod(methodHost, function (name) {
                if (!base.hasOwnProperty(name)) { // Base class and its subclass can have the same method
                    Object.defineProperty(base, name, {
                        value: function () {
                            'use strict';
                            var publicState = Object.getPrototypeOf(this);
                            return parentRef[name].apply(publicState, arguments);
                        }
                    });
                }
            });
            methodHost = Object.getPrototypeOf(methodHost);
        }
        Object.seal(this._base);
    },
    
    _setConstructor: function(variables) {
        if (this._constructor) {
            if (!this._parent) {
                var constructor = this._constructor;
                this._constructor = function () {
                    'use strict';
                    var publicState = Object.getPrototypeOf(this);
                    assignVars(publicState, variables.protected);
                    assignVars(publicState, variables.public);
                    return constructor.apply(this, arguments);
                };
            }
        } else {
            if (this._parent) {
                this._constructor = function() {
                    'use strict';
                    var baseConstructor = arguments[0];
                    return baseConstructor.apply(undefined, [].slice.call(arguments, 1));
                };
            } else {
                this._constructor = function () {
                    'use strict';
                    var publicState = Object.getPrototypeOf(this);
                    assignVars(publicState, variables.protected);
                    assignVars(publicState, variables.public);
                };
            }
        }

        return this._constructor;
    },

    _createInnerClass: function() {
        var variables = this._variables;
        var methods = this._methods;
        var parent = this._parent;
        var privateState = new WeakMap();
        var constructor = this._setConstructor(variables);
        
        var innerClass = function () {
            'use strict';
            
            privateState.set(this, Object.create(this));
            var privateThis = privateState.get(this);
            Object.defineProperty(privateThis, IS_PRIVATE_STATE, {value: true});
            assignVars(privateThis, variables.private);
            assignSeeThroughVars(privateThis, variables.protected);
            assignSeeThroughVars(privateThis, variables.public);
            assignMethods(privateThis, methods.private, privateState);

            var wasCalled = false;
            var superFn = parent
                ? function () {
                    'use strict';
                    var result = parent.apply(this, arguments);
                    assignVars(this, variables.protected);
                    assignVars(this, variables.public);
                    wasCalled = true;
                    return result;
                }.bind(this)
                : null;
            var args = (superFn ? [superFn] : []).concat([].slice.call(arguments));
            var constrResult = constructor.apply(privateThis, args);
            if (parent && !wasCalled) {
                throw new Error('The base class constructor should have been called. Please call it manually.')
            }
            
            // Prevent extensions to the created object once all of the parents have run their constructors
            if (Object.getPrototypeOf(this) === innerClass.prototype) {
                // Prevent new variables from being added and the ones created during construction to be removed
                Object.seal(this);
            }
            Object.seal(privateState.get(this));
            
            return constrResult;
        };
    
        if (parent) {
            innerClass.prototype = Object.create(parent.prototype, {
                constructor: { value: innerClass }
            });
            this._setBaseMethods();
        }

        assignMethods(innerClass.prototype, methods.protected, privateState);
        assignMethods(innerClass.prototype, methods.public, privateState);

        Object.preventExtensions(innerClass);
        this._innerClass = innerClass;
    },

    _createPublicClass: function() {
        var wrapper;
        var publicParent = this._publicParent
        if (this._parent) {
            wrapper = function () {
                return publicParent.apply(this, arguments);
            };
            wrapper.prototype = Object.create(this._publicParent.prototype);
        } else {
            wrapper = function () {
                var internalConstructor = this.internalConstructor;
                var variableConstructor = function (args) {
                    return internalConstructor.apply(this, args);
                };
                variableConstructor.prototype = internalConstructor.prototype;
                internalState.set(this, new variableConstructor(arguments));
            };
        }
        Object.defineProperties(wrapper.prototype, {
            constructor: {value: wrapper},
            internalConstructor: {value: this._innerClass}
        });

        Object.keys(this._methods.public).forEach(function (name) {
            Object.defineProperty(wrapper.prototype, name, {
                value: function () {
                    var state = internalState.get(this);
                    return state[name].apply(state, arguments);
                }
            });
        });
        Object.keys(this._variables.public).forEach(function (name) {
            Object.defineProperty(wrapper.prototype, name, {
                get: function () {
                    var state = internalState.get(this);
                    return state[name];
                },
                set: function (v) {
                    var state = internalState.get(this);
                    state[name] = v;
                },
                enumerable: true
            })
        });

        this._wrapper = wrapper;
        return wrapper;
    }
}));



// var Bird = ClassBuilder({
//     name: 'Bird',
//     parent: Animal,
//     constructor: function (base, favoriteFood) {
//         base();
//         this._wingspanFt = 1.4;
//         this.__favoriteFood = favoriteFood;
//     }
// })
// .static({
//     MAX_WEIGHT_KG: 5
// })
// .private({
//     __weight: 2.8,
//     __validateWeight: function() {
//         if (this.__weight < 0 || this.__weight > this.constructor.MAX_WEIGHT_KG * 2) {
//             throw new RangeError(`The weight cannot be negative or exceed ${this.constructor.MAX_WEIGHT_KG} kg.`);
//         }
//     }
// })
// .protected({
//     _gainWeight: function (kg) {
//         const newWeight = kg * 0.1;
//         console.log(`Bird has gained ${newWeight} kg.`);
//         return newWeight;
//     }
// })
// .public(function (base) {
//     return {
//         run: function (one, two) {
//             const moved = base.run.call(this, one, two);
//             if (moved) {
//                 console.log(`Bird is flying with a wingspan of ${this._wingspan} feet`);
//             }
//             return moved;
//         },
//         eat: function (kg) {
//             console.log(`Animal has eaten ${kg} kg.`);
//             this.__weight += this._gainWeight(kg);
//             this.__validateWeight();
//         },
//         favoriteFood: {
//             get: function () { return this.__favoriteFood; },
//             set: function(value) { this.__favoriteFood = (value || '').toString().trim(); }
//         }
//     }
// })
// .build();
