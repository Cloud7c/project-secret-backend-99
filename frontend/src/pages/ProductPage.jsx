import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductCard, { timeAgo } from '../components/ProductCard';
import '../assets/css/product.css';

const ProductPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [relatedListings, setRelatedListings] = useState([]);
    const [mainImageIndex, setMainImageIndex] = useState(0);

    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                setLoading(true);
                // Fetch product details
                const res = await fetch(`/api/listings/${id}`);
                const data = await res.json();
                
                if (!res.ok) {
                    throw new Error(data.error || 'Product not found');
                }
                
                setProduct(data.listing);
                setLoading(false); // Render product immediately!
                
                // Fire off the view increment asynchronously (we don't need to await or block for this)
                const token = localStorage.getItem('token');
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                fetch(`/api/listings/${id}/view`, { method: 'POST', headers }).catch(e => console.error("Failed to update views", e));

                // Fetch related listings from the same category in the background
                const relatedRes = await fetch(`/api/listings?category=${data.listing.category}&limit=4&exclude_id=${id}&shuffle=true`);
                const relatedData = await relatedRes.json();
                
                if (relatedData.listings) {
                    setRelatedListings(relatedData.listings);
                }
                
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchProductData();
        // Reset image index when product changes
        setMainImageIndex(0);
        // Scroll to top
        window.scrollTo(0, 0);
    }, [id]);

    const handleNextImage = () => {
        if (!product || !product.images) return;
        setMainImageIndex((prev) => (prev + 1) % product.images.length);
    };

    const handlePrevImage = () => {
        if (!product || !product.images) return;
        setMainImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    };

    if (loading) {
        return (
            <main className="product-page" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#666' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '40px', marginBottom: '20px' }}></i>
                    <h2>Loading Product Details...</h2>
                </div>
            </main>
        );
    }

    if (error || !product) {
        return (
            <main className="product-page" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: 'red' }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '40px', marginBottom: '20px' }}></i>
                    <h2>{error || 'Product not found'}</h2>
                    <Link to="/" className="btn-gold" style={{ display: 'inline-block', marginTop: '20px' }}>Return Home</Link>
                </div>
            </main>
        );
    }

    const priceFormatted = product.price != null 
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency || 'USD' }).format(product.price)
        : 'Contact Seller';
    
    // Determine placeholder image if none exists
    let placeholderImg = '/logo.png';
    if (product.category === 'vehicles') placeholderImg = '/hilux.jpg';
    if (product.category === 'machinery') placeholderImg = '/tractor.jpg';
    if (product.category === 'livestock') placeholderImg = '/cow.png';
    if (product.category === 'produce') placeholderImg = '/tomatoes.png';
    
    const images = (product.images && product.images.length > 0) ? product.images : [placeholderImg];

    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEndHandler = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;
        if (isLeftSwipe) {
            handleNextImage();
        }
        if (isRightSwipe) {
            handlePrevImage();
        }
    };

    return (
        <main className="product-page">
            <div className="product-container">
                
                {/* Breadcrumb */}
                <div className="breadcrumb">
                    <Link to="/">Home</Link> / <Link to={`/${product.category}`} style={{ textTransform: 'capitalize' }}>{product.category} Listings</Link> / <span>{product.title}</span>
                </div>

                <h2 className="page-title">{product.title}</h2>

                <div className="product-layout">
                    
                    {/* Left Column: Gallery & Description */}
                    <div className="product-left">
                        
                        <div 
                            className="main-image-container" 
                            style={{ position: 'relative', touchAction: 'pan-y' }}
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEndHandler}
                        >
                            <button className="favorite-btn"><i className="fa-regular fa-heart"></i></button>
                            
                            {images.length > 1 && (
                                <button className="gallery-arrow left-arrow" onClick={handlePrevImage}>
                                    <i className="fa-solid fa-chevron-left"></i>
                                </button>
                            )}
                            
                            <img src={images[mainImageIndex]} alt={product.title} className="main-img" style={{ pointerEvents: 'none' }} />
                            
                            {images.length > 1 && (
                                <button className="gallery-arrow right-arrow" onClick={handleNextImage}>
                                    <i className="fa-solid fa-chevron-right"></i>
                                </button>
                            )}
                        </div>
                        
                        <div className="thumbnail-gallery">
                            {images.map((img, idx) => (
                                <img 
                                    key={idx} 
                                    src={img} 
                                    alt={`Thumbnail ${idx}`} 
                                    className={`thumb ${idx === mainImageIndex ? 'active' : ''}`} 
                                    onClick={() => setMainImageIndex(idx)}
                                />
                            ))}
                        </div>

                        <div className="description-section">
                            <h3>Description</h3>
                            <p style={{ whiteSpace: 'pre-wrap' }}>{product.description || 'No description provided.'}</p>
                        </div>
                        
                    </div>

                    {/* Middle Column: Details & Seller Info */}
                    <div className="product-middle">
                        
                        {/* Main Product Info Card */}
                        <div className="info-card">
                            <h3 className="product-title">{product.title}</h3>
                            
                            <div className="subtitle-row">
                                <span className="subtitle-text">
                                    <i className="fa-solid fa-location-dot"></i> {product.location}{product.province ? ', ' + product.province : ''}
                                </span>
                                {product.seller?.is_verified && <span className="badge-green" style={{ marginLeft: '15px' }}>Verified</span>}
                                {product.is_featured && <span className="badge-green" style={{ backgroundColor: '#f59e0b', marginLeft: '10px' }}>Featured</span>}
                            </div>

                            <div className="features-grid">
                                {product.specs && Object.entries(product.specs).map(([key, value]) => {
                                    if (!value) return null;
                                    let icon = 'fa-check';
                                    if (key === 'condition') icon = 'fa-gauge';
                                    if (key === 'transmission') icon = 'fa-gear';
                                    if (key === 'fuel_type') icon = 'fa-gas-pump';
                                    if (key === 'mileage') icon = 'fa-road';
                                    if (key === 'color') icon = 'fa-palette';
                                    
                                    return (
                                        <div className="feature-item" key={key}>
                                            <i className={`fa-solid ${icon}`}></i>
                                            <span><strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="seller-profile-preview" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div>
                                    <h4>{product.seller?.full_name || 'Anonymous Seller'}</h4>
                                    <p><i className="fa-regular fa-clock"></i> Member since {product.seller?.created_at ? new Date(product.seller.created_at).getFullYear() : '2023'}</p>
                                </div>
                                <span style={{ fontSize: '11px', color: '#64748b', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: '500', fontStyle: 'normal' }}>
                                    <i className="fa-regular fa-clock" style={{ fontSize: '11px' }}></i> Posted {timeAgo(product.created_at)}
                                </span>
                            </div>
                        </div>

                        {/* Verification Card */}
                        <div className="verification-card">
                            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#2e7d32', marginRight: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: '20px', color: 'white', flexShrink: 0 }}>
                                {product.seller?.profile_picture ? (
                                    <img src={product.seller.profile_picture} alt="Seller" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    product.seller?.full_name ? product.seller.full_name.charAt(0).toUpperCase() : 'U'
                                )}
                            </div>
                            <div className="verif-details">
                                <h4>{product.seller?.full_name || 'User'}</h4>
                                {product.seller?.is_verified ? (
                                    <p style={{ color: '#2e7d32', fontWeight: 600 }}><i className="fa-solid fa-circle-check"></i> Identity Verified</p>
                                ) : (
                                    <p style={{ color: '#f59e0b', fontWeight: 600 }}><i className="fa-solid fa-triangle-exclamation"></i> Not Verified</p>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Pricing & Safety Tips */}
                    <div className="product-right">
                        
                        {/* Pricing Card */}
                        <div className="price-card">
                            <h2 className="price-tag">{priceFormatted}</h2>
                            <p className="price-sub">Price in {product.currency || 'USD'}</p>
                            <button className="btn-gold-full" onClick={() => alert(`Contacting ${product.seller?.full_name}: ${product.seller?.phone || 'No phone number provided'}`)}>Contact Seller</button>
                            <button className="btn-white-full"><i className="fa-regular fa-comment"></i> Chat</button>
                        </div>

                        {/* Safety Tips Card */}
                        <div className="safety-card">
                            <h4>SAFETY TIPS</h4>
                            <p>To avoid scams, never pay in advance. Always inspect the item physically before handing over money.</p>
                            <Link to="/safety" className="safety-link"><i className="fa-solid fa-shield-cat"></i> To know more click here</Link>
                        </div>

                    </div>
                </div>

                {/* Related Listings at the bottom */}
                {relatedListings.length > 0 && (
                    <div className="related-section">
                        <div className="section-header">
                            <h3 className="section-title">Related Listings</h3>
                            <Link to={`/${product.category}`} className="see-all">See All {product.category}</Link>
                        </div>
                        
                        <div className="related-product-grid">
                            {relatedListings.map(listing => (
                                <ProductCard key={listing.id} listing={listing} />
                            ))}
                        </div>
                        
                        <style>
                            {`
                            .related-product-grid {
                                display: grid;
                                grid-template-columns: repeat(4, 1fr);
                                gap: 15px;
                            }
                            
                            @media (max-width: 768px) {
                                .related-product-grid {
                                    grid-template-columns: repeat(2, 1fr) !important;
                                    gap: 10px !important;
                                }
                                
                                /* Universal scaling for related cards to match Homepage */
                                .related-product-grid > div * {
                                    font-size: 11px !important;
                                }
                                .related-product-grid > div h3 {
                                    font-size: 12px !important;
                                    margin-bottom: 4px !important;
                                }
                                .related-product-grid > div > div:first-child {
                                    height: 120px !important;
                                    min-height: 120px !important;
                                }
                            }
                            `}
                        </style>
                    </div>
                )}

            </div>
        </main>
    );
};

export default ProductPage;
