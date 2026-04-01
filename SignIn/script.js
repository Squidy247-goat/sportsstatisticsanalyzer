// Local storage for users (Simulating your HashMap)
const users = {}; 

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submitBtn');
const signInTab = document.getElementById('signInTab');
const signUpTab = document.getElementById('signUpTab');

let mode = 'signin';

// Toggle between Sign In and Sign Up
signInTab.addEventListener('click', () => {
    mode = 'signin';
    submitBtn.innerText = 'Sign in';
    signInTab.classList.add('active');
    signUpTab.classList.remove('active');
});

signUpTab.addEventListener('click', () => {
    mode = 'signup';
    submitBtn.innerText = 'Sign up';
    signUpTab.classList.add('active');
    signInTab.classList.remove('active');
});

// Handle the Button Click
submitBtn.addEventListener('click', () => {
    const email = emailInput.value;
    const pass = passwordInput.value;

    if (!email || !pass) {
        alert("Please fill in all fields");
        return;
    }

    if (mode === 'signup') {
        if (users[email]) {
            alert("User already exists!");
        } else {
            users[email] = pass;
            alert("Account created! Now you can sign in.");
        }
    } else {
        if (users[email] && users[email] === pass) {
            alert("Login successful!");
            // window.location.href = "sports-choice.html"; // Redirect here
        } else {
            alert("Invalid email or password!");
        }
    }
});