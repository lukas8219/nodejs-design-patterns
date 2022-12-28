import amqp from 'amqplib'
import { processTask } from './processTask.js'

async function main () {
  const PID = process.pid;
  const connection = await amqp.connect('amqp://localhost')
  const channel = await connection.createChannel()
  const { queue } = await channel.assertQueue('tasks_queue')
  const { queue: broadcastQueue } = await channel.assertQueue(`results_queue_${PID}`, { durable: false, autoDelete: true })
  const { queue: resultQueue } = await channel.assertQueue(`results_queue`);
  const cancelToSearchHash = new Map();
  await channel.prefetch(100);


  const { exchange }  = await channel.assertExchange('fanout-exchange', 'fanout');
  await channel.bindQueue(broadcastQueue, exchange);

  channel.consume(queue, async (rawMessage) => {

    const parsedMessage = JSON.parse(rawMessage.content.toString());
    const { cancel, process } = await processTask(parsedMessage);

    cancelToSearchHash.set(parsedMessage.searchHash, cancel);

    const found = await process();

    if (found) {
      cancel();
      const buffer = Buffer.from(JSON.stringify({ workerPid: PID, source: parsedMessage.searchHash, result: found }))
      await channel.sendToQueue(resultQueue,
        Buffer.from(JSON.stringify({ foundBy: PID, hash: parsedMessage.searchHash, result: found })))
      await channel.publish(exchange, `*_${process.pid}`, buffer);
      await channel.purgeQueue(queue);
    }

    await channel.ack(rawMessage)
  })

  channel.consume(broadcastQueue, async (message) => {

      const parsedMessage = JSON.parse(message.content.toString());

      if(parsedMessage.workerPid === process.pid){
        await channel.ack(message);
        return;
      }

      cancelToSearchHash.get(parsedMessage.source)();
  
      await channel.ack(message);
    })


  }

main().catch(err => console.error(err))
