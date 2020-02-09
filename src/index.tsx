import { h, render, JSX } from "preact";
import { useState, useEffect } from "preact/hooks";
import './style.css';
import { createTimer, Timer } from "./timer";
import { minuteFormat, hourFormat, dayFormat } from "./timeFormats";
import { faEdit, faTimesCircle, IconDefinition, faCheckCircle } from '@fortawesome/free-solid-svg-icons'

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
    renderEdit: (countInSeconds: number, onEdit: (countInSeconds: number) => void) => JSX.Element;
    nextState: (countInSeconds: number) => CountDisplayState;
}

function EditCountButton({ class: classes, onClick }: { class?: string, onClick?: () => void }) {
    return <button class={`m-4 border-transparent focus:shadow-outline focus:outline-none ${classes}`} onClick={onClick}><FontAwesomeIcon icon={faEdit}></FontAwesomeIcon></button>
}

function CancelEditCountButton({ class: classes, onClick }: { class?: string, onClick?: () => void }) {
    return <button class={`m-4 border-transparent focus:shadow-outline focus:outline-none ${classes}`} onClick={onClick}><FontAwesomeIcon icon={faTimesCircle}></FontAwesomeIcon></button>
}

function ConfirmEditCountButton({ class: classes, onClick }: { class?: string, onClick?: () => void }) {
    return <button class={`m-4 border-transparent focus:shadow-outline focus:outline-none ${classes}`} onClick={onClick}><FontAwesomeIcon icon={faCheckCircle}></FontAwesomeIcon></button>
}

function FontAwesomeIcon({ icon }: { icon: IconDefinition }) {
    const pathData = icon.icon[4]
    let paths: string[] = ([] as string[]).concat(pathData);

    return <svg class="fill-current text-gray-200" style={{ width: "50px", height: "50px" }} viewBox={`0 0 ${icon.icon[0] /*width*/} ${icon.icon[1] /*height*/}`} >
        {paths.map(path => <path d={path} />)}
    </svg>
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

function SecondsEditor(count: number, onEdit: (count: number) => void) {
    return <div class="text-6xl text-gray-700 flex">
        <input
            class="mx-2"
            placeholder={count.toString()}
            type="number" style={{ textAlign: "right" }}
            onInput={
                ({ currentTarget }) => onEdit(Number.parseInt(currentTarget.value))
            }>
        </input><span>s</span>
    </div>;
}

interface CountDisplayProps { countInSeconds: number, editState: EditState, onEditStateChange: (editState: EditState) => void, onEdit: (countInSeconds: number) => void, initialCountInSeconds: number };

function CountDisplay({ countInSeconds, editState, onEditStateChange, onEdit, initialCountInSeconds }: CountDisplayProps) {
    const [displayState, setDisplayState] = useState<CountDisplayState>(COUNT_DISPLAY_STATES.seconds);
    const [localCount, setLocalCount] = useState(initialCountInSeconds);

    function getEditButton(editState: EditState) {
        switch (editState) {
            case "disabled":
                return undefined;
            case "viewing":
                return <EditCountButton onClick={() => onEditStateChange("editing")} />;
            case "editing":
                return <div class="flex">
                    <ConfirmEditCountButton onClick={() => {
                        onEdit(localCount);
                        onEditStateChange("viewing");
                    }} />
                    <CancelEditCountButton onClick={() => {
                        onEditStateChange("viewing");
                    }} />
                </div>;
        }
    }

    const display = editState === "editing"
        ? displayState.renderEdit(initialCountInSeconds, countInSeconds => setLocalCount(countInSeconds))
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