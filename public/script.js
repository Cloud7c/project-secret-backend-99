// =========================================
// GLOBAL SCRIPTS (Waits for HTML to load)
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    
    // --- HAMBURGER MENU LOGIC ---
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
        });

        // Close when clicking a link inside the menu
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });

        // Close when clicking anywhere outside the menu
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
                navLinks.classList.remove('active');
            }
        });
    }

    // --- AUDIT FIX #3: DYNAMIC FOOTER YEAR ---
    const currentYear = new Date().getFullYear();
    const copyrightTexts = document.querySelectorAll('.copyright-text');
    copyrightTexts.forEach(text => {
        text.innerHTML = `&copy; ${currentYear} Zim AutoAgri.<br>All Rights reserved.`;
    });

    // --- SLIDER LOGIC ---
    const slider = document.getElementById('product-slider');
    const slideLeft = document.getElementById('slide-left');
    const slideRight = document.getElementById('slide-right');

    if (slider && slideLeft && slideRight) {
        const scrollAmount = 240; 
        slideLeft.addEventListener('click', () => {
            slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
        slideRight.addEventListener('click', () => {
            slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    }
});





// Main Navigation Hamburger Menu Toggle
document.addEventListener("DOMContentLoaded", function() {
    var hamburgerIcon = document.getElementById("hamburgerIcon");
    var mainNavLinks = document.getElementById("mainNavLinks");
    
    if (hamburgerIcon && mainNavLinks) {
        hamburgerIcon.addEventListener("click", function(e) {
            e.stopPropagation();
            mainNavLinks.classList.toggle("active");
        });

        // Close when clicking a link
        mainNavLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mainNavLinks.classList.remove('active');
            });
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (mainNavLinks.classList.contains('active') && !mainNavLinks.contains(e.target) && !hamburgerIcon.contains(e.target)) {
                mainNavLinks.classList.remove('active');
            }
        });
    }
});


// =========================================
// MOBILE FILTER DROPDOWN TOGGLE
// =========================================
document.addEventListener('DOMContentLoaded', function() {
    const filterBtn = document.getElementById('filterBtn');
    const filterSidebar = document.getElementById('filterSidebar');
    const filterBtnText = document.getElementById('filterBtnText');
    const filterIcon = document.getElementById('filterIcon');

    if (filterBtn && filterSidebar) {
        filterBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            filterSidebar.classList.toggle('show-filters');
            
            if (filterSidebar.classList.contains('show-filters')) {
                if (filterBtnText) filterBtnText.innerHTML = '<i class="fa-solid fa-filter"></i> Hide Filters';
                if (filterIcon) {
                    filterIcon.classList.remove('fa-chevron-down');
                    filterIcon.classList.add('fa-chevron-up');
                }
            } else {
                if (filterBtnText) filterBtnText.innerHTML = '<i class="fa-solid fa-filter"></i> Show Filters';
                if (filterIcon) {
                    filterIcon.classList.remove('fa-chevron-up');
                    filterIcon.classList.add('fa-chevron-down');
                }
            }
        });

        // Close sidebar filters if clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (filterSidebar.classList.contains('show-filters') && !filterSidebar.contains(e.target) && !filterBtn.contains(e.target)) {
                filterSidebar.classList.remove('show-filters');
                if (filterBtnText) filterBtnText.innerHTML = '<i class="fa-solid fa-filter"></i> Show Filters';
                if (filterIcon) {
                    filterIcon.classList.remove('fa-chevron-up');
                    filterIcon.classList.add('fa-chevron-down');
                }
            }
        });
    }
});

// =========================================
// FIX STICKY CSS DROPDOWNS ON MOBILE TOUCH
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    // When clicking a link inside a dropdown, remove focus to fix the "back button" sticky issue
    document.querySelectorAll('.dropdown-content a').forEach(link => {
        link.addEventListener('click', () => {
            document.activeElement.blur();
        });
    });

    // Close any stuck hover dropdowns on outside tap
    document.addEventListener('touchstart', (e) => {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-content').forEach(dc => {
                dc.style.display = 'none';
                setTimeout(() => dc.style.display = '', 100);
            });
        }
    }, {passive: true});
});

