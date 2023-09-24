import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    updateDoc,
    getDoc,
    increment,
    doc,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { firebaseConfig } from "./firebaseConfig.js";

let pollData;
const incrementValue = increment(1);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const pollId = getURLParameter("pollId");

// Function to update the option inputs
function updateOptionInputs(e) {
    const numOptions = e.target.value;
    const optionInputsDiv = document.getElementById("optionInputs");
    optionInputsDiv.innerHTML = ""; // clear any existing option inputs

    for (let i = 0; i < numOptions; i++) {
        const newInput = document.createElement("input");
        newInput.type = "text";
        newInput.id = `option${i + 1}`;
        newInput.classList.add = `options`;
        newInput.name = `option${i + 1}`;
        newInput.placeholder = `Option ${i + 1}`;

        optionInputsDiv.appendChild(newInput);
    }
}

// Update the optionDisplay and option inputs when the slider changes
document.getElementById("optionAmount").addEventListener("input", function (e) {
    document.getElementById("optionDisplay").textContent = e.target.value;
    updateOptionInputs(e);
});

document.getElementById("pollForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const question = document.getElementById("question").value;

    const colors = {
        color1: "Red",
        color2: "Green",
        color3: "Blue",
        color4: "Magenta",
        color5: "Yellow",
        color6: "Cyan",
        color7: "Purple",
        color8: "Dark Green",
    };
    // Get options from the dynamically generated inputs
    const numOptions = document.getElementById("optionAmount").value;
    const options = [];
    for (let i = 0; i < numOptions; i++) {
        options.push(document.getElementById(`option${i + 1}`).value);
    }

    // Assign colors to options
    const coloredOptions = {};
    const colorKeys = Object.keys(colors);
    for (let i = 0; i < options.length; i++) {
        const colorKey = colorKeys[i % colorKeys.length];
        coloredOptions[options[i]] = colors[colorKey];
    }
    //save poll data to firestore
    const voteTally = {};
    for (let i = 0; i < options.length; i++) {
        voteTally[`option${i}`] = 0;
    }
    addDoc(collection(db, "polls"), {
        question,
        options,
        voteTally,
        coloredOptions,
    })
        .then((docRef) => {
            console.log("Poll created with ID:", docRef.id);

            // Generate the unique URL for this poll
            const pollURL = `${window.location.href}?pollId=${docRef.id}`;

            // Display the URL in the createPoll container
            document.getElementById("pollLink").href = pollURL;
            document.getElementById("pollLink").textContent = pollURL;
            document.getElementById("pollLinkContainer").style.display =
                "block";
        })
        .catch((error) => {
            console.error("Error:", error);
        });
});

// Function to extract URL parameters
function getURLParameter(name) {
    return (
        decodeURIComponent(
            (new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(
                location.search
            ) || [, ""])[1].replace(/\+/g, "%20")
        ) || null
    );
}

