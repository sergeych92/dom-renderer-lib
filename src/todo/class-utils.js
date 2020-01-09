export function definePrivateVar(obj, prop, value) {
    if (Array.isArray(prop)) {
        for (let [key, value] of prop) {
            definePrivateVar(obj, key, value);
        }
    } else {
        Object.defineProperty(obj, prop, {
            value,
            writable: true,
            enumerable: true,
            configurable: false
        });
    }
}

export function defineConst(obj, prop, value) {
    if (Array.isArray(prop)) {
        for (let [key, value] of prop) {
            defineConst(obj, key, value);
        }
    } else {
        Object.defineProperty(obj, prop, {
            value,
            writable: false,
            enumerable: true,
            configurable: false
        });
    }
}
