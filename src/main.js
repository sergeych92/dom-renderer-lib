import '../css/style.scss';

import { createUpdatableComponent } from './updatable-component/utils';
import { ClassBuilder } from './animals/class-builder';

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


// var Animal = ClassBuilder({
//     constructor: function (favoriteFood) {
//         this.__favoriteFood = favoriteFood;
//     }
// }).private({
//     __favoriteFood: null,
//     _log: function(msg) {
//         console.log(msg);
//     }
// }).protected({
//     _updateCount: function () {
//         // Do nothing.
//     }
// }).public({
//     legs: 2,
//     saySomething: function () {
//         this._log('This is an animal with ' + this.legs + ' legs, whose favorite food is ' + this.__favoriteFood);
//         this.legs++;
//         this.__favoriteFood += '. Yammy!';
//         this._updateCount();
//     }
// }).build();
// // const animal = new Animal('sunflower seeds');
// // animal.saySomething();
// // animal.saySomething();


// var Pigeon = ClassBuilder({
//     parent: Animal,
//     constructor: function (base, favoriteFood, age) {
//         base(favoriteFood);
//         this.__age = age;
//     }
// }).private({
//     __age: 1,
//     __count: 0
// }).protected({
//     _updateCount: function () {
//         this.__count++;
//         console.log('Count is ' + this.__count);
//     }
// }).public(function (base) {
//     return {
//         status: 'not endangered',
//         saySomething: function() {
//             base.saySomething.call(this);
//             console.log('And the pigeon is ' + this.__age + ' years old.');
//         }
//     };
// }).build();

// const pigeon = new Pigeon('sunflower seeds', 5);
// pigeon.saySomething();
// pigeon.saySomething();




var Animal = ClassBuilder({
    constructor: function (name) {
        this.__name = name;
    }
}).private({
    __name: null
}).protected({
    _whatAreYou: function () {
        return `I am an animal named ${this.__name}`;
    }
}).build();


var Bird = ClassBuilder({
    parent: Animal,
    constructor: function (base, name, wingspan) {
        base(name)
        this.__wingspan = wingspan;
    }
}).private({
    __wingspan: null
}).protected(function (base) {
    return {
        _whatAreYou: function () {
            const descr = base._whatAreYou.call(this);
            return `${descr}\nI am a bird with a wingspan of ${this.__wingspan} inches.`;
        }
    };
}).build();


var Sparrow = ClassBuilder({
    parent: Bird,
    constructor: function (base, name, wingspan, weight) {
        base(name, wingspan)
        this.__weight = weight;
    }
}).private({
    __weight: null
}).protected(function (base) {
    return {
        _whatAreYou: function () {
            const descr = base._whatAreYou.call(this);
            return `${descr}\nI am a sparrow with a weight of ${this.__weight} ounces.`;
        }
    };
}).public({
    introduceYourself: function () {
        const descr = this._whatAreYou();
        console.log('Description: ' + descr);
    }
}).build();


const sparrow = new Sparrow('Chirik', 7, 2.2);
sparrow.introduceYourself();
