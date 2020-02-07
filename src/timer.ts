export function createTimer(ontick: (countInSeconds: number) => void) {
    const ACTIONS = {
        "START": 1,
        "STOP": 2,
        "RESET": 3,
    }

    const worker = createNewWorker();
    worker.onmessage = function ({ data: countInSeconds }) {
        ontick(countInSeconds);
    }

    function reset() {
        worker.postMessage(ACTIONS.RESET);
    }

    function stop() {
        worker.postMessage(ACTIONS.STOP);
    }

    function start() {
        worker.postMessage(ACTIONS.START);
    }

    worker.postMessage(ACTIONS.START);

    return { start, stop, reset };
}

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
    // find a way to share this with main file
    const ACTIONS = {
        "START": 1,
        "STOP": 2,
        "RESET": 3,
    }

    let countInSeconds: number = 0;
    let intervalId: number | undefined;

    /*
     * Get around the typing errors
     * https://github.com/microsoft/TypeScript/issues/20595#issuecomment-390359040
     */
    const context: Worker = self as any;


    addEventListener('message', ({ data }) => {
        switch (data) {
            case ACTIONS.RESET:
                countInSeconds = 0;
                break;
            case ACTIONS.START:
                if (!intervalId) {
                    console.log('starting to tick');
                    intervalId = tick();
                }
                break;
            case ACTIONS.STOP:
                if (intervalId) {
                    clearInterval(intervalId);
                }
                intervalId = undefined;
                break;
        }

        context.postMessage(countInSeconds);
    })

    function tick(): number {
        // typecast to get around the node typeings - I need to understand how to correctly set the types later
        return setInterval(() => { countInSeconds++; context.postMessage(countInSeconds) }, 1000) as unknown as number;
    }
}