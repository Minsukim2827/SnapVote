let pollData; // Declare pollData as a global variable

// ...

// On page load, check if a pollId parameter is present in the URL
window.onload = function () {
    const pollId = getURLParameter("pollId");
    if (pollId) {
        // Fetch the poll data from Firestore
        getDoc(doc(db, "polls", pollId))
            .then((doc) => {
                if (doc.exists) {
                    // If the poll exists, load the poll data
                    pollData = doc.data(); // Assign the fetched poll data to the global variable
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

// ...

document.getElementById("submitVote").addEventListener("click", function (e) {
    e.preventDefault();

    // Get the selected option
    const selectedOption = document.querySelector(
        'input[name="pollOption"]:checked'
    );

    if (selectedOption) {
        const optionIndex = selectedOption.value;

        // Get the poll question
        const pollQuestion =
            document.getElementById("pollQuestion").textContent;

        // Remove the pollOptions form and submitVote button
        const pollOptionsForm = document.getElementById("pollOptions");
        const submitVoteButton = document.getElementById("submitVote");
        pollOptionsForm.remove();
        submitVoteButton.remove();

        // Create a new div to display the vote tally
        const voteTallyDiv = document.createElement("div");
        voteTallyDiv.id = "voteTally";

        // Calculate the percentage of votes for each option
        const totalVotes = 100; // Assuming a total of 100 votes for simplicity
        const optionVotes = [20, 30, 50]; // Placeholder values, replace with actual votes
        const optionPercentages = optionVotes.map((votes) =>
            ((votes / totalVotes) * 100).toFixed(2)
        );

        // Create the bar graph using CSS to represent the vote tally
        for (let i = 0; i < optionPercentages.length; i++) {
            const optionBar = document.createElement("div");
            optionBar.classList.add("optionBar");
            optionBar.style.width = `${optionPercentages[i]}%`;

            const optionLabel = document.createElement("span");
            optionLabel.textContent = pollData.options[i]; // Access the options from the global pollData variable

            const optionPercentage = document.createElement("span");
            optionPercentage.textContent = `${optionPercentages[i]}%`;

            optionBar.appendChild(optionLabel);
            optionBar.appendChild(optionPercentage);
            voteTallyDiv.appendChild(optionBar);
        }

        // Append the vote tally div to the voteContainer
        document.getElementById("voteContainer").appendChild(voteTallyDiv);

        // Update the voteConfirmation text
        const voteConfirmation = document.getElementById("voteConfirmation");
        voteConfirmation.style.display = "block";
        voteConfirmation.textContent = "Thank you for your vote!";
    }
});
