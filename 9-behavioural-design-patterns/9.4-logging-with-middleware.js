/* 
Logggin with middlewares.

Rewrite the logging component you implemented for exercises 9.1 and 9.2 but this time using the middleware pattern to postprocess each log message allowing different middlewares to customize how to handle
the message and how to output them

We could for example add a serialize() middleware to convert log messages to string representation ready to be sent over wire or saved somewhere.
Then we could add, saveToFile() middlewares that saves each message to a file.
 */