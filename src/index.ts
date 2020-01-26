function main() {
    const app = document.getElementById("App");

    if (app === null) {
        console.error("Unable to find a root element for the application.");
        return;
    }

    const hello = document.createElement("span");
    hello.innerText = "Hello there!";

    app.appendChild(hello);
}

window.onload = main;