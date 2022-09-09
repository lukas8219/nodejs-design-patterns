//Queue class with one public methdo Dequeue.
// Dequeue => returns Promise that resolves when the item is dequeued from the queue. If the queue is empty, it will wait until a new item arrives.
// Must have revealling constructor with enqueue() with resolves any of the Dequeue promises.
import { createServer } from 'http'

class Queue {

    constructor(executor) {
        const queue = [];
        const waitingDequeues = [];

        executor((item) => {
            if (waitingDequeues.length) {
                waitingDequeues.shift()(item);
                return;
            }
            queue.push(Promise.resolve(item));
        })

        Object.defineProperty(this, '_dequeue', {
            value: function () {
                return new Promise(async (res, rej) => {
                    const next = queue.shift();
                    if (next) {
                        next.then(res).catch(rej);
                        return;
                    }
                    waitingDequeues.push(res);
                })
            }
        })
    }


    dequeue() {
        return this._dequeue()
    }

}


const queue = new Queue((push) => {
    createServer((req, res) => {
        push(req.headers);

        res.end();
    })
        .listen(8080)
});

const readMessage = () => {
    queue.dequeue().then((item) => {
        console.log(item);
        readMessage();
    })
}

readMessage();
