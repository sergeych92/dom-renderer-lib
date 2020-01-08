// class ToDoNote {}

// class ToDoMessage extends Note {}

// class ToDoPicture extends Note {}


// class NoteList {}



// CLASS ToDoNote
function ToDoNote(done) {
    this._done = done;
}

ToDoNote.MAX_LENGTH = 100;

ToDoNote.PROHIBITED_WORDS = new Set(['tomorrow', 'optional', 'postpone', 'unnecessary', 'later', 'todo']);


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




// CLASS ToDoMessage
function ToDoMessage({done, message}) {
    ToDoNote.call(this, done)
    this._message = message;
}

Object.defineProperty(ToDoMessage, 'MAX_LENGTH', { value: 200, writable: false, enumerable: true, configurable: false});

Object.setPrototypeOf(ToDoMessage, ToDoNote);

ToDoMessage.prototype = Object.create(ToDoNote.prototype, {
    ...Object.getOwnPropertyDescriptors({
        // Simple properties with default descriptor settings
        constructor: ToDoMessage
    }),

    // Properties with non-default descriptor (especially getters and setters)
    message: {
        get: () => this._message,
        set: function (v) {
            this._message = v ? v.toString() : '';
            if (v) {
                if (v.length > this.constructor.MAX_LENGTH) {
                    throw new RangeError(`The length of messages cannot exceed ${this.constructor.MAX_LENGTH}`);
                }
                const {hasWords, words} = this.constructor.hasProhibitedWords(v, ['remind']);
                if (hasWords) {
                    throw new Error(`Certain words are not allowed. These words have failed the test: ${words.join(', ')}`);
                }
            }
            this._message = (v || '').trim();
        },
        writable: true,
        configurable: true,
        enumerable: true
    }
});

function ToDoPicture({done, name}) {
    ToDoNote.call(this, done);
    this._name = name;
}
