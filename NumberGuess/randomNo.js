// Generate a random number between 1 and 100
let randomNumber = Math.floor(Math.random() * 100) + 1;
let attempts = 0;

// Function to check the user's guess
function checkGuess() {
    let userGuess = parseInt(document.getElementById("userGuess").value);
    let message = document.getElementById("message");
    let attemptsDisplay = document.getElementById("attempts");
    
    // Increase attempt count
    attempts++;

    // Check if the guess is correct, too high, or too low
    if (userGuess < randomNumber) {
        message.textContent = "Too low! Try again.";
        message.style.color = "red";
    } else if (userGuess > randomNumber) {
        message.textContent = "Too high! Try again.";
        message.style.color = "red";
    } else {
        message.textContent = `Congratulations! You guessed it in ${attempts} tries.`;
        message.style.color = "green";
    }

    // Update attempt count
    attemptsDisplay.textContent = `Attempts: ${attempts}`;
}
