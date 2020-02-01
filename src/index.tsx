import { h, render } from "preact";
import { useState, useRef, useErrorBoundary, useEffect } from "preact/hooks";
import './style.css';
import { createTimer } from "./timer";

render(<App />, document.getElementById('app') as Element);

function App() {
    try {
        return Timer();
    } catch (error) {
        return Broken(error);
    }
}

function Broken(error: unknown) {
    console.log("in broken");
    return <div class="flex justify-center">
        <div class="p-5">
            <h1 class="text-3xl text-red-500 p-3">Everything exploded!</h1>
            <p class="text-gray-700 bg-gray-400 font-mono p-3 rounded">{JSON.stringify(error)}</p>
        </div>
    </div>;
}

function Timer() {
    const [count, setCount] = useState(0);

    function ontick(count: number) {
        setCount(count);
    }

    const [timer, setTimer] = useState<{ start: () => void; stop: () => void; reset: () => void }>({ start: () => { }, stop: () => { }, reset: () => { } });

    useEffect(() => {
        setTimer(createTimer(ontick));
    }, [])

    const title = <h1 class="text-6xl text-gray-400">Reusable timer</h1>;
    const resetButton = <button
        onClick={timer.reset}
        class="px-6 text-3xl text-gray-700 font-bold bg-gray-200 border-solid border-4 border-gray-700 hover:bg-gray-500 py-3 rounded focus:border-dashed focus:outline-none active:bg-gray-200"
        id="resetButton">Reset</button>;
    const startButton =
        <button onClick={timer.start}
            class="px-6 text-3xl text-gray-700 font-bold bg-gray-200 border-solid border-4 border-gray-700 hover:bg-gray-500 py-3 rounded-l focus:border-dashed focus:outline-none active:bg-gray-200"
            id="startButton">Start</button>;
    const stopButton = <button
        onClick={timer.stop}
        class="px-6 text-3xl text-gray-400 font-semibold bg-gray-700 py-3 rounded-r border-4 border-transparent border-solid focus:border-gray-400 focus:border-dashed focus:outline-none"
        id="stopButton">Stop</button>;
    const counter = <span class="text-6xl text-gray-200" id="count">{count}</span>;

    return <div class="bg-gray-800 flex h-screen items-center justify-center">
        <div class="flex-auto max-w-xl flex flex-col">
            <div class="flex-8">
                <div class="flex flex-col text-center" id="app">
                    {title}
                    <div class="flex pt-10 pb-6 justify-center">
                        <div class="m-4">{resetButton}</div>
                        <div class="flex m-4">
                            {startButton}
                            {stopButton}
                        </div>
                    </div>
                    <div>{counter}</div>
                </div>
            </div>
            <div class="h-56"></div>
        </div>
    </div>;
}
