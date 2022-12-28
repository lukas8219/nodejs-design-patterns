import zeromq from 'zeromq';

async function main(){
  const pub = zeromq.socket('pub').bindSync("tcp://127.0.0.1:3000");
  console.log("Publisher bound to port 3000");
  setInterval(() => {
    pub.send(["queue-one", "this is my message!!"])
  }, 1000)
}

main();
