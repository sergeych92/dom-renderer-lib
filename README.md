A small library that lets you create components from html like this:

```
let c = createComponent(`<div name="name" title="Hello {{x + 1}}">some text</div>`);
c.update({x: 5});
```

Having done this, c becomes a component that can change its markup based on data supplied in subsequent calls to c.update.


There is also a ClassBuilder that allows to create classes with full support for private, protected, and public data and methods, while also allowing inheritance. An example:

```
var Animal = ClassBuilder({
    constructor: function (favoriteFood) {
        this.__favoriteFood = favoriteFood;
    }
}).private({
    __favoriteFood: null,
    _log: function(msg) {
        console.log(msg);
    }
}).protected({
    _updateCount: function () {
        // Do nothing.
    }
}).public({
    legs: 2,
    saySomething: function () {
        this._log('This is an animal with ' + this.legs + ' legs, whose favorite food is ' + this.__favoriteFood);
        this.legs++;
        this.__favoriteFood += '. Yammy!';
        this._updateCount();
    }
}).build();

var Pigeon = ClassBuilder({
    parent: Animal,
    constructor: function (base, favoriteFood, age) {
        base(favoriteFood);
        this.__age = age;
    }
}).private({
    __age: 1,
    __count: 0
}).protected({
    _updateCount: function () {
        this.__count++;
        console.log('Count is ' + this.__count);
    }
}).public(function (base) {
    return {
        status: 'not endangered',
        saySomething: function() {
            base.saySomething.call(this);
            console.log('And the pigeon is ' + this.__age + ' years old.');
        }
    };
}).build();

const pigeon = new Pigeon('sunflower seeds', 5);
pigeon.saySomething();
pigeon.saySomething();
```
