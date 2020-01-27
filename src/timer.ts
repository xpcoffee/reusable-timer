export function createTimer(ontick: (count: number) => void) {
    const ACTIONS = {
        "START": 1,
        "STOP": 2,
        "RESET": 3,
    }

    const worker = createNewWorker();
    worker.onmessage = function ({ data: count }) {
        ontick(count);
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

// Creates a new worker
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

function workerFn() {
    // find a way to share this with main file
    const ACTIONS = {
        "START": 1,
        "STOP": 2,
        "RESET": 3,
    }

    let count: number = 1;
    let timerActive: boolean = false;
    let locked: boolean = false;

    /*
     * Get around the typing errors
     * https://github.com/microsoft/TypeScript/issues/20595#issuecomment-390359040
     */
    const context: Worker = self as any;


    addEventListener('message', ({ data }) => {
        switch (data) {
            case ACTIONS.RESET:
                count = 1;
                break;
            case ACTIONS.START:
                if (!timerActive) {
                    timerActive = true;
                    tick();
                }
                break;
            case ACTIONS.STOP:
                timerActive = false;
                break;
        }

        context.postMessage(count);
    })

    function tick(newTick: boolean = true) {
        if (newTick && locked) {
            // don't start new ticks if one is already going
            return;
        }

        if (newTick && !locked) {
            locked = true;
        }

        context.postMessage(count)
        setTimeout(function () {
            count++;
            if (timerActive) {
                tick(false)
            } else {
                locked = false; // release lock
            }
        }, 1000);
    }
}