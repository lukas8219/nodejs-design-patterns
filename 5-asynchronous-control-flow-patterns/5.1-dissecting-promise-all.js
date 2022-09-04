import { EventEmitter } from "events";

export function waitAllPromises(promises) {
  return new Promise((res, rej) => {
    const result = [];
    const preProcessLength = promises.length;

    const emitter = new EventEmitter();

    let count = 0;

    emitter.on("finished", () => {
      ++count === preProcessLength && res(result);
    });

    const eventEmitterHandle = () => {
      emitter.emit("finished");
    };

    while (promises.length) {
      const idx = promises.length - 1;
      const prom = promises.pop();
      prom
        .catch(rej)
        .then((p) => (result[idx] = p))
        .then(eventEmitterHandle);
    }
  });
}

waitAllPromises([
  new Promise((res) =>
    setTimeout(() => res(`UM`), Math.round(Math.random() * 5000))
  ),
  new Promise((res) =>
    setTimeout(() => res(`DOIS`), Math.round(Math.random() * 5000))
  ),
  new Promise((res) =>
    setTimeout(() => res(`TRES`), Math.round(Math.random() * 5000))
  ),
  new Promise((res) =>
    setTimeout(() => res(`QUATRO`), Math.round(Math.random() * 5000))
  ),
]).then(console.log);
