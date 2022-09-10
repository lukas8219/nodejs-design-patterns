export function createFSAdapter() {
    const inmemory = new Map();
    return ({
        readFile(filename, options, callback) {
            if (typeof options === 'function') {
                callback = options;
                options = {};
            } else if (typeof options === 'string') {
                options = { encoding: options };
            }
            if (!inmemory.has(filename)) {
                //Format the error
                callback(new Error(`ENOENT open ${filename}`));
            }

            const file = inmemory.get(filename);
            //Add all encoding strategies
            const result = options.encoding === 'utf-8' ? file.toString() : file;
            callback(undefined, result)
        },
        writeFile(filename, contents, options, callback) {
            if (typeof options === 'function') {
                callback = options;
            }
            inmemory.set(filename, Buffer.from(contents));
            callback();
        }
    })
}

const inmemory = createFSAdapter();


inmemory.writeFile('texto.txt', 'THIS IS ME!!!!', (err, value) => {
    if (err) {
        console.error('ERROR');
        return;
    }

    inmemory.readFile('texto.txt', (err, v) => {
        if (err) {
            console.error('ERROR!')
        }
        console.log(v);
    })
})
