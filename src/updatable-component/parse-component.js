import { toDom } from "./utils";
import { MATCHERS, ID_MARKER } from "./constants";
import { AttributeCurlieParser } from "./attribute-curlie-parser";
import { TagParser } from "./tag-parser";
import { StandaloneParser } from "./standalone-parser";

/* {{ }} is allowed in two places:
 * inside attributes <div title="Hello {{ponyName}}">
 * and inside tags <p>Hello {{ponyName}}</p>, 
 */

export function parseComponent(template) {
    let lastId = 1;
    const parsers = [];

    // Go though each opening tag (<div id="my-id" name="main">, <input type="text" />)
    const deOpeningTags = template.replace(MATCHERS.OPENING_TAG, openingTag => {
        if (openingTag.includes('"')) { // therefore, cannot be an inlined match like <div title="str <span></span>">
            // TODO: validate: no data-refid="" attributes
            // go through attributes and transform all curlies
            const tagExprs = [];
            let tagId = null;
            const deAttributed = openingTag.replace(MATCHERS.ATTR_AND_CURLIE_VALUE, (_, name, value) => {
                tagExprs.push({
                    name,
                    value // contains "value1 {{value2 + 'smt'}} value3"
                });
                tagId = lastId++;
                return tagExprs.length === 1 ? ` ${ID_MARKER}="${tagId}" ` : '';
            });
            if (tagExprs.length) {
                if (tagExprs.length === 1) {
                    parsers.push(new AttributeCurlieParser({
                        ...tagExprs[0], id: tagId
                    }));
                } else {
                    parsers.push(new TagParser({
                        id: tagId,
                        attributes: tagExprs.map(e => new AttributeCurlieParser(e))
                    }));
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
        parsers.push(new StandaloneParser({
            id: lastId,
            expression
        }));
        return `<span ${ID_MARKER}="${lastId++}"></span>`;
    });

    return {
        parsers,
        root: toDom(deInnerTags)
    };
}
