import { ClassBuilder } from './class-builder';

test('create simple class', () => {
    const Animal = ClassBuilder({
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
    const Animal = ClassBuilder({
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
    const Animal = ClassBuilder({
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
    
    
    const Bird = ClassBuilder({
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
    
    
    const Sparrow = ClassBuilder({
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


    const Animal = ClassBuilder({
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


    const Pigeon = ClassBuilder({
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


test('Test access of private variables and methods in one class from another', () => {
    const Base = ClassBuilder()
        .public({
            workExperience: 3
        })
        .protected({
            testThisProtected: function(a, b, c) {
                expect(a).toEqual(1);
                expect(b).toEqual(2);
                expect(c).toEqual(3);

                expect(this.workExperience).toEqual(3);
                expect(this.weight).toEqual(12.8);

                this.setWeight(13);
                expect(this.getWeight()).toEqual(13);
                this.setWeight(12.8);

                expect(this.name).toEqual('Kenny');
                expect(this.age).toBeUndefined();
                expect(this.setAge).toBeUndefined();

                this.fromBaseToDervived(7, 9);
            }
        })
        .private({
            weight: 12.8,
            getWeight: function() { return this.weight; },
            setWeight: function(v) { this.weight = v; }
        }).build();

    const Derived = ClassBuilder({ parent: Base })
        .public(function (base) {
            return {
                name: 'Kenny',
                testThisPrivate: function () {
                    expect(this.age).toEqual(13);
                    this.setAge(51);
                    expect(this.age).toEqual(51);
                    this.setAge(13);
                    
                    expect(this.name).toEqual('Kenny');
                },
                testBasePublic: function () {
                    expect(this.weight).toBeUndefined();
                    expect(this.getWeight).toBeUndefined();
                    expect(this.setWeight).toBeUndefined();

                    base.testThisProtected.call(this, 1, 2, 3);
                },
                testBasePublicWithoutBaseRef: function () {
                    expect(this.weight).toBeUndefined();
                    expect(this.getWeight).toBeUndefined();
                    expect(this.setWeight).toBeUndefined();

                    this.testThisProtected(1, 2, 3); // Can do it like that because derived doesn't define this method
                }
            };
        })
        .protected({
            fromBaseToDervived: function(a, b) {
                expect(a).toEqual(7);
                expect(b).toEqual(9);

                this.testThisPrivate();

                expect(this.workExperience).toEqual(3);
                expect(this.weight).toBeUndefined();
                expect(this.setWeight).toBeUndefined();
            }
        })
        .private({
            age: 13,
            getAge: function() { return this.age; },
            setAge: function(v) { this.age = v;}
        }).build();


    const d = new Derived();
    d.testThisPrivate();
    d.testBasePublic();
    d.testBasePublicWithoutBaseRef();
});


test('Test access to  data in base from within the derived and base constructors', () => {
    let wasBaseCalled = false;
    let wasDerivedCalled = false;

    const Base = ClassBuilder({
        constructor: function() {
            // Check access to this class
            expect(this.__weight).toEqual(13);
            this.__weight = 14;
            expect(this.__getWeight()).toEqual(14);

            expect(this._age).toEqual(4);
            this._age = 5;
            expect(this._getAge()).toEqual(5);

            expect(this.species).toEqual('pigeon');
            this.species = 'spider';
            expect(this.getSpecies()).toEqual('spider');

            // Validate that there is no access to privates and protected and public vars haven't been defined yet
            expect(this.__infectionRate).toBeUndefined();
            expect(this.__getInfectionRate).toBeUndefined();

            expect(this._aggressiveness).toBeUndefined();
            expect(this._getAggressiveness()).toBeUndefined();

            expect(this.name).toBeUndefined();
            expect(this.getName()).toBeUndefined();
            wasBaseCalled = true;
        }
    }).private({
        __weight: 13,
        __getWeight: function() { return this.__weight; }
    }).protected({
        _age: 4,
        _getAge: function() { return this._age; }
    }).public({
        species: 'pigeon',
        getSpecies: function() { return this.species; }
    }).build();


    var Derived = ClassBuilder({
        parent: Base,
        constructor: function(base) {
            base.call(this);

            // Check access to this class
            expect(this.__infectionRate).toEqual(0.01);
            this.__infectionRate = 0.05;
            expect(this.__getInfectionRate()).toEqual(0.05);

            expect(this._aggressiveness).toEqual(0.3);
            this._aggressiveness = 0.5;
            expect(this._getAggressiveness()).toEqual(0.5);

            expect(this.name).toEqual('The seed eater');
            this.name = 'Tom';
            expect(this.getName()).toEqual('Tom');

            // Check access to Base class
            expect(this.__weight).toBeUndefined();
            expect(this.__getWeight).toBeUndefined();

            expect(this._age).toEqual(5);
            expect(this._getAge()).toEqual(5);

            expect(this.species).toEqual('spider');
            expect(this.getSpecies()).toEqual('spider');
            wasDerivedCalled = true;
        }
    }).private({
        __infectionRate: 0.01,
        __getInfectionRate: function() { return this.__infectionRate; }
    }).protected({
        _aggressiveness: 0.3,
        _getAggressiveness: function() { return this._aggressiveness; }
    }).public({
        name: 'The seed eater',
        getName: function() { return this.name; }
    }).build();

    const d = new Derived();
    expect(d.name).toEqual('Tom');
    expect(d.species).toEqual('spider');

    expect(wasBaseCalled).toEqual(true);
    expect(wasDerivedCalled).toEqual(true);
});

// Check the order of variable assignment in constructors
// Check variable creation during construction
// Parent and derived both have user-defined constructors and yet Derived doesn't call it
// Parent - autocreated constructor, Derived - manually created and base is called and is not called
// Variable or method declared more than once
// Variable and mothod share the same name
// public, private, etc doesn't get data passped properly

// TODO: support getters and setters?
// support constants?