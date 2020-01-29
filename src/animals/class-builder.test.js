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
