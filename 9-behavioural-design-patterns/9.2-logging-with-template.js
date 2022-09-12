/* 
Implement the same logging component in the previus exercise ut this time using template pattern.
We would be them obtain a Console Logger or a File logger class to log to a file.
Take notes on the differences between Template and Strategy.
 */

import { resolve } from 'path'
import { createWriteStream } from 'fs'
import { Readable } from 'stream';

class Logger {

    log(...messages) {
        const timestamp = new Date().toISOString();
        this._log(`${timestamp} : `, ...messages);
    }

}

class FileLoggerTemplate extends Logger {

    constructor(filename) {
        super();
        const _stream = createWriteStream(resolve(filename));
        process.on('exit', () => {
            _stream.end();
        })

        Object.defineProperty(this, '_log', {
            value: function (...messages) {
                Readable.from(messages)
                    .pipe(_stream, { end: false });
            }
        })
    }

}

class ConsoleLoggerTemplate extends Logger {

    constructor() {
        super()
        Object.defineProperty(this, '_log', {
            value: function (...messages) {
                console.log(...messages);
            }
        })
    }


}

const consoleLogger = new ConsoleLoggerTemplate();
const fileLogger = new FileLoggerTemplate('my-other.log');

consoleLogger.log('this_should_be.loggeeee!!');
fileLogger.log('this shouldnt be logged into console but on file!')