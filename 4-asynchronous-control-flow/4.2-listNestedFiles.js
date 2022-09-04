import { sep, join } from "path";
import fs from "fs";
import { Readable, Writable } from "stream";

export async function traverseDir(dir) {
  return new Promise((res, rej) => {
    fs.readdir(dir, "utf-8", (err, files) => {
      if (err) {
        rej(err);
      }

      res(files.map((file) => join(dir, file)));
    });
  });
}

export async function listNestedFiles(dir, cb) {
  const separatedFolders = dir.split(sep).slice(1);
  const resultFolders = [sep];
  const folderPromises = [];
  const output = [];
  let currFolder;

  while ((currFolder = separatedFolders.shift())) {
    resultFolders.push(currFolder);
    const builtFolder = resultFolders.join(sep);
    folderPromises.push(
      traverseDir(builtFolder).then((files) => output.push(...files))
    );
  }
  await Promise.all(folderPromises)
    .then(() => cb(output))
    .catch(cb);
}

export function listNestedFilesStreamSequentialSynchronous(dir, callback) {
  const separatedFolders = dir.split(sep).slice(1);

  const output = [];

  const folder = [sep];

  const ws = new Writable({
    write(dir, encoding, cb) {
      folder.push(dir);
      traverseDir(folder.join(sep))
        .then((files) => {
          output.push(...files);
          cb();
        })
        .catch(cb);
    },
    defaultEncoding: "utf-8",
  });

  Readable.from(separatedFolders)
    .pipe(ws)
    .on("finish", () => {
      callback(output);
    });
}
