import '../css/style.scss';
import { parseComponent } from './updatable-component/parse-component';
import { activateComponent } from './updatable-component/activate-component';

const data = {
    optionalColor: 'white',
    mainColor: 'blue',
    world: 'World',
    spanner: true,
    words: ['I', 'Love', 'JavaScript'],
    onWordClick: e => {
        e.preventDefault();
        console.log('clicked');
    }
}

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

let {expressions, root} = parseComponent(`
    <div attr1="{{hi"
        attr2="you}}"
        class="brown {{'color' + optionalColor}} green {{'_' + mainColor + '_'}}"
        name="main *if=&quot;hi&quot;"
        id="what is this">
            <div title="title <span id='not your typical attr'></span> string">
                Hello {{x + 1}} World
            </div>
            <input type="{{type}}">
            <span id="my-id">
    </div>`);
const component = activateComponent(expressions, root);
