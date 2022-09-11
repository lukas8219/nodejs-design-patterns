//Lazy instantiate the Buffer with the size as soon as the first .write method is called.
//If no write is ever called, the instance should not be created.
//What happens with all other methods?

//The INSTANCE cannot be crated or allocated?

export function createLazyBuffer(size) {
    function mockFn(target) {
        const toFn = (value) => () => value;

        const fnToValue = {
            byteOffset: 0,
            entries: toFn([]),
            indexOf: toFn(-1),
            includes: toFn(false),
            keys: toFn([]),
            lastIndexOf: toFn(-1),
            length: 0,
            toJSON: toFn({ type: 'Buffer', data: [] }),
            toString: toFn(''),
            values: toFn([]),
        }

        return fnToValue[target];
    }

    let _buffer;

    return new Proxy({}, {
        get(t, p, r) {
            if (p.includes('write') && !_buffer) {
                _buffer = Buffer.alloc(size);
                return _buffer[p].bind(_buffer);
            }
            if (!_buffer) {
                const fn = mockFn(p);
                if (fn) {
                    return fn;
                }
                if (['swap', 'read'].some((entry) => entry.includes(p))) {
                    return () => { };
                }
                return t[p];
            } else {
                return _buffer[p].bind(_buffer)
            }

        }
    })
}


const proxy = createLazyBuffer(200);
proxy.write(`DASPODSKpo`);
console.log(proxy.readUInt16BE(5));