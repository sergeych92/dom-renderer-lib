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


var Animal = ClassBuilder({
    constructor: function (favoriteFood) {
        this.__favoriteFood = favoriteFood;
    }
}).private({
    __favoriteFood: null,
    _log: function(msg) {
        console.log(msg);
    }
})
.public({
    legs: 2,
    saySomething: function () {
        this._log('This is an animal with ' + this.legs + ' legs, whose favorite food is ' + this.__favoriteFood);
        this.legs++;
        this.__favoriteFood += '. Yammy!';
    }
}).build();
// const animal = new Animal('sunflower seeds');
// animal.saySomething();
// animal.saySomething();


var Pigeon = ClassBuilder({
    parent: Animal,
    constructor: function (base, favoriteFood, age) {
        base(favoriteFood);
        this.__age = age;
    }
}).private({
    __age: 1
}).public(function (base) {
    return {
        status: 'not endangered',
        saySomething: function() {
            base.saySomething.call(this);
            console.log('And the pigeon is ' + this.__age + ' years old.');
        }
    };
}).build();

const pigeon = new Pigeon('sunflower seeds', 5);
pigeon.saySomething();