//Fn implementation
function createConsoleLog(color) {
    const keys = new Map([
        ['yellow', '[33m'],
        ['red', '[31m'],
        ['green', '[32m']
    ])


    return (...messages) => {
        console.log(`\x1b${keys.get(color)}${messages}\x1b[0m`)
    }
}


const redConsole = createConsoleLog('red');
const greenConsole = createConsoleLog('green');

//Class implementation
class Logger {

    log(...message) {
        console.log(`\x1b${this._color}${message}\x1b[0m`)
    }
}

class RedConsole extends Logger {
    _color = "[31m"
}

class GreenConsole extends Logger {
    _color = '[32m';
}

class YellowConsole extends Logger {
    _color = '[33m';
}

class LoggerFactory {
    static createLogger(color) {
        return new Map([
            ['red', new RedConsole()],
            ['yellow', new YellowConsole()],
            ['green', new GreenConsole()]
        ]).get(color);
    }
}

const logger = LoggerFactory.createLogger('red');

logger.log('this is a red message!')