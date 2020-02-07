import { h, render, JSX } from "preact";
import { useState, useEffect } from "preact/hooks";
import './style.css';
import { createTimer } from "./timer";
import { minuteFormat, hourFormat, dayFormat } from "./timeFormats";

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
    const [countInSeconds, setCountInSeconds] = useState(0);

    function ontick(seconds: number) {
        setCountInSeconds(seconds);
    }

    const [timer, setTimer] = useState<{ start: () => void; stop: () => void; reset: () => void }>({ start: () => { }, stop: () => { }, reset: () => { } });

    useEffect(() => {
        setTimer(createTimer(ontick));
    }, [])

    const title = <h1 class="text-6xl text-gray-400">Reusable timer</h1>;
    const resetButton = <button
        onClick={timer.reset}
        class="px-6 text-3xl text-gray-700 font-semibold bg-gray-200 hover:bg-gray-500 py-3 rounded border-2 border-transparent focus:border-orange-500 focus:outline-none active:bg-gray-400"
        id="resetButton">Reset</button>;

    return <div class="bg-gray-800 flex h-screen items-center justify-center">
        <div class="flex-auto max-w-xl flex flex-col">
            <div class="flex-8">
                <div class="flex flex-col text-center" id="app">
                    {title}
                    <div class="flex pt-10 pb-6 justify-center items-center">
                        <div class="m-4">{resetButton}</div>
                        <Toggle
                            activateLabel="Start"
                            deactivateLabel="Stop"
                            initiallyActive={true}
                            onToggle={active => { active ? timer.start() : timer.stop() }} />
                    </div>
                    <CountDisplay countInSeconds={countInSeconds} />
                </div>
            </div>
            <div class="h-56"></div>
        </div>
    </div>;
}

interface CountDisplayState {
    render: (countInSeconds: number) => JSX.Element;
    nextState: (countInSeconds: number) => CountDisplayState;
}

const COUNT_DISPLAY_STATES: { [key: string]: CountDisplayState } = {
    seconds: {
        render: (countInSeconds: number) => <span class="text-6xl text-gray-200" id="count">{countInSeconds}s</span>,
        nextState: () => COUNT_DISPLAY_STATES.minutes,
    },
    minutes: {
        render: (countInSeconds: number) => <span class="text-6xl text-gray-200" id="count">{minuteFormat(countInSeconds)}</span>,
        nextState: () => COUNT_DISPLAY_STATES.hours,
    },
    hours: {
        render: (countInSeconds: number) => <span class="text-6xl text-gray-200" id="count">{hourFormat(countInSeconds)}</span>,
        nextState: () => COUNT_DISPLAY_STATES.days,
    },
    days: {
        render: (countInSeconds: number) => <span class="text-6xl text-gray-200" id="count">{dayFormat(countInSeconds)}</span>,
        nextState: () => COUNT_DISPLAY_STATES.seconds,
    },
}

function CountDisplay({ countInSeconds }: { countInSeconds: number }) {
    const [displayState, setDisplayState] = useState<CountDisplayState>(COUNT_DISPLAY_STATES.seconds);

    return <button
        class="border-2 border-transparent focus:border-orange-500 focus:outline-none"
        onClick={() => setDisplayState(displayState.nextState(countInSeconds))}>
        {displayState.render(countInSeconds)}
    </button>;
}

function Toggle({
    onToggle,
    initiallyActive = false,
    activateLabel,
    deactivateLabel
}: {
    onToggle: (active: boolean) => void,
    initiallyActive?: boolean,
    activateLabel: string,
    deactivateLabel: string
}) {
    const [active, setActive] = useState<boolean>(initiallyActive);

    const label = active ? deactivateLabel : activateLabel;
    const position = active ? "justify-end" : "justify-start";

    const slider =
        <div class="px-6 text-3xl text-gray-700 font-semibold border-solid py-3 focus:outline-none bg-gray-200 focus:border-dashed rounded"
            id="startButton">{label}</div>;

    return <button class={`flex m-4 bg-gray-700 w-64 hover:bg-gray-500 border-transaparent p-2 rounded focus:outline-none border-2 border-transparent focus:border-orange-500 focus:outline-none active:bg-gray-400 ${position}`}
        onClick={() => {
            const newState = !active;
            setActive(newState);
            onToggle(newState);
        }
        }>
        {slider}
    </button>
}