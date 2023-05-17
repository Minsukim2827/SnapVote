import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDoc,
    doc,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { firebaseConfig } from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to update the option inputs
function updateOptionInputs(e) {
    const numOptions = e.target.value;
    const optionInputsDiv = document.getElementById("optionInputs");
    optionInputsDiv.innerHTML = ""; // clear any existing option inputs

    for (let i = 0; i < numOptions; i++) {
        const newInput = document.createElement("input");
        newInput.type = "text";
        newInput.id = `option${i + 1}`;
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

// Update the durationDisplay text when the slider changes
document.getElementById("duration").addEventListener("input", function (e) {
    document.getElementById("durationDisplay").textContent = e.target.value;
});

document.getElementById("pollForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const question = document.getElementById("question").value;
    const duration = document.getElementById("duration").value;

    // Get options from the dynamically generated inputs
    const numOptions = document.getElementById("optionAmount").value;
    const options = [];
    for (let i = 0; i < numOptions; i++) {
        options.push(document.getElementById(`option${i + 1}`).value);
    }

    // Save the poll data to Firestore
    addDoc(collection(db, "polls"), {
        question,
        options,
        duration,
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
    document.getElementById("pollQuestion").textContent = pollData.question;

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
}

// On page load, check if a pollId parameter is present in the URL
window.onload = function () {
    const pollId = getURLParameter("pollId");
    if (pollId) {
        // Fetch the poll data from Firestore
        getDoc(doc(db, "polls", pollId))
            .then((doc) => {
                if (doc.exists) {
                    // If the poll exists, load the poll data
                    const pollData = doc.data();
                    console.log("Poll data:", pollData);

                    // Load the poll data into the poll section
                    loadPoll(pollData);
                } else {
                    // If the poll does not exist, show an error message
                    console.log("No such poll!");
                }
            })
            .catch((error) => {
                console.log("Error getting poll:", error);
            });
    }
};
