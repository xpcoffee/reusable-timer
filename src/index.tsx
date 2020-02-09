import { h, render, JSX } from "preact";
import { useState, useEffect } from "preact/hooks";
import './style.css';
import { createTimer, Timer } from "./timer";
import { minuteFormat, hourFormat, dayFormat } from "./timeFormats";

function App() {
    try {
        return Timer();
    } catch (error) {
        return Broken(error);
    }
}

function Broken(error: unknown) {
    return <div class="flex justify-center">
        <div class="p-5">
            <h1 class="text-3xl text-red-500 p-3">Everything exploded!</h1>
            <p class="text-gray-700 bg-gray-400 font-mono p-3 rounded">{JSON.stringify(error)}</p>
        </div>
    </div>;
}

type EditState = "disabled" | "editing" | "viewing";

function Timer() {
    const DEFAULT_INITIAL_COUNT = 300; // five minutes
    const [countInSeconds, setCountInSeconds] = useState(DEFAULT_INITIAL_COUNT);
    const [initalCountInSeconds, setInitalCountInSeconds] = useState(DEFAULT_INITIAL_COUNT);
    const [timer, setTimer] = useState<Timer>({ start: () => { }, stop: () => { }, set: (_: number) => { } });

    function ontick(seconds: number) {
        setCountInSeconds(seconds);
    }

    useEffect(() => {
        setTimer(createTimer(ontick, initalCountInSeconds));
    }, [])

    const title = <h1 class="text-6xl text-gray-400">Reusable timer</h1>;
    const resetButton = <button
        onClick={() => timer.set(initalCountInSeconds)}
        class="px-6 text-3xl text-gray-700 font-semibold bg-gray-200 hover:bg-gray-500 py-3 rounded border-2 border-transparent focus:shadow-outline focus:outline-none active:bg-gray-400"
        id="resetButton">Reset</button>;

    const [active, setActive] = useState<boolean>(false);
    const [editing, setEditing] = useState<EditState>("viewing");

    return <div class="bg-gray-800 flex h-screen items-center justify-center">
        <div class="flex-auto max-w-xl flex flex-col">
            <div class="flex-8">
                <div class="flex flex-col text-center" id="app">
                    {title}
                    <div class="flex pt-10 pb-6 justify-center items-center">
                        <div class="m-4">{resetButton}</div>
                        <Toggle
                            active={active}
                            activateLabelText="Start"
                            deactivateLabelText="Stop"
                            activeLabelText="Counting"
                            inactiveLabelText="Stopped"
                            statusLabelText="Status"
                            onToggle={active => {
                                active ? timer.start() : timer.stop();
                                setActive(active);
                                setEditing(active ? "disabled" : "viewing");
                            }} />
                    </div>
                    <CountDisplay
                        countInSeconds={countInSeconds}
                        initialCountInSeconds={initalCountInSeconds}
                        editState={editing}
                        onEditStateChange={(editing) => setEditing(editing)}
                        onEdit={countInSeconds => {
                            setInitalCountInSeconds(countInSeconds);
                            setCountInSeconds(countInSeconds);
                            timer.set(countInSeconds);
                        }}
                    />
                </div>
            </div>
            <div class="h-56"></div>
        </div>
    </div>;
}

interface CountDisplayState {
    render: (countInSeconds: number) => JSX.Element;
    renderEdit: (countInSeconds: number, onEdit: (countInSeconds: number) => void, onConfirm?: () => void) => JSX.Element;
    nextState: (countInSeconds: number) => CountDisplayState;
}

function EditCountButton({ class: classes, onClick }: { class?: string, onClick?: () => void }) {
    return <button aria-label="Edit time" class={`m-4 border-transparent focus:shadow-outline focus:outline-none ${classes}`} onClick={onClick}>
        <svg class="fill-current text-gray-200" viewBox="0 0 576 512" style="width: 50px; height: 50px;"><path d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z"></path></svg>
    </button>
}

function CancelEditCountButton({ class: classes, onClick }: { class?: string, onClick?: () => void }) {
    return <button aria-label="Cancel edit" class={`m-4 border-transparent focus:shadow-outline focus:outline-none ${classes}`} onClick={onClick}>
        <svg class="fill-current text-gray-200" viewBox="0 0 512 512" style="width: 50px; height: 50px;"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm121.6 313.1c4.7 4.7 4.7 12.3 0 17L338 377.6c-4.7 4.7-12.3 4.7-17 0L256 312l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L134.4 338c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L312 256l65.6 65.1z"></path></svg>
    </button>
}

function ConfirmEditCountButton({ class: classes, onClick }: { class?: string, onClick?: () => void }) {
    return <button aria-label="Confirm edit" class={`m-4 border-transparent focus:shadow-outline focus:outline-none ${classes}`} onClick={onClick}>
        <svg class="fill-current text-gray-200" viewBox="0 0 512 512" style="width: 50px; height: 50px;"><path d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z"></path></svg>
    </button>
}

