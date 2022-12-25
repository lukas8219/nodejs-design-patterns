import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import serveHandler from 'serve-handler'
import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./database.db');

class HistoryService {

    constructor(){
        db.exec(`
        CREATE TABLE IF NOT EXISTS "histories" (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room TEXT,
            message TEXT
        )
        `)
    }

    listHistoryMessages(room) {
        return new Promise((res, rej) => {
            db.all(`SELECT * FROM "histories" WHERE "room" = ?`, [room], (err, rows) => {
                if(err){
                    return rej(err);
                }
                return res(rows.map(({ message }) => ({ message })));
            });
        })
    }

    _runAsyncOperation(query, params){
        return new Promise((res) => db.run(query, params, res));
    }

    async saveHistory(room, data){
        return new Promise(async (res) => {
            for(const message of data){
                await this._runAsyncOperation(`INSERT INTO "histories"(room, message) VALUES(?,?);`, [ room, message ]);
            }
            return res();
        })
    }

}

class WebsocketManager {

    constructor(server) {
        this.ws = new WebSocketServer({ server });
    }

    broadcast(message) {
        this._applyToAllClients((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        })
    }

    disconnect() {
        this.ws.close();
    }

    _applyToAllClients(cb) {
        this.ws.clients.forEach(cb);
    }

    onConnect(cb){
        this.ws.on('connection', cb);
    }
}

const server = createServer((req, res) => {
    serveHandler(req, res, { public: 'public' })
}
)

const wss = new WebsocketManager(server);
const service = new HistoryService();

wss.onConnect(async (client) => {

    const messages = await service.listHistoryMessages('the-room');

    for(const m of messages){
        client.send(m.message)
    }
    
    client.on('message', async (message) => {
        await service.saveHistory('the-room', [ message.toString() ]);
        wss.broadcast(message.toString());
    })
})

server.listen(8080);