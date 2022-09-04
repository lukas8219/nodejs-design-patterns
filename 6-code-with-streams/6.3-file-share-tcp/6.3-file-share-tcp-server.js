// Build client and server to transfer TCP files over a socket
//Add encryption

//Try using MUX or DEMUX for receiving multiple files.
import { Server } from "net";
import { createWriteStream } from "fs";

const [, , processPORT] = process.argv;

const PORT = processPORT || 8080;

const OUTPUT_FOLDER = "out";

function serverLog(...message) {
  if (process.env.DEBUG) {
    console.log(...message);
  }
}

const server = new Server().listen(PORT, () => {
  console.log(`[SERVER] Started listening on ${PORT}`);
  console.log = serverLog;
});

const RUNNING_STREAMS = new Map();

server.addListener("connection", (socket) => {
  socket.on("readable", () => {
    let chunk;

    let channel;
    let contentLength;
    let fileNameLength;
    let fileName;

    if (!channel) {
      chunk = socket.read(1);
      channel = chunk && chunk.readUInt8(0);
      console.log(`Packet received for channel ${channel}`);
    }

    if (!contentLength) {
      chunk = socket.read(4);
      contentLength = chunk && chunk.readUInt32BE(0);
      console.log(`Packet with length ${contentLength}`);
      if (contentLength === null) {
        return null;
      }
    }

    if (!fileNameLength) {
      chunk = socket.read(1);
      fileNameLength = chunk && chunk.readUInt8(0);
      console.log(`Filename with length ${fileNameLength}`);
    }

    if (!fileName) {
      chunk = socket.read(fileNameLength);
      fileName = chunk && chunk.toString();
      console.log(`Filename : ${fileName}`);
    }

    chunk = socket.read(contentLength);

    const ID = `${channel}-${fileName}-${socket.localAddress}`;

    if (chunk === null) {
      return;
    }

    if (RUNNING_STREAMS.has(ID)) {
      RUNNING_STREAMS.get(ID).write(chunk);
    } else {
      const stream = createWriteStream(`${OUTPUT_FOLDER}/${fileName}`);
      RUNNING_STREAMS.set(ID, stream);
      stream.write(chunk);
    }

    channel = null;
    contentLength = null;
    fileNameLength = null;
    fileName = null;
  });
});
