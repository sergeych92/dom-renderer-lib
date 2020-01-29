import { ClassBuilder } from './class-builder';

test('create simple class', () => {
    var Animal = ClassBuilder({
        constructor: function (favoriteFood) {
            this.legs = 4; // is a public variable
            this.__favoriteFood = favoriteFood; // is declared privately
        }
    }).public({
        legs: null
    }).build();

    expect(Animal).toBeTruthy();
    expect(typeof Animal).toEqual('function');
    expect(Animal.prototype instanceof Object).toEqual(true);


    const animal = new Animal('sunflower seeds');
    expect(animal).toBeTruthy();
    expect(animal.legs).toEqual(4);
    expect(animal.__favoriteFood).toBeUndefined();
});

test('check method visibility', () => {
    var Animal = ClassBuilder({
        constructor: function (favoriteFood) {
            this.__setFavoriteFood(favoriteFood);
        }
    }).private({
        __favoriteFood: null,
        __setFavoriteFood: function(v) {
            this.__favoriteFood = `[_${v}_]`;
        }
    }).protected({
        _thingsSaid: 0,
        _increaseSaidCount: function() {
            return ++this._thingsSaid;
        }
    }).public({
        legs: 4,
        saySomething: function (loudly) {
            const msg = `Animal with ${this.legs} legs whose favorite food is ${this.__favoriteFood}`;
            return {
                loudly,
                legs: this.legs,
                favoriteFood: this.__favoriteFood,
                msg: loudly ? msg.toUpperCase() : msg,
                saidTimes: this._increaseSaidCount()
            };
        }
    }).build();

    expect(Animal).toBeTruthy();

    const animal = new Animal('sunflower seeds');
    expect(animal).toBeTruthy();

    expect(animal.saySomething).toBeDefined();

    expect(animal._increaseSaidCount).toBeUndefined();
    expect(animal._thingsSaid).toBeUndefined();
    expect(animal.__favoriteFood).toBeUndefined();
    expect(animal.__setFavoriteFood).toBeUndefined();

    const response = animal.saySomething(true);
    expect(response).toEqual({
        loudly: true,
        legs: 4,
        favoriteFood: '[_sunflower seeds_]',
        msg: 'Animal with 4 legs whose favorite food is [_sunflower seeds_]'.toUpperCase(),
        saidTimes: 1
    });

    expect(animal._increaseSaidCount).toBeUndefined();
    expect(animal._thingsSaid).toBeUndefined();
    expect(animal.__favoriteFood).toBeUndefined();
    expect(animal.__setFavoriteFood).toBeUndefined();
});

test('basic inheritance with protected methods across 3 classes', () => {
    var Animal = ClassBuilder({
        constructor: function (name) {
            this.__name = name;
        }
    }).private({
        __name: null
    }).protected({
        _whatAreYou: function () {
            return `I am an animal named ${this.__name}`;
        }
    }).build();
    
    
    var Bird = ClassBuilder({
        parent: Animal,
        constructor: function (base, name, wingspan) {
            base(name)
            this.__wingspan = wingspan;
        }
    }).private({
        __wingspan: null
    }).protected(function (base) {
        return {
            _whatAreYou: function () {
                const descr = base._whatAreYou.call(this);
                return `${descr}. I am a bird with a wingspan of ${this.__wingspan} inches.`;
            }
        };
    }).build();
    
    
    var Sparrow = ClassBuilder({
        parent: Bird,
        constructor: function (base, name, wingspan, weight) {
            base(name, wingspan)
            this.__weight = weight;
        }
    }).private({
        __weight: null
    }).protected(function (base) {
        return {
            _whatAreYou: function () {
                const descr = base._whatAreYou.call(this);
                return `${descr}. I am a sparrow with a weight of ${this.__weight} ounces.`;
            }
        };
    }).public({
        introduceYourself: function () {
            const descr = this._whatAreYou();
            return 'Description: ' + descr;
        }
    }).build();
    
    
    const sparrow = new Sparrow('Chirik', 7, 2.24);
    expect(sparrow).toBeTruthy();
    expect(sparrow instanceof Sparrow).toEqual(true);
    expect(sparrow instanceof Bird).toEqual(true);
    expect(sparrow instanceof Animal).toEqual(true);

    expect(sparrow.introduceYourself).toBeDefined();
    expect(sparrow._whatAreYou).toBeUndefined();
    expect(sparrow.__weight).toBeUndefined();
    expect(sparrow.__wingspan).toBeUndefined();
    expect(sparrow.__name).toBeUndefined();

    const intro = sparrow.introduceYourself();
    expect(intro).toMatch(/Chirik/);
    expect(intro).toMatch(/7/);
    expect(intro).toMatch(/2.24/);
});

test('test private state in base and derived classes', () => {
    const messages = [];
    const consoleLog = (msg) => {
        messages.push(msg);
    }


    var Animal = ClassBuilder({
        constructor: function (favoriteFood) {
            this.__favoriteFood = favoriteFood;
        }
    }).private({
        __favoriteFood: null,
        _log: function(msg) {
            consoleLog(msg);
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
            consoleLog('Count is ' + this.__count);
        }
    }).public(function (base) {
        return {
            status: 'not endangered',
            saySomething: function() {
                base.saySomething.call(this);
                consoleLog('And the pigeon is ' + this.__age + ' years old.');
            }
        };
    }).build();

    const pigeon = new Pigeon('sunflower seeds', 5);
    pigeon.saySomething();
    
    expect(messages.length).toEqual(3);
    expect(messages[0]).toEqual('This is an animal with 2 legs, whose favorite food is sunflower seeds');
    expect(messages[1]).toEqual('Count is 1');
    expect(messages[2]).toEqual('And the pigeon is 5 years old.');

    pigeon.saySomething();
    expect(messages.length).toEqual(6);
    expect(messages[3]).toEqual('This is an animal with 3 legs, whose favorite food is sunflower seeds. Yammy!');
    expect(messages[4]).toEqual('Count is 2');
    expect(messages[5]).toEqual('And the pigeon is 5 years old.');
});


// Test access of private variables and methods in one class from another