import { MATCHERS, EMPTY_CURLIES, PROHIBITED_VARIABLE_NAMES, DYNAMIC_VAR_NAME } from "./constants";

export class AttributeCurlieParser {
    get id() { return this._id; }

    constructor({name, value, id = null}) {
        this._name = name;
        this._value = value;
        this._id = id;
    }

    parse(element) {
        const curlies = [];
        const tagValueArr = this._value.replace(MATCHERS.TAG_CURLIES_INNER, (_, curlieContent) => {
            curlies.push(curlieContent);
            return EMPTY_CURLIES;
        }).split(new RegExp(EMPTY_CURLIES, 'g'));

        const expressions = curlies.map(c => {
            let match = null;
            // Actually, js names are fairly complex: https://stackoverflow.com/questions/1661197/what-characters-are-valid-for-javascript-variable-names
            if (match = /^\s*([\w-]+)\s*$/.exec(c)) { // simple variable "word"
                const variable = match[1];
                return data => data[variable];
            } else {
                const variables = [...c.matchAll(/[\w-]+/g)].map(m => m[0]);
                if (variables.some(name => PROHIBITED_VARIABLE_NAMES.includes(name))) {
                    throw new SyntaxError('{{}} are not allowed to contain any js other than simple expressions');
                }
                // TODO: go a step further and only allow a set of whitelisted characters like +, -, (, ), !, &&
                return new Function(DYNAMIC_VAR_NAME, `
                    const {${variables.join(',')}} = ${DYNAMIC_VAR_NAME};
                    return ${c};
                `);
            }
            // TODO: identify a?.b?.c and replace this construct with safe variable access
            // allow pipes like {{ a | number:}} ?
        });

        return data => {
            // for each of the possible tags like data-abc, id, name, class, etc
            // create a setter that updates its value from expressions
        }; // expression
    }
}