// =========================================
// HOMEPAGE DYNAMIC LISTINGS (PROFESSIONAL ALGO)
// =========================================
const homeSlider = document.getElementById('product-slider');
if (homeSlider && (window.location.pathname === '/' || window.location.pathname.includes('index.html'))) {
    
    async function loadHomepageListings() {
        try {
            homeSlider.innerHTML = '<div style="text-align:center; width:100%; padding: 40px; color: #666;">Loading latest premium listings <i class="fa-solid fa-spinner fa-spin"></i></div>';
            
            // Fetch 8 listings with randomized rotation so every visitor sees a fresh mix
            const res = await fetch('/api/listings?limit=8&shuffle=true');
            const data = await res.json();
            
            if (data.listings && data.listings.length > 0) {
                homeSlider.innerHTML = ''; // clear loading
                
                data.listings.forEach(listing => {
                    const priceFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: listing.currency || 'USD' }).format(listing.price);
                    const specs = listing.specs || {};

                    // Build the meta icons dynamically
                    let metaHtml = '';
                    if (listing.category === 'vehicles' || listing.category === 'machinery') {
                        if (specs.condition) metaHtml += `<span><i class="fa-solid fa-gauge"></i> ${specs.condition}</span>`;
                        if (specs.fuel_type) metaHtml += `<span><i class="fa-solid fa-gas-pump"></i> ${specs.fuel_type}</span>`;
                        if (specs.transmission) metaHtml += `<span><i class="fa-solid fa-gear"></i> ${specs.transmission}</span>`;
                    } else if (listing.category === 'livestock' || listing.category === 'produce') {
                        if (specs.health) metaHtml += `<span><i class="fa-solid fa-notes-medical"></i> ${specs.health}</span>`;
                        if (specs.gender) metaHtml += `<span><i class="fa-solid fa-venus-mars"></i> ${specs.gender}</span>`;
                        if (specs.weight) metaHtml += `<span><i class="fa-solid fa-weight-scale"></i> ${specs.weight}</span>`;
                    } else {
                        // Spares/equipment fallback
                        if (specs.condition) metaHtml += `<span><i class="fa-solid fa-certificate"></i> ${specs.condition}</span>`;
                    }

                    // Fallback images based on category since we haven't built image uploads yet
                    let imageUrl = '/logo.png';
                    if (listing.images && listing.images.length > 0) {
                        imageUrl = listing.images[0];
                    } else {
                        if (listing.category === 'vehicles') imageUrl = '/hilux.jpg';
                        if (listing.category === 'machinery') imageUrl = '/tractor.jpg';
                        if (listing.category === 'livestock') imageUrl = '/cow.png';
                        if (listing.category === 'produce') imageUrl = '/tomatoes.png';
                        if (listing.category === 'spares' || listing.category === 'parts') imageUrl = '/autoparts.png';
                    }

                    let badgeClass = 'auto-card';
                    if (listing.category === 'livestock' || listing.category === 'produce' || listing.category === 'machinery') badgeClass = 'agri-card';

                    const cardHtml = `
                    <div class="product-card ${badgeClass}">
                        <div class="card-image-wrapper">
                            <span class="category-badge" style="text-transform: capitalize;">${listing.category}</span>
                            <button class="favorite-btn"><i class="fa-regular fa-heart"></i></button>
                            <a href="/product.html?id=${listing.id}">
                                <img src="${imageUrl}" alt="${listing.title}" class="product-image" loading="lazy">
                            </a>
                        </div>
                        <div class="card-details">
                            <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 4px; margin-bottom: 8px;">
                                ${listing.is_featured ? '<span class="featured-badge"><i class="fa-solid fa-star"></i> Featured</span>' : ''}
                                <p class="product-price" style="margin-bottom: 0;">${priceFormatted}</p>
                            </div>
                            <h4 class="product-name"><a href="/product.html?id=${listing.id}" style="color: inherit; text-decoration: none;">${listing.title}</a></h4>
                            <p class="product-location"><i class="fa-solid fa-location-dot"></i> ${listing.location}${listing.province ? ', ' + listing.province : ''}</p>
                            <div class="product-meta">
                                ${metaHtml}
                            </div>
                            <a href="/product.html?id=${listing.id}" class="view-details-btn">View Details</a>
                        </div>
                    </div>`;

                    homeSlider.innerHTML += cardHtml;
                });
            } else {
                homeSlider.innerHTML = '<div style="text-align:center; width:100%; padding: 40px; color: #666;">No listings available yet. Be the first to post an ad!</div>';
            }
        } catch (err) {
            console.error('Error loading homepage listings:', err);
            homeSlider.innerHTML = '<div style="text-align:center; width:100%; padding: 40px; color: red;">Failed to load listings. Please check your connection.</div>';
        }
    }
    
    loadHomepageListings();
}

// =========================================
// CATEGORY PAGES DYNAMIC LISTINGS
// =========================================
const path = window.location.pathname;

let targetCategory = '';
let targetGridId = '';
let cardType = '';

if (path.includes('vehicles.html')) {
    targetCategory = 'vehicles';
    targetGridId = '.vehicles-grid';
    cardType = 'vehicle';
} else if (path.includes('machinery.html')) {
    targetCategory = 'machinery';
    targetGridId = '.machinery-grid';
    cardType = 'machinery';
} else if (path.includes('spares.html')) {
    targetCategory = 'spares';
    targetGridId = '.spares-grid';
    cardType = 'spares';
} else if (path.includes('equipments.html')) {
    targetCategory = 'equipment';
    targetGridId = '.eq-grid';
    cardType = 'equipment';
} else if (path.includes('livestock.html')) {
    targetCategory = 'livestock';
    targetGridId = '.livestock-grid';
    cardType = 'livestock';
} else if (path.includes('produce.html')) {
    targetCategory = 'produce';
    targetGridId = '.masonry-grid';
    cardType = 'produce';
}

