document.addEventListener('DOMContentLoaded', () => {

    // ── Elements ────────────────────────────────────
    const loginForm      = document.getElementById('login-form');
    const emailInput     = document.getElementById('email-input');
    const passwordInput  = document.getElementById('password-input');
    const toggleBtn      = document.getElementById('toggle-password');
    const toggleIcon     = document.getElementById('toggle-icon');
    const toggleText     = document.getElementById('toggle-text');
    const errorBox       = document.getElementById('error-message');
    const submitBtn      = loginForm.querySelector('.primary-btn');

    // ── Show / Hide Password ─────────────────────────
    if (toggleBtn && passwordInput) {
        toggleBtn.addEventListener('click', () => {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleIcon.classList.replace('fa-lock-open', 'fa-lock');
                toggleText.innerText = 'Hide';
            } else {
                passwordInput.type = 'password';
                toggleIcon.classList.replace('fa-lock', 'fa-lock-open');
                toggleText.innerText = 'Show';
            }
        });
    }

    // ── Helper: Show error message ───────────────────
    const showError = (message) => {
        errorBox.textContent = message;
        errorBox.style.display = 'block';
    };

    const hideError = () => {
        errorBox.style.display = 'none';
    };

    // ── Form Submit — Call the Login API ─────────────
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();

        const email    = emailInput.value.trim();
        const password = passwordInput.value;

        // Basic front-end validation
        if (!email || !password) {
            showError('Please enter your email and password.');
            return;
        }

        // Show loading state on button
        submitBtn.textContent = 'Signing in...';
        submitBtn.disabled = true;

        try {
            // Call our real backend API
            const response = await fetch('/api/auth/login', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                // Show the error from the server
                showError(data.error || 'Login failed. Please try again.');
                
                // Clear the password field on failure!
                passwordInput.value = '';
                
                submitBtn.textContent = 'Sign In';
                submitBtn.disabled = false;
                return;
            }

            // ✅ Login successful!
            // Clear the form fields immediately for security
            loginForm.reset();
            
            // Save the token and user to localStorage
            localStorage.setItem('zaa_token', data.token);
            localStorage.setItem('zaa_user',  JSON.stringify(data.user));

            // Redirect to the appropriate page
            const urlParams = new URLSearchParams(window.location.search);
            const redirect = urlParams.get('redirect') || 'account.html';
            window.location.href = redirect;

        } catch (err) {
            showError('Network error. Please check your connection.');
            submitBtn.textContent = 'Sign In';
            submitBtn.disabled = false;
        }
    });

});