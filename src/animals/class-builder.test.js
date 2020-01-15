import { ClassBuilder } from './class-builder';

test('create simple class', () => {
    var Animal = ClassBuilder({
        name: 'Animal',
        constructor: function (favoriteFood) {
            this.legs = 4;
            this.__favoriteFood = favoriteFood;
        }
    }).build();

    expect(Animal).toBeTruthy();
    expect (typeof Animal).toEqual('function');
    expect(Animal.prototype).toEqual(Object.prototype);


    const animal = new Animal('sunflower seeds');
    expect(animal).toBeTruthy();
    expect(animal.legs).toEqual(4);
    expect(animal.__favoriteFood).toEqual('sunflower seeds');
});