if (targetCategory && targetGridId) {
    const gridElement = document.querySelector(targetGridId);
    let currentPage = 1;

    if (gridElement) {
        
        async function loadCategoryListings(queryString = '', append = false) {
            try {
                if (!append) {
                    gridElement.innerHTML = `<div style="text-align:center; width:100%; padding: 40px; color: #666; grid-column: 1 / -1;">Loading ${targetCategory} listings <i class="fa-solid fa-spinner fa-spin"></i></div>`;
                } else {
                    // Remove existing load more button before appending
                    const existingBtn = document.getElementById('load-more-btn-container');
                    if (existingBtn) existingBtn.remove();
                    
                    const loadingHtml = `<div id="append-loading" style="text-align:center; width:100%; padding: 20px; color: #666; grid-column: 1 / -1;"><i class="fa-solid fa-spinner fa-spin"></i> Loading more...</div>`;
                    gridElement.insertAdjacentHTML('beforeend', loadingHtml);
                }
                
                const res = await fetch(`/api/listings?category=${targetCategory}${queryString}`);
                const data = await res.json();
                
                if (append) {
                    const appendLoading = document.getElementById('append-loading');
                    if (appendLoading) appendLoading.remove();
                }

                if (data.listings && data.listings.length > 0) {
                    if (!append) gridElement.innerHTML = ''; // clear loading
                    
                    data.listings.forEach(listing => {
                        const priceFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: listing.currency || 'USD' }).format(listing.price);
                        const specs = listing.specs || {};
                        
                        let cardHtml = '';

                        // Fallback image logic
                        let imageUrl = '/logo.png';
                        if (listing.images && listing.images.length > 0) {
                            imageUrl = listing.images[0];
                        } else {
                            if (listing.category === 'vehicles') imageUrl = '/hilux.jpg';
                            if (listing.category === 'machinery') imageUrl = '/tractor.jpg';
                            if (listing.category === 'livestock') imageUrl = '/cow.png';
                            if (listing.category === 'produce') imageUrl = '/tomatoes.png';
                            if (listing.category === 'spares' || listing.category === 'parts') imageUrl = '/spare-brakes.png';
                            if (listing.category === 'equipment') imageUrl = '/tractor-1.png';
                        }

                        if (cardType === 'vehicle') {
                            cardHtml = `
                            <div class="vehicle-card">
                                <div class="v-card-image">
                                    <span class="v-badge ${specs.condition === 'Used' ? 'used' : ''}">${specs.condition || 'New'}</span>
                                    <button class="v-fav"><i class="fa-regular fa-heart"></i></button>
                                    <a href="/product.html?id=${listing.id}"><img src="${imageUrl}" alt="${listing.title}" loading="lazy"></a>
                                </div>
                                <div class="v-card-content">
                                    
                                    <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 4px; margin-bottom: 8px;">
                                        ${listing.is_featured ? '<span class="featured-badge"><i class="fa-solid fa-star"></i> Featured</span>' : ''}
                                        <p class="v-price" style="margin-bottom:0;">${priceFormatted}</p>
                                    </div>
                                    <h4><a href="/product.html?id=${listing.id}">${listing.title}</a></h4>
                                    <p class="v-specs"><i class="fa-solid fa-gauge"></i> ${specs.mileage || 'N/A'}<br><i class="fa-solid fa-location-dot"></i> ${listing.location}</p>
                                    <a href="/product.html?id=${listing.id}" class="v-btn">View Details</a>
                                </div>
                            </div>`;
                        } else if (cardType === 'machinery') {
                            cardHtml = `
                            <div class="machinery-card">
                                <div class="m-card-image">
                                    <span class="m-badge ${specs.condition === 'Used' ? 'used' : ''}">${specs.condition || 'New'}</span>
                                    <button class="m-fav"><i class="fa-regular fa-heart"></i></button>
                                    <a href="/product.html?id=${listing.id}"><img src="${imageUrl}" alt="${listing.title}" loading="lazy"></a>
                                </div>
                                <div class="m-card-content">
                                    
                                    <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 4px; margin-bottom: 8px;">
                                        ${listing.is_featured ? '<span class="featured-badge"><i class="fa-solid fa-star"></i> Featured</span>' : ''}
                                        <p class="m-price" style="margin-bottom:0;">${priceFormatted}</p>
                                    </div>
                                    <h4><a href="/product.html?id=${listing.id}">${listing.title}</a></h4>
                                    <p class="m-specs"><i class="fa-solid fa-clock"></i> ${specs.mileage || 'N/A'}<br><i class="fa-solid fa-location-dot"></i> ${listing.location}</p>
                                    <a href="/product.html?id=${listing.id}" class="m-btn">View Details</a>
                                </div>
                            </div>`;
                        } else if (cardType === 'spares') {
                            cardHtml = `
                            <div class="s-card">
                                <span class="s-badge ${specs.condition === 'Used' ? '' : 'oem'}">${specs.condition || 'OEM'}</span>
                                <div class="s-card-img">
                                    <a href="/product.html?id=${listing.id}"><img src="${imageUrl}" alt="${listing.title}" loading="lazy"></a>
                                </div>
                                <p class="s-sku">SKU: ${specs.part_number || 'N/A'}</p>
                                <h4 class="s-title"><a href="/product.html?id=${listing.id}" style="color: inherit; text-decoration: none;">${listing.title}</a></h4>
                                
                                <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 4px; padding: 0 1rem; margin-bottom: 0.5rem;">
                                    ${listing.is_featured ? '<span class="featured-badge"><i class="fa-solid fa-star"></i> Featured</span>' : ''}
                                    <p class="s-price" style="margin-bottom:0; padding:0;">${priceFormatted}</p>
                                </div>
                                <div class="s-compatibility"><i class="fa-solid fa-circle-check"></i> Fits: ${specs.compatible || 'Universal'}</div>
                                <div class="s-actions">
                                    <a href="/product.html?id=${listing.id}" class="s-btn-primary">View Details</a>
                                    <a href="#" class="s-btn-icon"><i class="fa-regular fa-heart"></i></a>
                                </div>
                            </div>`;
                        } else if (cardType === 'equipment') {
                            cardHtml = `
                            <div class="eq-card">
                                <div class="eq-card-img">
                                    <span class="eq-badge ${specs.condition === 'Used' ? 'used' : ''}">${specs.condition || 'New'}</span>
                                    <button class="eq-fav"><i class="fa-regular fa-heart"></i></button>
                                    <a href="/product.html?id=${listing.id}"><img src="${imageUrl}" alt="${listing.title}" loading="lazy"></a>
                                </div>
                                <div class="eq-card-info">
                                    <h3><a href="/product.html?id=${listing.id}" style="color: inherit; text-decoration: none;">${listing.title}</a></h3>
                                    
                                    <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 4px; margin-bottom: 8px;">
                                        ${listing.is_featured ? '<span class="featured-badge"><i class="fa-solid fa-star"></i> Featured</span>' : ''}
                                        <p class="eq-price" style="margin-bottom:0;">${priceFormatted}</p>
                                    </div>
                                    <div class="eq-meta">
                                        <span><i class="fa-regular fa-clock"></i> ${specs.mileage || 'N/A'}</span>
                                        <span><i class="fa-solid fa-location-dot"></i> ${listing.location}</span>
                                    </div>
                                    <a href="/product.html?id=${listing.id}" class="eq-btn">View Details</a>
                                </div>
                            </div>`;
                        } else if (cardType === 'livestock') {
                            cardHtml = `
                            <div class="ls-card">
                                <div class="ls-card-img">
                                    <span class="ls-card-badge">${listing.category}</span>
                                    <button class="ls-fav"><i class="fa-regular fa-heart"></i></button>
                                    <a href="/product.html?id=${listing.id}">
                                        <img src="${imageUrl}" alt="${listing.title}" loading="lazy">
                                    </a>
                                </div>
                                <div class="ls-card-body">
                                    <h3><a href="/product.html?id=${listing.id}" style="color: inherit; text-decoration: none;">${listing.title}</a></h3>
                                    <div class="ls-specs">
                                        <p><strong>Status:</strong> ${specs.health || 'Available'}</p>
                                        <p><strong>Weight:</strong> ${specs.weight || 'N/A'}</p>
                                        <p><strong>Breeder:</strong> ${listing.seller_name || 'Verified Seller'}</p>
                                        <p><strong>Location:</strong> ${listing.location}</p>
                                    </div>
                                    <div class="ls-price-row">
                                        <span class="price-label">Price</span>
                                        <span class="price-value">${priceFormatted}</span>
                                    </div>
                                    <a href="/product.html?id=${listing.id}" style="display:block; text-align:center; background:#2e7d32; color:white; padding:8px; border-radius:4px; text-decoration:none; margin-top:10px; font-weight:bold;">View Details</a>
                                </div>
                            </div>`;
                        } else if (cardType === 'produce') {
                            cardHtml = `
                            <div class="masonry-card">
                                <div class="card-img">
                                    <span class="card-badge organic">Fresh Crop</span>
                                    <a href="/product.html?id=${listing.id}">
                                        <img src="${imageUrl}" alt="${listing.title}" loading="lazy">
                                    </a>
                                </div>
                                <div class="card-body">
                                    <h3><a href="/product.html?id=${listing.id}" style="color: inherit; text-decoration: none;">${listing.title}</a></h3>
                                    <p class="seller"><i class="fa-solid fa-tractor"></i> ${listing.seller_name || 'Verified Farmer'}</p>
                                    <p class="desc">${listing.description ? listing.description.substring(0, 80) + '...' : 'Fresh produce available for order.'}</p>
                                    <div class="price-row">
                                        <span class="price-val">${priceFormatted}</span>
                                    </div>
                                    <a href="/product.html?id=${listing.id}" class="action-btn" style="text-decoration:none; display:block; text-align:center;">VIEW DETAILS</a>
                                </div>
                            </div>`;
                        }

                        gridElement.insertAdjacentHTML('beforeend', cardHtml);
                    });

                    // Add Load More button if there is a next page
                    if (data.hasNextPage) {
                        const loadMoreHtml = `
                        <div id="load-more-btn-container" style="grid-column: 1 / -1; text-align: center; margin-top: 20px;">
                            <button id="load-more-btn" style="padding: 12px 30px; background-color: #2b332b; color: #fff; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.2s;">
                                Load More <i class="fa-solid fa-chevron-down"></i>
                            </button>
                        </div>`;
                        gridElement.insertAdjacentHTML('beforeend', loadMoreHtml);

                        document.getElementById('load-more-btn').addEventListener('click', () => {
                            currentPage++;
                            triggerFilters(true); // true means append
                        });
                    }

                } else {
                    if (!append) {
                        gridElement.innerHTML = `<div style="text-align:center; width:100%; padding: 60px; color: #666; grid-column: 1 / -1; background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
                            <i class="fa-solid fa-box-open" style="font-size: 40px; color: #ddd; margin-bottom: 15px;"></i>
                            <br>No <b>${targetCategory}</b> listings available at the moment.
                        </div>`;
                    }
                }
            } catch (err) {
                console.error('Error loading category listings:', err);
                if (!append) gridElement.innerHTML = `<div style="text-align:center; width:100%; padding: 40px; color: red; grid-column: 1 / -1;">Failed to load listings. Please check your connection.</div>`;
            }
        }
        
        async function loadCategoryHighlight() {
            const highlightCard = document.querySelector('.highlight-card');
            if (!highlightCard) return;

            try {
                // Fetch 1 random featured listing for this specific category
                const res = await fetch(`/api/listings?category=${targetCategory}&limit=1&shuffle=true`);
                const data = await res.json();

                if (data.listings && data.listings.length > 0) {
                    const listing = data.listings[0];
                    const priceFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: listing.currency || 'USD' }).format(listing.price);
                    
                    let imageUrl = '/logo.png';
                    if (listing.images && listing.images.length > 0) {
                        imageUrl = listing.images[0];
                    } else {
                        if (listing.category === 'vehicles') imageUrl = '/hilux.jpg';
                        if (listing.category === 'machinery') imageUrl = '/tractor.jpg';
                        if (listing.category === 'livestock') imageUrl = '/cow.png';
                        if (listing.category === 'produce') imageUrl = '/tomatoes.png';
                        if (listing.category === 'spares' || listing.category === 'parts') imageUrl = '/spare-brakes.png';
                        if (listing.category === 'equipment') imageUrl = '/tractor-1.png';
                    }

                    // Dynamically update the HTML of the highlight card
                    highlightCard.innerHTML = `
                        <div class="highlight-image">
                            <span class="badge">Featured</span>
                            <a href="/product.html?id=${listing.id}">
                                <img src="${imageUrl}" alt="${listing.title}">
                            </a>
                        </div>
                        <div class="highlight-details">
                            <div class="highlight-header">
                                <h3><a href="/product.html?id=${listing.id}">${listing.title}</a></h3>
                                <button class="favorite-btn"><i class="fa-regular fa-heart"></i></button>
                            </div>
                            <p class="highlight-price"><strong>${priceFormatted}</strong></p>
                            <p class="highlight-desc">${listing.description ? listing.description.substring(0, 150) + '...' : 'Premium featured listing.'}</p>
                            <div class="highlight-actions">
                                <a href="/product.html?id=${listing.id}" class="btn-gold">View Details</a>
                                <a href="/product.html?id=${listing.id}" class="btn-green">Contact Seller</a>
                            </div>
                        </div>
                    `;
                } else {
                    // Hide if no featured listings exist for this category
                    highlightCard.style.display = 'none';
                }
            } catch (err) {
                console.error('Error loading category highlight:', err);
                highlightCard.style.display = 'none';
            }
        }
        
        // Setup filter button listener
        const applyBtn = document.getElementById('apply-filters-btn') || document.getElementById('applyFiltersBtn');
        const searchInput = document.getElementById('category-search-input');
        const searchBtn = document.getElementById('category-search-btn');

        function triggerFilters(isAppend = false) {
            if (!isAppend) {
                currentPage = 1;
            }

            let queryString = '';

            const type = document.querySelector('input[name="type"]:checked');
            if (type && type.value !== 'All Types') queryString += `&type=${encodeURIComponent(type.value)}`;

            const make = document.querySelector('input[name="make"]:checked');
            if (make && make.value !== 'All Makes') queryString += `&make=${encodeURIComponent(make.value)}`;

            const breed = document.querySelector('input[name="breed"]:checked');
            if (breed && breed.value !== 'All Breeds') queryString += `&breed=${encodeURIComponent(breed.value)}`;

            const sort = document.querySelector('input[name="sort"]:checked');
            if (sort && sort.value !== 'new') queryString += `&sort=${encodeURIComponent(sort.value)}`;

            const model = document.querySelector('input[name="model"]:checked');
            if (model && model.value !== 'All Models') queryString += `&model=${encodeURIComponent(model.value)}`;

            const condition = document.querySelector('input[name="condition"]:checked');
            if (condition && condition.value !== 'Any') queryString += `&condition=${encodeURIComponent(condition.value)}`;

            const trans = document.querySelector('input[name="trans"]:checked');
            if (trans && trans.value !== 'Any') queryString += `&transmission=${encodeURIComponent(trans.value)}`;

            const loc = document.querySelector('input[name="loc"]:checked');
            if (loc && loc.value !== 'All Provinces') queryString += `&province=${encodeURIComponent(loc.value)}`;

            const minPrice = document.getElementById('filter-price-min');
            if (minPrice && minPrice.value) queryString += `&price_min=${encodeURIComponent(minPrice.value)}`;

            const maxPrice = document.getElementById('filter-price-max');
            if (maxPrice && maxPrice.value) queryString += `&price_max=${encodeURIComponent(maxPrice.value)}`;

            if (searchInput && searchInput.value.trim()) {
                queryString += `&search=${encodeURIComponent(searchInput.value.trim())}`;
            }
            
            if (currentPage > 1) {
                queryString += `&page=${currentPage}`;
            }

            // Mobile Data Saving Algorithm (Zimbabwe Optimized)
            const isMobile = window.innerWidth <= 768;
            const itemLimit = isMobile ? 8 : 24; 
            queryString += `&limit=${itemLimit}`;

            // Sync URL silently
            const newUrl = new URL(window.location);
            newUrl.search = queryString;
            window.history.replaceState({}, '', newUrl);

            loadCategoryListings(queryString, isAppend);
        }

        // Parse URL and restore filters on load
        function restoreFiltersFromUrl() {
            const params = new URLSearchParams(window.location.search);
            let hasParams = false;

            if (params.has('page')) {
                currentPage = parseInt(params.get('page'), 10) || 1;
            }

            const restoreRadio = (name, value) => {
                const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
                if (radio) {
                    radio.checked = true;
                    // Update summary
                    const details = radio.closest('details');
                    if (details) {
                        const summary = details.querySelector('summary');
                        const label = radio.parentElement.textContent.trim();
                        summary.innerHTML = `${label} <i class="fa-solid fa-chevron-down"></i>`;
                    }
                    hasParams = true;
                }
            };

            if (params.has('type')) restoreRadio('type', params.get('type'));
            if (params.has('make')) restoreRadio('make', params.get('make'));
            if (params.has('breed')) restoreRadio('breed', params.get('breed'));
            if (params.has('sort')) restoreRadio('sort', params.get('sort'));
            if (params.has('model')) restoreRadio('model', params.get('model'));
            if (params.has('condition')) restoreRadio('condition', params.get('condition'));
            if (params.has('transmission')) restoreRadio('trans', params.get('transmission'));
            if (params.has('province')) restoreRadio('loc', params.get('province'));

            if (params.has('price_min')) {
                const el = document.getElementById('filter-price-min');
                if (el) { el.value = params.get('price_min'); hasParams = true; }
            }
            if (params.has('price_max')) {
                const el = document.getElementById('filter-price-max');
                if (el) { el.value = params.get('price_max'); hasParams = true; }
            }
            if (params.has('search')) {
                if (searchInput) { searchInput.value = params.get('search'); hasParams = true; }
            }

            // Execute filters immediately (this will do the initial fetch with the URL params applied)
            triggerFilters();
        }

        // Initialize
        restoreFiltersFromUrl();
        loadCategoryHighlight();

        if (applyBtn) {
            applyBtn.addEventListener('click', triggerFilters);
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', triggerFilters);
        }

        if (searchInput) {
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    triggerFilters();
                }
            });
        }
    }
}

