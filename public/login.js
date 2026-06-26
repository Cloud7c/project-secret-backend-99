document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Select the elements we need to interact with from our HTML
    const passwordInput = document.getElementById('password-input');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const toggleIcon = document.getElementById('toggle-icon');
    const toggleText = document.getElementById('toggle-text');

    // 2. Make sure the elements exist on the page before running the logic
    if (togglePasswordBtn && passwordInput) {
        
        // 3. Listen for a click on the "Show/Hide" button
        togglePasswordBtn.addEventListener('click', () => {
            
            // Check: Is the password currently hidden (as dots)?
            if (passwordInput.type === 'password') {
                
                // Action: Change it to normal text so the user can read it
                passwordInput.type = 'text';
                
                // Action: Swap the icon from an open lock to a closed lock
                toggleIcon.classList.remove('fa-lock-open');
                toggleIcon.classList.add('fa-lock');
                
                // Action: Change the button text to say "Hide"
                toggleText.innerText = 'Hide';
                
            } else {
                
                // Check: It must already be visible. Change it back to hidden dots!
                passwordInput.type = 'password';
                
                // Action: Swap the icon back to the open lock
                toggleIcon.classList.remove('fa-lock');
                toggleIcon.classList.add('fa-lock-open');
                
                // Action: Change the text back to "Show"
                toggleText.innerText = 'Show';
            }
        });
    }
});