/* 
Implement a loggin component having at least the following meethods
debug, info, warn and error. The logging component should also accept a strategy that defines
where the log message will be sent i.e 'FileStrategy'. 'ConsoleStragegy'. 
Bonus: Sending logs through TCP connection.
 */

import { createWriteStream } from 'fs';
import { resolve } from 'path';
import { Readable } from 'stream';

class FileStrategy {

    constructor(filename) {
        this._stream = createWriteStream(resolve(filename));
        process.on('exit', () => {
            this._stream.end();
        })
    }

    log(...messages) {
        Readable.from(...messages)
            .pipe(this._stream, { end: false })
    }
}

class ConsoleStrategy {

    log(...message) {
        console.log(...message);
    }
}

class Logger {
    constructor(strategy) {
        this._strategy = strategy;
    }

    log(...messages) {
        this._strategy.log(...messages);
    }
}



const consoleLogger = new Logger(new ConsoleStrategy());

consoleLogger.log('SHOULD LOG TO CONSOLE!');

const file = new Logger(new FileStrategy('my-logs.log'));
file.log('this is a log message!! version 2')