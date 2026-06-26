// =========================================
// GLOBAL SCRIPTS (Waits for HTML to load)
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    
    // --- HAMBURGER MENU LOGIC ---
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
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
        hamburgerIcon.addEventListener("click", function() {
            mainNavLinks.classList.toggle("active");
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
        filterBtn.addEventListener('click', function() {
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
    }
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
                    let imageUrl = 'logo.png';
                    if (listing.images && listing.images.length > 0) {
                        imageUrl = listing.images[0];
                    } else {
                        if (listing.category === 'vehicles') imageUrl = 'hilux.jpg';
                        if (listing.category === 'machinery') imageUrl = 'tractor.jpg';
                        if (listing.category === 'livestock') imageUrl = 'cow.png';
                        if (listing.category === 'produce') imageUrl = 'tomatoes.png';
                        if (listing.category === 'spares' || listing.category === 'parts') imageUrl = 'autoparts.png';
                    }

                    let badgeClass = 'auto-card';
                    if (listing.category === 'livestock' || listing.category === 'produce' || listing.category === 'machinery') badgeClass = 'agri-card';

                    const cardHtml = `
                    <div class="product-card ${badgeClass}">
                        <div class="card-image-wrapper">
                            <span class="category-badge" style="text-transform: capitalize;">${listing.category}</span>
                            <button class="favorite-btn"><i class="fa-regular fa-heart"></i></button>
                            <a href="product.html?id=${listing.id}">
                                <img src="${imageUrl}" alt="${listing.title}" class="product-image">
                            </a>
                        </div>
                        <div class="card-details">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                <p class="product-price" style="margin-bottom: 0;">${priceFormatted}</p>
                                ${listing.is_featured ? '<span class="featured-badge" style="background:#f59e0b; color:white; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"><i class="fa-solid fa-star"></i> Featured</span>' : ''}
                            </div>
                            <h4 class="product-name"><a href="product.html?id=${listing.id}" style="color: inherit; text-decoration: none;">${listing.title}</a></h4>
                            <p class="product-location"><i class="fa-solid fa-location-dot"></i> ${listing.location}${listing.province ? ', ' + listing.province : ''}</p>
                            <div class="product-meta">
                                ${metaHtml}
                            </div>
                            <a href="product.html?id=${listing.id}" class="view-details-btn">View Details</a>
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
    if (gridElement) {
        
        async function loadCategoryListings(queryString = '') {
            try {
                gridElement.innerHTML = `<div style="text-align:center; width:100%; padding: 40px; color: #666; grid-column: 1 / -1;">Loading ${targetCategory} listings <i class="fa-solid fa-spinner fa-spin"></i></div>`;
                
                const res = await fetch(`/api/listings?category=${targetCategory}${queryString}`);
                const data = await res.json();
                
                if (data.listings && data.listings.length > 0) {
                    gridElement.innerHTML = ''; // clear loading
                    
                    data.listings.forEach(listing => {
                        const priceFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: listing.currency || 'USD' }).format(listing.price);
                        const specs = listing.specs || {};
                        
                        let cardHtml = '';

                        // Fallback image logic
                        let imageUrl = 'logo.png';
                        if (listing.images && listing.images.length > 0) {
                            imageUrl = listing.images[0];
                        } else {
                            if (listing.category === 'vehicles') imageUrl = 'hilux.jpg';
                            if (listing.category === 'machinery') imageUrl = 'tractor.jpg';
                            if (listing.category === 'livestock') imageUrl = 'cow.png';
                            if (listing.category === 'produce') imageUrl = 'tomatoes.png';
                            if (listing.category === 'spares' || listing.category === 'parts') imageUrl = 'spare-brakes.png';
                            if (listing.category === 'equipment') imageUrl = 'tractor-1.png';
                        }

                        if (cardType === 'vehicle') {
                            cardHtml = `
                            <div class="vehicle-card">
                                <div class="v-card-image">
                                    <span class="v-badge ${specs.condition === 'Used' ? 'used' : ''}">${specs.condition || 'New'}</span>
                                    <button class="v-fav"><i class="fa-regular fa-heart"></i></button>
                                    <a href="product.html?id=${listing.id}"><img src="${imageUrl}" alt="${listing.title}"></a>
                                </div>
                                <div class="v-card-content">
                                    <p class="v-price">${priceFormatted}</p>
                                    <h4><a href="product.html?id=${listing.id}">${listing.title}</a></h4>
                                    <p class="v-specs"><i class="fa-solid fa-gauge"></i> ${specs.mileage || 'N/A'}<br><i class="fa-solid fa-location-dot"></i> ${listing.location}</p>
                                    <a href="product.html?id=${listing.id}" class="v-btn">View Details</a>
                                </div>
                            </div>`;
                        } else if (cardType === 'machinery') {
                            cardHtml = `
                            <div class="machinery-card">
                                <div class="m-card-image">
                                    <span class="m-badge ${specs.condition === 'Used' ? 'used' : ''}">${specs.condition || 'New'}</span>
                                    <button class="m-fav"><i class="fa-regular fa-heart"></i></button>
                                    <a href="product.html?id=${listing.id}"><img src="${imageUrl}" alt="${listing.title}"></a>
                                </div>
                                <div class="m-card-content">
                                    <p class="m-price">${priceFormatted}</p>
                                    <h4><a href="product.html?id=${listing.id}">${listing.title}</a></h4>
                                    <p class="m-specs"><i class="fa-solid fa-clock"></i> ${specs.mileage || 'N/A'}<br><i class="fa-solid fa-location-dot"></i> ${listing.location}</p>
                                    <a href="product.html?id=${listing.id}" class="m-btn">View Details</a>
                                </div>
                            </div>`;
                        } else if (cardType === 'spares') {
                            cardHtml = `
                            <div class="s-card">
                                <span class="s-badge ${specs.condition === 'Used' ? '' : 'oem'}">${specs.condition || 'OEM'}</span>
                                <div class="s-card-img">
                                    <a href="product.html?id=${listing.id}"><img src="${imageUrl}" alt="${listing.title}"></a>
                                </div>
                                <p class="s-sku">SKU: ${specs.part_number || 'N/A'}</p>
                                <h4 class="s-title"><a href="product.html?id=${listing.id}" style="color: inherit; text-decoration: none;">${listing.title}</a></h4>
                                <p class="s-price">${priceFormatted}</p>
                                <div class="s-compatibility"><i class="fa-solid fa-circle-check"></i> Fits: ${specs.compatible || 'Universal'}</div>
                                <div class="s-actions">
                                    <a href="product.html?id=${listing.id}" class="s-btn-primary">View Details</a>
                                    <a href="#" class="s-btn-icon"><i class="fa-regular fa-heart"></i></a>
                                </div>
                            </div>`;
                        } else if (cardType === 'equipment') {
                            cardHtml = `
                            <div class="eq-card">
                                <div class="eq-card-img">
                                    <span class="eq-badge ${specs.condition === 'Used' ? 'used' : ''}">${specs.condition || 'New'}</span>
                                    <button class="eq-fav"><i class="fa-regular fa-heart"></i></button>
                                    <a href="product.html?id=${listing.id}"><img src="${imageUrl}" alt="${listing.title}"></a>
                                </div>
                                <div class="eq-card-info">
                                    <h3><a href="product.html?id=${listing.id}" style="color: inherit; text-decoration: none;">${listing.title}</a></h3>
                                    <p class="eq-price">${priceFormatted}</p>
                                    <div class="eq-meta">
                                        <span><i class="fa-regular fa-clock"></i> ${specs.mileage || 'N/A'}</span>
                                        <span><i class="fa-solid fa-location-dot"></i> ${listing.location}</span>
                                    </div>
                                    <a href="product.html?id=${listing.id}" class="eq-btn">View Details</a>
                                </div>
                            </div>`;
                        } else if (cardType === 'livestock') {
                            cardHtml = `
                            <div class="ls-card">
                                <div class="ls-card-img">
                                    <span class="ls-card-badge">${listing.category}</span>
                                    <button class="ls-fav"><i class="fa-regular fa-heart"></i></button>
                                    <a href="product.html?id=${listing.id}">
                                        <img src="${imageUrl}" alt="${listing.title}">
                                    </a>
                                </div>
                                <div class="ls-card-body">
                                    <h3><a href="product.html?id=${listing.id}" style="color: inherit; text-decoration: none;">${listing.title}</a></h3>
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
                                    <a href="product.html?id=${listing.id}" style="display:block; text-align:center; background:#2e7d32; color:white; padding:8px; border-radius:4px; text-decoration:none; margin-top:10px; font-weight:bold;">View Details</a>
                                </div>
                            </div>`;
                        } else if (cardType === 'produce') {
                            cardHtml = `
                            <div class="masonry-card">
                                <div class="card-img">
                                    <span class="card-badge organic">Fresh Crop</span>
                                    <a href="product.html?id=${listing.id}">
                                        <img src="${imageUrl}" alt="${listing.title}">
                                    </a>
                                </div>
                                <div class="card-body">
                                    <h3><a href="product.html?id=${listing.id}" style="color: inherit; text-decoration: none;">${listing.title}</a></h3>
                                    <p class="seller"><i class="fa-solid fa-tractor"></i> ${listing.seller_name || 'Verified Farmer'}</p>
                                    <p class="desc">${listing.description ? listing.description.substring(0, 80) + '...' : 'Fresh produce available for order.'}</p>
                                    <div class="price-row">
                                        <span class="price-val">${priceFormatted}</span>
                                    </div>
                                    <a href="product.html?id=${listing.id}" class="action-btn" style="text-decoration:none; display:block; text-align:center;">VIEW DETAILS</a>
                                </div>
                            </div>`;
                        }

                        gridElement.innerHTML += cardHtml;
                    });
                } else {
                    gridElement.innerHTML = `<div style="text-align:center; width:100%; padding: 60px; color: #666; grid-column: 1 / -1; background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
                        <i class="fa-solid fa-box-open" style="font-size: 40px; color: #ddd; margin-bottom: 15px;"></i>
                        <br>No <b>${targetCategory}</b> listings available at the moment.
                    </div>`;
                }
            } catch (err) {
                console.error('Error loading category listings:', err);
                gridElement.innerHTML = `<div style="text-align:center; width:100%; padding: 40px; color: red; grid-column: 1 / -1;">Failed to load listings. Please check your connection.</div>`;
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
                    
                    let imageUrl = 'logo.png';
                    if (listing.images && listing.images.length > 0) {
                        imageUrl = listing.images[0];
                    } else {
                        if (listing.category === 'vehicles') imageUrl = 'hilux.jpg';
                        if (listing.category === 'machinery') imageUrl = 'tractor.jpg';
                        if (listing.category === 'livestock') imageUrl = 'cow.png';
                        if (listing.category === 'produce') imageUrl = 'tomatoes.png';
                        if (listing.category === 'spares' || listing.category === 'parts') imageUrl = 'spare-brakes.png';
                        if (listing.category === 'equipment') imageUrl = 'tractor-1.png';
                    }

                    // Dynamically update the HTML of the highlight card
                    highlightCard.innerHTML = `
                        <div class="highlight-image">
                            <span class="badge">Featured</span>
                            <a href="product.html?id=${listing.id}">
                                <img src="${imageUrl}" alt="${listing.title}">
                            </a>
                        </div>
                        <div class="highlight-details">
                            <div class="highlight-header">
                                <h3><a href="product.html?id=${listing.id}">${listing.title}</a></h3>
                                <button class="favorite-btn"><i class="fa-regular fa-heart"></i></button>
                            </div>
                            <p class="highlight-price"><strong>${priceFormatted}</strong></p>
                            <p class="highlight-desc">${listing.description ? listing.description.substring(0, 150) + '...' : 'Premium featured listing.'}</p>
                            <div class="highlight-actions">
                                <a href="product.html?id=${listing.id}" class="btn-gold">View Details</a>
                                <a href="product.html?id=${listing.id}" class="btn-green">Contact Seller</a>
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
        
        loadCategoryListings();
        loadCategoryHighlight();
        
        // Setup filter button listener
        const applyBtn = document.getElementById('apply-filters-btn');
        const searchInput = document.getElementById('category-search-input');
        const searchBtn = document.getElementById('category-search-btn');

        function triggerFilters() {
            let queryString = '';

            const make = document.querySelector('input[name="make"]:checked');
            if (make && make.value !== 'All Makes') queryString += `&make=${encodeURIComponent(make.value)}`;

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

            loadCategoryListings(queryString);
        }

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