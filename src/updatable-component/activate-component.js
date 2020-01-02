import { ID_MARKER } from "./constants";
import { UpdatableComponenet } from "./updatable-component";

export function activateComponent(parsers, rootElement) {
    const updaters = [];
    for (let parser of parsers) {
        const element = rootElement.querySelector(`[${ID_MARKER}="${parser.id}"]`);
        updaters.push(
            parser.parse(element)
        );
        if (element.hasAttribute(ID_MARKER)) {
            element.removeAttribute(ID_MARKER);
        }
    }
    return new UpdatableComponenet({rootElement, updaters});
}
