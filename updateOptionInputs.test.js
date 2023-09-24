// updateOptionInputs.test.js

import updateOptionInputs from "./updateOptionInputs.js";

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

global.document = new JSDOM(
    '<body><div id="optionInputs"></div></body>'
).window.document;

test("creates the correct number of input elements", () => {
    const e = { target: { value: "3" } };
    updateOptionInputs(e);
    const inputs = document.getElementById("optionInputs").children;
    expect(inputs.length).toBe(3);
});
