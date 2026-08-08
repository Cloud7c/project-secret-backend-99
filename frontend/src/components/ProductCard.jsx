import React from 'react';
import { Link } from 'react-router-dom';

export const timeAgo = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const past = new Date(dateString);
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerWeek = msPerDay * 7;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    const elapsed = now - past;

    if (elapsed < msPerHour) {
        const mins = Math.round(elapsed/msPerMinute);
        return mins <= 1 ? 'just now' : mins + ' mins ago';
    } else if (elapsed < msPerDay) {
        const hours = Math.round(elapsed/msPerHour);
        return hours + (hours === 1 ? ' hour ago' : ' hours ago');
    } else if (elapsed < msPerWeek) {
        const days = Math.round(elapsed/msPerDay);
        return days + (days === 1 ? ' day ago' : ' days ago');
    } else if (elapsed < msPerMonth) {
        const weeks = Math.round(elapsed/msPerWeek);
        return weeks + (weeks === 1 ? ' week ago' : ' weeks ago');
    } else if (elapsed < msPerYear) {
        const months = Math.round(elapsed/msPerMonth);
        return months + (months === 1 ? ' month ago' : ' months ago');
    } else {
        const years = Math.round(elapsed/msPerYear);
        return years + (years === 1 ? ' year ago' : ' years ago');
    }
};

