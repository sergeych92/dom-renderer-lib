import { defineConst } from "./class-utils";

function ToDoNote(done) {
    this._done = done;
}

ToDoNote.PROHIBITED_WORDS = new Set(['tomorrow', 'optional', 'postpone', 'unnecessary', 'later', 'todo']);
ToDoNote.MAX_LENGTH = 100;

defineConst(ToDoNote, [
    ['PROHIBITED_WORDS', new Set(['tomorrow', 'optional', 'postpone', 'unnecessary', 'later', 'todo'])],
    ['MAX_LENGTH', 100]
]);

ToDoNote.hasProhibitedWords = function (message, prohibitedWords = []) {
    const wordList = (message || '').split(/\s/g);
    const customWords = new Set(prohibitedWords || []);
    const failedWords = wordList.filter(word => {
        const lowercased = word.toLowerCase();
        return ToDoNote.PROHIBITED_WORDS.has(lowercased) || customWords.has(lowercased);
    });
    return {
        hasWords: failedWords.length > 0,
        words: failedWords
    };
}

ToDoNote.prototype = {
    constructor: ToDoNote,
    
    setFinished() {
        this._done = true;
    },

    setOpen() {
        this._done = false;
    },

    toggle() {
        this._done = !this._done;
    }
};
