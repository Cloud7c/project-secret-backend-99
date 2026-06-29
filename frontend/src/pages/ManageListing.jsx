import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const ManageListing = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Form states
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    
    // Image states
    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('zaa_token');
        if (!token) {
            navigate('/login?redirect=/account', { replace: true });
            return;
        }

        const fetchListing = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/listings/${id}`);
                const data = await res.json();
                
                if (!res.ok) {
                    throw new Error(data.error || 'Listing not found');
                }
                
                // Ensure the logged in user is the owner
                const userJson = localStorage.getItem('zaa_user');
                const currentUser = JSON.parse(userJson);
                
                if (data.listing.user_id !== currentUser.id) {
                    throw new Error('You do not have permission to manage this listing.');
                }

                setListing(data.listing);
                setTitle(data.listing.title || '');
                setPrice(data.listing.price || '');
                setDescription(data.listing.description || '');
                setExistingImages(data.listing.images || []);
                
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchListing();
        window.scrollTo(0, 0);
    }, [id, navigate]);

    const handleDelete = async () => {
        if (!window.confirm(`Are you absolutely sure you want to permanently delete "${listing.title}"? This cannot be undone.`)) {
            return;
        }

        try {
            const userJson = localStorage.getItem('zaa_user');
            const currentUser = JSON.parse(userJson);
            
            const res = await fetch(`/api/listings/${id}`, {
                method: 'DELETE',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('zaa_token')}` 
                },
                body: JSON.stringify({ user_id: currentUser.id })
            });

            if (res.ok) {
                alert('Listing deleted successfully.');
                navigate('/account');
            } else {
                const data = await res.json();
                alert(`Error: ${data.error}`);
            }
        } catch (err) {
            alert('Failed to delete listing.');
        }
    };

    const removeExistingImage = (indexToRemove) => {
        setExistingImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const removeNewImage = (indexToRemove) => {
        setNewImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const totalCount = existingImages.length + newImages.length + files.length;
        
        if (totalCount > 3) {
            alert('You can only have a maximum of 3 images per listing.');
            e.target.value = null; // reset input
            return;
        }
        
        setNewImages(prev => [...prev, ...files]);
        e.target.value = null; // reset input to allow selecting same files again if needed
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        if (existingImages.length + newImages.length > 3) {
            alert('You cannot have more than 3 images.');
            return;
        }

        if (!window.confirm(`Are you sure you want to save these changes to "${listing.title}"?`)) {
            return;
        }

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('price', price);
            formData.append('description', description);
            
            // Append flag to tell backend we updated images
            formData.append('images_updated', 'true');

            // Append existing images that were NOT deleted
            existingImages.forEach(img => {
                formData.append('existing_images', img);
            });
            
            // Append newly uploaded files
            newImages.forEach(file => {
                formData.append('images', file);
            });

            const res = await fetch(`/api/listings/${id}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${localStorage.getItem('zaa_token')}` 
                },
                body: formData
            });

            const data = await res.json();
            if (res.ok) {
                alert('Listing updated successfully!');
                navigate('/account');
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (err) {
            alert('Failed to update listing.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><h3>Loading...</h3></div>;
    if (error) return <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: 'red' }}><h3>{error}</h3><Link to="/account" className="btn-gold" style={{ marginTop: '20px' }}>Back to Dashboard</Link></div>;

    return (
        <div style={{ backgroundColor: '#f4f7f2', minHeight: '100vh', padding: '40px 20px 40px' }}>
            <style>{`
                .img-manage-container .remove-img-btn {
                    opacity: 1; /* Default visible for mobile */
                    transition: opacity 0.2s;
                }
                @media (min-width: 768px) {
                    .img-manage-container .remove-img-btn {
                        opacity: 0; /* Hidden by default on desktop */
                    }
                    .img-manage-container:hover .remove-img-btn {
                        opacity: 1; /* Show on hover for desktop */
                    }
                }
            `}</style>
            <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                
                {/* Header */}
                <div style={{ padding: '30px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fcfcfc' }}>
                    <div>
                        <Link to="/account" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '14px', marginBottom: '10px', display: 'inline-block' }}>
                            <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
                        </Link>
                        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: 0 }}>Manage Listing</h1>
                    </div>
                    <div style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                        <i className="fa-solid fa-eye"></i> {listing.views || 0} Views
                    </div>
                </div>

                {/* Form Body */}
                <div style={{ padding: '30px' }}>
                    <form onSubmit={handleSave}>
                        
                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>Listing Title</label>
                            <input 
                                type="text" 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)}
                                style={{ width: '100%', padding: '12px 15px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px' }}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>Price ({listing.currency})</label>
                            <input 
                                type="number" 
                                value={price} 
                                onChange={(e) => setPrice(e.target.value)}
                                style={{ width: '100%', padding: '12px 15px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px' }}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>Description</label>
                            <textarea 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)}
                                rows="5"
                                style={{ width: '100%', padding: '12px 15px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', resize: 'vertical' }}
                            ></textarea>
                        </div>

                        {/* Image Manager */}
                        <div style={{ marginBottom: '35px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#111827', marginBottom: '10px' }}>Listing Images ({existingImages.length + newImages.length} / 3)</label>
                            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '15px' }}>Add or remove images. Maximum of 3 images allowed.</p>
                            
                            <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
                                
                                {/* Existing Images */}
                                {existingImages.map((img, idx) => (
                                    <div key={`existing-${idx}`} style={{ position: 'relative', width: '90px', height: '90px', flexShrink: 0 }} className="img-manage-container">
                                        <img src={img} alt="Current" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                        <button 
                                            type="button" 
                                            onClick={() => removeExistingImage(idx)}
                                            className="remove-img-btn"
                                            style={{ position: 'absolute', top: '-5px', right: '-5px', width: '22px', height: '22px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
                                            title="Remove Image"
                                        >
                                            <i className="fa-solid fa-xmark"></i>
                                        </button>
                                    </div>
                                ))}

                                {/* Newly Added Images */}
                                {newImages.map((file, idx) => (
                                    <div key={`new-${idx}`} style={{ position: 'relative', width: '90px', height: '90px', flexShrink: 0 }} className="img-manage-container">
                                        <img src={URL.createObjectURL(file)} alt="New upload" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '2px dashed #28a745' }} />
                                        <button 
                                            type="button" 
                                            onClick={() => removeNewImage(idx)}
                                            className="remove-img-btn"
                                            style={{ position: 'absolute', top: '-5px', right: '-5px', width: '22px', height: '22px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
                                            title="Remove Image"
                                        >
                                            <i className="fa-solid fa-xmark"></i>
                                        </button>
                                    </div>
                                ))}

                                {/* Add New Button (only show if under 3) */}
                                {(existingImages.length + newImages.length) < 3 && (
                                    <label style={{ width: '90px', height: '90px', backgroundColor: '#e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '24px', cursor: 'pointer', flexShrink: 0 }}>
                                        <i className="fa-solid fa-plus"></i>
                                        <input 
                                            type="file" 
                                            multiple 
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px', paddingTop: '25px', borderTop: '1px solid #eee' }}>
                            <button 
                                type="button" 
                                onClick={handleDelete}
                                style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
                            >
                                <i className="fa-solid fa-trash-can"></i> Delete Permanently
                            </button>

                            <button 
                                type="submit" 
                                disabled={isSaving}
                                style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: isSaving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(40, 167, 69, 0.3)' }}
                            >
                                {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>} 
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default ManageListing;
