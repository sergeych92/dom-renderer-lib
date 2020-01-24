var ID_REF_VAR = '_id';

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
    const entityName = isVar ? 'variable' : 'method';
    if (accessObj.private.hasOwnProperty(name)
        || accessObj.protected.hasOwnProperty(name)
        || accessObj.public.hasOwnProperty(name)) {
            throw new TypeError('A ' + entityName + ' with the name ' + name + ' has already been declared.');
        }
    if (ID_REF_VAR === name) {
        throw new TypeError(ID_REF_VAR + ' is used for internal purposes and it is not allowed as a ' + entityName + '.');
    }
}

function assignVars(target, vars) {
    Object.keys(vars).forEach(function (name) {
        Object.defineProperty(target, name, {
            value: vars[name],
            writable: true,
            enumerable: true
        });
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
    Object.keys(target)
        .filter(function (method) { return typeof target[method] === 'function'; })
        .forEach(function (method) { cb(method, target[method])});
}

function assignMethods(target, methods, privateState) {
    forEachOwnMethod(methods, function (name, fn) {
        Object.defineProperty(target, name, {
            value: function () {
                fn.apply(privateState[this[ID_REF_VAR]], arguments);
            }
        });
    });
}


export function ClassBuilder(params) {
    'use strict';

    if (!params) {
        throw new TypeError('class builder must be created with parameters');
    }
    if (!this || Object.getPrototypeOf(this) !== ClassBuilder.prototype) {
        return new ClassBuilder(params);
    }

    this._parent = params.parent;
    this._constructor = params.constructor;

    validateParent(this._parent);
    validateConstructor(this._constructor);

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
        var innerClass = this._createInnerClass();
        // TODO: hide protected variables and methods
        return innerClass;
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
        var parentRef = this.parent.prototype;
        var methodHost = parentRef;
        while (methodHost !== Object.prototype) {
            forEachOwnMethod(methodHost, function (name) {
                if (!this._base.hasOwnProperty(name)) { // Base class and its subclass can have the same method
                    Object.defineProperty(this._base, name, {
                        value: function () {
                            var publicState = Object.getPrototypeOf(this);
                            parentRef[name].call(publicState);
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
        var methods = this._methods;
        var globalId = 0;
        var privateState = {};
        var innerClass = function () {
            var superFn = parent
                ? function () {
                    parent.apply(this, arguments);
                    assignVars(this, variables.protected);
                    assignVars(this, variables.public);
                }.bind(this)
                : null;
            var args = (superFn ? [superFn] : []).concat([].slice.call(arguments));
            
            Object.defineProperty(this, ID_REF_VAR, { value: globalId++ });
            privateState[this[ID_REF_VAR]] = Object.create(this);
            var privateThis = privateState[this[ID_REF_VAR]];
            assignVars(privateThis, variables.private);
            assignSeeThroughVars(privateThis, variables.protected);
            assignSeeThroughVars(privateThis, variables.public);
            assignMethods(privateThis, methods.private, privateState);

            constructor.apply(this, args);
        };

        assignMethods(innerClass.prototype, methods.protected, privateState);
        assignMethods(innerClass.prototype, methods.public, privateState);
    
        if (parent) {
            this._setBaseMethods();
            innerClass.prototype = Object.create(parent.prototype);
        }

        Object.preventExtensions(innerClass);
        return innerClass;
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

