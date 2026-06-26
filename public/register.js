document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Password Hide/Show Logic
    const passwordInput = document.getElementById('password-input');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const toggleIcon = document.getElementById('toggle-icon');

    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                // Swap the eye to the crossed-out eye
                toggleIcon.classList.remove('fa-eye');
                toggleIcon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                // Swap back to normal eye
                toggleIcon.classList.remove('fa-eye-slash');
                toggleIcon.classList.add('fa-eye');
            }
        });
    }

    // 2. Password Strength Meter Logic
    const strengthText = document.getElementById('strength-text');
    // Grab all 5 of our tiny bars
    const bars = [
        document.getElementById('bar-1'),
        document.getElementById('bar-2'),
        document.getElementById('bar-3'),
        document.getElementById('bar-4'),
        document.getElementById('bar-5')
    ];

    if (passwordInput) {
        // Run this function every single time the user types a letter
        passwordInput.addEventListener('input', (e) => {
            const val = e.target.value;
            let strength = 0;
            
            // First, reset all bars to default grey
            bars.forEach(bar => {
                bar.className = 'bar'; 
            });

            // If empty, show default text
            if (val.length === 0) {
                strengthText.innerHTML = 'Password must be at least 8 characters';
                return;
            }

            // Mathematical Analysis of Password Strength!
            if (val.length >= 8) strength += 1; // Good length
            if (/[a-z]/.test(val) && /[A-Z]/.test(val)) strength += 1; // Has upper & lower
            if (/\d/.test(val)) strength += 1; // Has numbers
            if (/[^a-zA-Z\d]/.test(val)) strength += 1; // Has special characters like @ # $
            if (val.length >= 12) strength += 1; // Bonus point for super long passwords

            // Apply dynamic colors based on the mathematical score
            if (strength <= 1) {
                bars[0].classList.add('active-weak'); // Turns 1 bar Red
                strengthText.innerHTML = '<span style="color:#ef4444">Weak:</span> Too short or simple';
            } 
            else if (strength === 2) {
                bars[0].classList.add('active-fair'); // Turns 2 bars Orange
                bars[1].classList.add('active-fair');
                strengthText.innerHTML = '<span style="color:#f59e0b">Fair:</span> Add numbers or symbols';
            } 
            else if (strength === 3 || strength === 4) {
                bars[0].classList.add('active-good'); // Turns 3 or 4 bars Light Green
                bars[1].classList.add('active-good');
                bars[2].classList.add('active-good');
                if (strength === 4) bars[3].classList.add('active-good');
                strengthText.innerHTML = '<span style="color:#10b981">Good:</span> Almost there';
            } 
            else if (strength >= 5) {
                bars.forEach(bar => bar.classList.add('active-strong')); // Turns ALL bars Dark Green
                strengthText.innerHTML = '<span>Strong:</span> Uppercase, lowercase, numbers, special character';
            }
        });
    }
});