import amqplib from 'amqplib';
import { nanoid } from 'nanoid';

export class AggregatorController {
  constructor(channel, queueName){
    this.correlatiosFn = new Map();
    this.channel = channel;
    this.initialize(queueName);
    this.delayedRequests = [];
  }

  async initialize(queueName){
    const { queue } = await this.channel.assertQueue(queueName);
    this.responseQueue = queue; 
    this.channel.consume(this.responseQueue, async (message) => {
      this.channel.ack(message);
      return this.correlatiosFn.get(message.properties.correlationId)(JSON.parse(message.content.toString()));
    });
  }

  send(exchange, payload){
    return new Promise(async (res) => {
      const correlationId = nanoid();
      this.channel.publish(exchange, '*', Buffer.from(JSON.stringify((payload))), { replyTo: this.responseQueue, correlationId });
      this.correlatiosFn.set(correlationId, res);
    })
  }

  destroy(){
    this.channel.close();
  }

}

async function main(){
  const conn = await amqplib.connect('amqp://localhost');
  const chan = await conn.createConfirmChannel();

  const  controller = new AggregatorController(chan, "my_response");

  setTimeout(async () => {
    const result = await controller.send('my_exchange', ["calc-me", 1, { "hello": 1 } ]);
    console.log(result);
  }, 1500)
    await chan.waitForConfirms();
}

main();
