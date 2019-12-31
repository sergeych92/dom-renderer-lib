import { ID_MARKER } from "./constants";
import { UpdatableComponenet } from "./updatable-component";

export function activateComponent(parsers, rootElement) {
    const expressions = [];
    for (let parser of parsers) {
        const element = rootElement.querySelector(`[${ID_MARKER}="${expr.id}"]`);
        expressions.push(
            parser.parse(element)
        );
    }
    return new UpdatableComponenet(expressions);
}
