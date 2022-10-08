/* 
Implement batching and caching for the totalSales API examples using only callbacks, streams and events. Without using promises or async await.
Pay attention to Zalgo when returning cached values!
*/

import { createServer } from "http";
import { Readable, Transform } from "stream";
import { EventEmitter } from "events";
import uuid4 from "uuid4";

class CacheStorage {
  _cache = new Map();

  has(key) {
    return this._cache.has(key);
  }

  get(key) {
    return this._cache.get(key);
  }

  put(k, v) {
    this._cache.set(k, v);
  }
}

class BatchTransform extends Transform {
  _values = [];
  hasEnded = false;
  _callbacksReq = [];

  constructor() {
    super();
    this.on("end", () => {
      this.hasEnded = true;
      this._callbacksReq.forEach((cb) => {
        setImmediate(() => cb(this.getValue()));
      });
    });
  }

  _transform(chunk, enc, cb) {
    this._values.push(chunk);
    cb(null, chunk);
  }

  getValue() {
    return Buffer.concat(this._values);
  }

  onEnd(callback) {
    this._callbacksReq.push(callback);
  }
}

class BatchManager extends EventEmitter {
  _storage = new Map();

  constructor(cache) {
    super();
    this.cache = cache;
    if (this.cache) {
      this.on("request-end", (url, response) => {
        this._storage.delete(url);
        this.cache && this.cache.put(url, response);
      });
    }
  }

  hasOngoingRequest(url) {
    return !!this._storage.get(url);
  }

  batchRequest(url, callback) {
    if (this.hasOngoingRequest(url)) {
      setImmediate(() => {
        const batchedRequest = this._storage.get(url);
        if (batchedRequest.hasEnded && this.cache && this.cache.has(url)) {
          callback(this.cache.get(url));
        } else {
          batchedRequest.onEnd(callback);
        }
      });

      return new Transform({
        write(chunk, enc, cb) {
          cb();
        },
      });
    }

    const stream = new BatchTransform();
    this._storage.set(url, stream);
    stream.onEnd((response) => this.emit("request-end", url, response));

    return stream;
  }
}

const cache = new CacheStorage();
const manager = new BatchManager(cache);

async function* generateDataToTest() {
  async function sleep(ms) {
    await new Promise((res) => {
      setTimeout(() => {
        res();
      }, Math.random() * 1500);
    });
  }

  let counter = 0;
  while (counter < 5) {
    counter++;
    await sleep();
    yield String(counter);
  }
}

createServer((req, res) => {
  const url = req.url;

  const id = uuid4();

  console.log(`Starting id=${id}`);

  if (cache.has(url)) {
    res.write(cache.get(url));
    res.end();
    return;
  }

  const t = manager.batchRequest(url, (response) => {
    res.write(response);
    res.end();
  });

  if (t instanceof BatchTransform) {
    Readable.from(generateDataToTest()).pipe(t).pipe(res);
  }
}).listen(8080);
