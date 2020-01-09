import { defineConst } from "./class-utils";

let private = WeakMap();

function ToDoMessage({done, message}) {
    ToDoNote.call(this, done)
    private.set(this, {
        a: 23
    });
}

defineConst(ToDoMessage, 'MAX_LENGTH', 200);

Object.setPrototypeOf(ToDoMessage, ToDoNote);


ToDoMessage.prototype = Object.create(ToDoNote.prototype, {
    ...Object.getOwnPropertyDescriptors({
        // Simple properties with default descriptor settings
        constructor: ToDoMessage,
        showA: function() {
            const a = private.get(this).a;
            console.log(a);
        },
        updateA: function(v) {
            private.get(this).a = v;
        }
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
        configurable: false,
        enumerable: true
    }
});
