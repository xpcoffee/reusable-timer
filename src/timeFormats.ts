const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_HOUR = MINUTES_PER_HOUR * SECONDS_PER_MINUTE;
const HOURS_PER_DAY = 24;
const SECONDS_PER_DAY = HOURS_PER_DAY * SECONDS_PER_HOUR;

export function minuteFormat(seconds: number): string {
    if (seconds === 0) {
        return "0m 0s"
    }

    const secs = seconds % SECONDS_PER_MINUTE;
    const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
    return `${minutes}m ${secs}s`
}

export function hourFormat(seconds: number): string {
    if (seconds === 0) {
        return "0h 0m 0s"
    }

    const secs = seconds % SECONDS_PER_MINUTE;
    const minutes = Math.floor(seconds / SECONDS_PER_MINUTE) % MINUTES_PER_HOUR;
    const hours = Math.floor(seconds / SECONDS_PER_HOUR);
    return `${hours}h ${minutes}m ${secs}s`
}

export function dayFormat(seconds: number): string {
    if (seconds === 0) {
        return "0d 0h 0m 0s"
    }

    const secs = seconds % SECONDS_PER_MINUTE;
    const minutes = Math.floor(seconds / SECONDS_PER_MINUTE) % MINUTES_PER_HOUR;
    const hours = Math.floor(seconds / SECONDS_PER_HOUR) % HOURS_PER_DAY;
    const days = Math.floor(seconds / SECONDS_PER_DAY);
    return `${days}d ${hours}h ${minutes}m ${secs}s`
}
