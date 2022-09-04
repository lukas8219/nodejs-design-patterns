class TaskQueueAsyncAwait {
  constructor(concurrency) {
    this.concurrency = concurrency;
    this.queue = [];
    this.consumerQueue = [];
    for (let i = 0; i < concurrency; i++) {
      this.consumer();
    }
  }

  async getNextTask() {
    return new Promise((res) => {
      if (this.queue.length) {
        return res(this.queue.shift());
      }
      this.consumerQueue.push(res);
    });
  }

  runTask(task) {
    return new Promise((res, rej) => {
      const taskWrapper = () => {
        return task.then(res, rej);
      };

      if (this.consumerQueue.length) {
        const consumer = this.consumerQueue.shift();
        consumer(taskWrapper);
      }

      this.queue.push(taskWrapper);
    });
  }

  consumer() {
    return new Promise((res, rej) => {
      res(this.getNextTask());
    })
      .then((task) => task())
      .then(() => {
        if (!this.consumerQueue.length) this.consumer(); // Promises memory leak.
      });
  }
}

const queue = new TaskQueueAsyncAwait(4);

queue
  .runTask(
    new Promise((res, rej) =>
      setTimeout(() => res(`OI`), Math.round(Math.random() * 5000))
    )
  )
  .then(console.log);

queue
  .runTask(
    new Promise((res, rej) =>
      setTimeout(() => res(`OI`), Math.round(Math.random() * 5000))
    )
  )
  .then(console.log);

queue
  .runTask(
    new Promise((res, rej) =>
      setTimeout(() => res(`OI`), Math.round(Math.random() * 5000))
    )
  )
  .then(console.log);

queue
  .runTask(
    new Promise((res, rej) =>
      setTimeout(() => res(`OI`), Math.round(Math.random() * 5000))
    )
  )
  .then(console.log);
queue
  .runTask(
    new Promise((res, rej) =>
      setTimeout(() => res(`OI`), Math.round(Math.random() * 5000))
    )
  )
  .then(console.log);
