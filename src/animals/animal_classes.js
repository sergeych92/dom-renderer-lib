// PROTECTED VARIABLES
(function () {
    //                  ANIMAL
    //                  [MAX_WEIGHT] - protected
    //                  [Speed] - protected
    //                  (Move) - public
    //                  [Weight] - private
    //                  (GainWeight) - protected
    //                  (Eat) - public
    
    // Bird                                 Mammal
    // (Move)-fly                           (Move)-walk
    // [wingSpan] - protected               [earLength] - protected

    // Sparrow                              Rabbit
    // (Move) - Chirik, Fly +30             (Move) - Squeak, Jump +3
    // -- too fat to fly                    can't run

    class Animal {
        static MAX_WEIGHT_KG = 5;
        _speed = 0;
        #weight = this.defaultWeight;

        get defaultWeight() { return 0; }

        move() {
            if (this.#weight > Animal.MAX_WEIGHT_KG) {
                console.log('Too fat to move!');
                return false;
            } else {
                console.log('Animal moving');
                return true;
            }
        }
        eat(kg) {
            console.log('Animal eating');
            this.#weight += this._gainWeight(kg);
        }
        _gainWeight(kg) {
            console.log('Animal has gained 0 kg.');
            return 0;
        }
    }



    class Bird extends Animal {
        _wingSpanFeet = 2;
        _speed = 25;

        move() {
            const moved = super.move();
            if (moved) {
                console.log(`Bird flying`);
            }
            return moved;
        }

        _gainWeight(kg) {
            const newWeight = kg * 0.1;
            console.log(`Bird has gained ${newWeight} kg.`);
            return newWeight;
        }
    }

    class Sparrow extends Bird {
        get defaultWeight() { return 1; }

        move() {
            const moved = super.move();
            if (moved) {
                console.log(`Sparrow is flying at ${this._speed} km/h with a wingspan of ${this._wingSpanFeet} feet.`);
            }
            return moved;
        }
    }



    class Mammal extends Animal {
        _earLengthInches = 2;
        _speed = 10;

        move() {
            const moved = super.move();
            if (moved) {
                console.log(`Mammal walking.`);
            }
            return moved;
        }

        _gainWeight(kg) {
            const newWeight = kg * 0.5;
            console.log(`Mammal has gained ${newWeight} kg.`);
            return newWeight;
        }
    }

    class Rabbit extends Mammal {
        get defaultWeight() { return 3; }
        move() {
            const moved = super.move();
            if (moved) {
                console.log(`Rabbit is hopping at ${this._speed} km/h with an earlength of ${this._earLengthInches} inches.`);
            }
            return moved;
        }
    }

    


    // let sparrow = new Sparrow();
    // sparrow.move();

    // sparrow.eat(45);
    // sparrow.move();
})();
