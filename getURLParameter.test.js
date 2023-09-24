import { getURLParameterForTest } from "./getURLParameter.js";

test("returns null for non-existing parameters", () => {
    expect(getURLParameterForTest("nonExisting", "")).toBe(null);
});

test("returns correct value for existing parameters", () => {
    expect(getURLParameterForTest("pollId", "?pollId=123")).toBe("123");
});
