import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/post-ad.css';

const PostAd = () => {
    const navigate = useNavigate();
    const [category, setCategory] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [images, setImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Form data state
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        province: 'Harare',
        location: '',
        description: ''
    });

    const [specs, setSpecs] = useState({});

        useEffect(() => {
        const token = localStorage.getItem('zaa_token');
        if (!token) {
            navigate('/login?redirect=/post-ad', { replace: true, state: { message: 'Please login to post an ad.' } });
        }
    }, [navigate]);

    const handleCategorySelect = (selectedCategory) => {
        setCategory(selectedCategory);
        setIsDropdownOpen(false);
        setSpecs({}); // reset specs when category changes
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('spec_')) {
            const specName = name.replace('spec_', '');
            setSpecs(prev => ({ ...prev, [specName]: type === 'checkbox' ? checked : value }));
        } else {
            setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    };

    const handleImageDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        addImages(files);
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        addImages(files);
    };

    const addImages = (files) => {
        const newImages = [...images, ...files];
        setImages(newImages);
        
        // Generate preview URLs
        const newPreviewUrls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls([...previewUrls, ...newPreviewUrls]);
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        const newPreviewUrls = [...previewUrls];
        URL.revokeObjectURL(newPreviewUrls[index]);
        newPreviewUrls.splice(index, 1);
        setPreviewUrls(newPreviewUrls);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const token = localStorage.getItem('zaa_token');
        const submitData = new FormData();
        
        submitData.append('category', category);
        submitData.append('title', formData.title);
        submitData.append('price', formData.price);
        submitData.append('province', formData.province);
        submitData.append('location', formData.location);
        submitData.append('description', formData.description);
        submitData.append('condition', specs.condition || 'New');
        submitData.append('specs', JSON.stringify(specs));

        images.forEach(img => {
            submitData.append('images', img);
        });

        try {
            const response = await fetch('/api/listings', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Do NOT set Content-Type to multipart/form-data. Browser sets it automatically with boundary.
                },
                body: submitData
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to post listing');
            }

            navigate(`/product/${data.listing.id}`);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const renderDynamicFields = () => {
        if (!category) return null;

        let detailsSection = null;

        if (category === 'vehicles') {
            detailsSection = (
                <>
                    <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>1. Vehicle Details</h2>
                        <span style={{ fontSize: '14px', color: '#1b4332', fontWeight: 'bold' }}><i className="fa-solid fa-circle-check"></i> Details</span>
                    </div>
                    <div className="fields-grid">
                        <div className="form-group"><label>Make / Brand</label><div className="input-with-icon"><i className="fa-solid fa-car"></i><input type="text" name="spec_make" onChange={handleInputChange} placeholder="e.g., Toyota, Isuzu" required /></div></div>
                        <div className="form-group"><label>Model</label><div className="input-with-icon"><i className="fa-solid fa-truck"></i><input type="text" name="spec_model" onChange={handleInputChange} placeholder="e.g., Hilux, KB300" required /></div></div>
                        <div className="form-group"><label>Year</label><div className="input-with-icon"><i className="fa-regular fa-calendar"></i><input type="number" name="spec_year" onChange={handleInputChange} placeholder="e.g., 2023" required /></div></div>
                        <div className="form-group"><label>Mileage (km)</label><div className="input-with-icon"><i className="fa-solid fa-gauge-high"></i><input type="text" name="spec_mileage" onChange={handleInputChange} placeholder="e.g., 85000" /></div></div>
                        <div className="form-group"><label>Engine HP</label><div className="input-with-icon"><i className="fa-solid fa-bolt"></i><input type="text" name="spec_engine_hp" onChange={handleInputChange} placeholder="e.g., 177" /></div></div>
                        <div className="form-group"><label>Drive Type</label><div className="input-with-icon"><i className="fa-solid fa-gear"></i><select name="spec_drive_type" onChange={handleInputChange} defaultValue="4WD"><option>4WD</option><option>2WD</option><option>AWD</option></select></div></div>
                        <div className="form-group"><label>Transmission</label><div className="input-with-icon"><i className="fa-solid fa-gears"></i><select name="spec_transmission" onChange={handleInputChange} defaultValue="Manual"><option>Manual</option><option>Automatic</option></select></div></div>
                        <div className="form-group"><label>Fuel Type</label><div className="input-with-icon"><i className="fa-solid fa-gas-pump"></i><select name="spec_fuel_type" onChange={handleInputChange} defaultValue="Diesel"><option>Diesel</option><option>Petrol</option><option>Electric</option></select></div></div>
                        <div className="form-group full-width">
                            <label>Condition</label>
                            <div className="condition-radio-group">
                                <label className={`radio-label ${specs.condition === 'New' || !specs.condition ? 'active-radio' : ''}`}><input type="radio" name="spec_condition" value="New" onChange={handleInputChange} checked={specs.condition === 'New' || !specs.condition} /> New</label>
                                <label className={`radio-label ${specs.condition === 'Used' ? 'active-radio' : ''}`}><input type="radio" name="spec_condition" value="Used" onChange={handleInputChange} checked={specs.condition === 'Used'} /> Used</label>
                            </div>
                        </div>
                    </div>
                </>
            );
        } else if (category === 'machinery') {
            detailsSection = (
                <>
                    <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>1. Machinery Details</h2>
                        <span style={{ fontSize: '14px', color: '#1b4332', fontWeight: 'bold' }}><i className="fa-solid fa-circle-check"></i> Details</span>
                    </div>
                    <div className="fields-grid">
                        <div className="form-group"><label>Make / Brand</label><div className="input-with-icon"><i className="fa-solid fa-tractor"></i><input type="text" name="spec_make" onChange={handleInputChange} placeholder="e.g., John Deere, Massey Ferguson" required /></div></div>
                        <div className="form-group"><label>Model</label><div className="input-with-icon"><i className="fa-solid fa-industry"></i><input type="text" name="spec_model" onChange={handleInputChange} placeholder="e.g., 5075E" required /></div></div>
                        <div className="form-group"><label>Year</label><div className="input-with-icon"><i className="fa-regular fa-calendar"></i><input type="number" name="spec_year" onChange={handleInputChange} placeholder="e.g., 2018" required /></div></div>
                        <div className="form-group"><label>Hours Used</label><div className="input-with-icon"><i className="fa-solid fa-gauge-high"></i><input type="text" name="spec_mileage" onChange={handleInputChange} placeholder="e.g., 1500" /></div></div>
                        <div className="form-group full-width">
                            <label>Condition</label>
                            <div className="condition-radio-group">
                                <label className={`radio-label ${specs.condition === 'New' || !specs.condition ? 'active-radio' : ''}`}><input type="radio" name="spec_condition" value="New" onChange={handleInputChange} checked={specs.condition === 'New' || !specs.condition} /> New</label>
                                <label className={`radio-label ${specs.condition === 'Used' ? 'active-radio' : ''}`}><input type="radio" name="spec_condition" value="Used" onChange={handleInputChange} checked={specs.condition === 'Used'} /> Used</label>
                            </div>
                        </div>
                    </div>
                </>
            );
        } else if (category === 'equipment') {
             detailsSection = (
                <>
                    <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>1. Equipment Details</h2>
                        <span style={{ fontSize: '14px', color: '#1b4332', fontWeight: 'bold' }}><i className="fa-solid fa-circle-check"></i> Details</span>
                    </div>
                    <div className="fields-grid">
                        <div className="form-group"><label>Equipment Type</label><div className="input-with-icon"><i className="fa-solid fa-toolbox"></i><input type="text" name="spec_type" onChange={handleInputChange} placeholder="e.g., Water Pump, Generator" required /></div></div>
                        <div className="form-group"><label>Brand</label><div className="input-with-icon"><i className="fa-solid fa-tag"></i><input type="text" name="spec_make" onChange={handleInputChange} placeholder="e.g., Honda, Kipor" required /></div></div>
                        <div className="form-group full-width">
                            <label>Condition</label>
                            <div className="condition-radio-group">
                                <label className={`radio-label ${specs.condition === 'New' || !specs.condition ? 'active-radio' : ''}`}><input type="radio" name="spec_condition" value="New" onChange={handleInputChange} checked={specs.condition === 'New' || !specs.condition} /> New</label>
                                <label className={`radio-label ${specs.condition === 'Used' ? 'active-radio' : ''}`}><input type="radio" name="spec_condition" value="Used" onChange={handleInputChange} checked={specs.condition === 'Used'} /> Used</label>
                            </div>
                        </div>
                    </div>
                </>
            );
        } else if (category === 'spares') {
            detailsSection = (
                <>
                    <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>1. Spares & Parts Details</h2>
                        <span style={{ fontSize: '14px', color: '#1b4332', fontWeight: 'bold' }}><i className="fa-solid fa-circle-check"></i> Details</span>
                    </div>
                    <div className="fields-grid">
                        <div className="form-group"><label>Part Name</label><div className="input-with-icon"><i className="fa-solid fa-gear"></i><input type="text" name="spec_part_name" onChange={handleInputChange} placeholder="e.g., Brake Pads, Alternator" required /></div></div>
                        <div className="form-group full-width"><label>Compatible Brands/Models</label><div className="input-with-icon"><i className="fa-solid fa-wrench"></i><input type="text" name="spec_compatible" onChange={handleInputChange} placeholder="e.g., Toyota Hilux 2015-2020" required /></div></div>
                        <div className="form-group full-width">
                            <label>Condition</label>
                            <div className="condition-radio-group">
                                <label className={`radio-label ${specs.condition === 'New' || !specs.condition ? 'active-radio' : ''}`}><input type="radio" name="spec_condition" value="New" onChange={handleInputChange} checked={specs.condition === 'New' || !specs.condition} /> New</label>
                                <label className={`radio-label ${specs.condition === 'Used' ? 'active-radio' : ''}`}><input type="radio" name="spec_condition" value="Used" onChange={handleInputChange} checked={specs.condition === 'Used'} /> Used</label>
                            </div>
                        </div>
                    </div>
                </>
            );
        } else if (category === 'livestock') {
            detailsSection = (
                <>
                    <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>1. Livestock Details</h2>
                        <span style={{ fontSize: '14px', color: '#1b4332', fontWeight: 'bold' }}><i className="fa-solid fa-circle-check"></i> Details</span>
                    </div>
                    <div className="fields-grid">
                        <div className="form-group"><label>Animal Type</label><div className="input-with-icon"><i className="fa-solid fa-cow"></i><input type="text" name="spec_animal_type" onChange={handleInputChange} placeholder="e.g., Cattle, Poultry, Pigs" required /></div></div>
                        <div className="form-group"><label>Breed</label><div className="input-with-icon"><i className="fa-solid fa-dna"></i><input type="text" name="spec_breed" onChange={handleInputChange} placeholder="e.g., Brahman, Boer" /></div></div>
                        <div className="form-group"><label>Age</label><div className="input-with-icon"><i className="fa-regular fa-clock"></i><input type="text" name="spec_age" onChange={handleInputChange} placeholder="e.g., 2 Years, 6 Months" /></div></div>
                        <div className="form-group"><label>Quantity Available</label><div className="input-with-icon"><i className="fa-solid fa-hashtag"></i><input type="number" name="spec_quantity" onChange={handleInputChange} placeholder="e.g., 50" required /></div></div>
                    </div>
                </>
            );
        } else if (category === 'produce') {
            detailsSection = (
                <>
                    <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>1. Produce Details</h2>
                        <span style={{ fontSize: '14px', color: '#1b4332', fontWeight: 'bold' }}><i className="fa-solid fa-circle-check"></i> Details</span>
                    </div>
                    <div className="fields-grid">
                        <div className="form-group"><label>Produce Type</label><div className="input-with-icon"><i className="fa-solid fa-seedling"></i><input type="text" name="spec_produce_type" onChange={handleInputChange} placeholder="e.g., Maize, Tomatoes, Cabbage" required /></div></div>
                        <div className="form-group"><label>Quantity Available</label><div className="input-with-icon"><i className="fa-solid fa-scale-balanced"></i><input type="text" name="spec_quantity" onChange={handleInputChange} placeholder="e.g., 100 Tonnes, 50 Crates" required /></div></div>
                        <div className="form-group full-width"><label>Packaging / Selling Unit</label><div className="input-with-icon"><i className="fa-solid fa-box"></i><input type="text" name="spec_packaging" onChange={handleInputChange} placeholder="e.g., Sold per 10kg pocket, Per Tonne" /></div></div>
                    </div>
                </>
            );
        }

        return (
            <>
                {detailsSection}
                
                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>2. Listing Information</h2>
                    <span style={{ fontSize: '14px', color: '#1b4332', fontWeight: 'bold' }}><i className="fa-solid fa-circle-check"></i> Pricing</span>
                </div>
                <div className="fields-grid">
                    <div className="form-group"><label>Listing Title</label><div className="input-with-icon"><i className="fa-regular fa-address-card"></i><input type="text" name="title" value={formData.title} onChange={handleInputChange} required /></div></div>
                    <div className="form-group"><label>Asking Price (USD)</label><div className="input-with-icon"><i className="fa-solid fa-dollar-sign"></i><input type="number" name="price" value={formData.price} onChange={handleInputChange} required /></div></div>
                    <div className="form-group"><label>Province</label><div className="input-with-icon"><i className="fa-solid fa-map"></i><select name="province" value={formData.province} onChange={handleInputChange}><option>Harare</option><option>Bulawayo</option><option>Mashonaland East</option><option>Mashonaland West</option><option>Mashonaland Central</option><option>Manicaland</option><option>Masvingo</option><option>Midlands</option><option>Matabeleland North</option><option>Matabeleland South</option></select></div></div>
                    <div className="form-group"><label>City / Location</label><div className="input-with-icon"><i className="fa-solid fa-location-dot"></i><input type="text" name="location" value={formData.location} onChange={handleInputChange} required /></div></div>
                    <div className="form-group full-width">
                        <label>Detailed Description</label>
                        <div className="rich-text-container">
                            <textarea name="description" rows="5" value={formData.description} onChange={handleInputChange} required></textarea>
                        </div>
                    </div>
                </div>
            </>
        );
    };

    return (
        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingBottom: '50px' }}>
            <div className="post-ad-header">
                <button type="button" onClick={() => window.location.href = '/'} className="back-btn">
                    <i className="fa-solid fa-arrow-left"></i> Back
                </button>
                <img src="/logo.png" alt="ZimAutoAgri Logo" className="header-logo" />
            </div>

            <main className="form-container">
                {error && <div style={{ padding: '15px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                
                {/* Category Selection */}
                <div className="category-card-wrapper">
                    <label>What are you listing?</label>
                    <div className="custom-dropdown" style={{ position: 'relative' }}>
                        <div className="custom-dropdown-inner" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="fa-solid fa-layer-group"></i>
                                <span>{category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Select a category...'}</span>
                            </div>
                            <i className="fa-solid fa-chevron-down"></i>
                        </div>
                        
                        {isDropdownOpen && (
                            <div className="dropdown-options">
                                {[
                                    { id: 'vehicles', icon: 'fa-truck', label: 'Vehicles' },
                                    { id: 'machinery', icon: 'fa-tractor', label: 'Machinery' },
                                    { id: 'equipment', icon: 'fa-toolbox', label: 'Equipment' },
                                    { id: 'spares', icon: 'fa-gear', label: 'Spares & Parts' },
                                    { id: 'livestock', icon: 'fa-cow', label: 'Livestock' },
                                    { id: 'produce', icon: 'fa-seedling', label: 'Produce & Crops' }
                                ].map(cat => (
                                    <div key={cat.id} className="dropdown-option" onClick={() => handleCategorySelect(cat.id)}>
                                        <i className={`fa-solid ${cat.icon}`}></i> {cat.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Media Upload */}
                <div className="media-upload-wrapper">
                    <div 
                        className="drop-zone-custom" 
                        onDragOver={e => e.preventDefault()} 
                        onDrop={handleImageDrop}
                    >
                        <i className="fa-solid fa-camera drop-icon"></i>
                        <p>Drag & drop photos here</p>
                        <label className="browse-btn">
                            Browse Files
                            <input type="file" multiple hidden accept="image/*" onChange={handleImageSelect} />
                        </label>
                    </div>
                    
                    <div className="preview-area-custom">
                        {previewUrls.length === 0 ? (
                            <p className="placeholder-text">Uploaded images will appear here...</p>
                        ) : (
                            previewUrls.map((url, idx) => (
                                <div key={idx} className="preview-img-wrap">
                                    <img src={url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button type="button" onClick={() => removeImage(idx)} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}><i className="fa-solid fa-times"></i></button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {renderDynamicFields()}
                
                <div className="form-actions-custom">
                    <button type="button" className="cancel-btn-custom" onClick={() => window.location.href = '/'}>Cancel</button>
                    <button type="submit" className={`submit-btn-custom ${category ? 'active' : ''}`} disabled={!category || loading}>
                        {loading ? 'Publishing...' : 'Continue to Details & Publish'} <i className="fa-solid fa-arrow-right"></i>
                    </button>
                </div>

            </form>
            </main>
        </div>
    );
};

export default PostAd;
