export function classBuilder() {

}


var Bird = classBuilder('Bird')
    .inherits(Animal)
    .static({
        MAX_WEIGHT_KG: 5
    })
    .private({
        __weight: 23,
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
        }
    });