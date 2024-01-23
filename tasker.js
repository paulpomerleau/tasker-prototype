const tasker = (() => {
  const functions = {};

  /**
   * @name register
   * @description registers a function to be used by the tasker
   * @param {(args: Record<string, any>, task: { resolve: Promise.resolve, reject: Promise.reject, postMessage: Worker.postMessage }) => Promise<any>} function to register
   * @returns {void}
   */
  const register = function (func) {
    if (typeof func !== "function") {
      throw new Error("Function must be a function");
    }

    if (!func.name) {
      throw new Error("Function must have a name");
    }

    if (func.constructor.name !== "AsyncFunction") {
      throw new Error("Function must be async");
    }

    functions[func.name] = func.toString();
  };

  const run = function (func, { onmessage, ...args }) {
    return new Promise((resolve, reject) => {
      const blob = new Blob(
        [
          `
            (async () => {
                try {
                    const func = ${func};
                    const params = ${JSON.stringify(args)};
                    const resolve = (__result) => self.postMessage({ __result });
                    const reject = (__error) => { throw new Error(__error) };
                    const postMessage = self.postMessage;
                    const __result = await func(params, { resolve, reject, postMessage }) || true;
                    self.postMessage({ __result });
                } catch (__error) {
                    console.error(__error);
                    self.postMessage({ __error });
                }
            })();
        `,
        ],
        { type: "application/javascript" }
      );

      const url = URL.createObjectURL(blob);
      const worker = new Worker(url);
      URL.revokeObjectURL(url);

      worker.onmessage = (event) => {
        const { data } = event;
        const { __result, __error } = data;
        if (__result) {
          worker.terminate();
          resolve(__result);
        } else if (__error) {
          worker.terminate();
          reject(__error);
        } else if (onmessage) {
          onmessage(data);
        }
      };
    });
  };

  return new Proxy(
    { register },
    {
      get: function (target, prop) {
        if (prop === "register") {
          return target[prop];
        }

        if (prop in functions) {
          return (args) => run(functions[prop], args);
        }

        return undefined;
      },
    }
  );
})();
