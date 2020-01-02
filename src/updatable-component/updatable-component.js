export class UpdatableComponenet {
    get element() { return this._rootElement; }
    
    constructor({rootElement, updaters}) {
        this._rootElement = rootElement;
        this._updaters = updaters;
    }

    update(data) {
        // go through each expression and call it with data
        for (let updater of this._updaters) {
            updater(data);
        }
    }
}