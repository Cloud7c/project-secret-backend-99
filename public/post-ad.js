// =========================================
// 1. EXHAUSTIVE DATA CONFIGURATIONS
// =========================================
const categoryConfigurations = {
    
    // --- VEHICLES & MACHINERY ---
    vehicles: `
        <div class="section-header">
            <h2>1. Vehicle & Machinery Details</h2>
            <span class="status-check"><i class="fa-solid fa-circle-check"></i> Details</span>
        </div>
        <div class="fields-grid">
            <div class="form-group"><label>Make / Brand</label><div class="input-with-icon"><i class="fa-solid fa-tractor"></i><input type="text" name="spec_make" placeholder="e.g., John Deere" required></div></div>
            <div class="form-group"><label>Model</label><div class="input-with-icon"><i class="fa-solid fa-truck"></i><input type="text" name="spec_model" placeholder="e.g., 8R 370" required></div></div>
            <div class="form-group"><label>Year</label><div class="input-with-icon"><i class="fa-regular fa-calendar"></i><input type="number" name="spec_year" placeholder="e.g., 2023" required></div></div>
            <div class="form-group"><label>Hours / Mileage</label><div class="input-with-icon"><i class="fa-solid fa-gauge-high"></i><input type="text" name="spec_mileage" placeholder="e.g., 5000"></div></div>
            <div class="form-group"><label>VIN / Serial Number</label><div class="input-with-icon"><i class="fa-solid fa-barcode"></i><input type="text" name="spec_vin" placeholder="Optional"></div></div>
            <div class="form-group"><label>Engine HP</label><div class="input-with-icon"><i class="fa-solid fa-bolt"></i><input type="number" name="spec_hp" placeholder="e.g., 370"></div></div>
            <div class="form-group"><label>Drive Type</label><div class="input-with-icon"><i class="fa-solid fa-gear"></i><select name="spec_drive_type"><option>4WD</option><option>2WD</option><option>AWD</option></select></div></div>
            <div class="form-group"><label>Transmission</label><div class="input-with-icon"><i class="fa-solid fa-gears"></i><select name="spec_transmission"><option>Manual</option><option>Automatic</option></select></div></div>
            <div class="form-group"><label>Fuel Type</label><div class="input-with-icon"><i class="fa-solid fa-gas-pump"></i><select name="spec_fuel_type"><option>Diesel</option><option>Petrol</option><option>Electric</option></select></div></div>
            <div class="form-group">
                <label>Condition</label>
                <div class="condition-radio-group">
                    <label class="radio-label active-radio"><input type="radio" name="spec_condition" value="New" checked> New</label>
                    <label class="radio-label"><input type="radio" name="spec_condition" value="Used"> Used</label>
                </div>
            </div>
        </div>
        
        <div class="section-header">
            <h2>2. Listing Information</h2>
            <span class="status-check"><i class="fa-solid fa-circle-check"></i> Pricing</span>
        </div>
        <div class="fields-grid">
            <div class="form-group"><label>Listing Title</label><div class="input-with-icon"><i class="fa-regular fa-address-card"></i><input type="text" name="title" placeholder="e.g., 2023 John Deere 8R 370" required></div></div>
            <div class="form-group"><label>Asking Price (USD)</label><div class="input-with-icon"><i class="fa-solid fa-dollar-sign"></i><input type="number" name="price" placeholder="e.g., 425000" required></div></div>
            <div class="form-group"><label>Province</label><div class="input-with-icon"><i class="fa-solid fa-map"></i><select name="province"><option>Harare</option><option>Bulawayo</option><option>Mashonaland East</option><option>Mashonaland West</option><option>Mashonaland Central</option><option>Manicaland</option><option>Masvingo</option><option>Midlands</option><option>Matabeleland North</option><option>Matabeleland South</option></select></div></div>
            <div class="form-group"><label>City / Location</label><div class="input-with-icon"><i class="fa-solid fa-location-dot"></i><input type="text" name="location" placeholder="e.g., Harare CBD" required></div></div>
            <div class="form-group full-width">
                <label>Detailed Description</label>
                <div class="rich-text-container">
                    <div class="rich-text-toolbar"><i class="fa-solid fa-bold"></i><i class="fa-solid fa-italic"></i><i class="fa-solid fa-list-ul"></i></div>
                    <textarea name="description" rows="5" placeholder="Provide full details about history, maintenance, and features..." required></textarea>
                </div>
            </div>
        </div>
    `,

    // --- LIVESTOCK ---
    livestock: `
        <div class="section-header">
            <h2>1. Livestock & Produce Details</h2>
            <span class="status-check"><i class="fa-solid fa-circle-check"></i> Details</span>
        </div>
        <div class="fields-grid">
            <div class="form-group"><label>Category</label><div class="input-with-icon"><i class="fa-solid fa-cow"></i><select name="spec_sub_category"><option>Cattle</option><option>Poultry</option><option>Goats/Sheep</option><option>Crops</option></select></div></div>
            <div class="form-group"><label>Breed / Variety</label><div class="input-with-icon"><i class="fa-solid fa-dna"></i><input type="text" name="spec_breed" placeholder="e.g., Brahman, White Maize" required></div></div>
            <div class="form-group"><label>Quantity Available</label><div class="input-with-icon"><i class="fa-solid fa-boxes-stacked"></i><input type="number" name="spec_quantity" placeholder="e.g., 50" required></div></div>
            <div class="form-group"><label>Average Weight / Size</label><div class="input-with-icon"><i class="fa-solid fa-weight-scale"></i><input type="text" name="spec_weight" placeholder="e.g., 500kg"></div></div>
            <div class="form-group"><label>Average Age</label><div class="input-with-icon"><i class="fa-solid fa-clock"></i><input type="text" name="spec_age" placeholder="e.g., 2 Years"></div></div>
            <div class="form-group"><label>Gender</label><div class="input-with-icon"><i class="fa-solid fa-venus-mars"></i><select name="spec_gender"><option>Mixed</option><option>Male</option><option>Female</option></select></div></div>
            <div class="form-group"><label>Vaccination / Health Status</label><div class="input-with-icon"><i class="fa-solid fa-syringe"></i><select name="spec_health"><option>Fully Vaccinated</option><option>Not Vaccinated</option><option>N/A (Produce)</option></select></div></div>
            <div class="form-group"><label>Moisture Content (Crops Only)</label><div class="input-with-icon"><i class="fa-solid fa-droplet"></i><input type="text" name="spec_moisture" placeholder="e.g., 12.5%"></div></div>
        </div>
        
        <div class="section-header">
            <h2>2. Listing Information</h2>
            <span class="status-check"><i class="fa-solid fa-circle-check"></i> Pricing</span>
        </div>
        <div class="fields-grid">
            <div class="form-group"><label>Listing Title</label><div class="input-with-icon"><i class="fa-regular fa-address-card"></i><input type="text" name="title" placeholder="e.g., 50 Brahman Heifers" required></div></div>
            <div class="form-group"><label>Total Asking Price (USD)</label><div class="input-with-icon"><i class="fa-solid fa-dollar-sign"></i><input type="number" name="price" placeholder="e.g., 12000" required></div></div>
            <div class="form-group"><label>Province</label><div class="input-with-icon"><i class="fa-solid fa-map"></i><select name="province"><option>Harare</option><option>Bulawayo</option><option>Mashonaland East</option><option>Mashonaland West</option><option>Mashonaland Central</option><option>Manicaland</option><option>Masvingo</option><option>Midlands</option><option>Matabeleland North</option><option>Matabeleland South</option></select></div></div>
            <div class="form-group"><label>City / Location</label><div class="input-with-icon"><i class="fa-solid fa-location-dot"></i><input type="text" name="location" placeholder="e.g., Bulawayo CBD" required></div></div>
            <div class="form-group full-width">
                <label>Detailed Description</label>
                <div class="rich-text-container">
                    <div class="rich-text-toolbar"><i class="fa-solid fa-bold"></i><i class="fa-solid fa-italic"></i><i class="fa-solid fa-list-ul"></i></div>
                    <textarea name="description" rows="5" placeholder="Describe the diet, health, farming methods, or crop quality..." required></textarea>
                </div>
            </div>
        </div>
    `,

    // --- PARTS & ACCESSORIES ---
    parts: `
        <div class="section-header">
            <h2>1. Part Details</h2>
            <span class="status-check"><i class="fa-solid fa-circle-check"></i> Details</span>
        </div>
        <div class="fields-grid">
            <div class="form-group"><label>Part Name</label><div class="input-with-icon"><i class="fa-solid fa-gear"></i><input type="text" name="spec_part_name" placeholder="e.g., Tractor Tire" required></div></div>
            <div class="form-group"><label>OEM Part Number</label><div class="input-with-icon"><i class="fa-solid fa-barcode"></i><input type="text" name="spec_part_number" placeholder="Optional"></div></div>
            <div class="form-group full-width"><label>Compatible Brands/Models</label><div class="input-with-icon"><i class="fa-solid fa-wrench"></i><input type="text" name="spec_compatible" placeholder="e.g., Fits John Deere 8R series" required></div></div>
            <div class="form-group">
                <label>Condition</label>
                <div class="condition-radio-group">
                    <label class="radio-label active-radio"><input type="radio" name="spec_condition" value="New" checked> New</label>
                    <label class="radio-label"><input type="radio" name="spec_condition" value="Used"> Used</label>
                </div>
            </div>
        </div>
        
        <div class="section-header">
            <h2>2. Listing Information</h2>
            <span class="status-check"><i class="fa-solid fa-circle-check"></i> Pricing</span>
        </div>
        <div class="fields-grid">
            <div class="form-group"><label>Listing Title</label><div class="input-with-icon"><i class="fa-regular fa-address-card"></i><input type="text" name="title" placeholder="e.g., John Deere Tractor Tire" required></div></div>
            <div class="form-group"><label>Asking Price (USD)</label><div class="input-with-icon"><i class="fa-solid fa-dollar-sign"></i><input type="number" name="price" placeholder="e.g., 250" required></div></div>
            <div class="form-group"><label>Province</label><div class="input-with-icon"><i class="fa-solid fa-map"></i><select name="province"><option>Harare</option><option>Bulawayo</option><option>Mashonaland East</option><option>Mashonaland West</option><option>Mashonaland Central</option><option>Manicaland</option><option>Masvingo</option><option>Midlands</option><option>Matabeleland North</option><option>Matabeleland South</option></select></div></div>
            <div class="form-group"><label>City / Location</label><div class="input-with-icon"><i class="fa-solid fa-location-dot"></i><input type="text" name="location" placeholder="e.g., Mutare" required></div></div>
            <div class="form-group full-width">
                <label>Detailed Description</label>
                <div class="rich-text-container">
                    <div class="rich-text-toolbar"><i class="fa-solid fa-bold"></i><i class="fa-solid fa-italic"></i><i class="fa-solid fa-list-ul"></i></div>
                    <textarea name="description" rows="5" placeholder="Describe the part condition, wear and tear, history..." required></textarea>
                </div>
            </div>
        </div>
    `
};