const COUNT_DISPLAY_STATES: { [key: string]: CountDisplayState } = {
    seconds: {
        render: (countInSeconds: number) => <span class="text-6xl text-gray-200" id="count">{countInSeconds}s</span>,
        renderEdit: SecondsEditor,
        nextState: () => COUNT_DISPLAY_STATES.minutes,
    },
    minutes: {
        render: (countInSeconds: number) => <span class="text-6xl text-gray-200" id="count">{minuteFormat(countInSeconds)}</span>,
        renderEdit: (count, onEdit) => <div></div>,
        nextState: () => COUNT_DISPLAY_STATES.hours,
    },
    hours: {
        render: (countInSeconds: number) => <span class="text-6xl text-gray-200" id="count">{hourFormat(countInSeconds)}</span>,
        renderEdit: (count, onEdit) => <div></div>,
        nextState: () => COUNT_DISPLAY_STATES.days,
    },
    days: {
        render: (countInSeconds: number) => <span class="text-6xl text-gray-200" id="count">{dayFormat(countInSeconds)}</span>,
        renderEdit: (count, onEdit) => <div></div>,
        nextState: () => COUNT_DISPLAY_STATES.seconds,
    },
}

function SecondsEditor(count: number, onEdit: (count: number) => void, onConfirm?: () => void) {
    return <div class="text-6xl text-gray-700 flex">
        <h2 id="editorId" class="hidden">Time editor</h2>
        <span id="secondsInputId">seconds</span>
        <input
            aria-labelledby="editorId secondsInputId"
            class="mx-2"
            placeholder={count.toString()}
            type="number" style={{ textAlign: "right" }}
            autoFocus={true}
            onKeyUp={(event) => {
                if (event.key === "Enter") {
                    onConfirm && onConfirm()
                }
            }}
            onInput={
                ({ currentTarget }) => onEdit(Number.parseInt(currentTarget.value))
            }>
        </input>
    </div>;
}

interface CountDisplayProps { countInSeconds: number, editState: EditState, onEditStateChange: (editState: EditState) => void, onEdit: (countInSeconds: number) => void, initialCountInSeconds: number };

function CountDisplay({ countInSeconds, editState, onEditStateChange, onEdit, initialCountInSeconds }: CountDisplayProps) {
    const [displayState, setDisplayState] = useState<CountDisplayState>(COUNT_DISPLAY_STATES.seconds);
    const [localCount, setLocalCount] = useState(initialCountInSeconds);

    const onConfirm = () => {
        onEdit(localCount);
        onEditStateChange("viewing");
    };

    function getEditButton(editState: EditState) {
        switch (editState) {
            case "disabled":
                return undefined;
            case "viewing":
                return <EditCountButton onClick={() => onEditStateChange("editing")} />;
            case "editing":
                return <div class="flex">
                    <ConfirmEditCountButton onClick={onConfirm} />
                    <CancelEditCountButton onClick={() => {
                        onEditStateChange("viewing");
                    }} />
                </div>;
        }
    }

    const display = editState === "editing"
        ? displayState.renderEdit(initialCountInSeconds, countInSeconds => setLocalCount(countInSeconds), onConfirm)
        : <button
            class="border-2 border-transparent focus:shadow-outline focus:outline-none"
            onClick={() => setDisplayState(displayState.nextState(countInSeconds))}>
            {displayState.render(countInSeconds)}
        </button>

    return <div class="flex justify-center">
        {display}
        {getEditButton(editState)}
    </div>;
}

interface ToggleProps {
    active: boolean,
    onToggle: (active: boolean) => void,
    activateLabelText: string,
    deactivateLabelText: string,
    activeLabelText: string,
    inactiveLabelText: string
    statusLabelText: string
}

function Toggle({
    active,
    onToggle,
    activateLabelText,
    deactivateLabelText,
    activeLabelText,
    inactiveLabelText,
    statusLabelText
}: ToggleProps) {
    const actionText = active ? deactivateLabelText : activateLabelText;
    const statusText = active ? activeLabelText : inactiveLabelText;
    const position = active ? "justify-end" : "justify-start";
    const background = active ? "bg-orange-400" : "bg-gray-700";

    const slider =
        <div class="px-6 text-3xl text-gray-700 font-semibold border-solid py-3 focus:outline-none bg-gray-200 rounded group-hover:bg-gray-500"
            id="startButton">{actionText}</div>;

    return <div>
        <div class="hidden">
            <span>{statusLabelText}</span>
            <span>{statusText}</span>
        </div>
        <button class={`flex m-4 ${background} w-64 group border-transaparent p-2 rounded focus:outline-none border-2 border-transparent focus:shadow-outline focus:outline-none ${position}`}
            onClick={() => {
                const newState = !active;
                onToggle(newState);
            }
            }>
            {slider}
        </button></div>
}

render(<App />, document.getElementById('app') as Element);