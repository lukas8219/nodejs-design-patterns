import zeromq from 'zeromq';

async function main(){

  const sub = zeromq.socket('sub').connect("tcp://127.0.0.1:3000");

  sub.on('message', (topic, message) => {
    console.log(topic, message);
  })

}

main();