function loadPoll(pollData) {
    // Set the question text
    const pollQuestion = document.getElementById("pollQuestion");
    pollQuestion.textContent = pollData.question;
    pollQuestion.style.fontSize = "50px";

    // Create a radio button for each option
    pollData.options.forEach((option, i) => {
        const questionContainer = document.createElement("div");
        questionContainer.classList.add("questionContainer");
        const optionLabel = document.createElement("label");
        optionLabel.textContent = option;

        const optionInput = document.createElement("input");
        optionInput.type = "radio";
        optionInput.name = "pollOption";
        optionInput.value = i;

        questionContainer.appendChild(optionLabel);
        questionContainer.appendChild(optionInput);
        document.getElementById("pollOptions").appendChild(questionContainer);
    });

    // Show the poll section and hide the home section
    document.getElementById("home").style.display = "none";
    document.getElementById("poll").style.display = "flex";
    document.getElementById("about").style.display = "none";
    const voteTally = pollData.voteTally;
    createBarChart(voteTally);
}
// creates a bar chart
function createBarChart(voteTally) {
    if (typeof voteTally !== "object") {
        console.error("Error: voteTally is not an object");
        return;
    }
    // iterate to get max vote
    let maxVote = 0;
    for (let key in voteTally) {
        if (voteTally[key] > maxVote) {
            maxVote = voteTally[key];
        }
    }

    const optionPercentages = {};
    // scale bar lengths off the max vote
    for (let key in voteTally) {
        optionPercentages[key] = ((voteTally[key] / maxVote) * 100).toFixed(2);
    }

    const voteTallyDiv = document.getElementById("voteTally");
    voteTallyDiv.innerHTML = ""; // Clear any existing bars
    const keys = Object.keys(optionPercentages);

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const optionText = pollData.options[key.substring(6)]; // Get the option text
        const optionBarContainer = document.createElement("div");
        optionBarContainer.classList.add("optionBarContainer");
        optionBarContainer.style.display = "flex";
        optionBarContainer.style.justifyContent = "space-between";
        optionBarContainer.style.alignItems = "center";
        optionBarContainer.style.marginBottom = "10px";

        const optionLabel = document.createElement("span");
        optionLabel.textContent = optionText;
        optionLabel.style.marginRight = "10px";

        const graph = document.createElement("div");
        const optionBar = document.createElement("div");
        optionBar.classList.add("optionBar");
        optionBar.style.width = `${optionPercentages[key]}%`;

        optionBar.style.backgroundColor = pollData.coloredOptions[optionText];
        optionBar.style.height = "30px";
        optionBar.style.marginRight = "10px";
        const optionVoteCount = document.createElement("div");
        optionVoteCount.textContent = `${pollData.voteTally[key]} Votes`;
        optionVoteCount.style.marginLeft = "10px";
        const barContainer = document.createElement("div");
        barContainer.classList.add("graphBarContainer");
        barContainer.style.display = "flex";
        barContainer.style.justifyContent = "flex-end";
        barContainer.style.width = "100%"; // Set the width of the container to 100%
        barContainer.style.maxWidth = "250px"; // Set the maximum width of the container
        barContainer.appendChild(optionBar);
        barContainer.appendChild(optionVoteCount);
        optionBarContainer.appendChild(optionLabel);
        optionBarContainer.appendChild(barContainer); // Append the barContainer instead of the optionBar

        voteTallyDiv.appendChild(optionBarContainer);
    }
    const questionDiv = document.createElement("div");
    questionDiv.classList.add("resultTitle");
    questionDiv.style.textAlign = "center";
    questionDiv.textContent = pollData.question; // Use the question from pollData
    voteTallyDiv.insertBefore(questionDiv, voteTallyDiv.firstChild);
}

// On page load, check if a pollId parameter is present in the URL
window.onload = async function () {
    if (pollId) {
        try {
            // Fetch the poll data from Firestore
            const docSnapshot = await getDoc(doc(db, "polls", pollId));
            if (docSnapshot.exists) {
                // If the poll exists, load the poll data
                pollData = docSnapshot.data(); // Assign the fetched poll data to the global variable
                console.log("Poll data:", pollData);
                loadPoll(pollData);
            } else {
                // If the poll does not exist, show an error message
                console.log("No such poll!");
            }
        } catch (error) {
            console.log("Error getting poll:", error);
        }
    }
};

document
    .getElementById("submitVote")
    .addEventListener("click", async function (e) {
        e.preventDefault();

        // Get the selected option
        const selectedOption = document.querySelector(
            'input[name="pollOption"]:checked'
        );

        if (selectedOption) {
            const optionIndex = `option${parseInt(selectedOption.value)}`;
            // Hide the pollVoteContainer
            document.getElementById("pollVoteContainer").style.display = "none";

            // Show the voteTally
            document.getElementById("voteTally").style.display = "block";
            // Increment the vote tally in the database
            const pollRef = doc(db, "polls", pollId);
            try {
                await updateDoc(pollRef, {
                    [`voteTally.${optionIndex}`]: incrementValue,
                });

                // Fetch the updated poll data from Firestore
                const docSnapshot = await getDoc(doc(db, "polls", pollId));
                if (docSnapshot.exists) {
                    // If the poll exists, load the updated poll data
                    pollData = docSnapshot.data();
                    console.log("Updated poll data:", pollData);

                    // Create the bar chart using the updated vote tally
                    createBarChart(pollData.voteTally);
                } else {
                    // If the poll does not exist, show an error message
                    console.log("No such poll!");
                }
            } catch (error) {
                console.log("Error getting poll:", error);
            }
        } else {
            // If no option is selected, show an error message
            alert("Please select an option before submitting your vote.");
        }
    });
