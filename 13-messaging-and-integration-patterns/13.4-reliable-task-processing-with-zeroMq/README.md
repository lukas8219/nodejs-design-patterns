Implement a mechanism to make our hashsum cracker example with ZeroMQ more reliable. As we already mentioned, with the implementation we saw in this chapter, if a worker crashes, all the tasks it was processing are lost. Implement a peer-to-peer queuing system and an acknowledgment mechanism to make sure that the message is always processed at least once (excluding errors due to hypothetical unprocessable tasks).

Casciaro, Mario; Mammino, Luciano. Node.js Design Patterns: Design and implement production-grade Node.js applications using proven patterns and techniques, 3rd Edition (p. 614). Packt Publishing. Edição do Kindle.


#I WASNT ABLE TO FINISH THIS ONE ON ARM PROCESSOR. MAC M1. Skipping for now.
#ZEROMQ LIB THROWS ERROR
dlopen(/Users/lucas.polesello/Documents/Projetos/nodejs-design-patterns/node_modules/zeromq/build/Release/zmq.node, 0x0001): tried: '/Users/lucas.polesello/Documents/Projetos/nodejs-design-patterns/node_modules/zeromq/build/Release/zmq.node' (mach-o file, but is an incompatible architecture (have 'x86_64', need 'arm64e'))

After installing `npm install zeromq@5 --build-from-source`
