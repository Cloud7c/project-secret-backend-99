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

            // Set Avatar Initials
            const avatarElement = document.getElementById('profile-avatar');
            if (avatarElement && user.full_name) {
                const names = user.full_name.split(' ');
                let initials = names[0].charAt(0).toUpperCase();
                if (names.length > 1) {
                    initials += names[names.length - 1].charAt(0).toUpperCase();
                }
                avatarElement.textContent = initials;
            }

            // Set Joined Date
            const joinedElement = document.getElementById('profile-joined');
            if (joinedElement && user.created_at) {
                const joinDate = new Date(user.created_at);
                const options = { year: 'numeric', month: 'long' };
                joinedElement.textContent = `Member Since: ${joinDate.toLocaleDateString(undefined, options)}`;
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

    // ── 3. Fetch User Listings ────────────────────────────────
    const loadUserListings = async () => {
        const grid = document.getElementById('user-listings-grid');
        if (!grid || !userJson) return;

        const user = JSON.parse(userJson);
        try {
            const res = await fetch(`/api/listings?user_id=${user.id}`);
            const data = await res.json();

            // Update analytics
            const adsCountEl = document.getElementById('analytic-ads-count');
            if (adsCountEl) adsCountEl.textContent = data.listings ? data.listings.length : 0;
            const impressionsEl = document.getElementById('analytic-impressions');
            if (impressionsEl) {
                // Calculate exact total real views across all user's listings
                let totalViews = 0;
                if (data.listings) {
                    data.listings.forEach(listing => {
                        totalViews += (listing.views || 0);
                    });
                }
                
                // Format with commas (e.g., 1,420)
                impressionsEl.textContent = new Intl.NumberFormat('en-US').format(totalViews);
            }

            if (data.listings && data.listings.length > 0) {
                grid.innerHTML = '';
                data.listings.forEach(listing => {
                    let imageUrl = 'logo.png';
                    if (listing.images && listing.images.length > 0) {
                        imageUrl = listing.images[0];
                    } else {
                        if (listing.category === 'vehicles') imageUrl = 'hilux.jpg';
                        if (listing.category === 'machinery') imageUrl = 'tractor.jpg';
                        if (listing.category === 'livestock') imageUrl = 'cow.png';
                        if (listing.category === 'produce') imageUrl = 'tomatoes.png';
                    }

                    const card = document.createElement('div');
                    card.className = 'listing-card';
                    card.innerHTML = `
                        <div class="listing-img" style="background-image: url('${imageUrl}');"></div>
                        <div class="listing-info">
                            <h4>${listing.title}</h4>
                            <p>Price: ${listing.currency || 'USD'} ${listing.price}</p>
                            <a href="#" style="color: #28a745; text-decoration: none; font-size: 14px; font-weight: bold; margin-top: 10px; display: block;">Manage Listing</a>
                        </div>
                    `;
                    grid.appendChild(card);
                });
            } else {
                grid.innerHTML = '<div style="grid-column: 1/-1; padding: 40px; text-align: center; color: #666;">You have no active listings yet.</div>';
            }
        } catch (err) {
            console.error(err);
            grid.innerHTML = '<div style="grid-column: 1/-1; padding: 40px; text-align: center; color: red;">Failed to load listings.</div>';
        }
    };

    loadUserListings();

});
