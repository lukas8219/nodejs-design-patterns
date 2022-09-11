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