import fs from "fs";
import { PassThrough, pipeline } from "stream";
import { Readable, Writable, Transform } from "stream";

function concatFiles(...args) {
  const callback = args.pop();
  const destination = args.pop();

  const ws = fs.createWriteStream(destination, { encoding: "utf-8" });

  const writeStream = new Transform({
    transform(fileName, encoding, cb) {
      fs.createReadStream(fileName, "utf-8")
        .on("close", () => {
          ws.write("\n");
          cb();
        })
        .pipe(ws, { end: false });
    },
  });

  Readable.from(...args)
    .pipe(writeStream)
    .on("finish", callback);
}

concatFiles(process.argv.slice(2), "out/myfile.txt", () => {
  console.log("FINISHED!");
});
