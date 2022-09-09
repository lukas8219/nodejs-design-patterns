function createDecoratedLog(console) {
    console.red = function (...message) {
        this.log(`\x1b[31m${message}\x1b[0m`)
    }

    console.green = function (...message) {
        this.log(`\x1b[32m${message}\x1b[0m`)
    }

    console.yellow = function (...message) {
        this.log(`\x1b[33m${message}\x1b[0m`)
    }

    return console;
}

const decorated = createDecoratedLog(console);


decorated.green('OI')