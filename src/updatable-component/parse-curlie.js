import { JS_VARNAME_MATCHER, PROHIBITED_VARIABLE_NAMES } from "./constants";

// Curlie == the abc of {{abc}}, as text
export function parseCurlie(curlie) {
    let match = null;
    // Actually, js names are fairly complex: https://stackoverflow.com/questions/1661197/what-characters-are-valid-for-javascript-variable-names
    if (match = JS_VARNAME_MATCHER.exec(curlie)) { // simple variable "word"
        const variable = match[1];
        return data => data[variable];
    } else {
        const variables = [...curlie.matchAll(/[\w-]+/g)].map(m => m[0]);
        // TODO: go a step further and only allow a set of whitelisted characters like +, -, (, ), !, &&
        if (variables.some(name => PROHIBITED_VARIABLE_NAMES.includes(name))) {
            throw new SyntaxError('{{}} are not allowed to contain any js other than simple expressions');
        }
        // TODO: could supply the model as a second parameter to this parse function and then provide the dynamic
        // function with model.keys
        const expr = new Function(...variables, `'use strict'; return ${curlie};`);
        return data => {
            try {
                return expr.apply(data, variables.map(v => data[v]));
            } catch (err) {
                throw new Error(`Expression "${curlie}" threw an error: ${err}`);
            }
        }
    }
    // TODO: identify a?.b?.c and replace this construct with safe variable access
    // allow pipes like {{ a | number:}} ?
}
