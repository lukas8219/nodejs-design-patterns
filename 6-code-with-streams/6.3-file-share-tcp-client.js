//Build client and server to transfer TCP files over a socket
//Add encryption

//Try using MUX or DEMUX for receiving multiple files.
import http from "http";
import { Readable, Transform } from "stream";
import fs from "fs";

http
  .createServer((req, res) => {
    const params = new URL(req.url, `http://${req.headers.host}`).searchParams
      .get("files")
      .split(",");

    const multiplexer = new Transform({
      write(chunk, enc, cb) {
        res.write(chunk);
        cb();
      },
    });

    multiplexer.on("finish", () => res.end());

    const readFromFile = new Transform({
      defaultEncoding: "utf-8",
      write(fileName, enc, cb) {
        fs.createReadStream(fileName).pipe(multiplexer);
      },
    });

    Readable.from(params).pipe(readFromFile);
  })
  .listen(3000);
