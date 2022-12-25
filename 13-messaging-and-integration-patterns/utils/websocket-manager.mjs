import { WebSocketServer, WebSocket } from 'ws';
import { parse } from 'url'

export class WebsocketManager {

    constructor(server, defaultRoom = 'the-room') {
        this.ws = new WebSocketServer({ noServer: true });
        this.clientsToRoom = new Map();
        server.on('upgrade', (request, socket, head) => {
            this.ws.handleUpgrade(request, socket, head, (ws) => {
               this.ws.emit('connection', ws, request);
            })
        })
        this.defaultRoom = defaultRoom;
    }

    broadcast(message) {
        this._applyToAllClients((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        })
    }

    broadcastToRoom(room, message){
        const clients = this.clientsToRoom.get(room) || [];
        clients.forEach((client) => {
            client.notify(message);
        })
    }

    disconnect() {
        this.ws.close();
    }

    _applyToAllClients(cb) {
        this.ws.clients.forEach(cb);
    }

    onConnect(cb){
        this.ws.on('connection', (client, request) => {
            const room = parse(request.url, true).query['room'] || this.defaultRoom;
            const clients = this.clientsToRoom.get(room) || [];
            this.clientsToRoom.set(room, new Array([...clients, client]));
            cb(new WebsocketClient(this, { client, room }));
        });
    }
}

export class WebsocketClient {

    constructor(wsManager, { client, room }){
        this.client = client;
        this.wsManager = wsManager;
        this.room = room;
    }

    notify(message){
        if(this.client.readyState === WebSocket.OPEN){
            this.client.send(message);
        }
    }

    onMessage(cb){
        this.client.on('message', cb);
    }

}