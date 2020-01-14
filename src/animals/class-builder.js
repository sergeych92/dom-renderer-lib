export function ClassBuilder() {
    this.clazz = function F() {};
}

// Object.assign(ClassBuilder.prototype, {

// });

Object.defineProperties(ClassBuilder.prototype, Object.getOwnPropertyDescriptors({
    inherits: function(className) {

        return this;
    }
}));


var Bird = ClassBuilder({
    name: 'Bird',
    parent: Animal,
    constructor: function (base, favoriteFood) {
        base();
        this._wingspanFt = 1.4;
        this.__favoriteFood = favoriteFood;
    }
})
.static({
    MAX_WEIGHT_KG: 5
})
.private({
    __weight: 2.8,
    __validateWeight: function() {
        if (this.__weight < 0 || this.__weight > this.constructor.MAX_WEIGHT_KG * 2) {
            throw new RangeError(`The weight cannot be negative or exceed ${this.constructor.MAX_WEIGHT_KG} kg.`);
        }
    }
})
.protected({
    _gainWeight: function (kg) {
        const newWeight = kg * 0.1;
        console.log(`Bird has gained ${newWeight} kg.`);
        return newWeight;
    }
})
.public(function (base) {
    return {
        run: function (one, two) {
            const moved = base.run.call(this, one, two);
            if (moved) {
                console.log(`Bird is flying with a wingspan of ${this._wingspan} feet`);
            }
            return moved;
        },
        eat: function (kg) {
            console.log(`Animal has eaten ${kg} kg.`);
            this.__weight += this._gainWeight(kg);
            this.__validateWeight();
        },
        $get_favoriteFood: function () {
            return this.__favoriteFood;
        },
        $set_favariteFood: function(value) {
            this.__favoriteFood = food;
        }
    }
})
.build();