export function definePrivateVar(obj, prop, value) {
    if (Array.isArray(prop)) {
        for (let [key, value] of prop) {
            definePrivateVar(obj, key, value);
        }
    } else {
        Object.defineProperty(obj, prop, {
            value,
            writable: true,
            enumerable: false,
            configurable: false
        });
    }
}

// If a property is a symbol or has any name that is not in the THIS_IS_VAR_56 format, then it's private
export function defineConst(obj, prop, value) {
    if (Array.isArray(prop)) {
        for (let [key, value] of prop) {
            defineConst(obj, key, value);
        }
    } else {
        const private = typeof prop === 'symbol' || !/^[A-Z0-9_]+$/.test(prop);
        Object.defineProperty(obj, prop, {
            value,
            writable: false,
            enumerable: private,
            configurable: false
        });
    }
}
