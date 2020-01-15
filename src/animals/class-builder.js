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


export function ClassBuilder(params) {
    'use strict';

    if (!params) {
        throw new TypeError('class builder must be created with parameters');
    }

    var parent = params.parent;
    var constructor = params.constructor;

    validateParent(parent);
    validateConstructor(constructor);

    if (!this || Object.getPrototypeOf(this) !== ClassBuilder.prototype) {
        return new ClassBuilder(params);
    }

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
                // Assign all of the variables
                for (var v in variables) {
                    if (variables.hasOwnProperty(v)) {
                        this[v] = variables[v];
                    }
                }
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
    build: function() {
        return this.clazz;
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
//         $get_favoriteFood: function () {
//             return this.__favoriteFood;
//         },
//         $set_favariteFood: function(value) {
//             this.__favoriteFood = food;
//         }
//     }
// })
// .build();