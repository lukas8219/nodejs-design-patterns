import { resolve } from 'path';

export function createFSAdapter(db) {
    return ({
        readFile(filename, options, callback) {
            if (typeof options === 'function') {
                callback = options;
                options = {};
            } else if (typeof options === 'string') {
                options = { encoding: options };
            }
            db.get(resolve(filename), { valueEncoding: options.encoding }, (err, value) => {
                if (err) {
                    if (err.notFound) {
                        err = new Error(`ENOENT, open "${filename}"`)
                        err.code = 'ENOENT';
                        err.errno = 34;
                        err.path = filename
                    }
                    return callback && callback(err);
                }
                callback && callback(undefined, value)
            })
        },
        writeFile(filename, contents, options, callback) {
            if (typeof options === 'function') {
                callback = options;
                options = {};
            } else if (typeof options === 'string') {
                options = { encoding: options };
            }
            db.put(resolve(filename), contents, {
                valueEncoding: options.encoding
            }, callback)
        }
    })
}

