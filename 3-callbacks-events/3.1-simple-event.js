import { EventEmitter } from "events";
import fs from "fs";

class FindRegex extends EventEmitter {
  constructor(regex) {
    this.regex = regex;
    this.files = [];
  }

  find() {
    this.emit("start", this.files);
    for (const fileName of this.files) {
      let buffer;
      try {
        buffer = fs.readFileSync(fileName, "utf-8");
        this.emit("fileread", buffer);
      } catch (err) {
        this.emit("error", err);
      }
      const match = buffer.match(this.regex);
      if (match) {
        match.forEach((m) => {
          this.emit("found", m);
        });
      }
    }
    return this;
  }

  addFile(filename) {
    this.files.push(filename);
    return this;
  }
}
