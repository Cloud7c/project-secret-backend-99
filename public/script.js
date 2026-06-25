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