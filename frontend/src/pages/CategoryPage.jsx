import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import '../assets/css/machinery.css'; // Just reuse machinery CSS for the layout

const CategoryPage = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const category = queryParams.get('category') || 'vehicles';
    
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/products?category=${category}&limit=50`);
                if (!res.ok) throw new Error('Failed to fetch listings');
                const data = await res.json();
                setListings(data.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, [category]);

    const titleMap = {
        vehicles: 'VEHICLES & CARS',
        machinery: 'HEAVY MACHINERY & CONSTRUCTION',
        spares: 'SPARES & PARTS',
        equipment: 'FARMING EQUIPMENT',
        livestock: 'LIVESTOCK',
        produce: 'CROP & PRODUCE'
    };

    const title = titleMap[category] || 'LISTINGS';

    return (
        <main className="machinery-page">
            <div className="machinery-container">
                <div className="breadcrumb">
                    <Link to="/">Home</Link> / <span>{title}</span>
                </div>

                <div className="m-page-header">
                    <h1>{title}</h1>
                    <div className="mobile-controls-row">
                        <div className="m-page-search">
                            <input type="text" placeholder={`Search ${category}...`} />
                            <i className="fa-solid fa-magnifying-glass" style={{ cursor: 'pointer' }}></i>
                        </div>
                    </div>
                </div>

                <div className="machinery-layout" style={{ position: 'relative' }}>
                    {/* Sidebar Placeholder */}
                    <aside className="filters-sidebar">
                        <h2 className="sidebar-title">Filters</h2>
                        <div className="filter-group">
                            <p style={{ color: '#666', fontSize: '13px' }}>Advanced filtering coming soon...</p>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="machinery-main">
                        <div className="results-header">
                            <span className="results-count">Showing {listings.length} results for {title}</span>
                        </div>
                        
                        <div className="machinery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                            {loading ? (
                                <p style={{ gridColumn: '1/-1', textAlign: 'center' }}>Loading {category}...</p>
                            ) : error ? (
                                <p style={{ gridColumn: '1/-1', color: 'red', textAlign: 'center' }}>{error}</p>
                            ) : listings.length > 0 ? (
                                listings.map(listing => (
                                    <ProductCard key={listing.id} listing={listing} cardType={listing.category} />
                                ))
                            ) : (
                                <p style={{ gridColumn: '1/-1', textAlign: 'center' }}>No {category} found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default CategoryPage;
