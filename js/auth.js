// ===== Auth Logic =====

// Load existing users from localStorage
let users = JSON.parse(localStorage.getItem('statEdgeUsers')) || {};

document.addEventListener('DOMContentLoaded', () => {
    const toggleSignIn = document.getElementById('toggle-signin');
    const toggleSignUp = document.getElementById('toggle-signup');
    const formSignIn = document.getElementById('form-signin');
    const formSignUp = document.getElementById('form-signup');

    // ===== Toggle between Sign In and Sign Up =====
    toggleSignIn.addEventListener('click', () => {
        toggleSignIn.classList.add('active');
        toggleSignUp.classList.remove('active');
        formSignIn.classList.remove('hidden');
        formSignUp.classList.add('hidden');
        clearErrors();
    });

    toggleSignUp.addEventListener('click', () => {
        toggleSignUp.classList.add('active');
        toggleSignIn.classList.remove('active');
        formSignUp.classList.remove('hidden');
        formSignIn.classList.add('hidden');
        clearErrors();
    });

    // ===== Sign In =====
    formSignIn.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signin-email').value.trim();
        const password = document.getElementById('signin-password').value;
        const errorEl = document.getElementById('signin-error');

        if (!email || !password) {
            errorEl.textContent = 'Please fill in all fields.';
            return;
        }

        if (!users[email]) {
            errorEl.textContent = 'No account found with that email.';
            return;
        }

        if (users[email] !== password) {
            errorEl.textContent = 'Wrong password. Try again.';
            return;
        }

        // Success
        loginUser(email);
    });

    // ===== Sign Up =====
    formSignUp.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;
        const errorEl = document.getElementById('signup-error');

        if (!email || !password || !confirm) {
            errorEl.textContent = 'Please fill in all fields.';
            return;
        }

        if (password.length < 6) {
            errorEl.textContent = 'Password must be at least 6 characters.';
            return;
        }

        if (password !== confirm) {
            errorEl.textContent = 'Passwords do not match.';
            return;
        }

        if (users[email]) {
            errorEl.textContent = 'An account with that email already exists.';
            return;
        }

        // Create account
        users[email] = password;
        localStorage.setItem('statEdgeUsers', JSON.stringify(users));

        // Auto-login after sign up
        loginUser(email);
    });

    // ===== Google Sign-In (Simulated) =====
    document.getElementById('google-signin-btn').addEventListener('click', () => {
        loginUser('demo@google.com');
    });
});

// ===== Login Helper =====
function loginUser(email) {
    appState.user = email;
    saveState();
    clearErrors();
    clearForms();
    showNav();

    // Go to sport selection if no sport chosen yet, otherwise dashboard
    if (appState.sport && appState.teamName) {
        document.getElementById('dashboard-team-name').textContent = appState.teamName;
        document.getElementById('dashboard-sport-badge').textContent = appState.sport;
        showScreen('screen-dashboard');
    } else {
        showScreen('screen-sport');
    }
}

// ===== Utility =====
function clearErrors() {
    document.getElementById('signin-error').textContent = '';
    document.getElementById('signup-error').textContent = '';
}

function clearForms() {
    document.getElementById('form-signin').reset();
    document.getElementById('form-signup').reset();
}
