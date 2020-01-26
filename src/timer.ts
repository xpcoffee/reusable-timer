export function createTimer() {
    const ACTIONS = {
        "START": 1,
        "STOP": 2,
        "RESET": 3,
    }

    const worker = createNewWorker();
    worker.onmessage = function ({ data: count }) {
        countDisplay.innerText = count;
    }

    const resetButton = document.createElement("button");
    resetButton.innerText = "Reset";
    resetButton.onclick = function () {
        worker.postMessage(ACTIONS.RESET);
    }

    const stopButton = document.createElement("button");
    stopButton.innerText = "Stop";
    stopButton.onclick = function () {
        worker.postMessage(ACTIONS.STOP);
    }

    const startButton = document.createElement("button");
    startButton.innerText = "Start";
    startButton.onclick = function () {
        worker.postMessage(ACTIONS.START);
    }

    const buttonDiv = document.createElement("div");
    buttonDiv.appendChild(startButton);
    buttonDiv.appendChild(resetButton);
    buttonDiv.appendChild(stopButton);

    const countDisplay = document.createElement("span");
    countDisplay.id = "counter";
    countDisplay.innerText = Number(1).toString();
    const countDiv = document.createElement("div");
    countDiv.appendChild(countDisplay)

    const timer = document.createElement("div");
    timer.appendChild(buttonDiv);
    timer.appendChild(countDiv);

    worker.postMessage(ACTIONS.START);

    return timer;
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
    // URL.revokeObjectURL(uri);
    return worker;
}

function workerFn() {
    // find a way to share this with main file
    const ACTIONS = {
        "START": 1,
        "STOP": 2,
        "RESET": 3,
    }

    console.log("loaded");

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