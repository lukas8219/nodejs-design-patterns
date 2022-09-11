/* 
Extend the createAsynCancelable function so that its possible to invoke other cancelable functions from within the main cacheable function.
Cancelling the main operation should also cancel all nested operations
hint: Allow to yield the result of an asyncCancelable from within the generator function.
 */