/* 
Imagine we are working on a warehouse management program.
Our next task is to create a class to modal Warehouse item and help track it.
Such a Warehouse item class has a constructor which accepts an ID and the initial state. 'arriving', 'stored', 'delivered'.
It has three methods : 
Store(locationid) : moves the item to stored state and records the locationId.
Deliver(address) : changes the state of the item to delivered, sets the delivery address and clears the locationId.
Describe() returns a string representation of the current state of the item. `item ID its on the way to the warehouse.`.....Or location... or delivered

The arriving state can be set only on creation. and cannot be reassigned.
An item canno be moved to arriving once stored or delivered.

it cannot be moved back to stored once delivered.
It cannot be delivered if never stored.

STATE PATTERN
 */

class WarehouseItemStoreState {

    constructor(warehouse, locationId) {
        warehouse.locationId = locationId;
        this._warehouse = warehouse;
        Object.defineProperty(this, '_canChange', {
            value: function () {
                return !(this._warehouse._state instanceof WarehouseItemDeliveredState);
            }
        })

        Object.defineProperty(this, '_canSet', {
            value: function () {
                return this._warehouse._state instanceof WarehouseItemArrivingState;
            }
        })
    }

    describe() {
        return `Item ${this._warehouse._id} its on location ${this._warehouse.locationId}`;
    }

}

class WarehouseItemDeliveredState {

    constructor(warehouse, address) {
        warehouse._address = address;
        this._warehouse = warehouse;
        Object.defineProperty(this, '_canChange', {
            value: function () {
                return this._warehouse._state instanceof WarehouseItemStoreState;
            }
        })

        Object.defineProperty(this, '_canSet', {
            value: function () {
                return this._warehouse._state && this._warehouse._state instanceof WarehouseItemStoreState;
            }
        })
    }

    describe() {
        return `Item ${this._warehouse._id} is on ${this._warehouse._address}`;
    }

}

class WarehouseItemArrivingState {

    constructor(warehouse) {
        this._warehouse = warehouse;
        Object.defineProperty(this, '_canChange', {
            value: function () {
                return ![WarehouseItemStoreState, WarehouseItemDeliveredState].some((c) => this._warehouse._state instanceof c);
            }
        })

        Object.defineProperty(this, '_canSet', {
            value: function () {
                return !this._warehouse._state;
            }
        })
    }

    describe() {
        return `Item ${this._warehouse._id} is arriving`;
    }

}

class WarehouseItem {

    constructor(id, state) {
        this._id = id;

        Object.defineProperty(this, '_changeState', {
            value: function (state) {
                if (!this._state) {
                    this._state = new WarehouseItemArrivingState(this);
                    return;
                }

                if (this._state._canChange() && state._canSet && state._canSet()) {
                    this._state = state;
                } else {
                    throw new Error(`Cannot change ${this._state.constructor.name} to ${state.constructor.name}`)
                }
            }
        })

        this._changeState(state);
    }


    store(locationId) {
        this._changeState(new WarehouseItemStoreState(this, locationId));
    }

    deliver(address) {
        this._changeState(new WarehouseItemDeliveredState(this, address))
    }

    describe() {
        return this._state.describe();
    }
}

const item = new WarehouseItem(10);
console.log(item.describe());

item.store(1231231);
console.log(item.describe());

item.deliver(`Rua dos Guri`);
console.log(item.describe());