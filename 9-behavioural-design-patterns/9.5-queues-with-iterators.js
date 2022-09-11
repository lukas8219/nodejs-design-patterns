/* 
Queues with iterators.

Implement a AsyncQueue class similar to TaskQueue classes we defined in Chapter 5.

Such a asynQueue will have a method class enqueue() to append new items to the queue and expose an @@asyncIterable method
which should provide the ability to process the elements in the queue asynchronously one at the time.
(With a concurrency of 1)
The async iterator returned form the AsyncQueue should terminate only after the Done() method of AsyncQueue in invoked and only after all imtes in the queue
are consumed. onsider that @@asyncIterable could be invoked in more than one place, thus returning an additional async iterator.
Which would allow you to increase the concurrency with which the queue is consumed.
*/