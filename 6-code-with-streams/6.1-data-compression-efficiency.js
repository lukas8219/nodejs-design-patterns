//CLI that takes a file as input and compresses it using different algorithms
// on zlib module(Brotli, Deflate, Gzip)
//Build summary of performance and compresson efficency table for the given file

//HINT: Use the FORK Pattern
import { once } from "events";
import fs from "fs";
import { createGzip, createBrotliCompress, createDeflate } from "zlib";

function compressFile(fileName) {
  const results = [];

  const fileStream = fs.createReadStream(fileName, "utf-8");

  function createStreamSummary(stream, streamName) {
    let streamSize = 0;
    let startedAt;

    stream.once("readable", () => {
      startedAt = Date.now();
      stream.resume();
    });

    stream.on("data", (chunk) => {
      streamSize += chunk.length;
    });

    stream.on("finish", () => {
      results.push({
        algorith: streamName,
        resultingLength: `${streamSize / 1024 / 1024}mb`,
        totalTime: `${Date.now() - startedAt}ms`,
      });
    });

    return stream;
  }

  const gzipStream = createStreamSummary(createGzip(), "gzip");
  const deflateStream = createStreamSummary(createDeflate(), "deflate");
  const brotliStream = createStreamSummary(createBrotliCompress(), "brotli");

  fileStream.pipe(gzipStream);
  fileStream.pipe(deflateStream);
  fileStream.pipe(brotliStream);

  Promise.all(
    [gzipStream, deflateStream, brotliStream].map((stream) =>
      once(stream, "end")
    )
  ).then(() => {
    console.table(results);
  });
}

compressFile(process.argv[2]);
