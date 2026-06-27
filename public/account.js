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

            // Set Avatar Initials or Image
            const avatarElement = document.getElementById('profile-avatar');
            if (avatarElement) {
                if (user.profile_picture) {
                    avatarElement.innerHTML = `<img src="${user.profile_picture}" style="width: 100%; height: 100%; object-fit: cover;">`;
                    avatarElement.style.backgroundColor = 'transparent';
                } else if (user.full_name) {
                    const names = user.full_name.split(' ');
                    let initials = names[0].charAt(0).toUpperCase();
                    if (names.length > 1) {
                        initials += names[names.length - 1].charAt(0).toUpperCase();
                    }
                    avatarElement.textContent = initials;
                }
            }

            // Set Cover Photo
            const coverElement = document.getElementById('profile-cover');
            if (coverElement && user.cover_picture) {
                coverElement.style.backgroundImage = `url('${user.cover_picture}')`;
            }

            // Set Joined Date
            const joinedElement = document.getElementById('profile-joined');
            if (joinedElement && user.created_at) {
                const joinDate = new Date(user.created_at);
                const options = { year: 'numeric', month: 'long' };
                joinedElement.textContent = `Member Since: ${joinDate.toLocaleDateString(undefined, options)}`;
            }
            
            // Image Upload Logic
            const token = localStorage.getItem('zaa_token');
            const avatarUpload = document.getElementById('avatar-upload');
            const coverUpload = document.getElementById('cover-upload');

            async function uploadImage(file, endpoint) {
                const formData = new FormData();
                formData.append('image', file);

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Upload failed');
                
                // Update local storage with new user data
                localStorage.setItem('zaa_user', JSON.stringify(data.user));
                return data.user;
            }

            if (avatarUpload) {
                avatarUpload.addEventListener('change', async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    try {
                        const updatedUser = await uploadImage(file, '/api/users/profile-picture');
                        avatarElement.innerHTML = `<img src="${updatedUser.profile_picture}" style="width: 100%; height: 100%; object-fit: cover;">`;
                        avatarElement.style.backgroundColor = 'transparent';
                    } catch (err) {
                        alert(err.message);
                    }
                });
            }

            if (coverUpload) {
                coverUpload.addEventListener('change', async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    try {
                        const updatedUser = await uploadImage(file, '/api/users/cover-picture');
                        coverElement.style.backgroundImage = `url('${updatedUser.cover_picture}')`;
                    } catch (err) {
                        alert(err.message);
                    }
                });
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

    // ── 3. Fetch User Listings (Paginated) ────────────────────────────────
    let currentPage = 1;

    const loadUserListings = async (append = false, isInitialLoad = false) => {
        const grid = document.getElementById('user-listings-grid');
        if (!grid || !userJson) return;

        const user = JSON.parse(userJson);
        const isMobile = window.innerWidth <= 768;
        const limit = isMobile ? 16 : 32;

        if (!append && !isInitialLoad) {
            currentPage = 1;
        }

        // Sync URL silently
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('page', currentPage);
        window.history.replaceState({}, '', newUrl);

        try {
            if (!append) {
                grid.innerHTML = '<div style="grid-column: 1/-1; padding: 40px; text-align: center; color: #666;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 10px;"></i><p>Loading your active listings...</p></div>';
            } else {
                const loadBtnContainer = document.getElementById('account-load-more-container');
                if (loadBtnContainer) loadBtnContainer.remove();
            }

            const res = await fetch(`/api/listings?user_id=${user.id}&limit=${limit}&page=${currentPage}`);
            const data = await res.json();

            // Only update analytics on initial load to prevent appending issues
            if (!append) {
                const adsCountEl = document.getElementById('analytic-ads-count');
                if (adsCountEl) adsCountEl.textContent = data.count || 0;
                const impressionsEl = document.getElementById('analytic-impressions');
                if (impressionsEl) {
                    let totalViews = 0;
                    if (data.listings) {
                        data.listings.forEach(listing => {
                            totalViews += (listing.views || 0);
                        });
                    }
                    impressionsEl.textContent = new Intl.NumberFormat('en-US').format(totalViews);
                }
            }

            if (data.listings && data.listings.length > 0) {
                if (!append) grid.innerHTML = '';
                
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
                        <div class="listing-img" style="overflow: hidden;">
                            <img src="${imageUrl}" alt="${listing.title}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div class="listing-info">
                            <h4>${listing.title}</h4>
                            <p>Price: ${listing.currency || 'USD'} ${listing.price}</p>
                            <a href="#" style="color: #28a745; text-decoration: none; font-size: 14px; font-weight: bold; margin-top: 10px; display: block;">Manage Listing</a>
                        </div>
                    `;
                    grid.appendChild(card);
                });

                // Add Load More button if there is a next page
                if (data.hasNextPage) {
                    const loadMoreHtml = `
                    <div id="account-load-more-container" style="grid-column: 1 / -1; text-align: center; margin-top: 20px;">
                        <button id="account-load-more-btn" style="padding: 10px 24px; background-color: #2b7a4b; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s;">
                            Load More <i class="fa-solid fa-chevron-down"></i>
                        </button>
                    </div>`;
                    grid.insertAdjacentHTML('beforeend', loadMoreHtml);

                    document.getElementById('account-load-more-btn').addEventListener('click', () => {
                        currentPage++;
                        loadUserListings(true, false);
                    });
                }
            } else {
                if (!append) {
                    grid.innerHTML = '<div style="grid-column: 1/-1; padding: 40px; text-align: center; color: #666;">You have no active listings yet.</div>';
                }
            }
        } catch (err) {
            console.error(err);
            if (!append) grid.innerHTML = '<div style="grid-column: 1/-1; padding: 40px; text-align: center; color: red;">Failed to load listings.</div>';
        }
    };

    // Restore page from URL on initial load
    const params = new URLSearchParams(window.location.search);
    if (params.has('page')) {
        currentPage = parseInt(params.get('page'), 10) || 1;
    }
    loadUserListings(false, true);

});
