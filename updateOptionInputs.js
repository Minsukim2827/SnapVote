function updateOptionInputs(e) {
    const numOptions = e.target.value;
    const optionInputsDiv = document.getElementById("optionInputs");
    optionInputsDiv.innerHTML = ""; // clear any existing option inputs

    for (let i = 0; i < numOptions; i++) {
        const newInput = document.createElement("input");
        newInput.type = "text";
        newInput.classList.add(`options`);
        newInput.name = `option${i + 1}`;
        newInput.placeholder = `Option ${i + 1}`;

        optionInputsDiv.appendChild(newInput);
    }
}

export default updateOptionInputs;
