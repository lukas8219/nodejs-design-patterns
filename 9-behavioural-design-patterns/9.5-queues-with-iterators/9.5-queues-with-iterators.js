/* 
Queues with iterators.

Implement a AsyncQueue class similar to TaskQueue classes we defined in Chapter 5.

Such a asynQueue will have a method class enqueue() to append new items to the queue and expose an @@asyncIterable method
which should provide the ability to process the elements in the queue asynchronously one at the time.
(With a concurrency of 1)
The async iterator returned form the AsyncQueue should terminate only after the Done() method of AsyncQueue in invoked and only after all items in the queue
are consumed. Consider that @@asyncIterable could be invoked in more than one place, thus returning an additional async iterator.
Which would allow you to increase the concurrency with which the queue is consumed.
*/
import * as childProcess from "child_process";
import { IterableInstance } from "./iterable-queue.js";

//Tried to teest with child process, but each node process  was creating separate instances of the IterableQueue
/* ["One", "Two"].forEach((id) => {
  const child = childProcess.fork("./consumer.js", [id]);
  child.on("message", (message) => console.log(message));
}); */

const timeouts = [];

const itOne = IterableInstance[Symbol.asyncIterator]();
const itTwo = IterableInstance[Symbol.asyncIterator]();

function callIterator(iterator, label) {
  iterator.next().then(({ value, done }) => {
    if (!done) {
      console.log(label, value);
      timeouts.push(
        setTimeout(() => {
          callIterator(iterator, label);
        }, Math.floor(Math.random() * 800))
      );
    }
  });
}

callIterator(itOne, "one");
callIterator(itTwo, "two");

function addToIterator(item) {
  IterableInstance.enqueue(item);
  timeouts.push(
    setTimeout(() => {
      addToIterator(Math.random() * 1e2);
    }, 1000)
  );
}

setTimeout(() => {
  IterableInstance.done();
  timeouts.forEach((t) => clearTimeout(t));
}, 5000);

addToIterator();
