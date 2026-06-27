import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const ProductDetails = () => {
    const { id } = useParams();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/listings/${id}`);
                if (!res.ok) throw new Error('Product not found');
                const data = await res.json();
                setListing(data.listing);
            } catch (err) {
                console.error(err);
                setError('Product not found or error loading product details.');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}><i className="fa-solid fa-spinner fa-spin"></i> Loading...</div>;
    if (error || !listing) return <div style={{ padding: '100px', textAlign: 'center', color: 'red' }}>{error}</div>;

    const specs = listing.specs || {};
    const priceFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: listing.currency || 'USD' }).format(listing.price);
    const isVerified = listing.seller?.is_verified;
    const joinYear = new Date(listing.seller?.created_at).getFullYear();

    let fallbackUrl = '/logo.png';
    if (listing.category === 'vehicles') fallbackUrl = '/hilux.jpg';
    if (listing.category === 'machinery') fallbackUrl = '/tractor.jpg';
    if (listing.category === 'livestock') fallbackUrl = '/cow.png';
    if (listing.category === 'produce') fallbackUrl = '/tomatoes.png';
    if (listing.category === 'spares' || listing.category === 'parts') fallbackUrl = '/spare-brakes.png';
    if (listing.category === 'equipment') fallbackUrl = '/tractor-1.png';

    const imagesArray = listing.images && listing.images.length > 0 ? listing.images : [fallbackUrl];

    const getInitials = (name) => {
        if (!name) return 'S';
        const parts = name.split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    return (
        <main className="product-page-wrapper">
            <div className="product-container">
                <div className="breadcrumb">
                    <Link to="/">Home</Link> &gt; <Link to={`/?category=${listing.category}`}>{listing.category}</Link> &gt; <span>{listing.title}</span>
                </div>

                <div className="product-layout">
                    {/* Left Column: Media */}
                    <div className="product-left">
                        <div className="main-image-container">
                            <span className="badge-condition">{specs.condition || 'New'}</span>
                            <img src={imagesArray[0]} alt={listing.title} className="main-product-image" />
                        </div>
                        <div className="thumbnail-strip">
                            {imagesArray.map((img, index) => (
                                <img key={index} src={img} alt={`Thumb ${index}`} className="thumb" />
                            ))}
                        </div>
                        
                        <div className="description-section">
                            <h3>Description</h3>
                            <p>{listing.description || 'No description provided.'}</p>
                        </div>
                    </div>

                    {/* Middle Column: Details */}
                    <div className="product-middle">
                        <div className="info-card">
                            <h3 className="product-title">{listing.title}</h3>
                            <div className="subtitle-row">
                                <span className="subtitle-text"><i className="fa-solid fa-location-dot"></i> {listing.location}{listing.province ? `, ${listing.province}` : ''}</span>
                                {isVerified && <span className="badge-green">Verified</span>}
                            </div>

                            <div className="features-grid">
                                {specs.mileage && <div className="feature-item"><i className="fa-solid fa-gauge"></i> {specs.mileage}</div>}
                                {specs.fuel_type && <div className="feature-item"><i className="fa-solid fa-gas-pump"></i> {specs.fuel_type}</div>}
                                {specs.transmission && <div className="feature-item"><i className="fa-solid fa-gear"></i> {specs.transmission}</div>}
                            </div>

                            <div className="seller-profile-preview">
                                <div>
                                    <h4>{listing.seller?.full_name || 'Seller'}</h4>
                                    <p><i className="fa-solid fa-calendar-days" style={{ color: '#666' }}></i> Member since {joinYear}</p>
                                </div>
                            </div>
                        </div>

                        {/* Verification Card */}
                        <div className="verification-card">
                            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#2b7a4b', marginRight: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: '20px', color: 'white', flexShrink: 0 }}>
                                {listing.seller?.profile_picture ? (
                                    <img src={listing.seller.profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Seller" />
                                ) : (
                                    getInitials(listing.seller?.full_name)
                                )}
                            </div>
                            <div className="verif-details">
                                <h4>
                                    {listing.seller?.full_name || 'Seller'}
                                    {isVerified && <i className="fa-solid fa-circle-check" style={{ color: '#1da1f2', marginLeft: '5px' }}></i>}
                                </h4>
                                <p style={{ color: isVerified ? '#2b7a4b' : '#999' }}>{isVerified ? 'Verified Identity' : 'Unverified Identity'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Pricing */}
                    <div className="product-right">
                        <div className="price-card">
                            <h2 className="price-tag">{priceFormatted}</h2>
                            <p className="price-sub">Category: {listing.category.toUpperCase()}</p>
                            <button className="btn-gold-full">Contact Seller</button>
                            <button className="btn-white-full"><i className="fa-regular fa-comment"></i> Chat</button>
                        </div>
                        <div className="safety-card">
                            <h4>SAFETY TIPS</h4>
                            <p>To avoid scams, never pay in advance. Always inspect the item physically before handing over money.</p>
                            <a href="#" className="safety-link"><i className="fa-solid fa-shield-cat"></i> To know more click here</a>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ProductDetails;
