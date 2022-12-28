import amqplib from 'amqplib'
import Redis from 'ioredis';

const client = new Redis();

const aggregators = [
  {
    operation: 'AmountOfArguments',
    aggregate(...args){
      return args.length;
    }
  },
  {
    operation: 'SumOfArguments',
    aggregate(...args){
      return args.reduce((p,c) => Number(p)+Number(c), 0);
    }
  },
  {
    operation: 'ProductOfArguments',
    aggregate(...args){
      return args.reduce((p,c) => Number(p)*Number(c), 1);
    }
  },
  {
    operation: 'SumFactorialOfArguments',
    aggregate(...args){
      return args.map((n) => Math.pow(Number(n), 2)).reduce((p,c) => p+c, 0);
    }
  }
];

async function main(){
  const connection = await amqplib.connect('amqp://localhost');
  const channel = await connection.createChannel();
  const { exchange } = await channel.assertExchange('my_exchange', 'fanout');

  for(const { operation, aggregate } of aggregators){
    const { queue } = await channel.assertQueue(operation, { autoDelete: true });
    await channel.bindQueue(queue, exchange);

    channel.consume(queue, async (raw) => {
      const message = JSON.parse(raw.content.toString());
      const { replyTo, correlationId } = raw.properties;
      const redisKey = `my_exchange_${correlationId}`;
      try {
       const result = await aggregate(...message);
        const aggregateMessage = {
            operation,
            aggregate: result || null
        }
        await next(aggregateMessage, replyTo, redisKey, correlationId);
      } catch(err){
        console.error(err);
        const errorMessage = { error: JSON.stringify(err), message: 'Unexpected error' };
        await next(errorMessage, replyTo, redisKey, correlationId);
      } finally {
        channel.ack(raw);
      }
    });
  }

  async function next(message, replyTo, redisKey, correlationId){
    if(!await client.exists(redisKey)){
      await client.call('JSON.SET', redisKey, '$', JSON.stringify([]));
    }
    const [ totalNumber ] = await client.call('JSON.ARRAPPEND', redisKey, '$', JSON.stringify(message));
    if(totalNumber === aggregators.length){
      const finalArray = await client.call('JSON.GET', redisKey);
      await client.del(redisKey);
      channel.sendToQueue(replyTo, Buffer.from(finalArray), { correlationId });
    }
  }
}

main();
