export class IterableQueue {
  constructor() {
    this.queue = [];
    this.listeners = [];
    this._isDone = false;
  }

  enqueue(item) {
    if (this._isDone) {
      return;
    }

    const listener = this.listeners.shift();
    if (listener) {
      listener(item);
      return;
    }
    this.queue.push(item);
  }

  done() {
    this._isDone = true;
  }

  [Symbol.asyncIterator]() {
    return {
      next: async () => {
        return new Promise((res, rej) => {
          const item = this.queue.shift();
          if (item !== undefined) {
            return res({ value: item });
          }
          if (!this._isDone) {
            this.listeners.push((item) => {
              res({ value: item });
            });
          } else {
            res({ done: true });
          }
        });
      },
    };
  }
}
const IterableInstance = new IterableQueue();
for (let i = 0; i < 10; i++) {
  IterableInstance.enqueue(i);
}

export { IterableInstance };
