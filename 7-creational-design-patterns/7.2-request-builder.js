import { once } from 'events';
import { request } from 'https';
import { Readable } from 'stream';

class RequestBuilder {

    constructor(method) {
        this._method = method;
    }

    static GET() {
        return new this('GET');
    }

    static POST(body) {
        return new this('POST').body(body);
    }

    static PUT(body) {
        return new this('PUT').body(body);
    }

    static DELETE() {
        return new this('DELETE');
    }

    URL(url) {
        const URL_OBJECT = new URL(url);
        this._hostname = URL_OBJECT.host;
        this._path = URL_OBJECT.pathname;
        return this;
    }

    headers(headers) {
        this._headers = headers;
        return this;
    }

    body(body) {
        this._body = body;
        return this;
    }

    auth(auth) {
        this._auth = auth;
        return this;
    }

    async buildAsStream() {
        return new Promise((res, rej) => {
            const req = request({
                method: this._method,
                headers: {
                    'Content-Type': 'application/json',
                },
                hostname: this._hostname,
                path: this._path,
            }, res);

            if (this._body) {
                const buffer = Buffer.from(JSON.stringify(this._body));
                Readable.from(buffer)
                    .pipe(req)
            } else {
                req.end();
            }
        })
    }

    async buildAsPromise() {
        return new Promise(async (res, rej) => {
            const response = await this.buildAsStream();
            const data = [];

            response.on('data', (chunk) => data.push(chunk));
            response.on('error', rej);

            const isApplicationJson = response.headers['content-type'].includes('application/json');

            await once(response, 'end');
            if (isApplicationJson) {
                res(JSON.parse(Buffer.concat(data)))
            } else {
                res(Buffer.concat(data).toString())
            }

        })
    }
}

const payload = {
    "email": "muh.nurali43@gmail.com",
    "password": "12345678"
};

RequestBuilder.POST(payload).URL(`https://api-nodejs-todolist.herokuapp.com/user/login`).buildAsPromise().then(console.log);

//Add FILE upload