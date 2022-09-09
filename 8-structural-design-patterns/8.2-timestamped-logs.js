const consoleProxy = new Proxy(console, {
    get(t, p, r) {
        if (['log', 'debug', 'error', 'info'].includes(p)) {
            const fn = t[p];
            return function (...messages) {
                const now = new Date().toISOString();
                return fn(`${now} ${messages}`)
            }
        }
    }
})
