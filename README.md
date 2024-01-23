## Intro
Prototype for a simple library to offload functions to worker threads. 
Intent is to provide a simple API surface so devs can code as they would with async patterns.

## USAGE
Include the tasker.js, register your function, use it.

```
    tasker.register(async function hello({ name }, task) {
        const { resolve, reject, postMessage } = task;
        if (!name) reject('need a name bub');
        postMessage(`hello from the worker thread ${name}!`);
        resolve();
    });

    // throws, missing name
    tasker
        .hello({})
        .then(console.log)
        .catch(console.error)

    // logs message then resolves
    tasker
        .hello({ name: 'Bob', onmessage: console.log })
        .then(() => console.log('done'))
        .catch(console.error);
```

## Todo 
- [ ] need a different name
- [ ] accomodate external scripts (url)
- [ ] provide global config for things like pool management