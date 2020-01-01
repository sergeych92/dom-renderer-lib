import { MATCHERS, EMPTY_CURLIES, PROHIBITED_VARIABLE_NAMES, DYNAMIC_VAR_NAME, JS_VARNAME_MATCHER } from "./constants";
import { setDiff } from "./utils";

export class AttributeCurlieParser {
    get id() { return this._id; }

    constructor({name, value, id = null}) {
        this._name = name;
        this._value = value;
        this._id = id;
    }

    parse(element) {
        const {curlies, tagValues} = this._splitTagValue(element);
        const expressions = this._generateExpressions(element, curlies);

        let tagSetter;
        if (this._name === 'class') {
            tagSetter = this._createClassSetter(element, tagValues, expressions);
        } else { // apply generic setAttribute logic
            tagSetter = this._createGenericAttrSetter(element, tagValues, expressions);
        }
        return tagSetter; // expression
    }

    _splitTagValue(element) {
        const curlies = [];
        const tagValues = this._value.replace(MATCHERS.TAG_CURLIES_INNER, (_, curlieContent) => {
            curlies.push(curlieContent);
            return EMPTY_CURLIES;
        }).split(new RegExp(EMPTY_CURLIES, 'g'));
        return {curlies, tagValues};
    }

    // element - Dom element; curlies - the abc of {{abc}} as text
    _generateExpressions(element, curlies) {
        return curlies.map(c => {
            let match = null;
            // Actually, js names are fairly complex: https://stackoverflow.com/questions/1661197/what-characters-are-valid-for-javascript-variable-names
            if (match = JS_VARNAME_MATCHER.exec(c)) { // simple variable "word"
                const variable = match[1];
                return data => data[variable];
            } else {
                const variables = [...c.matchAll(/[\w-]+/g)].map(m => m[0]);
                // TODO: go a step further and only allow a set of whitelisted characters like +, -, (, ), !, &&
                if (variables.some(name => PROHIBITED_VARIABLE_NAMES.includes(name))) {
                    throw new SyntaxError('{{}} are not allowed to contain any js other than simple expressions');
                }
                // TODO: could supply the model as a second parameter to this parse function and then provide the dynamic
                // function with model.keys
                let expr = new Function(...variables, `'use strict'; return ${c};`);
                return data => {
                    try {
                        return expr.apply(data, variables.map(v => data[v]));
                    } catch (err) {
                        throw new Error(`Expression "${c}" threw an error: ${err}`);
                    }
                }
            }
            // TODO: identify a?.b?.c and replace this construct with safe variable access
            // allow pipes like {{ a | number:}} ?
        });
    }

    _createClassSetter(element, tagValues, expressions) {
        element.classList.add(...tagValues);
        let prevClasses = new Set();
        return data => {
            const nextClasses = new Set(expressions.map(expr => expr(data)));
            const addClasses = setDiff(nextClasses, prevClasses);
            const deleteClasses = setDiff(prevClasses, nextClasses);
            prevClasses = nextClasses;
            for (let clazz of addClasses) {
                element.classList.add(clazz);
            }
            for (let clazz of deleteClasses) {
                element.classList.remove(clazz);
            }
        }
    }

    _createGenericAttrSetter(element, tagValues, expressions) {
        element.setAttribute(this._name, '');
        let prevValue = null;
        if (tagValues.length === 2 && tagValues[0] === '' && tagValues[1] === '') { // attr="{{word}}"
            return data => {
                const resultStr = expressions[0](data);
                if (prevValue !== resultStr) {
                    element.setAttribute(this._name, resultStr);
                    prevValue = resultStr;
                }
            };
        } else { // attr="Hello {{word}} there"
            return data => {
                const fillValues = expressions.map(expr => expr(data));
                const resultStr = tagValues.reduce((prev, curr, index) => {
                    prev.push(curr);
                    if (index < fillValues.length) {
                        prev.push(fillValues[index]);
                    }
                }, []).join('');
                if (prevValue !== resultStr) {
                    element.setAttribute(this._name, resultStr);
                    prevValue = resultStr;
                }
            };
        }
    }
}
