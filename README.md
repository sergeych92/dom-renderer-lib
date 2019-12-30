A small library that lets you create components from html like this:

let c = createComponent(`<div name="name" title="Hello {{x + 1}}">some text</div>`);
c.update({x: 5});

Having done this, c becomes a component that can change its markup based on data supplied in subsequent calls to c.update.
