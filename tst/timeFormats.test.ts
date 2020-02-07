import { minuteFormat, hourFormat, dayFormat } from "../src/timeFormats";

describe("minuteFormat", () => {
    it("formats correctly", () => {
        expect(minuteFormat(10)).toEqual("0m 10s");
        expect(minuteFormat(60)).toEqual("1m 0s");
        expect(minuteFormat(601)).toEqual("10m 1s");
        expect(minuteFormat(6001)).toEqual("100m 1s");
        expect(minuteFormat(60001)).toEqual("1000m 1s");
        expect(minuteFormat(600001)).toEqual("10000m 1s");
    })
})

describe("hourFormat", () => {
    it("formats correctly", () => {
        expect(hourFormat(10)).toEqual("0h 0m 10s");
        expect(hourFormat(60)).toEqual("0h 1m 0s");
        expect(hourFormat(601)).toEqual("0h 10m 1s");
        expect(hourFormat(6001)).toEqual("1h 40m 1s");
        expect(hourFormat(60001)).toEqual("16h 40m 1s");
        expect(hourFormat(600001)).toEqual("166h 40m 1s");
    })
})

describe("dayFormat", () => {
    it("formats correctly", () => {
        expect(dayFormat(10)).toEqual("0d 0h 0m 10s");
        expect(dayFormat(60)).toEqual("0d 0h 1m 0s");
        expect(dayFormat(601)).toEqual("0d 0h 10m 1s");
        expect(dayFormat(6001)).toEqual("0d 1h 40m 1s");
        expect(dayFormat(60001)).toEqual("0d 16h 40m 1s");
        expect(dayFormat(600001)).toEqual("6d 22h 40m 1s");
    })
})