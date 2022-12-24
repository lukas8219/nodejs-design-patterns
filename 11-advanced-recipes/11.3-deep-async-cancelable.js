/* 
Extend the createAsynCancelable function so that its possible to invoke other cancelable functions from within the main cancelable function.
Cancelling the main operation should also cancel all nested operations
hint: Allow to yield the result of an asyncCancelable from within the generator function.
 */

function createAsyncCancelable(generationFunction) {
    return function asyncCancelable(...args) {
        const generator = generationFunction(...args);

        let canceled = false;
        const toBeCancelled = [];

        function cancel() {
            toBeCancelled.forEach((fn) => fn());
            canceled = true;
        }

        const promise = new Promise((res, rej) => {

            async function next(prevResult) {

                if (prevResult.value && typeof prevResult.value.cancel === 'function') {
                    toBeCancelled.push(prevResult.value.cancel)
                }

                if (canceled) {
                    return rej(new Error('canceled!'));
                }

                if (prevResult.done) {
                    return res(prevResult.value);
                }
                try {
                    await next(await generator.next(await (await prevResult.value)))
                } catch (err) {
                    try {
                        await next(await generator.throw(err));
                    } catch (err2) {
                        return rej(err2);
                    }
                }

            }

            next({});
        })

        return { promise, cancel }
    }();
}

//TEST

function asyncFn(fn, ms = 1000) {
    return new Promise((res, rej) => {
        setTimeout(() => {
            try {
                return res(fn());
            } catch (err) {
                return rej(err);
            }
        }, ms)
    })
}

function createFlow(name) {
    return createAsyncCancelable(function* () {
        try {
            yield console.log(`starting flow ${name}`);
            const a = yield asyncFn(() => 100);
            const b = yield asyncFn(() => 200);
            yield asyncFn(() => console.log(a + b));
            yield console.log(`finishing flow ${name}`);
        } catch (err) {
            console.log(err);
        }
    });
}

const { promise, cancel } = createAsyncCancelable(function* () {
    try {
        yield createFlow('1');
        yield createFlow('2');
        yield createFlow('3');
    } catch (err) {
        console.log(err);
    }
});


setTimeout(() => {
    cancel()
})
