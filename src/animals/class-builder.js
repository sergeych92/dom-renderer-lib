function validateParent(parent) {
    if (parent && typeof parent !== 'function') {
        throw new TypeError('Parent must be a constructor function.');
    }
}

function validateConstructor(constructor) {
    if (constructor && typeof constructor !== 'function') {
        throw new TypeError('Constructor must be a function.');
    }
}

function validateDeclaredName(accessObj, name, isVar) {
    if (accessObj.private.hasOwnProperty(name)
        || accessObj.protected.hasOwnProperty(name)
        || accessObj.public.hasOwnProperty(name)) {
            const entityName = isVar ? 'variable' : 'method';
            throw new TypeError('A ' + entityName + ' with the name ' + name + ' has already been declared.');
        }
}

export function ClassBuilder(params) {
    'use strict';

    if (!params) {
        throw new TypeError('class builder must be created with parameters');
    }

    this._parent = params.parent;
    this._constructor = params.constructor;

    validateParent(this._parent);
    validateConstructor(this._constructor);

    if (!this || Object.getPrototypeOf(this) !== ClassBuilder.prototype) {
        return new ClassBuilder(params);
    }

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

function assignNonPrivateVars(vars) {
    Object.keys(vars.protected).forEach(function (name) {
        Object.defineProperty(this, name, {
            value: vars.protected[name],
            writable: true
        });
    });
    Object.keys(vars.public).forEach(function (name) {
        Object.defineProperty(this, name, {
            value: vars.public[name],
            writable: true
        });
    });
}

Object.defineProperties(ClassBuilder.prototype, Object.getOwnPropertyDescriptors({
    private: function(defs) {
        this._saveDefinitions(defs, 'private');
    },
    protected: function(defs) {
        this._saveDefinitions(defs, 'protected');
    },
    public: function(defs) {
        this._saveDefinitions(defs, 'public');
    },
    build: function() {
        var innerClass = this._createInnerClass();

        return this.clazz;
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
        });
    },
    
    _setBaseMethods: function() {
        var parentRef = this.parent.prototype;
        var methodHost = parentRef;
        while (methodHost !== Object.prototype) {
            Object.keys(methodHost)
                .filter(function (method) { return typeof methodHost[method] === 'function'; })
                .forEach(function (method) {
                    if (!this._base.hasOwnProperty(method)) {
                        Object.defineProperty(this._base, method, {
                            value: function () {
                                var publicState = Object.getPrototypeOf(this);
                                parentRef[method].call(publicState);
                            }
                        });
                    }
                });
            methodHost = Object.getPrototypeOf(methodHost);
        }
        Object.seal(this._base);
    },
    
    _setConstructor: function() {
        if (!this._constructor) {
            if (this._parent) {
                this._constructor = function(args) {
                    var base = args[0];
                    base.apply(this, args.slice(1));
                };
            } else {
                this._constructor = function () {};
            }
        }
        return this._constructor;
    },

    _createInnerClass: function() {
        var constructor = this._setConstructor();
        var parent = this._parent;
        
        var variables = this._variables;
        var globalId = 0;
        this._innerClass = function () {
            var superFn = parent
                ? function () {
                    parent.apply(this, arguments);
                    assignNonPrivateVars.call(this, variables);
                }.bind(this)
                : null;
            var args = (superFn ? [superFn] : []).concat([].slice.call(arguments));
            
            // TODO: implement setting private variables and methods here
            this._id = globalId++;
            privateState[this._id] = Object.create(this);
            Object.assign(privateState[this._id], {
                _name: name,
                _thingsSaid: 0,
                _log: function(msg) {
                    console.log(this._name + ': ' + msg);
                }
                // TODO: set up setters for protected and public variables that set obj.__proto__ vars with the same data
                // undeclared variables are not allowed
                // variables cannot be removed
            });

            constructor.apply(this, args);
        };
    
        if (parent) {
            this._setBaseMethods();
            this._innerClass.prototype = Object.create(parent.prototype);
            // TODO: add methods and wrap them in private state calls
        }
    }
}));


/*

Animal
__isEndangered = true
showSummary() --> this.__isEndangered - OK

Pigeon extends Animal
__wingspan = 2 feet
reportStatus() --> __wingspan - OK; __isEndangered - error: cannot access its parent's private vars

*/


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

