import './style.css';
import { createTimer } from "./timer";

function main() {
    const startButton = assertExists(document.getElementById("startButton"));
    const stopButton = assertExists(document.getElementById("stopButton"));
    const resetButton = assertExists(document.getElementById("resetButton"));
    const counter = assertExists(document.getElementById("count"));

    const canContinue = startButton && stopButton && resetButton && counter;

    if (!canContinue) {
        console.error("Unable to find a main element for the application.");
        return;
    }

    function ontick(count: number) {
        counter.innerText = count.toString();
    }

    const { start, stop, reset } = createTimer(ontick);
    startButton.onclick = start;
    stopButton.onclick = stop;
    resetButton.onclick = reset;
}

function withErrorBoundary(fn: () => void) {
    return (
        function wrappedMain() {
            try {
                fn();
            } catch (e) {
                const app = assertExists(document.getElementById("app"));
                while (app.firstChild) {
                    app.removeChild(app.firstChild);
                }

                const div = document.createElement("div");
                const msg = document.createElement("span");
                msg.innerText = "The application has failed spectacularly:"

                const stack = document.createElement("p");
                stack.innerText = JSON.stringify(e);

                div.appendChild(msg);
                div.appendChild(stack);
                app.appendChild(div);
            }
        }
    );
}

function assertExists(element: HTMLElement | null): HTMLElement {
    if (element === null) {
        throw "Critical element missing."
    }
    return element;
}

window.onload = withErrorBoundary(main);