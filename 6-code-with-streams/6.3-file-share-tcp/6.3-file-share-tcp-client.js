//Build client and server to transfer TCP files over a socket
//Add encryption

//Try using MUX or DEMUX for receiving multiple files.
import { Socket } from "net";
import { createReadStream } from "fs";
import { parse } from "path";

const PACKET_CHANNEL_SIZE = 1;
const PACKET_LENGTH_SIZE = 4;

const sock = new Socket();

const [, , port, ...FILES] = process.argv;

sock.connect(
  {
    port,
  },
  () => {
    let finished = 0;

    let id = 0;

    for (const f of FILES) {
      id++;

      const filename = parse(f).base;
      const ss = createReadStream(f);
      let chunk = undefined;

      ss.on("readable", () => {
        while ((chunk = ss.read()) !== null) {
          const buffer = Buffer.alloc(
            PACKET_CHANNEL_SIZE + PACKET_LENGTH_SIZE + 1
          );

          buffer.writeUint8(id, 0);
          buffer.writeUint32BE(chunk.length, 1);
          buffer.writeUInt8(filename.length, 5);

          const finalBuffer = Buffer.concat([
            buffer,
            Buffer.from(filename),
            chunk,
          ]);

          console.log(
            `Sending packet to channel ${id} fileNameLength : ${filename.length} fileName ${filename} : Total Buffer Size ${finalBuffer.length}`
          );
          sock.write(finalBuffer);
        }
      });

      ss.on("close", () => {
        if (++finished === FILES.length) {
          sock.end();
        }
      });
    }
  }
);