const ProductCard = ({ listing, forceVehicleStyle = false }) => {
    const priceFormatted = new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: listing.currency || 'USD' 
    }).format(listing.price);
    
    const specs = listing.specs || {};

    let metaHtml = [];
    if (listing.category === 'vehicles' || listing.category === 'machinery') {
        if (specs.condition) metaHtml.push(<span key="cond"><i className="fa-solid fa-gauge"></i> {specs.condition}</span>);
        if (specs.fuel_type) metaHtml.push(<span key="fuel"><i className="fa-solid fa-gas-pump"></i> {specs.fuel_type}</span>);
        if (specs.transmission) metaHtml.push(<span key="trans"><i className="fa-solid fa-gear"></i> {specs.transmission}</span>);
    } else if (listing.category === 'livestock' || listing.category === 'produce') {
        if (specs.health) metaHtml.push(<span key="health"><i className="fa-solid fa-notes-medical"></i> {specs.health}</span>);
        if (specs.gender) metaHtml.push(<span key="gender"><i className="fa-solid fa-venus-mars"></i> {specs.gender}</span>);
        if (specs.weight) metaHtml.push(<span key="weight"><i className="fa-solid fa-weight-scale"></i> {specs.weight}</span>);
    } else {
        if (specs.condition) metaHtml.push(<span key="cond"><i className="fa-solid fa-certificate"></i> {specs.condition}</span>);
    }

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

    const isVehicle = listing.category === 'vehicles';
    const isMachinery = listing.category === 'machinery';
    const isSpares = listing.category === 'spares' || listing.category === 'parts';
    const isEquipment = listing.category === 'equipment';
    const isLivestock = listing.category === 'livestock';
    const isProduce = listing.category === 'produce';
    const cardClass = isVehicle ? 'vehicle-card' : isMachinery ? 'machinery-card' : isSpares ? 's-card' : isEquipment ? 'eq-card' : isLivestock ? 'ls-card' : isProduce ? 'masonry-card' : `product-card ${badgeClass}`;

    if (isProduce && !forceVehicleStyle) {
        return (
            <div className="masonry-card">
                <div className="card-img">
                    <Link to={`/product/${listing.id}`}>
                        <img src={imageUrl} alt={listing.title} loading="lazy" />
                    </Link>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ flexGrow: 1 }}>
                    {listing.is_featured && <div style={{ marginBottom: '4px' }}><span className="featured-badge" style={{ backgroundColor: '#ff9900', color: '#fff', padding: '2px 6px', fontSize: '10px', borderRadius: '3px', fontWeight: 'bold', display: 'inline-block' }}><i className="fa-solid fa-star"></i> Featured</span></div>}
                    <h3><Link to={`/product/${listing.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{listing.title}</Link></h3>
                    <div style={{ fontSize: '13px', color: '#e2e8f0', marginBottom: '10px', marginTop: '8px', lineHeight: '1.4' }}>
                        <p style={{ margin: '0 0 4px 0' }}><strong style={{ color: '#ffffff' }}>Type:</strong> {specs.produce_type || 'Fresh Produce'}</p>
                        <p style={{ margin: '0 0 4px 0' }}><strong style={{ color: '#ffffff' }}>Quantity:</strong> {specs.quantity || 'N/A'}</p>
                        <p style={{ margin: '0' }}><strong style={{ color: '#ffffff' }}>Location:</strong> {listing.location || 'Unknown'}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', marginBottom: '6px' }}>
                        <span className="price-val" style={{ display: 'block' }}>{priceFormatted}</span>
                    </div>
                    </div>
                    <div style={{ marginTop: 'auto' }}>
                        <div style={{ textAlign: 'left', marginBottom: '8px' }}>
                            <span style={{ fontSize: '11px', color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                                <i className="fa-regular fa-clock" style={{ fontSize: '10px' }}></i> {timeAgo(listing.created_at)}
                            </span>
                        </div>
                        <Link to={`/product/${listing.id}`} className="action-btn" style={{ textDecoration: 'none', display: 'block', textAlign: 'center', margin: 0 }}>VIEW DETAILS</Link>
                    </div>
                </div>
            </div>
        );
    }

    if (isLivestock && !forceVehicleStyle) {
        return (
            <div className="ls-card">
                <div className="ls-card-img">
                    <button className="ls-fav"><i className="fa-regular fa-heart"></i></button>
                    <Link to={`/product/${listing.id}`}>
                        <img src={imageUrl} alt={listing.title} loading="lazy" />
                    </Link>
                </div>
                <div className="ls-card-body" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ flexGrow: 1 }}>
                    {listing.is_featured && <div style={{ marginBottom: '4px' }}><span className="featured-badge" style={{ backgroundColor: '#ff9900', color: '#fff', padding: '2px 6px', fontSize: '10px', borderRadius: '3px', fontWeight: 'bold', display: 'inline-block' }}><i className="fa-solid fa-star"></i> Featured</span></div>}
                    <h3><Link to={`/product/${listing.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{listing.title}</Link></h3>
                    <div className="ls-specs">
                        <p><strong>Status:</strong> {specs.health || 'Available'}</p>
                        <p><strong>Weight:</strong> {specs.weight || 'N/A'}</p>
                        <p><strong>Location:</strong> {listing.location || 'Unknown'}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', marginBottom: '6px' }}>
                        <span className="price-value" style={{ display: 'block' }}>{priceFormatted}</span>
                    </div>
                    </div>
                    <div style={{ marginTop: 'auto' }}>
                        <div style={{ textAlign: 'left', marginBottom: '8px' }}>
                            <span style={{ fontSize: '11px', color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                                <i className="fa-regular fa-clock" style={{ fontSize: '10px' }}></i> {timeAgo(listing.created_at)}
                            </span>
                        </div>
                        <Link to={`/product/${listing.id}`} style={{ display: 'block', textAlign: 'center', background: '#2e7d32', color: 'white', padding: '8px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px', margin: 0 }}>View Details</Link>
                    </div>
                </div>
            </div>
        );
    }

    if (isEquipment && !forceVehicleStyle) {
        return (
            <div className="eq-card">
                <div className="eq-card-img">
                    <button className="eq-fav"><i className="fa-regular fa-heart"></i></button>
                    <Link to={`/product/${listing.id}`}>
                        <img src={imageUrl} alt={listing.title} loading="lazy" />
                    </Link>
                </div>
                <div className="eq-card-info" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', marginBottom: '4px' }}>
                        {listing.is_featured && <span className="featured-badge" style={{ backgroundColor: '#ff9900', color: '#fff', padding: '2px 6px', fontSize: '10px', borderRadius: '3px', fontWeight: 'bold', display: 'inline-block' }}><i className="fa-solid fa-star"></i> Featured</span>}
                        <p className="eq-price" style={{ margin: 0 }}>{priceFormatted}</p>
                    </div>
                    <h3>
                        <Link to={`/product/${listing.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{listing.title}</Link>
                    </h3>
                    <div className="eq-meta">
                        <span><i className="fa-solid fa-clock"></i> {specs.hours || 'N/A'} hrs</span>
                        <span><i className="fa-solid fa-location-dot"></i> {listing.location || 'N/A'}</span>
                    </div>
                    </div>
                    <div style={{ marginTop: 'auto' }}>
                        <div style={{ textAlign: 'left', marginBottom: '8px', marginTop: '4px' }}>
                            <span style={{ fontSize: '11px', color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                                <i className="fa-regular fa-clock" style={{ fontSize: '10px' }}></i> {timeAgo(listing.created_at)}
                            </span>
                        </div>
                        <Link to={`/product/${listing.id}`} className="eq-btn" style={{ display: 'block', margin: 0, textAlign: 'center' }}>View Details</Link>
                    </div>
                </div>
            </div>
        );
    }

    if (isSpares && !forceVehicleStyle) {
        return (
            <div className="s-card">
                <div className="s-card-img">
                    <Link to={`/product/${listing.id}`}>
                        <img src={imageUrl} alt={listing.title} loading="lazy" />
                    </Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ flexGrow: 1 }}>
                        {listing.is_featured && <div style={{ marginBottom: '4px', padding: '0 1rem', paddingTop: '1rem' }}><span className="featured-badge" style={{ backgroundColor: '#ff9900', color: '#fff', padding: '2px 6px', fontSize: '10px', borderRadius: '3px', fontWeight: 'bold', display: 'inline-block' }}><i className="fa-solid fa-star"></i> Featured</span></div>}
                        
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', padding: '0 1rem', marginBottom: '0.5rem', paddingTop: listing.is_featured ? '0' : '1rem' }}>
                            <p className="s-price" style={{ marginBottom: '0', padding: '0' }}>{priceFormatted}</p>
                        </div>

                        <h4 className="s-title">
                            <Link to={`/product/${listing.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{listing.title}</Link>
                        </h4>
                        
                        <div className="s-compatibility"><i className="fa-solid fa-circle-check"></i> Fits: {specs.compatible || 'Universal'}</div>
                        
                        <p className="s-sku" style={{ paddingTop: 0, paddingBottom: '0.5rem' }}><i className="fa-solid fa-location-dot"></i> {listing.location || 'N/A'}</p>
                    </div>
                    <div style={{ marginTop: 'auto' }}>
                        <div style={{ textAlign: 'left', padding: '0 1rem', marginBottom: '8px' }}>
                            <span style={{ fontSize: '11px', color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                                <i className="fa-regular fa-clock" style={{ fontSize: '10px' }}></i> {timeAgo(listing.created_at)}
                            </span>
                        </div>
                        <div className="s-actions" style={{ marginTop: 0 }}>
                            <Link to={`/product/${listing.id}`} className="s-btn-primary" style={{ flex: 1, textAlign: 'center' }}>View Details</Link>
                            <a href="#" className="s-btn-icon" onClick={(e) => e.preventDefault()}><i className="fa-regular fa-heart"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isMachinery && !forceVehicleStyle) {
            return (
                <div className="machinery-card">
                    <div className="m-card-image">
                        <button className="m-fav"><i className="fa-regular fa-heart"></i></button>
                        <Link to={`/product/${listing.id}`}>
                            <img src={imageUrl} alt={listing.title} className="product-image" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Link>
                    </div>
                    <div className="m-card-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ flexGrow: 1 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', marginBottom: '8px' }}>
                            {listing.is_featured && <span className="featured-badge" style={{ backgroundColor: '#ff9900', color: '#fff', padding: '2px 6px', fontSize: '10px', borderRadius: '3px', fontWeight: 'bold', display: 'inline-block' }}><i className="fa-solid fa-star"></i> Featured</span>}
                            <p className="m-price" style={{ marginBottom: '0', color: '#ffcc00', fontSize: '18px', fontWeight: 'bold' }}>{priceFormatted}</p>
                        </div>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
                            <Link to={`/product/${listing.id}`} style={{ color: '#fff', textDecoration: 'none' }}>{listing.title}</Link>
                        </h4>
                        <p className="m-specs" style={{ color: '#aaa', fontSize: '11px', margin: '0 0 15px 0' }}>
                            <i className="fa-solid fa-gauge"></i> {specs.mileage || 'N/A'}<br />
                            <i className="fa-solid fa-location-dot"></i> {listing.location || 'N/A'}
                        </p>
                        </div>
                        <div style={{ marginTop: 'auto' }}>
                            <div style={{ textAlign: 'left', marginBottom: '8px' }}>
                                <span style={{ fontSize: '11px', color: '#94a3b8', backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                                    <i className="fa-regular fa-clock" style={{ fontSize: '10px' }}></i> {timeAgo(listing.created_at)}
                                </span>
                            </div>
                            <Link to={`/product/${listing.id}`} className="m-btn" style={{ display: 'block', textAlign: 'center', backgroundColor: '#ffcc00', color: '#111', padding: '8px', textDecoration: 'none', fontWeight: 'bold', borderRadius: '4px', margin: 0 }}>
                                View Details
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className={isVehicle ? 'vehicle-card' : 'vehicle-card'}>
                <div className="v-card-image">
                    <button className="v-fav"><i className="fa-regular fa-heart"></i></button>
                    <Link to={`/product/${listing.id}`}>
                        <img src={imageUrl} alt={listing.title} className="product-image" loading="lazy" />
                    </Link>
                </div>
                <div className="v-card-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ flexGrow: 1 }}>
                        {isVehicle ? (
                            <>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', marginBottom: '8px' }}>
                                    {listing.is_featured && <span className="featured-badge" style={{ backgroundColor: '#ff9900', color: '#fff', padding: '2px 6px', fontSize: '10px', borderRadius: '3px', fontWeight: 'bold', display: 'inline-block' }}><i className="fa-solid fa-star"></i> Featured</span>}
                                    <p className="v-price" style={{ margin: 0 }}><strong>{priceFormatted}</strong></p>
                                </div>
                                <h4>
                                    <Link to={`/product/${listing.id}`}>{listing.title}</Link>
                                </h4>
                                <div className="v-specs">
                                    <span><i className="fa-solid fa-gauge"></i> {specs.mileage || '0'} km</span><br />
                                    <span><i className="fa-solid fa-location-dot"></i> {listing.location}{listing.province ? ', ' + listing.province : ''}</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', marginBottom: '8px' }}>
                                    {listing.is_featured && <span className="featured-badge" style={{ backgroundColor: '#ff9900', color: '#fff', padding: '2px 6px', fontSize: '10px', borderRadius: '3px', fontWeight: 'bold', display: 'inline-block' }}><i className="fa-solid fa-star"></i> Featured</span>}
                                    <p className="v-price" style={{ margin: 0 }}><strong>{priceFormatted}</strong></p>
                                </div>
                                <h4>
                                    <Link to={`/product/${listing.id}`}>{listing.title}</Link>
                                </h4>
                                <div className="v-specs">
                                    {specs.condition && <><span><i className="fa-solid fa-certificate"></i> {specs.condition}</span><br /></>}
                                    <span><i className="fa-solid fa-location-dot"></i> {listing.location}{listing.province ? ', ' + listing.province : ''}</span>
                                </div>
                            </>
                        )}
                    </div>
                    
                    <div style={{ marginTop: 'auto' }}>
                        <div style={{ textAlign: 'left', marginBottom: '8px', marginTop: '4px' }}>
                            <span style={{ fontSize: '11px', color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                                <i className="fa-regular fa-clock" style={{ fontSize: '10px' }}></i> {timeAgo(listing.created_at)}
                            </span>
                        </div>
                        <Link to={`/product/${listing.id}`} className="view-details-btn" style={{ display: 'block', margin: 0, textAlign: 'center' }}>View Details</Link>
                    </div>
                </div>
            </div>
        );
};

export default ProductCard;

