export function createTimer(ontick: (countInSeconds: number) => void, initialCountInSeconds: number = 0): Timer {
    type TimerAction = { type: "start" } | { type: "stop" } | { type: "set", countInSeconds: number }

    const worker = createNewWorker();
    worker.onmessage = function ({ data: countInSeconds }) {
        ontick(countInSeconds);
    }

    function set(countInSeconds: number) {
        const action: TimerAction = { type: "set", countInSeconds }
        worker.postMessage(action);
    }

    function stop() {
        const action: TimerAction = { type: "stop" }
        worker.postMessage(action);
    }

    function start() {
        const action: TimerAction = { type: "start" }
        worker.postMessage(action);
    }

    set(initialCountInSeconds);

    return { start, stop, set };
}

export type Timer = {
    start: () => void,
    stop: () => void,
    set: (countInSeconds: number) => void,
};

function createNewWorker() {
    // Unfortunately, the webworker API expects a file/URI from whic to load code
    // So we need to turn our worker code into a text blob and create a URI that points to the result
    const fnCode = workerFn.toString();
    const code = fnCode.substring(fnCode.indexOf("{") + 1, fnCode.lastIndexOf("}"));
    const blob = new Blob([code], { type: 'application/javascript' });
    const uri = URL.createObjectURL(blob);

    const worker = new Worker(uri);
    URL.revokeObjectURL(uri);
    return worker;
}

// Placing the worker code in a function allows us to get the code as a string; we need that text code when creating a new worker.
function workerFn() {
    // find a way to share this outside of the worker function
    type TimerAction = { type: "start" } | { type: "stop" } | { type: "set", countInSeconds: number }

    let countInSeconds: number = 0;
    let intervalId: number | undefined;

    /*
     * Get around the typing errors
     * https://github.com/microsoft/TypeScript/issues/20595#issuecomment-390359040
     */
    const context: Worker = self as any;

    addEventListener('message', ({ data }) => {
        const message = data as TimerAction;
        switch (message.type) {
            case "set":
                countInSeconds = message.countInSeconds;
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = tick();
                }
                break;
            case "start":
                if (!intervalId) {
                    intervalId = tick();
                }
                break;
            case "stop":
                if (intervalId) {
                    clearInterval(intervalId);
                }
                intervalId = undefined;
                break;
        }

        context.postMessage(countInSeconds);
    })

    function tick(): number {
        const interval = setInterval(() => {
            countInSeconds > 0 ? countInSeconds-- : clearInterval(interval);
            context.postMessage(countInSeconds)
        }, 1000) as unknown as number; // typecast to get around the node typeings - I need to understand how to correctly set the types later

        return interval;
    }
}