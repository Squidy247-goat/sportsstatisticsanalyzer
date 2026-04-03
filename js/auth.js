// ===== Auth Logic (Supabase) =====

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
    formSignIn.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signin-email').value.trim();
        const password = document.getElementById('signin-password').value;
        const errorEl = document.getElementById('signin-error');

        if (!email || !password) {
            errorEl.textContent = 'Please fill in all fields.';
            return;
        }

        errorEl.textContent = 'Signing in...';

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            errorEl.textContent = error.message;
            return;
        }

        await loginUser(data.user.email);
    });

    // ===== Sign Up =====
    formSignUp.addEventListener('submit', async (e) => {
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

        errorEl.textContent = 'Creating account...';

        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password
        });

        if (error) {
            errorEl.textContent = error.message;
            return;
        }

        // Supabase may require email confirmation depending on project settings.
        // If email confirmation is enabled, the user object exists but session may be null.
        if (data.session) {
            await loginUser(data.user.email);
        } else {
            errorEl.textContent = '';
            errorEl.style.color = '#4ade80';
            errorEl.textContent = 'Check your email to confirm your account, then sign in.';
            errorEl.style.color = '';
            // Switch to sign in form
            toggleSignIn.click();
            document.getElementById('signin-error').style.color = '#4ade80';
            document.getElementById('signin-error').textContent = 'Account created! Check your email to confirm, then sign in.';
        }
    });

    // ===== Google Sign-In =====
    document.getElementById('google-signin-btn').addEventListener('click', async () => {
        try {
            const { data, error } = await supabaseClient.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + window.location.pathname
                }
            });
            console.log('OAuth response:', { data, error });
            if (error) {
                alert('Google Sign-In error: ' + error.message);
            }
        } catch (err) {
            console.error('Google Sign-In exception:', err);
            alert('Google Sign-In failed: ' + err.message);
        }
    });
});

// ===== Login Helper =====
async function loginUser(email) {
    appState.user = email;
    await loadState();
    appState.user = email;
    clearErrors();
    clearForms();
    showNav();

    // Go to sport selection if no sport chosen yet, otherwise dashboard
    if (appState.sport && appState.teamName) {
        showDashboard();
    } else {
        showScreen('screen-sport');
    }
}

// ===== Utility =====
function clearErrors() {
    const signinErr = document.getElementById('signin-error');
    const signupErr = document.getElementById('signup-error');
    signinErr.textContent = '';
    signinErr.style.color = '';
    signupErr.textContent = '';
    signupErr.style.color = '';
}

function clearForms() {
    document.getElementById('form-signin').reset();
    document.getElementById('form-signup').reset();
}
