import './style.css';
import { createTimer } from "./timer";

function main() {
    const app = document.getElementById("App");

    if (app === null) {
        console.error("Unable to find a root element for the application.");
        return;
    }

    app.appendChild(createTimer());
}

window.onload = main;