// PRIVATE VARIABLES
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

    // let counter = new WordCounter();
    // counter.textStr = 'Hello there. Hey, are you there? Maria, are you allright?!';
    // console.log(`String: "${counter.textStr}"`);
    // for (let word of counter) {
    //     console.log(`Word: "${word}", frequency: ${counter.getWordFrequency(word)}`);
    // }
})();