// =========================================
// CUSTOM FILTER AUTO-CLOSE & SUMMARY UPDATE
// =========================================
document.querySelectorAll('.custom-filter').forEach(details => {
    const summary = details.querySelector('summary');
    const originalText = summary ? summary.innerHTML.split('<i')[0].trim() : ''; // Get the text before the icon
    
    const radios = details.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                // Update summary text
                if (summary) {
                    const selectedLabel = e.target.parentElement.textContent.trim();
                    summary.innerHTML = `${selectedLabel} <i class="fa-solid fa-chevron-down"></i>`;
                }
                // Close the dropdown
                details.removeAttribute('open');
            }
        });
    });
});

// =========================================
// DUAL PRICE SLIDER LOGIC
// =========================================
const minSlider = document.getElementById('filter-price-slider-min');
const maxSlider = document.getElementById('filter-price-slider-max');
const minPriceInput = document.getElementById('filter-price-min');
const maxPriceInput = document.getElementById('filter-price-max');

function enforceMinMaxConstraints() {
    let minVal = parseInt(minSlider.value);
    let maxVal = parseInt(maxSlider.value);
    
    // Ensure min < max
    if (minVal >= maxVal) {
        minVal = maxVal - 1;
        minSlider.value = minVal;
    }
    
    // Update inputs
    if (minPriceInput) minPriceInput.value = minVal;
    if (maxPriceInput) maxPriceInput.value = maxVal;
}

