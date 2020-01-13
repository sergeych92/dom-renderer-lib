import '../css/style.scss';

import { createUpdatableComponent } from './updatable-component/utils';

// const data = {
//     optionalColor: 'white',
//     mainColor: 'blue',
//     world: 'World',
//     spanner: true,
//     words: ['I', 'Love', 'JavaScript'],
//     onWordClick: e => {
//         e.preventDefault();
//         console.log('clicked');
//     }
// }

// let htmlStr = toUpdatableComponent(`
// <div class="brown {{optionalColor}} green {{mainColor}}" name="main *if=&quot;hi&quot;">
//     <div class="spanner" *if="spanner">
//         <span data-word="1">Hello</span>
//         <span data-word="2">{{world}}!</span>
//     </div>
//     <ul>
//         <li *for="let x of words">
//             <div>And the word is:</div>
//             <a href="#" (click)="onWordClick($event)">{{x}}</a>
//         </li>;
//     </ul>
// </div>`, data);


// let {parsers, root} = parseComponent(`
//     <div attr1="{{hi"
//         attr2="you}}"
//         class="brown {{'color' + optionalColor}} green {{'_' + mainColor + '_'}}"
//         name="main *if=&quot;hi&quot;"
//         id="what is this">
//             <div title="title <span id='not your typical attr'></span> string">
//                 Hello {{x + 1}} World
//             </div>
//             <input type="{{type}}">
//             <span id="my-id">
//     </div>`);
// const component = activateComponent(parsers, root);
// component.update(data);

const data = {
    word: 'World',
    x: 3,
    y: 4,
    color: 'yellowish-brown'
}
const component = createUpdatableComponent(`
<div title="hello {{word}}!" class="brown {{color}} yellow">
    <span>What is {{x}} + {{y}}?</span>
    It is {{ x + y }}.
</div>`);
component.update(data);

document.querySelector('.anchor').append(
    component.element
);



let classes = {
    secret: new WeakMap()
};

(function(common) {

    // ANIMAL
    function AnimalInternal() {
        this.__weight = 1;
    }

    AnimalInternal.MAX_WEIGHT_KG = 5;

    Object.assign(AnimalInternal.prototype, {
        run: function () {
            if (this.__weight > this.constructor.MAX_WEIGHT_KG) {
                console.log('Animal is too fat to move');
                return false;
            } else {
                console.log(`Animal is moving with a weight of ${this.__weight} kg`);
                return true;
            }
        },

        eat: function (kg) {
            console.log(`Animal has eaten ${kg} kg.`);
            this.__weight += this._gainWeight(kg);
            this.__validateWeight();
        },

        _gainWeight: function (kg) {
            return 0;
        },

        __validateWeight: function() {
            if (this.__weight < 0 || this.__weight > this.constructor.MAX_WEIGHT_KG * 2) {
                throw new RangeError(`The weight cannot be negative or exceed ${this.constructor.MAX_WEIGHT_KG} kg.`);
            }
        }
    });

    const secret = common.secret;
    function Animal() {
        secret.set(this, new this.internalConstructor());
    }

    Animal.MAX_WEIGHT_KG = AnimalInternal.MAX_WEIGHT_KG;

    Object.assign(Animal.prototype, {
        internalConstructor: AnimalInternal,
        run: function () {
            return secret.get(this).run();
        },
        eat: function (kg) {
            return secret.get(this).eat(kg);
        }
    });

    Object.assign(common, {
        Animal,
        AnimalInternal
    });
})(classes);





(function (common) {
    const {Animal, AnimalInternal} = common;

    // BIRD
    function BirdInternal() {
        AnimalInternal.call(this);
        this._wingspan = 1; // feet
    }
    Object.setPrototypeOf(BirdInternal, AnimalInternal);

    BirdInternal.MAX_WEIGHT_KG = 3;

    BirdInternal.prototype = Object.create(AnimalInternal.prototype);
    Object.assign(BirdInternal.prototype, {
        constructor: BirdInternal,

        run: function () {
            const moved = AnimalInternal.prototype.run.call(this);
            if (moved) {
                console.log(`Bird is flying with a wingspan of ${this._wingspan} feet`);
            }
            return moved;
        },

        _gainWeight: function (kg) {
            const newWeight = kg * 0.1;
            console.log(`Bird has gained ${newWeight} kg.`);
            return newWeight;
        }
    });


    const secret = common.secret;
    function Bird() {
        Animal.call(this);
    }
    Object.setPrototypeOf(Bird, Animal);
    Bird.prototype = Object.create(Animal.prototype);
    Object.assign(Bird.prototype, {
        constructor: Bird,
        internalConstructor: BirdInternal,
        run: function () {
            secret.get(this).run();
        }
    });

    Object.assign(common, {
        Bird,
        BirdInternal
    });
})(classes);






(function (common) {
    // TEST
    const {Bird} = common;
    const bird = new Bird();
    bird.run();

    bird.eat(30);
    bird.run();
})(classes);
