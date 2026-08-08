import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import '../assets/css/hero.css';
import '../assets/css/listings.css';

const Home = () => {
    // Original state for default load
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search filters state
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('');
    const [searchModel, setSearchModel] = useState('');
    const [searchLocation, setSearchLocation] = useState('');

    // Search results state
    const [isSearching, setIsSearching] = useState(false);
    const [featuredSearchResults, setFeaturedSearchResults] = useState([]);
    const [generalSearchResults, setGeneralSearchResults] = useState([]);
    
    // Pagination & Infinite Scroll
    const [searchPage, setSearchPage] = useState(1);
    const [hasMoreSearchResults, setHasMoreSearchResults] = useState(false);
    const [searchSeed, setSearchSeed] = useState('');
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    
    const featuredSectionRef = useRef(null);
    const observerTarget = useRef(null);

    // 1. Initial Load (Default Mixed Random Listings)
    useEffect(() => {
        let zaa_seed = sessionStorage.getItem('zaa_seed');
        if (!zaa_seed) {
            zaa_seed = Math.floor(Math.random() * 1000000000).toString();
            sessionStorage.setItem('zaa_seed', zaa_seed);
        }
        setSearchSeed(zaa_seed);
        fetchSearchResults(1, zaa_seed, true, {});
    }, []);

    // 2. Fetch Search Results Logic
    const fetchSearchResults = async (pageToFetch, seedToUse, isInitialSearch = false, overrides = {}) => {
        try {
            if (isInitialSearch) {
                setLoading(true);
            } else {
                setIsFetchingMore(true);
            }

            // Build query params
            const params = new URLSearchParams();
            params.append('limit', '8');
            params.append('page', pageToFetch);
            if (seedToUse) params.append('seed', seedToUse);
            if (searchTerm) params.append('search', searchTerm);
            const cat = overrides.category !== undefined ? overrides.category : searchCategory;
            const mod = overrides.model !== undefined ? overrides.model : searchModel;
            const loc = overrides.location !== undefined ? overrides.location : searchLocation;
            
            // Check if user is in default search state
            const isDefaultState = !searchTerm && !cat && !mod && !loc;

            if (isDefaultState) {
                params.set('limit', '16');
                params.append('random_sample', 'true');
            } else {
                params.set('limit', '8');
            }

            if (cat) params.append('category', cat);
            if (mod) params.append('make', mod); 
            if (loc) params.append('province', loc);

            const response = await fetch(`/api/listings?${params.toString()}`);
            const data = await response.json();
            
            if (data && data.listings) {
                // Split results into featured vs unfeatured
                const fetchedFeatured = [];
                const fetchedGeneral = [];
                
                data.listings.forEach(listing => {
                    if (listing.is_featured) {
                        fetchedFeatured.push(listing);
                    } else {
                        fetchedGeneral.push(listing);
                    }
                });

                if (isInitialSearch) {
                    // For initial search, fill top slider up to 8
                    const topFeatured = fetchedFeatured.slice(0, 8);
                    const overflowFeatured = fetchedFeatured.slice(8);
                    
                    setFeaturedSearchResults(topFeatured);
                    setGeneralSearchResults([...overflowFeatured, ...fetchedGeneral]);
                } else {
                    // For subsequent pages, everything goes to general results grid
                    setGeneralSearchResults(prev => [...prev, ...fetchedFeatured, ...fetchedGeneral]);
                }
                
                const cat = overrides.category !== undefined ? overrides.category : searchCategory;
                const mod = overrides.model !== undefined ? overrides.model : searchModel;
                const loc = overrides.location !== undefined ? overrides.location : searchLocation;
                const isDefaultState = !searchTerm && !cat && !mod && !loc;

                // If there are more pages available from the backend, allow infinite scrolling
                if (!data.hasNextPage) {
                    setHasMoreSearchResults(false);
                } else {
                    setHasMoreSearchResults(true);
                }
            }
        } catch (err) {
            console.error("Failed to fetch search results", err);
        } finally {
            setLoading(false);
            setIsFetchingMore(false);
        }
    };

    // 3. Handle Initial Search Trigger
    const handleSearch = (overrides = {}, shouldScroll = true) => {
        setIsSearching(true);
        const newSeed = Math.floor(Math.random() * 1000000000).toString();
        setSearchSeed(newSeed);
        setSearchPage(1);
        
        // Scroll to results smoothly only if intended
        if (shouldScroll && featuredSectionRef.current) {
            featuredSectionRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        
        fetchSearchResults(1, newSeed, true, overrides);
    };

    const handleFilterChange = (type, value, e) => {
        if (type === 'category') setSearchCategory(value);
        if (type === 'model') setSearchModel(value);
        if (type === 'location') setSearchLocation(value);
        
        const detailsEl = e.target.closest('details');
        if (detailsEl) {
            detailsEl.removeAttribute('open');
            detailsEl.open = false;
        }
        
        // Trigger auto-search without auto-scrolling
        handleSearch({ [type]: value }, false);
    };

    // 4. Infinite Scroll Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMoreSearchResults && !isFetchingMore && !loading) {
                    const nextPage = searchPage + 1;
                    setSearchPage(nextPage);
                    fetchSearchResults(nextPage, searchSeed, false);
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [hasMoreSearchResults, isFetchingMore, loading, searchPage, searchSeed]);

    // Slider controls for top section
    const slideLeft = () => {
        const slider = document.getElementById('featured-slider');
        if (slider) slider.scrollBy({ left: -260, behavior: 'smooth' });
    };

    const slideRight = () => {
        const slider = document.getElementById('featured-slider');
        if (slider) slider.scrollBy({ left: 260, behavior: 'smooth' });
    };

    const isDefaultState = !searchTerm && !searchCategory && !searchModel && !searchLocation;

    return (
        <main>
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
                            <input 
                                type="text" 
                                placeholder="Search Cars, Trucks, Tractors..." 
                                className="search-input-main"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button className="search-submit-btn" onClick={handleSearch}>SEARCH</button>
                        </div>

                        <div className="search-bottom-row hero-custom-dropdowns">
                            <details className="custom-filter hero-filter">
                                <summary>{searchCategory ? searchCategory.charAt(0).toUpperCase() + searchCategory.slice(1) : 'Category'} <i className="fa-solid fa-chevron-down" style={{ fontSize: '11px', color: '#666' }}></i></summary>
                                <div className="hero-options">
                                    <label><input type="radio" name="category" value="" checked={searchCategory === ''} onChange={(e) => handleFilterChange('category', e.target.value, e)} /> All Categories</label>
                                    <label><input type="radio" name="category" value="vehicles" checked={searchCategory === 'vehicles'} onChange={(e) => handleFilterChange('category', e.target.value, e)} /> Vehicles</label>
                                    <label><input type="radio" name="category" value="machinery" checked={searchCategory === 'machinery'} onChange={(e) => handleFilterChange('category', e.target.value, e)} /> Machinery</label>
                                    <label><input type="radio" name="category" value="equipment" checked={searchCategory === 'equipment'} onChange={(e) => handleFilterChange('category', e.target.value, e)} /> Equipment</label>
                                    <label><input type="radio" name="category" value="spares" checked={searchCategory === 'spares'} onChange={(e) => handleFilterChange('category', e.target.value, e)} /> Spares & Parts</label>
                                    <label><input type="radio" name="category" value="livestock" checked={searchCategory === 'livestock'} onChange={(e) => handleFilterChange('category', e.target.value, e)} /> Livestock</label>
                                    <label><input type="radio" name="category" value="produce" checked={searchCategory === 'produce'} onChange={(e) => handleFilterChange('category', e.target.value, e)} /> Produce</label>
                                </div>
                            </details>

                            <details className="custom-filter hero-filter">
                                <summary>{searchModel ? searchModel.charAt(0).toUpperCase() + searchModel.slice(1) : 'Model'} <i className="fa-solid fa-chevron-down" style={{ fontSize: '11px', color: '#666' }}></i></summary>
                                <div className="hero-options">
                                    <label><input type="radio" name="model" value="" checked={searchModel === ''} onChange={(e) => handleFilterChange('model', e.target.value, e)} /> Any Model</label>
                                    <label><input type="radio" name="model" value="toyota" checked={searchModel === 'toyota'} onChange={(e) => handleFilterChange('model', e.target.value, e)} /> Toyota</label>
                                    <label><input type="radio" name="model" value="ford" checked={searchModel === 'ford'} onChange={(e) => handleFilterChange('model', e.target.value, e)} /> Ford</label>
                                    <label><input type="radio" name="model" value="mahindra" checked={searchModel === 'mahindra'} onChange={(e) => handleFilterChange('model', e.target.value, e)} /> Mahindra</label>
                                    <label><input type="radio" name="model" value="nissan" checked={searchModel === 'nissan'} onChange={(e) => handleFilterChange('model', e.target.value, e)} /> Nissan</label>
                                </div>
                            </details>

                            <details className="custom-filter hero-filter">
                                <summary>{searchLocation ? searchLocation.charAt(0).toUpperCase() + searchLocation.slice(1) : 'Location'} <i className="fa-solid fa-chevron-down" style={{ fontSize: '11px', color: '#666' }}></i></summary>
                                <div className="hero-options" style={{ left: 'auto', right: 0 }}>
                                    <label><input type="radio" name="location" value="" checked={searchLocation === ''} onChange={(e) => handleFilterChange('location', e.target.value, e)} /> All Provinces</label>
                                    <label><input type="radio" name="location" value="Harare" checked={searchLocation === 'Harare'} onChange={(e) => handleFilterChange('location', e.target.value, e)} /> Harare</label>
                                    <label><input type="radio" name="location" value="Bulawayo" checked={searchLocation === 'Bulawayo'} onChange={(e) => handleFilterChange('location', e.target.value, e)} /> Bulawayo</label>
                                    <label><input type="radio" name="location" value="Mutare" checked={searchLocation === 'Mutare'} onChange={(e) => handleFilterChange('location', e.target.value, e)} /> Mutare</label>
                                    <label><input type="radio" name="location" value="Mashonaland Central" checked={searchLocation === 'Mashonaland Central'} onChange={(e) => handleFilterChange('location', e.target.value, e)} /> Mashonaland Central</label>
                                    <label><input type="radio" name="location" value="Mashonaland East" checked={searchLocation === 'Mashonaland East'} onChange={(e) => handleFilterChange('location', e.target.value, e)} /> Mashonaland East</label>
                                    <label><input type="radio" name="location" value="Mashonaland West" checked={searchLocation === 'Mashonaland West'} onChange={(e) => handleFilterChange('location', e.target.value, e)} /> Mashonaland West</label>
                                    <label><input type="radio" name="location" value="Masvingo" checked={searchLocation === 'Masvingo'} onChange={(e) => handleFilterChange('location', e.target.value, e)} /> Masvingo</label>
                                    <label><input type="radio" name="location" value="Matabeleland North" checked={searchLocation === 'Matabeleland North'} onChange={(e) => handleFilterChange('location', e.target.value, e)} /> Matabeleland North</label>
                                    <label><input type="radio" name="location" value="Matabeleland South" checked={searchLocation === 'Matabeleland South'} onChange={(e) => handleFilterChange('location', e.target.value, e)} /> Matabeleland South</label>
                                    <label><input type="radio" name="location" value="Midlands" checked={searchLocation === 'Midlands'} onChange={(e) => handleFilterChange('location', e.target.value, e)} /> Midlands</label>
                                </div>
                            </details>
                        </div>
                    </div>
                </div>
            </section>

            {/* CATEGORY CARDS */}
            <section className="category-cards-wrapper">
                <div className="category-cards-container">
                    <Link to="/vehicles" className="category-card">
                        <i className="fa-solid fa-car card-icon"></i>
                        <span className="card-title">Vehicles</span>
                    </Link>
                    <Link to="/machinery" className="category-card">
                        <i className="fa-solid fa-truck-moving card-icon"></i>
                        <span className="card-title">Machinery</span>
                    </Link>
                    <Link to="/spares" className="category-card">
                        <i className="fa-solid fa-gear card-icon"></i>
                        <span className="card-title">Spares</span>
                    </Link>
                    <Link to="/vehicles" className="category-card">
                        <i className="fa-solid fa-truck card-icon"></i>
                        <span className="card-title">Trucks</span>
                    </Link>
                    <Link to="/equipment" className="category-card">
                        <i className="fa-solid fa-tractor card-icon"></i>
                        <span className="card-title">Equipment</span>
                    </Link>
                    <Link to="/livestock" className="category-card">
                        <i className="fa-solid fa-cow card-icon"></i>
                        <span className="card-title">Livestock</span>
                    </Link>
                    <Link to="/produce" className="category-card">
                        <i className="fa-solid fa-wheat-awn card-icon"></i>
                        <span className="card-title">Crops &<br/>Produce</span>
                    </Link>
                </div>
            </section>

            <style>
                {`
                @media (max-width: 768px) {
                    /* Align container padding */
                    .featured-section {
                        padding-left: 10px !important;
                        padding-right: 10px !important;
                    }
                    .featured-container {
                        padding-left: 0 !important;
                        padding-right: 0 !important;
                    }

                    /* Featured slider padding & gap */
                    #featured-slider {
                        padding-left: 0 !important;
                        padding-right: 0 !important;
                        gap: 10px !important;
                    }
                    
                    /* 📱 PHONES (up to 575px): 2 wide cards */
                    #featured-slider > div {
                        flex: 0 0 calc(50vw - 15px) !important;
                        width: calc(50vw - 15px) !important;
                        max-width: calc(50vw - 15px) !important;
                        min-width: calc(50vw - 15px) !important;
                        box-sizing: border-box !important;
                    }
                    
                    /* Others / All Results: 2 columns on phone */
                    .product-grid-vertical {
                        display: grid !important;
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 10px !important;
                    }
                }

                /* 📟 TABLETS (576px to 768px): 3 narrower cards — NOT stretched */
                @media (min-width: 576px) and (max-width: 768px) {
                    #featured-slider > div {
                        flex: 0 0 calc(33.33vw - 14px) !important;
                        width: calc(33.33vw - 14px) !important;
                        max-width: calc(33.33vw - 14px) !important;
                        min-width: calc(33.33vw - 14px) !important;
                        box-sizing: border-box !important;
                    }
                    
                    /* Others / All Results: 3 columns on tablet */
                    .product-grid-vertical {
                        display: grid !important;
                        grid-template-columns: repeat(3, 1fr) !important;
                        gap: 12px !important;
                    }
                }

                /* Universal font scaling for all cards */
                @media (max-width: 768px) {
                    #featured-slider > div *,
                    .product-grid-vertical > div * {
                        font-size: 11px !important;
                    }
                    #featured-slider > div h3,
                    .product-grid-vertical > div h3 {
                        font-size: 12px !important;
                        margin-bottom: 4px !important;
                    }
                    
                    /* Universal image scaling — phones */
                    #featured-slider > div > div:first-child,
                    .product-grid-vertical > div > div:first-child {
                        height: 110px !important;
                        min-height: 110px !important;
                    }
                }

                /* Tablet image height — slightly taller */
                @media (min-width: 576px) and (max-width: 768px) {
                    #featured-slider > div > div:first-child,
                    .product-grid-vertical > div > div:first-child {
                        height: 130px !important;
                        min-height: 130px !important;
                    }
                }
                `}
            </style>

            {/* PRODUCT GRID SECTION (TOP TIER: FEATURED SLIDER) */}
            <section className="featured-section" ref={featuredSectionRef}>
                <div className="featured-container">
                    <div className="section-header">
                        <h3 className="section-title">
                            {isSearching ? (
                                <>SEARCH RESULTS <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal', marginLeft: '10px', textTransform: 'none' }}>(Featured Matches)</span></>
                            ) : (
                                <><i className="fa-solid fa-star" style={{ color: '#006400', marginRight: '8px' }}></i>FEATURED LISTINGS</>
                            )}
                        </h3>
                        <div className="section-nav">
                            <button className="nav-arrow" onClick={slideLeft}><i className="fa-solid fa-chevron-left"></i></button>
                            <button className="nav-arrow" onClick={slideRight}><i className="fa-solid fa-chevron-right"></i></button>
                        </div>
                    </div>

                    <div className="product-grid" id="featured-slider" style={{ minHeight: '300px' }}>
                        {loading ? (
                            <div style={{ width: '100%', textAlign: 'center', padding: '40px', color: '#666', gridColumn: '1 / -1' }}>
                                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', marginBottom: '10px' }}></i>
                                <p>{isSearching ? 'Searching...' : 'Loading featured listings...'}</p>
                            </div>
                        ) : (
                            featuredSearchResults.length > 0 ? (
                                featuredSearchResults.map(listing => (
                                    <ProductCard key={listing.id} listing={listing} />
                                ))
                            ) : (
                                <div style={{ width: '100%', textAlign: 'center', padding: '40px', color: '#666', gridColumn: '1 / -1' }}>
                                    <p>No featured listings found.</p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </section>

            {/* SECOND TIER: SEARCH RESULTS GRID (VERTICAL) */}
            <section className="featured-section" style={{ paddingTop: '10px', paddingBottom: '60px' }}>
                <div className="featured-container">
                    <div className="section-header" style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                        <h3 className="section-title" style={{ fontSize: '18px', textTransform: 'uppercase' }}>
                            {isDefaultState ? 'OTHERS' : 'ALL RESULTS'}
                        </h3>
                    </div>

                        <div className="product-grid-vertical">
                            {generalSearchResults.length > 0 ? (
                                generalSearchResults.map(listing => (
                                    <ProductCard key={`gen-${listing.id}`} listing={listing} forceVehicleStyle={true} />
                                ))
                            ) : !loading && (
                                <div style={{ width: '100%', textAlign: 'center', padding: '40px', color: '#666', gridColumn: '1 / -1' }}>
                                    <p>No additional matching listings found.</p>
                                </div>
                            )}
                        </div>

                        {/* Infinite Scroll Trigger & Loader */}
                        <div ref={observerTarget} style={{ width: '100%', height: '20px', margin: '30px 0' }}>
                            {isFetchingMore && (
                                <div style={{ textAlign: 'center', color: '#666' }}>
                                    <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                                    Loading more...
                                </div>
                            )}
                        </div>
                        
                        {!hasMoreSearchResults && generalSearchResults.length > 0 && (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#999', fontSize: '14px', borderTop: '1px solid #eee', marginTop: '10px' }}>
                                End of results
                            </div>
                        )}
                    </div>
                </section>
            
        </main>
    );
};

export default Home;