if (minSlider && maxSlider) {
    minSlider.addEventListener('input', enforceMinMaxConstraints);
    maxSlider.addEventListener('input', enforceMinMaxConstraints);
}

if (minPriceInput && maxPriceInput) {
    minPriceInput.addEventListener('input', (e) => {
        let val = parseInt(e.target.value) || 0;
        if (val < 0) val = 0; // Prevent negative
        e.target.value = val;
        
        let maxVal = parseInt(maxSlider.value);
        if (val >= maxVal) {
            val = maxVal - 1;
            e.target.value = val;
        }
        
        minSlider.value = val;
    });

    maxPriceInput.addEventListener('input', (e) => {
        let val = parseInt(e.target.value) || 0;
        let minVal = parseInt(minSlider.value);
        
        if (val <= minVal) {
            val = minVal + 1;
            e.target.value = val;
        }
        
        maxSlider.value = val;
    });
}

// =========================================
// PRODUCT PAGE DYNAMIC LOADING
// =========================================
if (window.location.pathname.includes('product.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId && !isNaN(productId)) {
        async function loadProductDetails() {
            try {
                const res = await fetch(`/api/listings/${productId}`);
                if (!res.ok) throw new Error('Product not found');
                
                const data = await res.json();
                const listing = data.listing;
                const specs = listing.specs || {};
                
                // Set Title and Price
                document.getElementById('dynamic-title').innerText = listing.title;
                const pageTitleEl = document.getElementById('dynamic-page-title');
                if(pageTitleEl) pageTitleEl.innerText = listing.title;
                
                const breadcrumbEl = document.getElementById('dynamic-breadcrumb');
                if(breadcrumbEl) breadcrumbEl.innerText = listing.title;
                
                document.title = listing.title + " - Zim AutoAgri";

                const priceFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: listing.currency || 'USD' }).format(listing.price);
                document.getElementById('dynamic-price').innerText = priceFormatted;
                document.getElementById('dynamic-price-sub').innerText = `Category: ${listing.category.toUpperCase()}`;
                document.getElementById('dynamic-similar-price').innerText = listing.location + (listing.province ? `, ${listing.province}` : '');
                
                // Set Description
                const descText = listing.description ? String(listing.description).replace(/\n/g, '<br>') : 'No description provided.';
                document.getElementById('dynamic-description').innerHTML = `<h3>Description</h3><p>${descText}</p>`;
                
                // Set Seller
                if (listing.seller) {
                    const sellerName = listing.seller.full_name || 'Verified Seller';
                    document.getElementById('dynamic-seller-name').innerText = sellerName;
                    
                    const verifNameEl = document.getElementById('dynamic-verification-name');
                    if (verifNameEl) {
                        verifNameEl.innerHTML = `${sellerName} <i class="fa-solid fa-circle-check" style="color: #1da1f2;"></i>`;
                    }
                    
                    const joinDate = new Date(listing.seller.created_at).getFullYear();
                    document.getElementById('dynamic-seller-date').innerHTML = `<i class="fa-solid fa-circle-check" style="color: green;"></i> Member since ${joinDate}`;
                }
                
                // Set Images
                let imagesArray = [];
                if (listing.images && listing.images.length > 0) {
                    imagesArray = listing.images;
                } else {
                    let fallbackUrl = 'logo.png';
                    if (listing.category === 'vehicles') fallbackUrl = 'hilux.jpg';
                    if (listing.category === 'machinery') fallbackUrl = 'tractor.jpg';
                    if (listing.category === 'livestock') fallbackUrl = 'cow.png';
                    if (listing.category === 'produce') fallbackUrl = 'tomatoes.png';
                    if (listing.category === 'spares' || listing.category === 'parts') fallbackUrl = 'spare-brakes.png';
                    if (listing.category === 'equipment') fallbackUrl = 'tractor-1.png';
                    imagesArray = [fallbackUrl];
                }
                
                const mainImage = document.getElementById('dynamic-image');
                const thumbnailContainer = document.getElementById('dynamic-thumbnails');
                let currentImageIndex = 0;

                const updateMainImage = (index) => {
                    if(mainImage) mainImage.src = imagesArray[index];
                    // Update active class on thumbnails
                    if(thumbnailContainer) {
                        const thumbs = thumbnailContainer.querySelectorAll('.thumb');
                        thumbs.forEach((t, i) => {
                            if(i === index) t.classList.add('active');
                            else t.classList.remove('active');
                        });
                    }
                };

                // Generate thumbnails
                if(thumbnailContainer) {
                    thumbnailContainer.innerHTML = '';
                    imagesArray.forEach((imgSrc, index) => {
                        const thumb = document.createElement('img');
                        thumb.src = imgSrc;
                        thumb.className = index === 0 ? 'thumb active' : 'thumb';
                        thumb.style.cursor = 'pointer';
                        thumb.addEventListener('click', () => {
                            currentImageIndex = index;
                            updateMainImage(currentImageIndex);
                        });
                        thumbnailContainer.appendChild(thumb);
                    });
                }

                // Set initial main image
                updateMainImage(0);

                // Wire up arrows
                const leftArrow = document.getElementById('gallery-left');
                const rightArrow = document.getElementById('gallery-right');
                
                if (leftArrow && rightArrow) {
                    if (imagesArray.length <= 1) {
                        leftArrow.style.display = 'none';
                        rightArrow.style.display = 'none';
                    } else {
                        leftArrow.style.display = 'flex';
                        rightArrow.style.display = 'flex';
                        leftArrow.addEventListener('click', () => {
                            currentImageIndex = (currentImageIndex - 1 + imagesArray.length) % imagesArray.length;
                            updateMainImage(currentImageIndex);
                        });
                        rightArrow.addEventListener('click', () => {
                            currentImageIndex = (currentImageIndex + 1) % imagesArray.length;
                            updateMainImage(currentImageIndex);
                        });
                    }
                }
                
                // Set Features Grid dynamically based on specs
                const featuresGrid = document.getElementById('dynamic-features');
                featuresGrid.innerHTML = ''; // clear dummy
                
                // Icons mapping
                const iconMap = {
                    'condition': 'fa-solid fa-clipboard-check',
                    'mileage': 'fa-solid fa-gauge',
                    'fuel_type': 'fa-solid fa-gas-pump',
                    'transmission': 'fa-solid fa-gear',
                    'drive_type': 'fa-solid fa-truck-monster',
                    'hp': 'fa-solid fa-bolt',
                    'weight': 'fa-solid fa-weight-hanging',
                    'health': 'fa-solid fa-heart-pulse',
                    'breed': 'fa-solid fa-dna',
                    'unit': 'fa-solid fa-box'
                };
                
                let specsAdded = 0;
                for (const [key, value] of Object.entries(specs)) {
                    if (value && specsAdded < 6) { // Show up to 6 specs
                        const icon = iconMap[key] || 'fa-solid fa-tag';
                        const label = key.replace(/_/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase());
                        featuresGrid.innerHTML += `<div class="feature-item"><i class="${icon}"></i> <b>${label}:</b> ${value}</div>`;
                        specsAdded++;
                    }
                }
                
                if (specsAdded === 0) {
                    featuresGrid.innerHTML = `<div class="feature-item"><i class="fa-solid fa-check"></i> Available Now</div>`;
                }

                // ─────────────────────────────────────────────────────────
                // RELATED LISTINGS ALGORITHM
                // ─────────────────────────────────────────────────────────
                const relatedGrid = document.querySelector('.related-section .product-grid');
                if (relatedGrid) {
                    try {
                        const relRes = await fetch(`/api/listings?category=${listing.category}&exclude_id=${listing.id}&limit=4&sort=pop`);
                        const relData = await relRes.json();
                        
                        if (relData.listings && relData.listings.length > 0) {
                            relatedGrid.innerHTML = ''; // clear dummy data
                            
                            relData.listings.forEach(relListing => {
                                let relImageUrl = '/logo.png';
                                if (relListing.images && relListing.images.length > 0) {
                                    relImageUrl = relListing.images[0];
                                } else {
                                    if (relListing.category === 'vehicles') relImageUrl = '/hilux.jpg';
                                    if (relListing.category === 'machinery') relImageUrl = '/tractor.jpg';
                                    if (relListing.category === 'livestock') relImageUrl = '/cow.png';
                                    if (relListing.category === 'produce') relImageUrl = '/tomatoes.png';
                                    if (relListing.category === 'spares' || relListing.category === 'parts') relImageUrl = '/spare-brakes.png';
                                    if (relListing.category === 'equipment') relImageUrl = '/tractor-1.png';
                                }

                                const relPriceFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: relListing.currency || 'USD' }).format(relListing.price);
                                
                                relatedGrid.innerHTML += `
                                    <div class="product-card">
                                        <div class="card-image-wrapper">
                                            <span class="category-badge">${relListing.category.toUpperCase()}</span>
                                            <button class="favorite-btn"><i class="fa-regular fa-heart"></i></button>
                                            <a href="/product.html?id=${relListing.id}">
                                                <img src="${relImageUrl}" alt="${relListing.title}" class="product-image" style="height: 180px; object-fit: cover;">
                                            </a>
                                        </div>
                                        <div class="card-details">
                                            <p class="product-price">${relPriceFormatted}</p>
                                            <h4 class="product-name"><a href="/product.html?id=${relListing.id}" style="color: inherit; text-decoration: none;">${relListing.title}</a></h4>
                                            <p class="product-location"><i class="fa-solid fa-location-dot"></i> ${relListing.location}</p>
                                        </div>
                                    </div>
                                `;
                            });
                            
                            // Update 'See All' link
                            const seeAllLink = document.querySelector('.related-section .see-all');
                            if (seeAllLink) seeAllLink.href = `/agriculture/${listing.category}.html`;
                        } else {
                            // Hide related section if no related items
                            document.querySelector('.related-section').style.display = 'none';
                        }
                    } catch (e) {
                        console.error('Failed to load related listings', e);
                    }
                }

                // ─────────────────────────────────────────────────────────
                // VIEW TRACKING (Unique Views Algorithm)
                // ─────────────────────────────────────────────────────────
                const trackView = async () => {
                    const viewedKey = `zaa_viewed_${productId}`;
                    const lastViewed = localStorage.getItem(viewedKey);
                    const now = Date.now();
                    const COOLDOWN_HOURS = 24;

                    if (!lastViewed || (now - parseInt(lastViewed)) > (COOLDOWN_HOURS * 60 * 60 * 1000)) {
                        try {
                            await fetch(`/api/listings/${productId}/view`, { method: 'POST' });
                            localStorage.setItem(viewedKey, now.toString());
                        } catch (e) {
                            console.error('Failed to record view', e);
                        }
                    }
                };
                
                // Track view after a 2-second delay to ensure they didn't just accidentally click and bounce
                setTimeout(trackView, 2000);
                
            } catch (err) {
                console.error(err);
                document.getElementById('dynamic-title').innerText = 'Product not found';
            }
        }
        loadProductDetails();
    }
}

