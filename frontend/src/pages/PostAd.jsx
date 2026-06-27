import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
            navigate('/login', { state: { message: 'Please login to post an ad.' } });
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
                <div className="fields-grid">
                    <div className="form-group"><label>Make / Brand</label><div className="input-with-icon"><i className="fa-solid fa-car"></i><input type="text" name="spec_make" onChange={handleInputChange} required /></div></div>
                    <div className="form-group"><label>Model</label><div className="input-with-icon"><i className="fa-solid fa-truck"></i><input type="text" name="spec_model" onChange={handleInputChange} required /></div></div>
                    <div className="form-group"><label>Year</label><div className="input-with-icon"><i className="fa-regular fa-calendar"></i><input type="number" name="spec_year" onChange={handleInputChange} required /></div></div>
                    <div className="form-group"><label>Mileage (km)</label><div className="input-with-icon"><i className="fa-solid fa-gauge-high"></i><input type="text" name="spec_mileage" onChange={handleInputChange} /></div></div>
                    <div className="form-group"><label>Transmission</label><div className="input-with-icon"><i className="fa-solid fa-gears"></i><select name="spec_transmission" onChange={handleInputChange} defaultValue="Manual"><option>Manual</option><option>Automatic</option></select></div></div>
                    <div className="form-group"><label>Fuel Type</label><div className="input-with-icon"><i className="fa-solid fa-gas-pump"></i><select name="spec_fuel_type" onChange={handleInputChange} defaultValue="Diesel"><option>Diesel</option><option>Petrol</option><option>Electric</option></select></div></div>
                    <div className="form-group">
                        <label>Condition</label>
                        <div className="condition-radio-group">
                            <label className={`radio-label ${specs.condition === 'New' || !specs.condition ? 'active-radio' : ''}`}><input type="radio" name="spec_condition" value="New" onChange={handleInputChange} checked={specs.condition === 'New' || !specs.condition} /> New</label>
                            <label className={`radio-label ${specs.condition === 'Used' ? 'active-radio' : ''}`}><input type="radio" name="spec_condition" value="Used" onChange={handleInputChange} checked={specs.condition === 'Used'} /> Used</label>
                        </div>
                    </div>
                </div>
            );
        } else if (category === 'machinery') {
            detailsSection = (
                <div className="fields-grid">
                    <div className="form-group"><label>Make / Brand</label><div className="input-with-icon"><i className="fa-solid fa-tractor"></i><input type="text" name="spec_make" onChange={handleInputChange} required /></div></div>
                    <div className="form-group"><label>Model</label><div className="input-with-icon"><i className="fa-solid fa-industry"></i><input type="text" name="spec_model" onChange={handleInputChange} required /></div></div>
                    <div className="form-group"><label>Year</label><div className="input-with-icon"><i className="fa-regular fa-calendar"></i><input type="number" name="spec_year" onChange={handleInputChange} required /></div></div>
                    <div className="form-group"><label>Hours Used</label><div className="input-with-icon"><i className="fa-solid fa-gauge-high"></i><input type="text" name="spec_mileage" onChange={handleInputChange} /></div></div>
                    <div className="form-group">
                        <label>Condition</label>
                        <div className="condition-radio-group">
                            <label className={`radio-label ${specs.condition === 'New' || !specs.condition ? 'active-radio' : ''}`}><input type="radio" name="spec_condition" value="New" onChange={handleInputChange} checked={specs.condition === 'New' || !specs.condition} /> New</label>
                            <label className={`radio-label ${specs.condition === 'Used' ? 'active-radio' : ''}`}><input type="radio" name="spec_condition" value="Used" onChange={handleInputChange} checked={specs.condition === 'Used'} /> Used</label>
                        </div>
                    </div>
                </div>
            );
        } else if (category === 'equipment') {
             detailsSection = (
                <div className="fields-grid">
                    <div className="form-group"><label>Equipment Type</label><div className="input-with-icon"><i className="fa-solid fa-toolbox"></i><input type="text" name="spec_type" onChange={handleInputChange} required /></div></div>
                    <div className="form-group"><label>Brand</label><div className="input-with-icon"><i className="fa-solid fa-tag"></i><input type="text" name="spec_make" onChange={handleInputChange} required /></div></div>
                    <div className="form-group">
                        <label>Condition</label>
                        <div className="condition-radio-group">
                            <label className={`radio-label ${specs.condition === 'New' || !specs.condition ? 'active-radio' : ''}`}><input type="radio" name="spec_condition" value="New" onChange={handleInputChange} checked={specs.condition === 'New' || !specs.condition} /> New</label>
                            <label className={`radio-label ${specs.condition === 'Used' ? 'active-radio' : ''}`}><input type="radio" name="spec_condition" value="Used" onChange={handleInputChange} checked={specs.condition === 'Used'} /> Used</label>
                        </div>
                    </div>
                </div>
            );
        } else if (category === 'spares') {
            detailsSection = (
                <div className="fields-grid">
                    <div className="form-group"><label>Part Name</label><div className="input-with-icon"><i className="fa-solid fa-gear"></i><input type="text" name="spec_part_name" onChange={handleInputChange} required /></div></div>
                    <div className="form-group full-width"><label>Compatible Brands/Models</label><div className="input-with-icon"><i className="fa-solid fa-wrench"></i><input type="text" name="spec_compatible" onChange={handleInputChange} required /></div></div>
                    <div className="form-group">
                        <label>Condition</label>
                        <div className="condition-radio-group">
                            <label className={`radio-label ${specs.condition === 'New' || !specs.condition ? 'active-radio' : ''}`}><input type="radio" name="spec_condition" value="New" onChange={handleInputChange} checked={specs.condition === 'New' || !specs.condition} /> New</label>
                            <label className={`radio-label ${specs.condition === 'Used' ? 'active-radio' : ''}`}><input type="radio" name="spec_condition" value="Used" onChange={handleInputChange} checked={specs.condition === 'Used'} /> Used</label>
                        </div>
                    </div>
                </div>
            );
        } else if (category === 'livestock') {
            detailsSection = (
                <div className="fields-grid">
                    <div className="form-group"><label>Animal Type</label><div className="input-with-icon"><i className="fa-solid fa-cow"></i><select name="spec_sub_category" onChange={handleInputChange} defaultValue="Cattle"><option>Cattle</option><option>Poultry</option><option>Goats</option><option>Sheep</option><option>Pigs</option><option>Other</option></select></div></div>
                    <div className="form-group"><label>Breed</label><div className="input-with-icon"><i className="fa-solid fa-dna"></i><input type="text" name="spec_breed" onChange={handleInputChange} required /></div></div>
                    <div className="form-group"><label>Quantity Available</label><div className="input-with-icon"><i className="fa-solid fa-boxes-stacked"></i><input type="number" name="spec_quantity" onChange={handleInputChange} required /></div></div>
                </div>
            );
        } else if (category === 'produce') {
            detailsSection = (
                <div className="fields-grid">
                    <div className="form-group"><label>Produce Type</label><div className="input-with-icon"><i className="fa-solid fa-seedling"></i><input type="text" name="spec_crop_type" onChange={handleInputChange} required /></div></div>
                    <div className="form-group"><label>Quantity (Tons/Kg)</label><div className="input-with-icon"><i className="fa-solid fa-weight-scale"></i><input type="text" name="spec_quantity" onChange={handleInputChange} required /></div></div>
                </div>
            );
        }

        return (
            <>
                <div className="section-header">
                    <h2>1. Specific Details</h2>
                    <span className="status-check"><i className="fa-solid fa-circle-check"></i> Details</span>
                </div>
                {detailsSection}
                
                <div className="section-header">
                    <h2>2. Listing Information</h2>
                    <span className="status-check"><i className="fa-solid fa-circle-check"></i> Pricing</span>
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
        <main className="form-container" style={{ margin: '40px auto', maxWidth: '900px', backgroundColor: '#fff', borderRadius: '12px', padding: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
            <h1 style={{ fontSize: '28px', marginBottom: '8px', color: '#111' }}>Create a Listing</h1>
            <p className="subtitle" style={{ color: '#666', marginBottom: '30px' }}>Fill out the details below to post your free ad.</p>

            {error && <div style={{ padding: '15px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                
                {/* Category Selection */}
                <div className="form-group primary-category">
                    <label>What are you listing?</label>
                    <div className="custom-dropdown" style={{ position: 'relative' }}>
                        <div className="dropdown-selected" onClick={() => setIsDropdownOpen(!isDropdownOpen)} style={{ padding: '15px', border: '2px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 'bold' }}>
                                <i className="fa-solid fa-layer-group"></i>
                                <span>{category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Select a category...'}</span>
                            </div>
                            <i className="fa-solid fa-chevron-down arrow"></i>
                        </div>
                        
                        {isDropdownOpen && (
                            <div className="dropdown-options" style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', zIndex: 10, marginTop: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                                {[
                                    { id: 'vehicles', icon: 'fa-truck', label: 'Vehicles' },
                                    { id: 'machinery', icon: 'fa-tractor', label: 'Machinery' },
                                    { id: 'equipment', icon: 'fa-toolbox', label: 'Equipment' },
                                    { id: 'spares', icon: 'fa-gear', label: 'Spares & Parts' },
                                    { id: 'livestock', icon: 'fa-cow', label: 'Livestock' },
                                    { id: 'produce', icon: 'fa-seedling', label: 'Produce & Crops' }
                                ].map(cat => (
                                    <div key={cat.id} className="dropdown-option" onClick={() => handleCategorySelect(cat.id)} style={{ padding: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.2s', borderBottom: '1px solid #f1f5f9' }}>
                                        <i className={`fa-solid ${cat.icon}`}></i> {cat.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Media Upload */}
                <div className="media-upload-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px', marginBottom: '30px' }}>
                    <div 
                        className="drop-zone" 
                        onDragOver={e => e.preventDefault()} 
                        onDrop={handleImageDrop}
                        style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '40px', textAlign: 'center', backgroundColor: '#f8fafc', transition: 'all 0.3s' }}
                    >
                        <i className="fa-solid fa-camera drop-icon" style={{ fontSize: '48px', color: '#94a3b8', marginBottom: '15px' }}></i>
                        <p style={{ color: '#475569', fontWeight: 'bold', marginBottom: '15px' }}>Drag & drop photos here</p>
                        <label className="browse-btn" style={{ display: 'inline-block', backgroundColor: '#2e7d32', color: '#fff', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Browse Files
                            <input type="file" multiple hidden accept="image/*" onChange={handleImageSelect} />
                        </label>
                    </div>
                    
                    <div className="thumbnail-preview-area" style={{ backgroundColor: '#f1f5f9', borderRadius: '12px', padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px', alignContent: 'start', minHeight: '200px' }}>
                        {previewUrls.length === 0 ? (
                            <p className="placeholder-text" style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8', marginTop: '40px' }}>Uploaded images will appear here...</p>
                        ) : (
                            previewUrls.map((url, idx) => (
                                <div key={idx} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden' }}>
                                    <img src={url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button type="button" onClick={() => removeImage(idx)} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}><i className="fa-solid fa-times"></i></button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {renderDynamicFields()}
                
                <div className="form-actions bottom-actions border-top" style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                    <button type="button" className="cancel-btn" onClick={() => navigate(-1)} style={{ padding: '14px 24px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                    <button type="submit" className="submit-btn" disabled={!category || loading} style={{ padding: '14px 24px', backgroundColor: category ? '#2e7d32' : '#cbd5e1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: category ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {loading ? 'Publishing...' : 'Publish Listing'} <i className="fa-solid fa-arrow-right"></i>
                    </button>
                </div>

            </form>
        </main>
    );
};

export default PostAd;
