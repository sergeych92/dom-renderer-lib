import { ID_MARKER } from "./constants";

export function activateComponent(expressions, rootElement) {
    for (let expression of expressions) {
        const element = rootElement.querySelector(`[${ID_MARKER}="${expression.id}"]`);
    }
}
