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
}

function saveDefinitions(defs, access) {
    Object.keys(defs || {}).forEach(function (key) {
        if (typeof defs[key] === 'function') {
            validateDeclaredName(this._methods, key, false);
            this._methods[access][key] = defs[key];
        } else {
            validateDeclaredName(this._variables, key, true);
            this._variables[access][key] = defs[key];
        }
    });
}

function createInnerClass() {
    var constructor = this._constructor;
    if (!constructor) {
        if (parent) {
            constructor = function(args) {
                var base = args[0];
                base.apply(this, args.slice(1));
            };
        } else {
            constructor = function () {};
        }
    }
    
    this._variables = {};
    var variables = this._variables;
    this.clazz = function () {
        const superFn = parent
            ? function () {
                parent.apply(this, arguments);
                // TODO: Assign all protected and public variables to this object
            }.bind(this)
            : null;
        const args = (superFn ? [superFn] : []).concat([].slice.call(arguments));
        
        constructor.apply(this, args);
    };

    if (parent) {
        this.clazz.prototype = Object.create(parent.prototype);
    }
}

Object.defineProperties(ClassBuilder.prototype, Object.getOwnPropertyDescriptors({
    private: function(defs) {
        saveDefinitions.call(this, defs, 'private');
    },
    protected: function(defs) {
        saveDefinitions.call(this, defs, 'protected');
    },
    public: function(defs) {
        saveDefinitions.call(this, defs, 'public');
    },
    build: function() {
        var innerClass = createInnerClass.call(this);

        return this.clazz;
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