// =========================================
// 2. CLEAN EVENT LISTENERS
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    
    const dynamicFieldsContainer = document.getElementById('dynamic-fields-container');
    const submitBtn = document.getElementById('submit-btn');

    // 2A. CUSTOM DROPDOWN LOGIC
    const dropdownSelected = document.getElementById('dropdown-selected');
    const dropdownOptions = document.getElementById('dropdown-options');
    const hiddenCategoryInput = document.getElementById('main-category');
    
    if (dropdownSelected && dropdownOptions && hiddenCategoryInput) {
        const selectedText = dropdownSelected.querySelector('span');

        dropdownSelected.addEventListener('click', () => {
            dropdownOptions.classList.toggle('show');
        });

        const options = document.querySelectorAll('.dropdown-option');
        options.forEach(option => {
            option.addEventListener('click', () => {
                const value = option.getAttribute('data-value');
                const text = option.innerText;
                
                selectedText.innerText = text;
                dropdownOptions.classList.remove('show');
                hiddenCategoryInput.value = value;
                
                const newFieldsHTML = categoryConfigurations[value];
                if (newFieldsHTML) {
                    dynamicFieldsContainer.innerHTML = newFieldsHTML;
                    submitBtn.disabled = false;
                    attachRadioLogic();
                }
            });
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.custom-dropdown')) {
                dropdownOptions.classList.remove('show');
            }
        });
    }

    // 2B. BUTTON LISTENERS
    const triggerBrowseBtn = document.getElementById('trigger-browse-btn');
    const fileInput = document.getElementById('file-input');
    
    if (triggerBrowseBtn && fileInput) {
        triggerBrowseBtn.addEventListener('click', () => {
            fileInput.click();
        });
    }

    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            window.location.href = 'index.html'; 
        });
    }

    // 2C. IMAGE UPLOAD LOGIC (MAX 3 IMAGES)
    const previewArea = document.getElementById('thumbnail-preview-area');
    let selectedFilesArray = []; 

    if (fileInput && previewArea) {
        fileInput.addEventListener('change', (e) => {
            
            const rawNewFiles = Array.from(e.target.files);
            let validNewImages = [];
            
            // Only keep files that are actually images
            rawNewFiles.forEach(file => {
                if (file.type.startsWith('image/')) {
                    validNewImages.push(file);
                }
            });

            // CHECK: Does this exceed our 3 image limit?
            if (selectedFilesArray.length + validNewImages.length > 3) {
                alert('You can only upload a maximum of 3 images!');
                
                // Cut the incoming array down so the total equals exactly 3
                const availableSlots = 3 - selectedFilesArray.length;
                validNewImages = validNewImages.slice(0, availableSlots);
            }

            // If we actually have images to add, remove the placeholder text
            if (validNewImages.length > 0 && previewArea.querySelector('.placeholder-text')) {
                previewArea.innerHTML = '';
            }
            
            // Add the valid images to the screen and memory
            validNewImages.forEach(file => {
                
                selectedFilesArray.push(file);

                const imageURL = URL.createObjectURL(file);
                
                const wrapper = document.createElement('div');
                wrapper.className = 'preview-wrapper';
                
                const imgElement = document.createElement('img');
                imgElement.src = imageURL;
                imgElement.className = 'preview-thumb';
                
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-thumb-btn';
                removeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
                
                removeBtn.addEventListener('click', (event) => {
                    event.preventDefault(); 
                    wrapper.remove(); 
                    
                    selectedFilesArray = selectedFilesArray.filter(f => f !== file);
                    
                    if (selectedFilesArray.length === 0) {
                        previewArea.innerHTML = '<p class="placeholder-text">Uploaded images will appear here...</p>';
                    }
                });

                wrapper.appendChild(imgElement);
                wrapper.appendChild(removeBtn);
                previewArea.appendChild(wrapper);
            });
            
            // Clear the actual input so the user can select the same file again if they delete it
            fileInput.value = '';
        });
    }

    // Helper Function
    function attachRadioLogic() {
        const radioLabels = document.querySelectorAll('.radio-label');
        radioLabels.forEach(label => {
            label.addEventListener('click', function() {
                const siblings = this.parentElement.querySelectorAll('.radio-label');
                siblings.forEach(sib => sib.classList.remove('active-radio'));
                this.classList.add('active-radio');
            });
        });
    }

    // =========================================
    // 3. API SUBMISSION LOGIC
    // =========================================
    const form = document.getElementById('dynamic-ad-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Disable button and show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Publishing... <i class="fa-solid fa-spinner fa-spin"></i>';

            // Gather standard fields
            const formData = new FormData(form);
            const category = document.getElementById('main-category').value;
            
            // Get user from token
            const userJson = localStorage.getItem('zaa_user');
            if (!userJson) {
                alert("You must be logged in to post an ad.");
                window.location.href = 'login.html';
                return;
            }
            const user = JSON.parse(userJson);

            // Construct Payload
            const payload = {
                user_id: user.id,
                category: category,
                title: formData.get('title'),
                price: parseFloat(formData.get('price')),
                province: formData.get('province'),
                location: formData.get('location'),
                description: formData.get('description'),
                specs: {}
            };

            // Loop through form data to find 'spec_' fields
            for (let [key, value] of formData.entries()) {
                if (key.startsWith('spec_') && value.trim() !== '') {
                    const cleanKey = key.replace('spec_', '');
                    payload.specs[cleanKey] = value;
                }
            }

            try {
                const token = localStorage.getItem('zaa_token');
                const response = await fetch('/api/listings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (!response.ok) {
                    alert(data.error || 'Failed to post listing.');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Continue to Details & Publish <i class="fa-solid fa-arrow-right"></i>';
                    return;
                }

                // Success! Redirect to account dashboard
                alert("Listing posted successfully!");
                window.location.href = 'account.html';

            } catch (err) {
                console.error(err);
                alert('Network error. Please try again.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Continue to Details & Publish <i class="fa-solid fa-arrow-right"></i>';
            }
        });
    }
});