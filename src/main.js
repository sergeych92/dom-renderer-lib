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


(function() {
    const secret = new WeakMap();

    function WordCounter() {
        secret.set(this, {
            textStr: '',
            wordList: new Map(),
            splitStr: (str) => {
                return str.split(/[\s\W]+/).filter(s => !!s);
            },
            calcWordFrequencies: (wordList) => {
                const counts = new Map();
                for (let word of wordList) {
                    if (counts.has(word)) {
                        counts.set(word, counts.get(word) + 1);
                    } else {
                        counts.set(word, 1);
                    }
                }
                return counts;
            }
        });
    }

    Object.defineProperties(WordCounter.prototype, {
        [Symbol.iterator]: {
            value: function* () {
                for (let [key] of secret.get(this).wordList) {
                    yield key;
                }
            }
        },
        textStr: {
            get: function () {
                return secret.get(this).textStr;
            },
            set: function(str) {
                if (str) {
                    const self = secret.get(this);
                    if (self.textStr !== str) {
                        self.textStr = str;
                        const list = self.splitStr(str);
                        self.wordList = self.calcWordFrequencies(list);
                    }
                } else {
                    str = '';
                }
            },
            enumerable: true
        },
        getWordFrequency: {
            value: function (word) {
                return secret.get(this).wordList.get(word);
            }
        }
    });

    let counter = new WordCounter();
    counter.textStr = 'Hello there. Hey, are you there? Maria, are you allright?!';
    console.log(`String: "${counter.textStr}"`);
    for (let word of counter) {
        console.log(`Word: "${word}", frequency: ${counter.getWordFrequency(word)}`);
    }
})();
