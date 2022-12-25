import { createServer } from 'http';
import serveHandler from 'serve-handler'
import { HistoryService } from '../utils/history-service.mjs';
import { WebsocketManager } from '../utils/websocket-manager.mjs';

const server = createServer((req, res) => {
    serveHandler(req, res, { public: 'public' })
}
)
const wss = new WebsocketManager(server);
const service = new HistoryService();

wss.onConnect(async (client) => {

    const messages = await service.listHistoryMessages('the-room');

    for(const m of messages){
        client.notify(m.message)
    }

    client.onMessage(async (message) => {
        await service.saveHistory('the-room', [ message.toString() ]);
        wss.broadcast(message.toString());
    })
    
})

server.listen(8080);