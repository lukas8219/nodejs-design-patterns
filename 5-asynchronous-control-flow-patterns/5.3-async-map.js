Array.asyncMap = function (iterable, callback, concurrency) {
  return new Promise((resolve, reject) => {
    const result = [];
    const copy = [...iterable];
    let running = 0;

    const executeCallBack = (item) => {
      if (callback instanceof Promise) {
        return callback(item);
      } else {
        return new Promise((res) => res(callback(item)));
      }
    };

    const consumer = (id) => {
      return new Promise((res, rej) => {
        running++;
        if (copy.length) {
          const cb = copy.shift();
          executeCallBack(cb)
            .then((v) => {
              running--;
              result.push(v);
              if (result.length === iterable.length) {
                resolve(result);
              }
              res();
            })
            .then(() => {
              if (running < concurrency) consumer(id);
            });
        }
      }).then((r) => {});
    };

    for (let i = 0; i < concurrency; i++) {
      consumer(i);
    }
  });
};

//Function implemented by @nebarf github.com/nebarf
async function mapAsync(iterable, callback, concurrency) {
  if (!concurrency || !Number.isInteger(concurrency)) {
    throw new Error('"Concurrency" param must be a positive integer.');
  }

  // Split the iterable into a set of chunks. The execution of chunks is then
  // done in series to enforce the provided concurrency level.
  let slices = [];
  for (const [index, item] of iterable.entries()) {
    const sliceIndex = Math.floor(index / concurrency);
    slices[sliceIndex] = [].concat(slices[sliceIndex] || [], item);
  }

  // Serial execution of slices cumulating the results of each async slice mapping.
  let results = [];
  for (const [index, slice] of slices.entries()) {
    const promises = slice.map((item) => callback(item));
    const sliceMapRes = await Promise.all(promises);

    //Try changing this lines to see the performance impact.
    results.push(...sliceMapRes);
    //results = [...results, ...sliceMapRes];
  }

  return results;
}

const map = async (i) => {
  return new Promise((res) => {
    setTimeout(() => {
      res(i + 1);
    }, Math.round(Math.random() * 500));
  });
};

//This demo is instereing to see how the Promise.all is a way better approach to deal with Concurrency
(async () => {
  const amount = 400;
  const concurrency = 6;
  console.log(`Iterating ${amount}`);

  console.time("async");
  await Array.asyncMap(new Array(amount).fill(1), map, concurrency);
  console.timeEnd("async");

  console.time("async 2");
  await mapAsync(new Array(amount).fill(1), map, concurrency);
  console.timeEnd("async 2");
})();
