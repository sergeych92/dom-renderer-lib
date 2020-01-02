import { parseCurlie } from "./parse-curlie";
import { escapeHtml } from "./utils";

export class StandaloneParser {
    get id() { return this._id; }

    constructor({id, curlie}) {
        this._id = id;
        this._curlie = curlie;
    }

    parse(element) {
        const expr = parseCurlie(this._curlie);

        let prevElement = element;
        let prevValue = null;
        return data => {
            const nextValue = escapeHtml(expr(data));
            if (prevValue !== nextValue) {
                const nextElement = document.createTextNode(nextValue);
                prevElement.replaceWith(nextElement);
                prevElement = nextElement;
            }
        };
    }
}
