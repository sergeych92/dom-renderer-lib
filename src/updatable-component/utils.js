import { activateComponent } from "./activate-component";
import { parseComponent } from "./parse-component";

export function toDom(html) {
    var template = document.createElement('template');
    html = html.trim(); // avoid returning the space as firstChild later
    template.innerHTML = html;
    return template.content;
}

export function escapeHtml(str = '') {
    return String(str).replace(/"/g, '&quot;');
}

// a = Set(1,2,3); b = Set(2,3,4); a - b == [1]
export function setDiff(a, b) {
    return [...a].filter(v => !b.has(v));
}

export function createUpdatableComponent(htmlStr) {
    const {parsers, root} = parseComponent(htmlStr);
    return activateComponent(parsers, root);
}
