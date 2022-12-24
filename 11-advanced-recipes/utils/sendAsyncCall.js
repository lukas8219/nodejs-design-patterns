const [, , quantity] = process.argv;

import { spawn } from "child_process";

console.log(`Sending ${quantity} requests`);

async function sleep(ms) {
  return new Promise((res) => {
    setTimeout(() => {
      res();
    }, ms);
  });
}

(async function () {
  const array = new Array(Number(quantity)).fill(0);
  for (const _ of array) {
    spawn("curl localhost:8080/my-url", {
      stdio: "inherit",
      shell: true,
    });
    await sleep(400);
  }
})();