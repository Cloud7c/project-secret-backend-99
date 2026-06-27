import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ listing, cardType }) => {
    const specs = listing.specs || {};
    const priceFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: listing.currency || 'USD' }).format(listing.price);
    
    let imageUrl = '/logo.png';
    if (listing.images && listing.images.length > 0) {
        imageUrl = listing.images[0];
    } else {
        if (listing.category === 'vehicles') imageUrl = '/hilux.jpg';
        if (listing.category === 'machinery') imageUrl = '/tractor.jpg';
        if (listing.category === 'livestock') imageUrl = '/cow.png';
        if (listing.category === 'produce') imageUrl = '/tomatoes.png';
        if (listing.category === 'spares' || listing.category === 'parts') imageUrl = '/spare-brakes.png';
        if (listing.category === 'equipment') imageUrl = '/tractor-1.png';
    }

    if (cardType === 'vehicles') {
        return (
            <div className="product-card">
                <div className="card-image-wrapper">
                    <span className={`category-badge ${specs.condition === 'Used' ? 'used' : ''}`}>{specs.condition || 'New'}</span>
                    <button className="favorite-btn"><i className="fa-regular fa-heart"></i></button>
                    <Link to={`/product/${listing.id}`}>
                        <img src={imageUrl} alt={listing.title} loading="lazy" className="product-image" />
                    </Link>
                </div>
                <div className="card-details">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', marginBottom: '8px' }}>
                        {listing.is_featured && <span className="featured-badge"><i className="fa-solid fa-star"></i> Featured</span>}
                        <h3 className="card-price" style={{ marginBottom: 0 }}>{priceFormatted}</h3>
                    </div>
                    <h4 className="card-title"><Link to={`/product/${listing.id}`}>{listing.title}</Link></h4>
                    <p className="card-location"><i className="fa-solid fa-location-dot"></i> {listing.location}</p>
                    
                    <div className="card-meta">
                        <span><i className="fa-solid fa-gauge"></i> {specs.mileage || 'N/A'}</span>
                        <span><i className="fa-solid fa-gas-pump"></i> {specs.fuel_type || 'N/A'}</span>
                        <span><i className="fa-solid fa-gear"></i> {specs.transmission || 'N/A'}</span>
                    </div>
                </div>
            </div>
        );
    }

    if (cardType === 'machinery') {
        return (
            <div className="machinery-card">
                <div className="m-card-image">
                    <span className={`m-badge ${specs.condition === 'Used' ? 'used' : ''}`}>{specs.condition || 'New'}</span>
                    <button className="m-fav"><i className="fa-regular fa-heart"></i></button>
                    <Link to={`/product/${listing.id}`}>
                        <img src={imageUrl} alt={listing.title} loading="lazy" />
                    </Link>
                </div>
                <div className="m-card-content">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', marginBottom: '8px' }}>
                        {listing.is_featured && <span className="featured-badge"><i className="fa-solid fa-star"></i> Featured</span>}
                        <p className="m-price" style={{ marginBottom: 0 }}>{priceFormatted}</p>
                    </div>
                    <h4><Link to={`/product/${listing.id}`}>{listing.title}</Link></h4>
                    <p className="m-specs"><i className="fa-solid fa-clock"></i> {specs.mileage || 'N/A'}<br/><i className="fa-solid fa-location-dot"></i> {listing.location}</p>
                    <Link to={`/product/${listing.id}`} className="m-btn">View Details</Link>
                </div>
            </div>
        );
    }

    if (cardType === 'spares') {
        return (
            <div className="s-card">
                <span className={`s-badge ${specs.condition === 'Used' ? '' : 'oem'}`}>{specs.condition || 'OEM'}</span>
                <div className="s-card-img">
                    <Link to={`/product/${listing.id}`}>
                        <img src={imageUrl} alt={listing.title} loading="lazy" />
                    </Link>
                </div>
                <p className="s-sku">SKU: {specs.part_number || 'N/A'}</p>
                <h4 className="s-title"><Link to={`/product/${listing.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{listing.title}</Link></h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', padding: '0 1rem', marginBottom: '0.5rem' }}>
                    {listing.is_featured && <span className="featured-badge"><i className="fa-solid fa-star"></i> Featured</span>}
                    <p className="s-price" style={{ marginBottom: 0, padding: 0 }}>{priceFormatted}</p>
                </div>
                <div className="s-compatibility"><i className="fa-solid fa-circle-check"></i> Fits: {specs.compatible || 'Universal'}</div>
                <div className="s-actions">
                    <Link to={`/product/${listing.id}`} className="s-btn-primary">View Details</Link>
                    <a href="#" className="s-btn-icon"><i className="fa-regular fa-heart"></i></a>
                </div>
            </div>
        );
    }

    if (cardType === 'equipment') {
        return (
            <div className="eq-card">
                <div className="eq-card-img">
                    <span className={`eq-badge ${specs.condition === 'Used' ? 'used' : ''}`}>{specs.condition || 'New'}</span>
                    <button className="eq-fav"><i className="fa-regular fa-heart"></i></button>
                    <Link to={`/product/${listing.id}`}>
                        <img src={imageUrl} alt={listing.title} loading="lazy" />
                    </Link>
                </div>
                <div className="eq-card-info">
                    <h3><Link to={`/product/${listing.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{listing.title}</Link></h3>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', marginBottom: '8px' }}>
                        {listing.is_featured && <span className="featured-badge"><i className="fa-solid fa-star"></i> Featured</span>}
                        <p className="eq-price" style={{ marginBottom: 0 }}>{priceFormatted}</p>
                    </div>
                    <div className="eq-meta">
                        <span><i className="fa-regular fa-clock"></i> {specs.mileage || 'N/A'}</span>
                        <span><i className="fa-solid fa-location-dot"></i> {listing.location}</span>
                    </div>
                    <Link to={`/product/${listing.id}`} className="eq-btn">View Details</Link>
                </div>
            </div>
        );
    }

    if (cardType === 'livestock') {
        return (
            <div className="ls-card">
                <div className="ls-card-img">
                    <span className="ls-card-badge">{listing.category}</span>
                    <button className="ls-fav"><i className="fa-regular fa-heart"></i></button>
                    <Link to={`/product/${listing.id}`}>
                        <img src={imageUrl} alt={listing.title} loading="lazy" />
                    </Link>
                </div>
                <div className="ls-card-body">
                    <h3><Link to={`/product/${listing.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{listing.title}</Link></h3>
                    <div className="ls-specs">
                        <p><strong>Status:</strong> {specs.health || 'Available'}</p>
                        <p><strong>Weight:</strong> {specs.weight || 'N/A'}</p>
                        <p><strong>Breeder:</strong> {listing.seller?.full_name || 'Verified Seller'}</p>
                        <p><strong>Location:</strong> {listing.location}</p>
                    </div>
                    <div className="ls-price-row">
                        <span className="price-label">Price</span>
                        <span className="price-value">{priceFormatted}</span>
                    </div>
                    <Link to={`/product/${listing.id}`} style={{ display: 'block', textAlign: 'center', background: '#2e7d32', color: 'white', padding: '8px', borderRadius: '4px', textDecoration: 'none', marginTop: '10px', fontWeight: 'bold' }}>View Details</Link>
                </div>
            </div>
        );
    }

    if (cardType === 'produce') {
        return (
            <div className="masonry-card">
                <div className="card-img">
                    <span className="card-badge organic">Fresh Crop</span>
                    <Link to={`/product/${listing.id}`}>
                        <img src={imageUrl} alt={listing.title} loading="lazy" />
                    </Link>
                </div>
                <div className="card-body">
                    <h3><Link to={`/product/${listing.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{listing.title}</Link></h3>
                    <p className="seller"><i className="fa-solid fa-tractor"></i> {listing.seller?.full_name || 'Verified Farmer'}</p>
                    <p className="desc">{listing.description ? listing.description.substring(0, 80) + '...' : 'Fresh produce available for order.'}</p>
                    <div className="price-row">
                        <span className="price-val">{priceFormatted}</span>
                    </div>
                    <Link to={`/product/${listing.id}`} className="action-btn" style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>VIEW DETAILS</Link>
                </div>
            </div>
        );
    }

    // Default fallback (e.g. general product)
    return (
        <div className="product-card">
            <div className="card-image">
                <Link to={`/product/${listing.id}`}>
                    <img src={imageUrl} alt={listing.title} loading="lazy" />
                </Link>
            </div>
            <div className="card-content">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', marginBottom: '8px' }}>
                    {listing.is_featured && <span className="featured-badge"><i className="fa-solid fa-star"></i> Featured</span>}
                    <h3 className="price" style={{ marginBottom: 0 }}>{priceFormatted}</h3>
                </div>
                <h4 className="title"><Link to={`/product/${listing.id}`}>{listing.title}</Link></h4>
                <p className="location"><i className="fa-solid fa-location-dot"></i> {listing.location}</p>
            </div>
        </div>
    );
};

export default ProductCard;
