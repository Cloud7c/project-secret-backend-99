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


// =========================================
// RUN IMMEDIATELY - FETCH DATA FROM API
// =========================================
if (window.location.pathname.includes("product.html")) {
    
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
        
        // 1. Create a modern async function so we can "await" the API call
        const fetchProductData = async () => {
            try {
                // 2. Make the "phone call" to our new backend API!
                const response = await fetch(`/api/products/${productId}`);
                const result = await response.json();

                // 3. If the server says success, paint the HTML!
                if (result.success) {
                    const product = result.data;

                    const titleElement = document.getElementById('dynamic-title');
                    const priceElement = document.getElementById('dynamic-price');
                    const imageElement = document.getElementById('dynamic-image');
                    const pageTitleElement = document.getElementById('dynamic-page-title');
                    const breadcrumbElement = document.getElementById('dynamic-breadcrumb');
                    const similarPriceElement = document.getElementById('dynamic-similar-price');
                    const priceSubElement = document.getElementById('dynamic-price-sub');
                    const featuresContainer = document.getElementById('dynamic-features');
                    const thumbnailsContainer = document.getElementById('dynamic-thumbnails');
                    
                    if (titleElement) titleElement.textContent = product.title;
                    if (priceElement) priceElement.textContent = product.price;
                    
                    if (imageElement) {
                        imageElement.src = product.image;
                        imageElement.alt = product.title; 
                    }
                    
                    if (pageTitleElement) pageTitleElement.textContent = product.title;
                    if (breadcrumbElement) breadcrumbElement.textContent = product.title;
                    document.title = product.title + " - Zim AutoAgri";

                    if (similarPriceElement && product.similarPrice) {
                        similarPriceElement.textContent = "Similar to " + product.similarPrice;
                    }
                    if (priceSubElement) {
                        priceSubElement.textContent = "Price: " + product.price;
                    }

                    if (featuresContainer && product.features) {
                        featuresContainer.innerHTML = '';
                        product.features.forEach(feature => {
                            const div = document.createElement('div');
                            div.className = 'feature-item';
                            div.innerHTML = `<i class="fa-solid ${feature.icon}"></i> ${feature.text}`;
                            featuresContainer.appendChild(div);
                        });
                    }

                    if (thumbnailsContainer) {
                        thumbnailsContainer.innerHTML = '';
                        const thumb = document.createElement('img');
                        thumb.src = product.image;
                        thumb.className = 'thumb active';
                        thumb.alt = product.title + ' Thumbnail';
                        thumbnailsContainer.appendChild(thumb);
                    }
                } else {
                    showErrorPage();
                }
            } catch (error) {
                console.error("Failed to fetch product:", error);
                showErrorPage();
            }
        };

        // Helper function to show errors cleanly
        const showErrorPage = () => {
            const titleElement = document.getElementById('dynamic-title');
            const pageTitleElement = document.getElementById('dynamic-page-title');
            const imageElement = document.getElementById('dynamic-image');
            const featuresContainer = document.getElementById('dynamic-features');
            const priceElement = document.getElementById('dynamic-price');
            
            if (titleElement) titleElement.textContent = "Product Not Found";
            if (pageTitleElement) pageTitleElement.textContent = "Error 404";
            if (priceElement) priceElement.textContent = "N/A";
            if (imageElement) imageElement.src = "logo.png"; 
            if (featuresContainer) featuresContainer.innerHTML = ""; 
        };

        // 4. Actually execute our async function
        fetchProductData();
        
    }
}


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
            
            // Fetch exactly 8 listings, prioritized by featured status and recency
            const res = await fetch('/api/listings?limit=8');
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

                    const cardHtml = \`
                    <div class="product-card \${badgeClass}">
                        <div class="card-image-wrapper">
                            <span class="category-badge" style="text-transform: capitalize;">\${listing.category}</span>
                            \${listing.is_featured ? '<span class="featured-badge" style="position:absolute; top:10px; right:10px; background:#f59e0b; color:white; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold; z-index:2; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"><i class="fa-solid fa-star"></i> Featured</span>' : ''}
                            <button class="favorite-btn"><i class="fa-regular fa-heart"></i></button>
                            <a href="product.html?id=\${listing.id}">
                                <img src="\${imageUrl}" alt="\${listing.title}" class="product-image">
                            </a>
                        </div>
                        <div class="card-details">
                            <p class="product-price">\${priceFormatted}</p>
                            <h4 class="product-name"><a href="product.html?id=\${listing.id}" style="color: inherit; text-decoration: none;">\${listing.title}</a></h4>
                            <p class="product-location"><i class="fa-solid fa-location-dot"></i> \${listing.location}\${listing.province ? ', ' + listing.province : ''}</p>
                            <div class="product-meta">
                                \${metaHtml}
                            </div>
                            <a href="product.html?id=\${listing.id}" class="view-details-btn">View Details</a>
                        </div>
                    </div>\`;

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