import { MATCHERS, EMPTY_CURLIES } from "./constants";
import { setDiff } from "./utils";
import { parseCurlie } from "./parse-curlie";

export class AttributeCurlieParser {
    get id() { return this._id; }
    get name() { return this._name; }

    constructor({name, value, id = null}) {
        this._name = name;
        this._value = value;
        this._id = id;
    }

    parse(element) {
        const {curlies, tagValues} = this._splitTagValue();
        const expressions = curlies.map(c => parseCurlie(c));

        let tagSetter;
        if (this._name === 'class') {
            tagSetter = this._createClassSetter(element, tagValues, expressions);
        } else { // apply generic setAttribute logic
            tagSetter = this._createGenericAttrSetter(element, tagValues, expressions);
        }
        // TODO: this._name === 'style'
        return tagSetter; // expression
    }

    _splitTagValue() {
        const curlies = [];
        const tagValues = this._value.replace(MATCHERS.TAG_CURLIES_INNER, (_, curlieContent) => {
            curlies.push(curlieContent);
            return EMPTY_CURLIES;
        }).split(new RegExp(EMPTY_CURLIES, 'g'));
        return {curlies, tagValues};
    }

    _createClassSetter(element, tagValues, expressions) {
        tagValues = tagValues.map(v => v.trim()); // classes cannot contain spaces
        element.classList.add(...tagValues);
        let prevClasses = new Set();
        return data => {
            const nextClasses = new Set(
                expressions.map(expr => expr(data)).filter(expr => !!expr).map(expr => String(expr).trim())
            );
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
                    return prev;
                }, []).join('');
                if (prevValue !== resultStr) {
                    element.setAttribute(this._name, resultStr);
                    prevValue = resultStr;
                }
            };
        }
    }
}
