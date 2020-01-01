export function toDom(html) {
    var template = document.createElement('template');
    html = html.trim(); // avoid return the space as firstChild later
    template.innerHTML = html;
    return template.content.firstChild;
}

export function escapeHtml() {
    var pre = document.createElement('pre');
    var text = document.createTextNode(string)
        .replace(/"/g, '&quot;');
    pre.appendChild(text);
    return pre.innerHTML;
}

// a = Set(1,2,3); b = Set(2,3,4); a - b == [1]
export function setDiff(a, b) {
    return [...a].filter(v => !b.has(v));
}