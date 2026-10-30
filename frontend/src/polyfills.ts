// sockjs-client references Node's `global` in its browser bundle.
// Expose the browser global object before Angular and the chat service load.
Object.assign(globalThis, { global: globalThis });
