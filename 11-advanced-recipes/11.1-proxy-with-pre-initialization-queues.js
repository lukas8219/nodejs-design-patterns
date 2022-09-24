/* 
Using a JavaScript Proxy, create a wrapper for adding pre-initialization queues to any object.
You should allow the consumer of the wrapper to decide which methods to augment and the name of the property/event that indicates if the component is initialized.
*/
function createAsyncProxy(target, proxyProperties, initializer) {
  const isProxyProperty = (property) => {
    if (Array.isArray(proxyProperties)) {
      return proxyProperties.includes(property);
    }
    return property === proxyProperties;
  };
  const queue = [];

  return new Proxy(target, {
    get(t, property) {
      if (property === initializer) {
        return t[property];
      }
      if (t[initializer]) {
        return t[property];
      }
      if (isProxyProperty(property)) {
        return new Promise((res, rej) => {
          queue.push(() => res(t[property]));
        });
      }
      return t[property];
    },
    set(t, property, value) {
      if (property === initializer) {
        process.nextTick(() => queue.forEach((task) => task()));
      }
      return (t[property] = value);
    },
  });
}

const obj = { name: "Lucas" };

const wr = createAsyncProxy(obj, "name", "age");

wr.name.then((name) => console.log(name));

setTimeout(() => {
  wr.age = 50;
}, 500);
