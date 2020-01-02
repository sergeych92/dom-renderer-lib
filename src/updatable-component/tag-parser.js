export class TagParser {
    get id() { return this._id; }

    constructor({id, attributes}) {
        this._id = id;
        this._attributes = attributes;
    }

    parse(element) {
        const allNames = new Set(this._attributes.map(a => a.name));
        if (allNames.size !== this._attributes.length) {
            throw new Error(`Element ${element} has duplicate attributes.`);
        }
        const expressions = [];
        for (let attr of this._attributes) {
            expressions.push(attr.parse(element));
        }
        return data => {
            for (let expr of expressions) {
                expr(data);
            }
        };
    }
}
