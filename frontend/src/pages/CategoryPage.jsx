import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

// Import CSS for all categories to support dynamic switching
import '../assets/css/machinery.css'; 
import '../assets/css/vehicles.css';
import '../assets/css/spares.css';
import '../assets/css/equipments.css';
import '../assets/css/livestock.css';
import '../assets/css/produce.css';

const CategoryPage = ({ title, category }) => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    
    // Filter States
    const [make, setMake] = useState('All Makes');
    const [model, setModel] = useState('All Models');
    const [type, setType] = useState('All Types');
    const [condition, setCondition] = useState('Any');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [transmission, setTransmission] = useState('Any');
    const [loc, setLoc] = useState('All Provinces');
    const [sort, setSort] = useState('newest'); // newest, lowest, highest
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination (Basic placeholder setup)
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const [highlightItem, setHighlightItem] = useState(null);
    const observerTarget = useRef(null);

    const location = useLocation();

    // Determine base CSS class based on category
    const getBaseClass = () => {
        if (category === 'vehicles') return 'vehicles';
        if (category === 'spares') return 'spares';
        if (category === 'equipment') return 'equipment';
        if (category === 'livestock') return 'livestock';
        if (category === 'produce') return 'produce';
        return 'machinery'; // Default fallback
    };
    const baseClass = getBaseClass();

    const fetchHighlight = async () => {
        try {
            const seed = Math.floor(Math.random() * 1000000000).toString();
            const res = await fetch(`/api/listings?category=${category}&limit=1&shuffle=true&featured=true&seed=${seed}`);
            const data = await res.json();
            if (data && data.listings && data.listings.length > 0) {
                setHighlightItem(data.listings[0]);
            } else {
                setHighlightItem(null);
            }
        } catch (err) {
            console.error("Failed to fetch highlight", err);
            setHighlightItem(null);
        }
    };

    const fetchListings = async (resetPage = false) => {
        try {
            if (resetPage) {
                setLoading(true);
            } else {
                setIsFetchingMore(true);
            }
            const currentPage = resetPage ? 1 : page;
            
            const params = new URLSearchParams();
            params.append('category', category);
            params.append('limit', '12');
            params.append('page', currentPage);
            
            if (searchTerm) params.append('search', searchTerm);
            
            // Map sort to backend expectations
            if (sort === 'lowest') params.append('sort', 'low');
            else if (sort === 'highest') params.append('sort', 'high');
            else if (sort === 'newest') params.append('sort', 'new');
            
            if (loc !== 'All Provinces') params.append('province', loc);
            if (condition !== 'Any') params.append('condition', condition);
            if (minPrice) params.append('price_min', minPrice);
            if (maxPrice) params.append('price_max', maxPrice);
            
            // Category-Specific
            if (category === 'vehicles') {
                if (make !== 'All Makes') params.append('make', make);
                if (model !== 'All Models') params.append('model', model);
                if (transmission !== 'Any') params.append('transmission', transmission);
            } else if (category === 'machinery') {
                if (type !== 'All Types') params.append('type', type);
                if (make !== 'All Makes') params.append('make', make);
            }

            const response = await fetch(`/api/listings?${params.toString()}`);
            const data = await response.json();
            
            if (data && data.listings) {
                if (resetPage) {
                    setListings(data.listings);
                } else {
                    setListings(prev => [...prev, ...data.listings]);
                }
                setHasMore(data.hasNextPage);
            } else {
                if (resetPage) setListings([]);
            }
        } catch (err) {
            console.error(`Failed to fetch ${category} listings`, err);
            if (resetPage) setListings([]);
        } finally {
            setLoading(false);
            setIsFetchingMore(false);
        }
    };

    // Fetch on initial load or category change
    useEffect(() => {
        // Toggle body background for livestock and produce
        if (category === 'livestock') {
            document.body.classList.add('bg-pasture-green');
            document.body.classList.remove('bg-fresh-market');
        } else if (category === 'produce') {
            document.body.classList.add('bg-fresh-market');
            document.body.classList.remove('bg-pasture-green');
        } else {
            document.body.classList.remove('bg-pasture-green');
            document.body.classList.remove('bg-fresh-market');
        }

        // Reset filters when changing categories
        setMake('All Makes');
        setModel('All Models');
        setType('All Types');
        setCondition('Any');
        setMinPrice('');
        setMaxPrice('');
        setTransmission('Any');
        setLoc('All Provinces');
        setSort('newest');
        setSearchTerm('');
        setPage(1);
        
        fetchHighlight();
        fetchListings(true);
        setFilterOpen(false);
    }, [category]);

    // Intersection Observer for Infinite Scroll (limit to 60 items before requiring click)
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isFetchingMore && !loading) {
                    if (listings.length >= 60) return; // Cap at 60 for infinite scroll
                    const nextPage = page + 1;
                    setPage(nextPage);
                    // use timeout to avoid React state batching issues with the observer
                    setTimeout(() => fetchListings(false), 0);
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
    }, [hasMore, isFetchingMore, loading, page, listings.length]);

    // Auto-search when any filter changes
    const isInitialMount = useRef(true);
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        
        // Debounce slightly to prevent rapid consecutive API calls if user clicks fast
        const timer = setTimeout(() => {
            setPage(1);
            fetchListings(true);
        }, 150);
        
        return () => clearTimeout(timer);
    }, [make, model, type, condition, minPrice, maxPrice, transmission, loc, sort]);

    // Handle closing <details> dropdowns when selecting an option or clicking outside
    useEffect(() => {
        const handleDocumentClick = (e) => {
            const detailsElements = document.querySelectorAll('details.custom-filter, details.custom-sort');
            detailsElements.forEach(details => {
                // Check if the click is on a radio button inside the dropdown
                const isRadioClick = details.contains(e.target) && e.target.tagName.toLowerCase() === 'input' && e.target.type === 'radio';
                
                if (isRadioClick || !details.contains(e.target)) {
                    details.removeAttribute('open');
                }
            });
        };
        document.addEventListener('click', handleDocumentClick);
        return () => document.removeEventListener('click', handleDocumentClick);
    }, []);

    // Handle Search Submission
    const handleSearch = () => {
        setPage(1);
        fetchListings(true);
    };

    // Handle Apply Filters
    const handleApplyFilters = () => {
        setPage(1);
        fetchListings(true);
        setFilterOpen(false); // Close mobile filters
    };
    
    const handleSortChange = (e) => {
        setSort(e.target.value);
        setPage(1);
        setTimeout(() => fetchListings(true), 0);
    };

    return (
        <main className={
            category === 'equipment' ? 'open-field-layout bg-green-tint' : 
            category === 'livestock' ? 'pasture-layout bg-pasture-green' : 
            category === 'spares' ? 'spares-page-wrapper' : 
            `${baseClass}-page`
        }>
            
            {category === 'livestock' ? (
                <div className="livestock-banner">
                    <div className="banner-inner">
                        <div className="ls-page-header">
                            <h1>PREMIUM LIVESTOCK</h1>
                            <div className="mobile-controls-row">
                                <div className="ls-page-search">
                                    <input 
                                        type="text" 
                                        placeholder="Search Livestock..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <i className="fa-solid fa-magnifying-glass" onClick={handleSearch} style={{ cursor: 'pointer' }}></i>
                                </div>
                                <button className="filters-dropdown-btn" id="filterBtn" onClick={() => setFilterOpen(!filterOpen)}>
                                    <span id="filterBtnText"><i className="fa-solid fa-filter"></i> Filters</span>
                                </button>
                            </div>
                        </div>
                        <div className="banner-illustration">
                            <div className="cloud cloud-1"></div>
                            <div className="cloud cloud-2"></div>
                            <div className="sun"></div>
                            <div className="hill-back"></div>
                            <div className="hill-middle"></div>
                            <div className="hill-front"></div>
                            <i className="fa-solid fa-cow cow-shadow cow-1"></i>
                            <i className="fa-solid fa-cow cow-shadow cow-2"></i>
                            <i className="fa-solid fa-cow cow-shadow cow-3"></i>
                        </div>
                    </div>
                </div>
            ) : category === 'produce' ? (
                <div className="produce-banner" style={{ background: "linear-gradient(rgba(27, 67, 50, 0.35), rgba(45, 106, 79, 0.35)), url('/produce-hero-bg.png') center/cover no-repeat" }}>
                    <div className="banner-inner">
                        <h2>FARM FRESH PRODUCE</h2>
                        <p>Directly from local Zimbabwean farmers to your table</p>
                        
                        <div className="banner-search">
                            <i className="fa-solid fa-magnifying-glass"></i>
                            <input 
                                type="text" 
                                id="category-search-input" 
                                placeholder="Search tomatoes, maize, bulk bags..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button className="search-btn" id="category-search-btn" onClick={handleSearch}>SEARCH</button>
                        </div>
                    </div>
                </div>
            ) : null}

            <div className={category === 'livestock' ? '' : category === 'produce' ? 'produce-main-content' : `${baseClass}-container`}>
                
                {category !== 'livestock' && category !== 'produce' && (
                    <>
                        <div className="breadcrumb">
                            <Link to="/">Home</Link> / 
                            <span style={category === 'spares' ? { fontWeight: '700' } : { textTransform: 'capitalize' }}>
                                {category === 'spares' ? ' Spares & Accessories' : category === 'equipment' ? ' Equipments' : ` ${title} Listings`}
                            </span>
                        </div>

                        <div className={category === 'machinery' ? "m-page-header" : category === 'spares' ? "s-page-header" : category === 'equipment' ? 'eq-page-header' : "v-page-header"}>
                            <h1 style={{ textTransform: 'uppercase' }}>
                                {category === 'machinery' ? 'HEAVY MACHINERY & CONSTRUCTION' : category === 'spares' ? 'SPARES & ACCESSORIES' : category === 'equipment' ? 'AGRICULTURAL EQUIPMENTS' : `${title} LISTINGS`}
                            </h1>
                            
                            <div className="mobile-controls-row">
                                <div className={category === 'machinery' ? "m-page-search" : category === 'spares' ? "s-page-search" : category === 'equipment' ? 'eq-page-search' : "v-page-search"}>
                                    <input 
                                        type="text" 
                                        placeholder={category === 'spares' ? "Search Part or SKU..." : `Search ${title}...`} 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <i className="fa-solid fa-magnifying-glass" style={{ cursor: 'pointer' }} onClick={handleSearch}></i>
                                </div>
                                
                                {category === 'spares' && (
                                    <button className="filters-dropdown-btn" id="filterBtn" onClick={() => setFilterOpen(!filterOpen)}>
                                        <span id="filterBtnText"><i className="fa-solid fa-filter"></i> Filters</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {category !== 'spares' && category !== 'equipment' && category !== 'produce' && (
                    <div className="mobile-action-bar desktop-hide">
                        <button className="filters-dropdown-btn" onClick={() => setFilterOpen(!filterOpen)}>
                            <span><i className="fa-solid fa-filter"></i> Filters</span>
                        </button>
                        
                        <details className="custom-sort" style={{ flex: 1 }}>
                            <summary style={{ height: '42px', borderRadius: '21px', justifyContent: 'center', gap: '8px' }}>
                                <i className="fa-solid fa-sort"></i> Sort By
                            </summary>
                            <div className="custom-options" style={{ width: '100%' }}>
                                <label><input type="radio" name="sortM" value="newest" checked={sort === 'newest'} onChange={handleSortChange} /> Newest</label>
                                <label><input type="radio" name="sortM" value="lowest" checked={sort === 'low'} onChange={handleSortChange} /> Lowest Price</label>
                                <label><input type="radio" name="sortM" value="highest" checked={sort === 'high'} onChange={handleSortChange} /> Highest Price</label>
                            </div>
                        </details>
                    </div>
                )}

                {category === 'equipment' && (
                    <div className="horizontal-filter-bar" id="filterSidebar">
                        <span className="filter-label">FILTER BY:</span>
                        
                        <div className="hf-selects">
                            <div className="sort-section">
                                <details className="custom-filter">
                                    <summary>{type === 'All Types' ? 'Machine Type' : type} <i className="fa-solid fa-chevron-down"></i></summary>
                                    <div className="custom-options" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                        <label><input type="radio" name="typeEq" value="All Types" checked={type === 'All Types'} onChange={(e) => setType(e.target.value)} /> All Types</label>
                                        <label><input type="radio" name="typeEq" value="Balers" checked={type === 'Balers'} onChange={(e) => setType(e.target.value)} /> Balers</label>
                                        <label><input type="radio" name="typeEq" value="Cranes" checked={type === 'Cranes'} onChange={(e) => setType(e.target.value)} /> Cranes</label>
                                        <label><input type="radio" name="typeEq" value="Cultivators" checked={type === 'Cultivators'} onChange={(e) => setType(e.target.value)} /> Cultivators</label>
                                        <label><input type="radio" name="typeEq" value="Earthmoving" checked={type === 'Earthmoving'} onChange={(e) => setType(e.target.value)} /> Earthmoving</label>
                                        <label><input type="radio" name="typeEq" value="Excavators" checked={type === 'Excavators'} onChange={(e) => setType(e.target.value)} /> Excavators</label>
                                        <label><input type="radio" name="typeEq" value="Tractors" checked={type === 'Tractors'} onChange={(e) => setType(e.target.value)} /> Tractors</label>
                                    </div>
                                </details>
                            </div>
                            
                            <div className="sort-section">
                                <details className="custom-filter">
                                    <summary>{make === 'All Makes' ? 'Brand' : make} <i className="fa-solid fa-chevron-down"></i></summary>
                                    <div className="custom-options" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                        <label><input type="radio" name="makeEq" value="All Makes" checked={make === 'All Makes'} onChange={(e) => setMake(e.target.value)} /> All Brands</label>
                                        <label><input type="radio" name="makeEq" value="Caterpillar" checked={make === 'Caterpillar'} onChange={(e) => setMake(e.target.value)} /> Caterpillar</label>
                                        <label><input type="radio" name="makeEq" value="John Deere" checked={make === 'John Deere'} onChange={(e) => setMake(e.target.value)} /> John Deere</label>
                                        <label><input type="radio" name="makeEq" value="Massey Ferguson" checked={make === 'Massey Ferguson'} onChange={(e) => setMake(e.target.value)} /> Massey Ferguson</label>
                                        <label><input type="radio" name="makeEq" value="New Holland" checked={make === 'New Holland'} onChange={(e) => setMake(e.target.value)} /> New Holland</label>
                                    </div>
                                </details>
                            </div>

                            <div className="sort-section">
                                <details className="custom-filter">
                                    <summary>{condition === 'Any' ? 'Condition' : condition} <i className="fa-solid fa-chevron-down"></i></summary>
                                    <div className="custom-options">
                                        <label><input type="radio" name="condEq" value="Any" checked={condition === 'Any'} onChange={(e) => setCondition(e.target.value)} /> Any Condition</label>
                                        <label><input type="radio" name="condEq" value="New" checked={condition === 'New'} onChange={(e) => setCondition(e.target.value)} /> New</label>
                                        <label><input type="radio" name="condEq" value="Used" checked={condition === 'Used'} onChange={(e) => setCondition(e.target.value)} /> Used</label>
                                    </div>
                                </details>
                            </div>
                            
                            <div className="sort-section">
                                <details className="custom-filter">
                                    <summary>{loc === 'All Provinces' ? 'Location' : loc} <i className="fa-solid fa-chevron-down"></i></summary>
                                    <div className="custom-options" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                        <label><input type="radio" name="locEq" value="All Provinces" checked={loc === 'All Provinces'} onChange={(e) => setLoc(e.target.value)} /> All Locations</label>
                                        <label><input type="radio" name="locEq" value="Harare" checked={loc === 'Harare'} onChange={(e) => setLoc(e.target.value)} /> Harare</label>
                                        <label><input type="radio" name="locEq" value="Bulawayo" checked={loc === 'Bulawayo'} onChange={(e) => setLoc(e.target.value)} /> Bulawayo</label>
                                    </div>
                                </details>
                            </div>

                            <div className="sort-section">
                                <details className="custom-sort">
                                    <summary>Sort By <i className="fa-solid fa-chevron-down"></i></summary>
                                    <div className="custom-options">
                                        <label><input type="radio" name="sortEq" value="newest" checked={sort === 'newest'} onChange={handleSortChange} /> Newest Arrivals</label>
                                        <label><input type="radio" name="sortEq" value="low" checked={sort === 'low'} onChange={handleSortChange} /> Price: Low to High</label>
                                        <label><input type="radio" name="sortEq" value="high" checked={sort === 'high'} onChange={handleSortChange} /> Price: High to Low</label>
                                    </div>
                                </details>
                            </div>
                        </div>
                    </div>
                )}

                {category === 'produce' && (
                    <div className="produce-filter-bar">
                        <div className="sort-section">
                            <details className="custom-filter">
                                <summary><span className="summary-text">{type === 'All Types' ? 'All Produce' : type}</span> <i className="fa-solid fa-chevron-down" style={{ fontSize: '11px', color: '#666', flexShrink: 0 }}></i></summary>
                                <div className="custom-options" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                    <label><input type="radio" name="typeProd" value="All Types" checked={type === 'All Types'} onChange={(e) => setType(e.target.value)} /> All Produce</label>
                                    <label><input type="radio" name="typeProd" value="Apples" checked={type === 'Apples'} onChange={(e) => setType(e.target.value)} /> Apples</label>
                                    <label><input type="radio" name="typeProd" value="Avocados" checked={type === 'Avocados'} onChange={(e) => setType(e.target.value)} /> Avocados</label>
                                    <label><input type="radio" name="typeProd" value="Bananas" checked={type === 'Bananas'} onChange={(e) => setType(e.target.value)} /> Bananas</label>
                                    <label><input type="radio" name="typeProd" value="Cabbage" checked={type === 'Cabbage'} onChange={(e) => setType(e.target.value)} /> Cabbage</label>
                                    <label><input type="radio" name="typeProd" value="Carrots" checked={type === 'Carrots'} onChange={(e) => setType(e.target.value)} /> Carrots</label>
                                    <label><input type="radio" name="typeProd" value="Maize" checked={type === 'Maize'} onChange={(e) => setType(e.target.value)} /> Maize</label>
                                    <label><input type="radio" name="typeProd" value="Onions" checked={type === 'Onions'} onChange={(e) => setType(e.target.value)} /> Onions</label>
                                    <label><input type="radio" name="typeProd" value="Potatoes" checked={type === 'Potatoes'} onChange={(e) => setType(e.target.value)} /> Potatoes</label>
                                    <label><input type="radio" name="typeProd" value="Tomatoes" checked={type === 'Tomatoes'} onChange={(e) => setType(e.target.value)} /> Tomatoes</label>
                                </div>
                            </details>
                        </div>
                        
                        <div className="sort-section">
                            <details className="custom-filter">
                                <summary><span className="summary-text">{loc === 'All Provinces' ? 'All Provinces' : loc}</span> <i className="fa-solid fa-chevron-down" style={{ fontSize: '11px', color: '#666', flexShrink: 0 }}></i></summary>
                                <div className="custom-options" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                    <label><input type="radio" name="locProd" value="All Provinces" checked={loc === 'All Provinces'} onChange={(e) => setLoc(e.target.value)} /> All Locations</label>
                                    <label><input type="radio" name="locProd" value="Harare" checked={loc === 'Harare'} onChange={(e) => setLoc(e.target.value)} /> Harare</label>
                                    <label><input type="radio" name="locProd" value="Bulawayo" checked={loc === 'Bulawayo'} onChange={(e) => setLoc(e.target.value)} /> Bulawayo</label>
                                    <label><input type="radio" name="locProd" value="Manicaland" checked={loc === 'Manicaland'} onChange={(e) => setLoc(e.target.value)} /> Manicaland</label>
                                    <label><input type="radio" name="locProd" value="Mashonaland West" checked={loc === 'Mashonaland West'} onChange={(e) => setLoc(e.target.value)} /> Mashonaland West</label>
                                    <label><input type="radio" name="locProd" value="Masvingo" checked={loc === 'Masvingo'} onChange={(e) => setLoc(e.target.value)} /> Masvingo</label>
                                </div>
                            </details>
                        </div>

                        <div className="sort-section">
                            <details className="custom-sort">
                                <summary><span className="summary-text">Sort By</span> <i className="fa-solid fa-chevron-down" style={{ fontSize: '11px', color: '#666', flexShrink: 0 }}></i></summary>
                                <div className="custom-options">
                                    <label><input type="radio" name="sortProd" value="newest" checked={sort === 'newest'} onChange={handleSortChange} /> Fresh Arrivals</label>
                                    <label><input type="radio" name="sortProd" value="low" checked={sort === 'low'} onChange={handleSortChange} /> Price: Low to High</label>
                                    <label><input type="radio" name="sortProd" value="high" checked={sort === 'high'} onChange={handleSortChange} /> Price: High to Low</label>
                                </div>
                            </details>
                        </div>
                    </div>
                )}

                <div className={category === 'livestock' ? 'livestock-main-content' : category === 'produce' ? '' : `${baseClass}-layout`} style={category === 'livestock' || category === 'produce' ? {} : { position: 'relative' }}>
                    
                    {/* Left Sidebar Filters */}
                    {category === 'livestock' && (
                        <aside className="livestock-sidebar" id="filterSidebar">
                            <div className="sidebar-section">
                                <h4>Category</h4>
                                <details className="custom-filter">
                                    <summary>{type === 'All Types' ? 'All Livestock' : type} <i className="fa-solid fa-chevron-down"></i></summary>
                                    <div className="custom-options" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                        <label><input type="radio" name="typeLs" value="All Types" checked={type === 'All Types'} onChange={(e) => setType(e.target.value)} /> All Livestock</label>
                                        <label><input type="radio" name="typeLs" value="Cattle" checked={type === 'Cattle'} onChange={(e) => setType(e.target.value)} /> Cattle</label>
                                        <label><input type="radio" name="typeLs" value="Goats" checked={type === 'Goats'} onChange={(e) => setType(e.target.value)} /> Goats</label>
                                        <label><input type="radio" name="typeLs" value="Sheep" checked={type === 'Sheep'} onChange={(e) => setType(e.target.value)} /> Sheep</label>
                                        <label><input type="radio" name="typeLs" value="Pigs" checked={type === 'Pigs'} onChange={(e) => setPigs(e.target.value)} /> Pigs</label>
                                        <label><input type="radio" name="typeLs" value="Poultry" checked={type === 'Poultry'} onChange={(e) => setPoultry(e.target.value)} /> Poultry</label>
                                    </div>
                                </details>
                            </div>
                            <div className="sidebar-section">
                                <h4>Breed</h4>
                                <details className="custom-filter">
                                    <summary>{make === 'All Makes' ? 'All Breeds' : make} <i className="fa-solid fa-chevron-down"></i></summary>
                                    <div className="custom-options" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                        <label><input type="radio" name="makeLs" value="All Makes" checked={make === 'All Makes'} onChange={(e) => setMake(e.target.value)} /> All Breeds</label>
                                        <label><input type="radio" name="makeLs" value="Brahman" checked={make === 'Brahman'} onChange={(e) => setBrahman(e.target.value)} /> Brahman</label>
                                        <label><input type="radio" name="makeLs" value="Boer Goat" checked={make === 'Boer Goat'} onChange={(e) => setBoer(e.target.value)} /> Boer Goat</label>
                                    </div>
                                </details>
                            </div>
                            <div className="sidebar-section">
                                <h4>Location</h4>
                                <details className="custom-filter">
                                    <summary>{loc} <i className="fa-solid fa-chevron-down"></i></summary>
                                    <div className="custom-options" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                        <label><input type="radio" name="locLs" value="All Provinces" checked={loc === 'All Provinces'} onChange={(e) => setLoc(e.target.value)} /> All Provinces</label>
                                        <label><input type="radio" name="locLs" value="Harare" checked={loc === 'Harare'} onChange={(e) => setLoc(e.target.value)} /> Harare</label>
                                        <label><input type="radio" name="locLs" value="Bulawayo" checked={loc === 'Bulawayo'} onChange={(e) => setLoc(e.target.value)} /> Bulawayo</label>
                                    </div>
                                </details>
                            </div>
                            <div className="sidebar-section">
                                <h4>Price Range</h4>
                                <div className="range-slider-container">
                                    <input type="range" className="price-slider min-slider" min="0" max="10000" value={minPrice || 0} onChange={(e) => setMinPrice(e.target.value)} />
                                    <input type="range" className="price-slider max-slider" min="0" max="10000" value={maxPrice || 10000} onChange={(e) => setMaxPrice(e.target.value)} />
                                </div>
                                <div className="price-inputs">
                                    <input type="number" placeholder="Min" min="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                                    <input type="number" placeholder="Max" min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                                </div>
                            </div>
                        </aside>
                    )}

                    {category !== 'equipment' && category !== 'livestock' && category !== 'produce' && (
                    <aside className={`filters-sidebar ${filterOpen ? 'show' : ''}`}>
                        <h2 className="sidebar-title">Filter {title}</h2>
                        
                        {/* ======================= */}
                        {/* SPARES SPECIFIC FILTERS */}
                        {/* ======================= */}
                        {category === 'spares' && (
                            <>
                                <div className="sidebar-section">
                                    <h4>Part Category</h4>
                                    <details className="custom-filter">
                                        <summary>{type === 'All Types' ? 'All Categories' : type} <i className="fa-solid fa-chevron-down"></i></summary>
                                        <div className="custom-options">
                                            <label><input type="radio" name="type" value="All Types" checked={type === 'All Types'} onChange={(e) => setType(e.target.value)} /> All Categories</label>
                                            <label><input type="radio" name="type" value="Engine Components" checked={type === 'Engine Components'} onChange={(e) => setType(e.target.value)} /> Engine Components</label>
                                            <label><input type="radio" name="type" value="Brakes & Rotors" checked={type === 'Brakes & Rotors'} onChange={(e) => setType(e.target.value)} /> Brakes & Rotors</label>
                                            <label><input type="radio" name="type" value="Suspension & Steering" checked={type === 'Suspension & Steering'} onChange={(e) => setType(e.target.value)} /> Suspension & Steering</label>
                                            <label><input type="radio" name="type" value="Filters & Fluids" checked={type === 'Filters & Fluids'} onChange={(e) => setType(e.target.value)} /> Filters & Fluids</label>
                                            <label><input type="radio" name="type" value="Body Parts" checked={type === 'Body Parts'} onChange={(e) => setType(e.target.value)} /> Body Parts</label>
                                        </div>
                                    </details>
                                </div>

                                <div className="sidebar-section">
                                    <h4>Condition</h4>
                                    <details className="custom-filter">
                                        <summary>{condition === 'Any' ? 'Any Condition' : condition} <i className="fa-solid fa-chevron-down"></i></summary>
                                        <div className="custom-options">
                                            <label><input type="radio" name="conditionS" value="Any" checked={condition === 'Any'} onChange={(e) => setCondition(e.target.value)} /> Any Condition</label>
                                            <label><input type="radio" name="conditionS" value="Genuine OEM" checked={condition === 'Genuine OEM'} onChange={(e) => setCondition(e.target.value)} /> Genuine OEM</label>
                                            <label><input type="radio" name="conditionS" value="Aftermarket (New)" checked={condition === 'Aftermarket (New)'} onChange={(e) => setCondition(e.target.value)} /> Aftermarket (New)</label>
                                            <label><input type="radio" name="conditionS" value="Refurbished" checked={condition === 'Refurbished'} onChange={(e) => setCondition(e.target.value)} /> Refurbished</label>
                                            <label><input type="radio" name="conditionS" value="Used" checked={condition === 'Used'} onChange={(e) => setCondition(e.target.value)} /> Used</label>
                                        </div>
                                    </details>
                                </div>

                                <div className="sidebar-section">
                                    <h4>Vehicle Type</h4>
                                    <details className="custom-filter">
                                        <summary>{make === 'All Makes' ? 'All Types' : make} <i className="fa-solid fa-chevron-down"></i></summary>
                                        <div className="custom-options">
                                            <label><input type="radio" name="makeS" value="All Makes" checked={make === 'All Makes'} onChange={(e) => setMake(e.target.value)} /> All Types</label>
                                            <label><input type="radio" name="makeS" value="Passenger Cars" checked={make === 'Passenger Cars'} onChange={(e) => setMake(e.target.value)} /> Passenger Cars</label>
                                            <label><input type="radio" name="makeS" value="Commercial Trucks" checked={make === 'Commercial Trucks'} onChange={(e) => setMake(e.target.value)} /> Commercial Trucks</label>
                                            <label><input type="radio" name="makeS" value="Agriculture Tractors" checked={make === 'Agriculture Tractors'} onChange={(e) => setMake(e.target.value)} /> Agriculture Tractors</label>
                                        </div>
                                    </details>
                                </div>
                            </>
                        )}

                        {/* ======================= */}
                        {/* VEHICLES SPECIFIC FILTERS */}
                        {/* ======================= */}
                        {category === 'vehicles' && (
                            <>
                                <div className="filter-group">
                                    <label>Make</label>
                                    <details className="custom-filter">
                                        <summary>{make} <i className="fa-solid fa-chevron-down"></i></summary>
                                        <div className="custom-options" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                            <label><input type="radio" name="make" value="All Makes" checked={make === 'All Makes'} onChange={(e) => setMake(e.target.value)} /> All Makes</label>
                                            <label><input type="radio" name="make" value="Toyota" checked={make === 'Toyota'} onChange={(e) => setMake(e.target.value)} /> Toyota</label>
                                            <label><input type="radio" name="make" value="Honda" checked={make === 'Honda'} onChange={(e) => setMake(e.target.value)} /> Honda</label>
                                            <label><input type="radio" name="make" value="Nissan" checked={make === 'Nissan'} onChange={(e) => setMake(e.target.value)} /> Nissan</label>
                                            <label><input type="radio" name="make" value="Ford" checked={make === 'Ford'} onChange={(e) => setMake(e.target.value)} /> Ford</label>
                                            <label><input type="radio" name="make" value="Isuzu" checked={make === 'Isuzu'} onChange={(e) => setMake(e.target.value)} /> Isuzu</label>
                                            <label><input type="radio" name="make" value="Mazda" checked={make === 'Mazda'} onChange={(e) => setMake(e.target.value)} /> Mazda</label>
                                            <label><input type="radio" name="make" value="Mercedes-Benz" checked={make === 'Mercedes-Benz'} onChange={(e) => setMercedesBenz(e.target.value)} /> Mercedes-Benz</label>
                                        </div>
                                    </details>
                                </div>

                                <div className="filter-group">
                                    <label>Model</label>
                                    <details className="custom-filter">
                                        <summary>{model} <i className="fa-solid fa-chevron-down"></i></summary>
                                        <div className="custom-options" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                            <label><input type="radio" name="model" value="All Models" checked={model === 'All Models'} onChange={(e) => setModel(e.target.value)} /> All Models</label>
                                            <label><input type="radio" name="model" value="Hilux" checked={model === 'Hilux'} onChange={(e) => setModel(e.target.value)} /> Hilux</label>
                                            <label><input type="radio" name="model" value="Corolla" checked={model === 'Corolla'} onChange={(e) => setModel(e.target.value)} /> Corolla</label>
                                            <label><input type="radio" name="model" value="Ranger" checked={model === 'Ranger'} onChange={(e) => setModel(e.target.value)} /> Ranger</label>
                                            <label><input type="radio" name="model" value="Fit" checked={model === 'Fit'} onChange={(e) => setModel(e.target.value)} /> Fit</label>
                                        </div>
                                    </details>
                                </div>
                                
                                <div className="checkbox-group">
                                    <label><input type="radio" name="transmission" value="Any" checked={transmission === 'Any'} onChange={(e) => setTransmission(e.target.value)} /> Any Transmission</label>
                                    <label><input type="radio" name="transmission" value="Automatic" checked={transmission === 'Automatic'} onChange={(e) => setTransmission(e.target.value)} /> Automatic</label>
                                    <label><input type="radio" name="transmission" value="Manual" checked={transmission === 'Manual'} onChange={(e) => setTransmission(e.target.value)} /> Manual</label>
                                </div>
                            </>
                        )}

                        {/* ======================= */}
                        {/* MACHINERY SPECIFIC FILTERS */}
                        {/* ======================= */}
                        {category === 'machinery' && (
                            <>
                                <div className="filter-group">
                                    <label>Category</label>
                                    <details className="custom-filter">
                                        <summary>{type} <i className="fa-solid fa-chevron-down"></i></summary>
                                        <div className="custom-options" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                            {['All Types', 'Balers', 'Cranes', 'Cultivators', 'Earthmoving', 'Excavators', 'Forklifts', 'Generators', 'Graders', 'Harvesters', 'Loaders', 'Planters', 'Rollers', 'Seeders', 'Sprayers', 'Tillage Equipment', 'Tractors'].map(t => (
                                                <label key={t}><input type="radio" name="type" value={t} checked={type === t} onChange={(e) => setType(e.target.value)} /> {t}</label>
                                            ))}
                                        </div>
                                    </details>
                                </div>

                                <div className="filter-group">
                                    <label>Make</label>
                                    <details className="custom-filter">
                                        <summary>{make} <i className="fa-solid fa-chevron-down"></i></summary>
                                        <div className="custom-options" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                            {['All Makes', 'Bobcat', 'Case IH', 'Caterpillar', 'Claas', 'Deutz-Fahr', 'Hitachi', 'JCB', 'John Deere', 'Komatsu', 'Kubota', 'Mahindra', 'Massey Ferguson', 'New Holland', 'Valtra', 'Volvo'].map(m => (
                                                <label key={m}><input type="radio" name="make" value={m} checked={make === m} onChange={(e) => setMake(e.target.value)} /> {m}</label>
                                            ))}
                                        </div>
                                    </details>
                                </div>
                            </>
                        )}

                        {/* Condition Filter (Global for Vehicles/Machinery/Parts) */}
                        {['vehicles', 'machinery', 'spares', 'equipment'].includes(category) && (
                            <div className="checkbox-group">
                                <label><input type="radio" name="condition" value="Any" checked={condition === 'Any'} onChange={(e) => setCondition(e.target.value)} /> Any</label>
                                <label><input type="radio" name="condition" value="New" checked={condition === 'New'} onChange={(e) => setCondition(e.target.value)} /> New</label>
                                <label><input type="radio" name="condition" value="Used" checked={condition === 'Used'} onChange={(e) => setCondition(e.target.value)} /> Used</label>
                            </div>
                        )}

                        {/* Price Filter (Global) */}
                        <div className="filter-group">
                            <label>Price Range</label>
                            <div className="range-slider-container">
                                <input type="range" className="price-slider min-slider" min="0" max="500000" value={minPrice || 0} onChange={(e) => setMinPrice(e.target.value)} />
                                <input type="range" className="price-slider max-slider" min="0" max="500000" value={maxPrice || 500000} onChange={(e) => setMaxPrice(e.target.value)} />
                            </div>
                            <div className="price-inputs">
                                <input type="number" placeholder="Min" min="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                                <input type="number" placeholder="Max" min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                            </div>
                        </div>

                        {/* Province Filter (Global - Moved to bottom) */}
                        <div className="filter-group">
                            <label>Location</label>
                            <details className="custom-filter">
                                <summary>{loc} <i className="fa-solid fa-chevron-down"></i></summary>
                                <div className="custom-options" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                    <label><input type="radio" name="loc" value="All Provinces" checked={loc === 'All Provinces'} onChange={(e) => setLoc(e.target.value)} /> All Provinces</label>
                                    <label><input type="radio" name="loc" value="Harare" checked={loc === 'Harare'} onChange={(e) => setLoc(e.target.value)} /> Harare</label>
                                    <label><input type="radio" name="loc" value="Bulawayo" checked={loc === 'Bulawayo'} onChange={(e) => setLoc(e.target.value)} /> Bulawayo</label>
                                    <label><input type="radio" name="loc" value="Mutare" checked={loc === 'Mutare'} onChange={(e) => setLoc(e.target.value)} /> Mutare</label>
                                    <label><input type="radio" name="loc" value="Mashonaland Central" checked={loc === 'Mashonaland Central'} onChange={(e) => setLoc(e.target.value)} /> Mashonaland Central</label>
                                    <label><input type="radio" name="loc" value="Mashonaland East" checked={loc === 'Mashonaland East'} onChange={(e) => setLoc(e.target.value)} /> Mashonaland East</label>
                                    <label><input type="radio" name="loc" value="Mashonaland West" checked={loc === 'Mashonaland West'} onChange={(e) => setLoc(e.target.value)} /> Mashonaland West</label>
                                    <label><input type="radio" name="loc" value="Masvingo" checked={loc === 'Masvingo'} onChange={(e) => setLoc(e.target.value)} /> Masvingo</label>
                                    <label><input type="radio" name="loc" value="Matabeleland North" checked={loc === 'Matabeleland North'} onChange={(e) => setLoc(e.target.value)} /> Matabeleland North</label>
                                    <label><input type="radio" name="loc" value="Matabeleland South" checked={loc === 'Matabeleland South'} onChange={(e) => setLoc(e.target.value)} /> Matabeleland South</label>
                                    <label><input type="radio" name="loc" value="Midlands" checked={loc === 'Midlands'} onChange={(e) => setLoc(e.target.value)} /> Midlands</label>
                                </div>
                            </details>
                        </div>

                        <button className="post-ad-btn" style={{ width: '100%', marginTop: '15px', textAlign: 'center', border: 'none', cursor: 'pointer' }} onClick={handleApplyFilters}>Apply Filters</button>
                    </aside>
                    )}

                    {/* Right Side Content Grid */}
                    <section className={category === 'livestock' ? 'livestock-right-column' : category === 'produce' ? 'produce-grid-wrapper' : `${baseClass}-main`}>
                        
                        {/* Highlight Card (Disabled for Machinery/Spares/Equipment/Livestock/Produce to match grid layouts) */}
                        {highlightItem && category !== 'machinery' && category !== 'spares' && category !== 'equipment' && category !== 'livestock' && category !== 'produce' && (
                            <div className="highlight-card desktop-only-card" style={{ display: 'flex', marginBottom: '30px' }}>
                                <div className="highlight-image">
                                    <span className="badge">Featured</span>
                                    <Link to={`/product/${highlightItem.id}`}>
                                        <img 
                                            src={(highlightItem.images && highlightItem.images.length > 0) ? highlightItem.images[0] : (category === 'vehicles' ? '/hilux.jpg' : '/tractor.jpg')} 
                                            alt={highlightItem.title} 
                                        />
                                    </Link>
                                </div>
                                <div className="highlight-details">
                                    <div className="highlight-header">
                                        <h3><Link to={`/product/${highlightItem.id}`}>{highlightItem.title}</Link></h3>
                                        <button className="favorite-btn"><i className="fa-regular fa-heart"></i></button>
                                    </div>
                                    <p className="highlight-price">
                                        <strong>{new Intl.NumberFormat('en-US', { style: 'currency', currency: highlightItem.currency || 'USD' }).format(highlightItem.price)}</strong>
                                    </p>
                                    <p className="highlight-desc">
                                        {highlightItem.description ? (highlightItem.description.substring(0, 150) + '...') : 'Premium featured listing.'}
                                    </p>
                                    <div className="highlight-actions">
                                        <Link to={`/product/${highlightItem.id}`} className="btn-gold">View Details</Link>
                                        <Link to={`/product/${highlightItem.id}`} className="btn-green">Contact Seller</Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        {category !== 'equipment' && category !== 'livestock' && category !== 'produce' && (
                        <div className="desktop-controls-row sorting-row">
                            {category !== 'spares' ? (
                                <div className="desktop-search-wrapper v-page-search" style={{ margin: 0, width: '300px' }}>
                                    <input 
                                        type="text" 
                                        placeholder={`Search ${title}...`} 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        style={{ border: 'none', outline: 'none', flex: 1, padding: '10px' }}
                                    />
                                    <i className="fa-solid fa-magnifying-glass" style={{ padding: '0 15px', color: '#666', cursor: 'pointer' }} onClick={handleSearch}></i>
                                </div>
                            ) : (
                                <div style={{ flex: 1 }}></div>
                            )}
                            
                            <div className="desktop-sort-wrapper sort-options" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                                <label style={{ marginRight: '10px', color: '#666', fontWeight: 600 }}>Sorted By:</label>
                                <details className="custom-sort">
                                    <summary style={{ backgroundColor: '#fff', border: '1px solid #ddd', padding: '10px 20px', borderRadius: '21px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                                        {sort === 'newest' ? 'Newest' : sort === 'lowest' ? 'Lowest Price' : 'Highest Price'} <i className="fa-solid fa-chevron-down"></i>
                                    </summary>
                                    <div className="custom-options" style={{ width: '160px', right: 0, left: 'auto' }}>
                                        <label><input type="radio" name="sort" value="newest" checked={sort === 'newest'} onChange={handleSortChange} /> Newest</label>
                                        <label><input type="radio" name="sort" value="lowest" checked={sort === 'lowest'} onChange={handleSortChange} /> Lowest Price</label>
                                        <label><input type="radio" name="sort" value="highest" checked={sort === 'highest'} onChange={handleSortChange} /> Highest Price</label>
                                    </div>
                                </details>
                            </div>
                        </div>
                        )}

                        <div className={category === 'equipment' ? 'eq-grid' : category === 'livestock' ? 'livestock-grid' : category === 'produce' ? 'masonry-grid' : `${baseClass}-grid`} style={{ minHeight: '300px' }}>
                            {loading && page === 1 ? (
                                <div style={{ width: '100%', textAlign: 'center', padding: '40px', color: '#666', gridColumn: '1 / -1' }}>
                                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', marginBottom: '10px' }}></i>
                                    <p>Loading listings...</p>
                                </div>
                            ) : listings.length > 0 ? (
                                listings.map(listing => (
                                    <ProductCard key={listing.id} listing={listing} />
                                ))
                            ) : (
                                <div style={{ width: '100%', textAlign: 'center', padding: '40px', color: '#666', gridColumn: '1 / -1' }}>
                                    <i className="fa-solid fa-inbox" style={{ fontSize: '24px', marginBottom: '10px' }}></i>
                                    <p>No listings found for this criteria.</p>
                                </div>
                            )}
                        </div>
                        
                        {/* Observer Target for Infinite Scroll */}
                        <div ref={observerTarget} style={{ height: '20px', width: '100%' }}></div>
                        
                        {isFetchingMore && (
                            <div style={{ width: '100%', textAlign: 'center', padding: '20px', color: '#666' }}>
                                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '20px', marginBottom: '10px' }}></i>
                                <p>Loading more...</p>
                            </div>
                        )}
                        
                        {!loading && !isFetchingMore && hasMore && listings.length >= 60 && (
                            <div style={{ textAlign: 'center', marginTop: '10px', width: '100%' }}>
                                <button 
                                    onClick={() => { setPage(p => p + 1); setTimeout(() => fetchListings(false), 0); }}
                                    className="btn-gold"
                                    style={{ padding: '12px 30px', fontSize: '15px', border: 'none', cursor: 'pointer' }}
                                >
                                    Load More
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
};

export default CategoryPage;
