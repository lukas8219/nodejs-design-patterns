/* 
Logggin with middlewares.

Rewrite the logging component you implemented for exercises 9.1 and 9.2 but this time using the middleware pattern to postprocess each log message allowing different middlewares to customize how to handle
the message and how to output them

We could for example add a serialize() middleware to convert log messages to string representation ready to be sent over wire or saved somewhere.
Then we could add, saveToFile() middlewares that saves each message to a file.
 */
import { createWriteStream } from 'fs';
import { Socket, Server } from 'net';
import { Readable } from 'stream';

const server = new Server().listen(8080, () => console.log('WORKED!'))

server.on('connection', (stream) => {
    stream.pipe(createWriteStream('my-log-tcp.log', 'utf-8'))
})

const socket = new Socket()
    .connect({
        localAddress: '127.0.0.1',
        port: 8080,
    });

function createLogWithMiddleware(middleware){
    return function(...messages){
        const exec = function(middleware){
            middleware && typeof middleware === 'function' &&  middleware(...messages);    
        } 
        console.log(...messages);
        if(Array.isArray(middleware)){
            middleware.forEach(exec);
            return;
        }
        exec(middleware)
    }
}


function saveToFile(){
    return function(...messages){
        Readable.from(messages)
        .pipe(createWriteStream('my-logs.txt', 'utf-8'))
    }
}

function serialize(){
   return  function(...message){
        Readable.from(message)
        .pipe(socket)
    }
}

const logger = createLogWithMiddleware([saveToFile(), serialize()])
logger('THIS IS MY MESSAGE!')

//TODO evolve this! Add error handling! Improve performance of streams
//Add next method calling