/* 
Create a HTTP server with a POST endpoint that receives as input the code of a function (string) and an array of arguments, executes the fn with the given args in a worker thread or in a separate process
and returns the result back to the client.
hint you can use evail() vm.runInContext or neither of the two.
 */
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { compileFunction, createContext, Script } from 'vm';
import { parentPort, isMainThread, workerData, Worker } from 'worker_threads'

if(isMainThread){
    createServer(async (req, res) => {
        const ENDPOINT = /run-in-vm/
        if (req.method === 'POST' && req.url.match(ENDPOINT)) {
                const buffer = [];
    
                for await (const chunk of req) {
                    buffer.push(chunk);
                }
    
                const { fn, args } = JSON.parse(Buffer.concat(buffer));
    
                const worker = new Worker(fileURLToPath(import.meta.url), {
                    workerData: { fn, args }
                });
    
                ["exit", "error"].forEach((event) => {
                    worker.on(event, (error) => {
                        if(res.headersSent){
                            return;
                        }
                        if(error !== 0){
                            res.writeHead(500);
                            res.write(JSON.stringify({ message: error, code: 500 }));
                            console.log(error);
                            return res.end();
                        }
                    });
                })

                worker.on('message', (message) => {
                        res.writeHead(200, {
                         'Content-Type': 'application/json'
                        });
                        res.write(JSON.stringify({ result: message, fn, args }));
                        return res.end();
                })
        }
    }).listen(8080);
} else {
    const { fn, args } = workerData;

    const script = new Script(`
    var fn = ${fn};
    `);

    const context = createContext({});
    script.runInNewContext(context);

    const result = context['fn'](...args)

    parentPort.postMessage(result);
}
