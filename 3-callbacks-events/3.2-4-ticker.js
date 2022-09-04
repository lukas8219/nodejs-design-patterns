import { EventEmitter } from "events";

function ticker(number, callback) {
  let max = Number(number);
  const emitter = new EventEmitter();
  let count = 0;

  const tick = () => {
    max -= 50;
    count++;
    if (Date.now() % 5 === 0) {
      const error = Error("Divisible by 5");
      emitter.emit("error", error);
      callback(error);
    } else {
      emitter.emit("tick");
    }
  };

  const applyTick = () => {
    setTimeout(() => {
      if (max) {
        tick();
        applyTick();
      } else {
        callback(count);
      }
    }, 50);
  };

  process.nextTick(() => {
    tick();
    applyTick();
  });

  return emitter;
}

const em = ticker(500, (count) => {
  console.log(count);
});

em.on("error", (err) => {
  console.error("This is an error", err);
});
