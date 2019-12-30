import { toDom } from "./utils";
import { MATCHERS, EXPRESSION_TYPES, ID_MARKER } from "./constants";

/* {{ }} is allowed in two places:
 * inside attributes <div title="Hello {{ponyName}}">
 * and inside tags <p>Hello {{ponyName}}</p>, 
 */

export function parseComponent(template) {
    let lastId = 1;
    const expressions = [];

    // Go though each opening tag (<div id="my-id" name="main">, <input type="text" />)
    const deOpeningTags = template.replace(MATCHERS.OPENING_TAG, openingTag => {
        if (openingTag.includes('"')) { // therefore, cannot be an inlined match like <div title="str <span></span>">
            // TODO: validate: no data-refid="" attributes
            // go through attributes and transform all curlies
            const tagExprs = [];
            const deAttributed = openingTag.replace(MATCHERS.ATTR_AND_VALUE, (_, name, value) => {
                tagExprs.push({
                    type: EXPRESSION_TYPES.ATTR,
                    name,
                    value, // contains "value1 {{value2 + 'smt'}} value3"
                    id: lastId
                });
                return ` ${ID_MARKER}="${lastId++}" `;
            });
            if (tagExprs.length) {
                if (tagExprs.length === 1) {
                    expressions.push(tagExprs[0]);
                } else {
                    expressions.push({
                        type: EXPRESSION_TYPES.MULTI,
                        expressions: tagExprs
                    });
                }
            }
            return deAttributed;
        } else {
            // validate that it doesn't allow any {{ }}
            if (openingTag.includes('{{') || openingTag.includes('}}')) {
                throw new SyntaxError(`{{ and }} are not allowed at this position: ${openingTag}`);
            }
            return openingTag;
        }
    });

    // Validate: <div>Ololo</div {{x + 1}}>
    const deClosingTags = deOpeningTags.replace(MATCHERS.CLOSING_TAG, closingTag => {
        // validate that it doesn't allow any {{ }}
        if (closingTag.includes('{{') || closingTag.includes('}}')) {
            throw new SyntaxError(`{{ and }} are not allowed at this position: ${closingTag}`);
        }
        return closingTag;
    });

    // Process: <div>title="yes {{hi}}"</div> -- not an attribute
    const deInnerTags = deClosingTags.replace(MATCHERS.TAG_CURLIES_INNER, (_, expression) => {
        expressions.push({
            type: EXPRESSION_TYPES.TAG,
            expression,
            id: lastId
        });
        return `<span ${ID_MARKER}="${lastId++}"></span>`;
    });

    return {
        expressions,
        root: toDom(deInnerTags)
    };
}