// =========================================
// LIVESTOCK: DYNAMIC BREED FILTERING
// =========================================
if (window.location.pathname.includes('livestock.html')) {
    const breedMap = {
        "Cattle": ["Afrikaner", "Angus", "Beefmaster", "Bonsmara", "Boran", "Brahman", "Charolais", "Drakensberger", "Guernsey", "Hereford", "Holstein (Friesland)", "Jersey", "Limousin", "Mashona", "Nguni", "Nkone", "Santa Gertrudis", "Simbra", "Simmental", "Tuli"],
        "Poultry": ["Australorp", "Boschveld", "Brahma", "Broilers (Ross/Cobb)", "Koekoek", "Layers", "Leghorn", "Orpington", "Plymouth Rock", "Rhode Island Red", "Road Runner", "Sussex", "Venda"],
        "Goats": ["Boer Goat", "Kalahari Red", "Mashona Goat", "Matabele Goat", "Saanen", "Savanna", "Toggenburg"],
        "Sheep": ["Blackhead Persian", "Damara", "Dohne Merino", "Dorper", "Hampshire Down", "Ile de France", "Meatmaster", "Merino", "Suffolk"],
        "Pigs": ["Chester White", "Duroc", "Hampshire", "Landrace", "Large Black", "Large White", "Pietrain"],
        "Farm Dogs": ["Anatolian Shepherd", "Boerboel", "Border Collie", "German Shepherd", "Jack Russell", "Malinois", "Rhodesian Ridgeback", "Rottweiler"],
        "Rabbits": ["Angora", "Californian", "Chinchilla", "Dutch", "Flemish Giant", "New Zealand Red", "New Zealand White"],
        "Horses": ["Appaloosa", "Arabian", "Boerperd", "Clydesdale", "Friesian", "Percheron", "Quarter Horse", "Saddlebred", "Shire", "Thoroughbred"],
        "Donkeys": ["Standard Donkey", "Mammoth Jackstock"],
        "Fish (Aquaculture)": ["African Catfish", "Carp", "Nile Tilapia", "Rainbow Trout"],
        "Bees": ["African Honey Bee", "Cape Honey Bee"]
    };

    const typeRadios = document.querySelectorAll('input[name="type"]');
    const breedInput = document.querySelector('input[name="breed"]');
    
    if (typeRadios.length > 0 && breedInput) {
        const breedContainer = breedInput.closest('.custom-options');
        const breedDetails = breedContainer.closest('.custom-filter');
        const breedSummary = breedDetails.querySelector('summary');

        // Function to populate breeds based on selected category
        const populateBreeds = (selectedType) => {
            breedContainer.innerHTML = '<label><input type="radio" name="breed" value="All Breeds" checked> All Breeds</label>';
            breedSummary.innerHTML = 'All Breeds <i class="fa-solid fa-chevron-down"></i>';

            let breedsToAdd = [];
            if (selectedType === "All Livestock") {
                Object.values(breedMap).forEach(arr => breedsToAdd.push(...arr));
                breedsToAdd.sort(); // Alphabetical
            } else if (breedMap[selectedType]) {
                breedsToAdd = breedMap[selectedType];
            }

            // Remove duplicates and sort
            breedsToAdd = [...new Set(breedsToAdd)].sort();

            breedsToAdd.forEach(b => {
                const label = document.createElement('label');
                label.innerHTML = `<input type="radio" name="breed" value="${b}"> ${b}`;
                breedContainer.appendChild(label);
            });

            // Re-attach listeners
            const newRadios = breedContainer.querySelectorAll('input[type="radio"]');
            newRadios.forEach(r => {
                r.addEventListener('change', (ev) => {
                    if (ev.target.checked) {
                        const selectedLabel = ev.target.parentElement.textContent.trim();
                        breedSummary.innerHTML = `${selectedLabel} <i class="fa-solid fa-chevron-down"></i>`;
                        breedDetails.removeAttribute('open');
                        
                        if (typeof window.triggerFilters === 'function') {
                            window.triggerFilters();
                        }
                    }
                });
            });
        };

        // Populate initially based on current selection
        const initialType = document.querySelector('input[name="type"]:checked')?.value || "All Livestock";
        populateBreeds(initialType);

        // Attach listener for category changes
        typeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                populateBreeds(e.target.value);
            });
        });
    }
}
