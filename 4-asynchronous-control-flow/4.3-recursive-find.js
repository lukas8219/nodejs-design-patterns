import { listNestedFiles } from "./4.2-listNestedFiles.js";
import { PassThrough, Readable, Transform, Writable } from "stream";
import fs from "fs";

export function recursiveFind(dir, keyword, cb) {
  const findKeyword = (files) => {
    const result = [];

    const filterByTxtFile = new Transform({
      defaultEncoding: "utf-8",
      transform(file, encoding, cb) {
        if (file.toString().endsWith(".txt")) {
          return cb(null, file.toString());
        }
        cb();
      },
    });

    const filterFileByKeyword = new Transform({
      defaultEncoding: "utf-8",
      transform(filePath, enc, cb) {
        let contains = false;
        const file = fs.createReadStream(filePath, "utf-8");
        file
          .on("data", (data) => {
            if (!contains) {
              contains = data.includes(keyword);
            } else {
              file.close();
            }
          })
          .on("close", () => {
            if (contains) {
              result.push(filePath.toString());
              return cb(undefined, filePath);
            }
            cb();
          });
      },
    });

    Readable.from(files, { encoding: "utf-8" })
      .pipe(filterByTxtFile)
      .pipe(filterFileByKeyword)
      .on("finish", () => cb(Array.from(result)));
  };

  listNestedFiles(dir, findKeyword);
}

(() => {
  recursiveFind(process.argv[2], "DMASDKPS", console.log);
})();
