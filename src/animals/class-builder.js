function validateClassName(name) {
    if (!name || !/^[A-Z]\w*$/.test(name)) {
        throw new TypeError('Class name must start with a capital letter and be followed by alphanumeric symbols or _');
    }
}

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

    validateClassName(params.name);
    validateParent(params.parent);
    validateConstructor(params.constructor);

    if (!this || Object.getPrototypeOf(this) !== ClassBuilder.prototype) {
        return new ClassBuilder(params);
    }

    this._params = params;

    var constructor = this._params.constructor;
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
    this._params.constructor = constructor;
}

Object.defineProperties(ClassBuilder.prototype, Object.getOwnPropertyDescriptors({
    build: function() {
        var name = this._params.name;
        var parent = this._params.parent;
        var constructor = this._params.constructor;
        var obj = {};

        obj[name] = function () { // assign to obj[name] in order to force the function to have the given name
            const superFn = parent
                ? function () {
                    parent.apply(this, arguments);
                    // TODO: assign all of the variables here
                }.bind(this)
                : null;
            const args = (superFn ? [superFn] : []).concat([].slice.call(arguments));
            
            constructor.apply(this, args);
        };

        if (parent) {
            obj[name].prototype = Object.create(parent.prototype);
        }
        return obj[name];
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