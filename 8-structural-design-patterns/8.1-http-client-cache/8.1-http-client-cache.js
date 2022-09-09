import { RequestBuilder } from '../../7-creational-design-patterns/7.2-request-builder.js'
import https from 'https';
import fs from 'fs'
import { Readable } from 'stream';

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

function createProxiedRequestBuilder(method) {
    if (!['GET', 'PUT', 'POST', 'DELETE'].includes(method)) {
        throw new Error('please specify a valid method')
    }
    const instance = new RequestBuilder(method);

    const cache = new Map();

    return new Proxy(instance, {
        get(t, p, r) {

            if (p === 'buildAsPromise' && instance._method === 'GET') {
                const key = `${instance._hostname}${instance._path}`;
                return async function () {
                    if (cache.has(key)) {
                        return cache.get(key);
                    }
                    const result = t[p];
                    const res = await result.apply(instance);
                    cache.set(key, res)
                    return res;
                };
            }
            return t[p];
        }
    })
}

const options = {
    key: fs.readFileSync('./security/key.pem'),
    cert: fs.readFileSync('./security/cert.pem')
};

https.createServer(options, (req, res) => {
    setTimeout(() => {
        console.log('GOT A REQUEST!')
        res.writeHead(200);
        res.write('OI');
        res.end();
    }, 3000)
})
    .listen(8000)
    .once('listening', async () => {
        const proxied = createProxiedRequestBuilder('GET');
        await proxied.URL('https://localhost:8000').buildAsPromise().then(console.log);
        await proxied.URL('https://localhost:8000').buildAsPromise().then(console.log);
    })