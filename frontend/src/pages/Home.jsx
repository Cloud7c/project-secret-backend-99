import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const Home = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter states
    const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '');
    const [activeProvince, setActiveProvince] = useState(searchParams.get('province') || 'All Provinces');

    useEffect(() => {
        const categoryFromUrl = searchParams.get('category') || '';
        setActiveCategory(categoryFromUrl);
    }, [searchParams]);

    useEffect(() => {
        fetchListings();
    }, [activeCategory, activeProvince]);

    const fetchListings = async () => {
        setLoading(true);
        setError(null);
        try {
            let zaa_seed = sessionStorage.getItem('zaa_seed');
            if (!zaa_seed) {
                zaa_seed = Math.floor(Math.random() * 100000000).toString();
                sessionStorage.setItem('zaa_seed', zaa_seed);
            }

            const limit = window.innerWidth <= 768 ? 16 : 32;
            
            let queryUrl = `/api/listings?limit=${limit}&shuffle=true&seed=${zaa_seed}`;
            if (activeCategory) queryUrl += `&category=${encodeURIComponent(activeCategory)}`;
            if (activeProvince && activeProvince !== 'All Provinces') {
                queryUrl += `&province=${encodeURIComponent(activeProvince)}`;
            }

            const res = await fetch(queryUrl);
            if (!res.ok) throw new Error('Failed to fetch listings');
            
            const data = await res.json();
            setListings(data.listings || []);
        } catch (err) {
            console.error(err);
            setError('Failed to load items. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = (cat) => {
        if (cat) {
            setSearchParams({ category: cat });
        } else {
            setSearchParams({});
        }
    };

    return (
        <main className="main-content">
            {/* HERO SECTION */}
            <section className="hero-section">
                <video autoPlay loop muted playsInline className="hero-video-bg">
                    <source src="/Hero.mp4" type="video/mp4" />
                </video>
                <div className="hero-overlay" style={{ background: 'rgba(0, 0, 0, 0.15)' }}></div>
                
                <div className="hero-content">
                    <h1 className="hero-title">Buy. Sell. Trade. In Zimbabwe.</h1>
                    <h2 className="hero-subtitle">AUTOMOTIVE & AGRICULTURE</h2>

                    <div className="hero-search-box">
                        <div className="search-top-row">
                            <input type="text" id="hero-search-input" placeholder="Search Cars, Trucks, Tractors..." className="search-input-main" />
                            <button id="hero-search-btn" className="search-submit-btn">SEARCH</button>
                        </div>

                        <div className="search-bottom-row hero-custom-dropdowns">
                            
                            <details className="custom-filter hero-filter">
                                <summary>Category <i className="fa-solid fa-chevron-down" style={{ fontSize: '11px', color: '#666' }}></i></summary>
                                <div className="hero-options">
                                    <label><input type="radio" name="category" value="" defaultChecked onClick={() => handleCategoryClick('')} /> All Categories</label>
                                    <label><input type="radio" name="category" value="vehicles" onClick={() => handleCategoryClick('vehicles')} /> Vehicles</label>
                                    <label><input type="radio" name="category" value="machinery" onClick={() => handleCategoryClick('machinery')} /> Machinery</label>
                                    <label><input type="radio" name="category" value="equipment" onClick={() => handleCategoryClick('equipment')} /> Equipment</label>
                                    <label><input type="radio" name="category" value="spares" onClick={() => handleCategoryClick('spares')} /> Spares & Parts</label>
                                    <label><input type="radio" name="category" value="livestock" onClick={() => handleCategoryClick('livestock')} /> Livestock</label>
                                    <label><input type="radio" name="category" value="produce" onClick={() => handleCategoryClick('produce')} /> Produce</label>
                                </div>
                            </details>

                            <details className="custom-filter hero-filter">
                                <summary>Model <i className="fa-solid fa-chevron-down" style={{ fontSize: '11px', color: '#666' }}></i></summary>
                                <div className="hero-options">
                                    <label><input type="radio" name="model" value="" defaultChecked /> Any Model</label>
                                    <label><input type="radio" name="model" value="toyota" /> Toyota</label>
                                    <label><input type="radio" name="model" value="ford" /> Ford</label>
                                    <label><input type="radio" name="model" value="mahindra" /> Mahindra</label>
                                    <label><input type="radio" name="model" value="nissan" /> Nissan</label>
                                </div>
                            </details>

                            <details className="custom-filter hero-filter">
                                <summary>Location <i className="fa-solid fa-chevron-down" style={{ fontSize: '11px', color: '#666' }}></i></summary>
                                <div className="hero-options" style={{ left: 'auto', right: 0 }}>
                                    <label><input type="radio" name="location" value="" defaultChecked /> All Provinces</label>
                                    <label><input type="radio" name="location" value="Harare" /> Harare</label>
                                    <label><input type="radio" name="location" value="Bulawayo" /> Bulawayo</label>
                                    <label><input type="radio" name="location" value="Mutare" /> Mutare</label>
                                </div>
                            </details>

                        </div>
                    </div>
                </div>
            </section>

            {/* CATEGORY CARDS */}
            <section className="category-cards-wrapper">
                <div className="category-cards-container">
                    <Link to="/category?category=vehicles" className="category-card">
                        <i className="fa-solid fa-car card-icon"></i>
                        <span className="card-title">Vehicles</span>
                    </Link>
                    <Link to="/category?category=machinery" className="category-card">
                        <i className="fa-solid fa-truck-moving card-icon"></i>
                        <span className="card-title">Machinery</span>
                    </Link>
                    <Link to="/category?category=spares" className="category-card">
                        <i className="fa-solid fa-gear card-icon"></i>
                        <span className="card-title">Spares</span>
                    </Link>
                    <Link to="/category?category=vehicles" className="category-card">
                        <i className="fa-solid fa-truck card-icon"></i>
                        <span className="card-title">Trucks</span>
                    </Link>
                    <Link to="/category?category=equipment" className="category-card">
                        <i className="fa-solid fa-tractor card-icon"></i>
                        <span className="card-title">Equipment</span>
                    </Link>
                    <Link to="/category?category=livestock" className="category-card">
                        <i className="fa-solid fa-cow card-icon"></i>
                        <span className="card-title">Livestock</span>
                    </Link>
                    <Link to="/category?category=produce" className="category-card">
                        <i className="fa-solid fa-wheat-awn card-icon"></i>
                        <span className="card-title">Crops &<br/>Produce</span>
                    </Link>
                </div>
            </section>

            {/* FEATURED ADVERTS */}
            <section className="featured-section">
                <div className="featured-container">
                    <div className="section-header">
                        <h3 className="section-title">FEATURED LISTINGS</h3>
                        <div className="section-nav">
                            <button className="nav-arrow" id="slide-left"><i className="fa-solid fa-chevron-left"></i></button>
                            <button className="nav-arrow" id="slide-right"><i className="fa-solid fa-chevron-right"></i></button>
                        </div>
                    </div>

                    <div className="product-grid" id="product-slider">
                        {loading ? (
                            <div style={{ width:'100%', textAlign:'center', padding: '40px', color: '#666', gridColumn: '1 / -1' }}>
                                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', marginBottom: '10px' }}></i>
                                <p>Loading featured listings...</p>
                            </div>
                        ) : error ? (
                            <p className="error-text" style={{ gridColumn: '1 / -1' }}>{error}</p>
                        ) : listings.length > 0 ? (
                            listings.map(listing => (
                                <ProductCard key={listing.id} listing={listing} cardType={listing.category} />
                            ))
                        ) : (
                            <p className="error-text" style={{ gridColumn: '1 / -1' }}>No items found.</p>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Home;
