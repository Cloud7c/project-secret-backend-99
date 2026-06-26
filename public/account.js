document.addEventListener('DOMContentLoaded', () => {

    // ── 1. Populate User Profile ──────────────────────────────
    const userJson = localStorage.getItem('zaa_user');
    
    if (userJson) {
        try {
            const user = JSON.parse(userJson);
            
            // Get the HTML elements
            const nameElement = document.getElementById('profile-name');
            const emailElement = document.getElementById('profile-email');
            
            // Update the UI with real data
            if (nameElement) {
                // Keep the verified icon if it exists
                const verifiedIcon = nameElement.querySelector('.verified-icon');
                nameElement.textContent = user.full_name + ' ';
                if (verifiedIcon) {
                    nameElement.appendChild(verifiedIcon);
                }
            }
            
            if (emailElement) {
                emailElement.textContent = user.email;
            }
            
        } catch (err) {
            console.error('Error parsing user data:', err);
        }
    }

    // ── 2. Handle Logout ──────────────────────────────────────
    const logoutBtn = document.getElementById('logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Clear the secure tokens
            localStorage.removeItem('zaa_token');
            localStorage.removeItem('zaa_user');
            
            // Redirect to login page
            window.location.href = 'login.html';
        });
    }

});
