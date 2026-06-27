import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/admin.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activePanel, setActivePanel] = useState('dashboard-panel');
    const [users, setUsers] = useState([]);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkAdminAndFetchData = async () => {
            const token = localStorage.getItem('zaa_token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const [usersRes, listingsRes] = await Promise.all([
                    fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch('/api/admin/listings', { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                if (!usersRes.ok || !listingsRes.ok) {
                    throw new Error('Access denied or failed to fetch data');
                }

                const usersData = await usersRes.json();
                const listingsData = await listingsRes.json();

                setUsers(usersData);
                setListings(listingsData);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError(err.message);
                setLoading(false);
            }
        };

        checkAdminAndFetchData();
    }, [navigate]);

    const handleVerifyUser = async (userId, currentStatus) => {
        const token = localStorage.getItem('zaa_token');
        try {
            const res = await fetch(`/api/admin/users/${userId}/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ is_verified: !currentStatus })
            });
            if (res.ok) {
                setUsers(users.map(u => u.id === userId ? { ...u, is_verified: !currentStatus } : u));
            }
        } catch (err) {
            console.error('Failed to verify user', err);
        }
    };

    const handleDeleteListing = async (listingId) => {
        if (!window.confirm('Are you sure you want to delete this listing?')) return;
        const token = localStorage.getItem('zaa_token');
        try {
            const res = await fetch(`/api/admin/listings/${listingId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setListings(listings.filter(l => l.id !== listingId));
            }
        } catch (err) {
            console.error('Failed to delete listing', err);
        }
    };

    if (error) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <h2>Access Denied</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/')} className="glass-btn" style={{ marginTop: '20px' }}>Go Home</button>
            </div>
        );
    }

    if (loading) {
        return <div style={{ padding: '50px', textAlign: 'center' }}><i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px' }}></i></div>;
    }

    const pendingVerifications = users.filter(u => !u.is_verified);
    const activeListingsCount = listings.length;

    return (
        <div className="admin-layout" style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#0f172a' }}>
            {/* Background Orbs for Glassmorphism */}
            <div className="bg-orb orb-1"></div>
            <div className="bg-orb orb-2"></div>
            <div className="bg-orb orb-3"></div>

            <div className="admin-layout">
                {/* LEFT SIDEBAR */}
                <aside className="glass-sidebar">
                    <div className="sidebar-brand">
                        <img src="/logo.png" alt="Logo" className="brand-logo" />
                        <h2>ZIM AUTOAGRI</h2>
                    </div>

                    <nav className="sidebar-nav">
                        <a href="#" className={`nav-item ${activePanel === 'dashboard-panel' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActivePanel('dashboard-panel'); }}>
                            <i className="fa-solid fa-grid-2"></i> Dashboard
                        </a>
                        <a href="#" className={`nav-item ${activePanel === 'users-panel' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActivePanel('users-panel'); }}>
                            <i className="fa-solid fa-users"></i> Users
                        </a>
                        <a href="#" className={`nav-item ${activePanel === 'verification-panel' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActivePanel('verification-panel'); }}>
                            <i className="fa-solid fa-shield-check"></i> Verification
                        </a>
                        <a href="#" className={`nav-item ${activePanel === 'listings-panel' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActivePanel('listings-panel'); }}>
                            <i className="fa-solid fa-layer-group"></i> Listings
                        </a>
                        <a href="#" className={`nav-item ${activePanel === 'payments-panel' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActivePanel('payments-panel'); }}>
                            <i className="fa-solid fa-credit-card"></i> Payments
                        </a>
                        <a href="#" className={`nav-item ${activePanel === 'analytics-panel' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActivePanel('analytics-panel'); }}>
                            <i className="fa-solid fa-chart-mixed"></i> Analytics
                        </a>
                        <a href="#" className={`nav-item ${activePanel === 'settings-panel' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActivePanel('settings-panel'); }}>
                            <i className="fa-solid fa-gear"></i> Settings
                        </a>
                    </nav>

                    {/* Admin Profile at Bottom */}
                    <div className="sidebar-profile">
                        <img src="/avatar.jpeg" alt="Admin" className="profile-avatar" onError={(e) => e.target.src='https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff&size=40'} />
                        <div className="profile-info">
                            <span className="profile-name">Admin</span>
                            <span className="profile-role">Super Admin</span>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT AREA */}
                <main className="glass-main" style={{ overflowY: 'auto', maxHeight: '100vh' }}>
                    {/* TOP BAR */}
                    <header className="top-bar">
                        <div className="top-bar-left">
                            <h1>Admin // <span className="secret-text">SECRET DASHBOARD</span></h1>
                            <p className="top-bar-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <div className="top-bar-right">
                            <div className="search-box">
                                <i className="fa-solid fa-magnifying-glass"></i>
                                <input type="text" placeholder="Search" id="global-search" />
                            </div>
                            <button className="icon-btn" onClick={() => navigate('/')} title="Back to Main Site"><i className="fa-solid fa-home"></i></button>
                            <button className="icon-btn"><i className="fa-regular fa-user"></i></button>
                        </div>
                    </header>

                    {/* DASHBOARD PANEL */}
                    {activePanel === 'dashboard-panel' && (
                        <section id="dashboard-panel" className="panel-section active">
                            <div className="dashboard-grid-top">
                                <div className="stats-row">
                                    <div className="glass-card stat-card">
                                        <div className="stat-header">
                                            <span>Total Active Users</span>
                                            <i className="fa-solid fa-user-group stat-icon-sm"></i>
                                        </div>
                                        <p className="stat-number">{users.length}</p>
                                        <span className="stat-sub">Total <span className="stat-change positive">+0%</span></span>
                                    </div>
                                    <div className="glass-card stat-card">
                                        <div className="stat-header">
                                            <span>Verification Queue</span>
                                            <i className="fa-regular fa-clock stat-icon-sm"></i>
                                        </div>
                                        <p className="stat-number">{pendingVerifications.length}</p>
                                        <span className="stat-sub">Pending <span className="stat-change negative">0%</span></span>
                                    </div>
                                    <div className="glass-card stat-card">
                                        <div className="stat-header">
                                            <span>New Listings</span>
                                            <i className="fa-regular fa-calendar stat-icon-sm"></i>
                                        </div>
                                        <p className="stat-number">{activeListingsCount}</p>
                                        <span className="stat-sub">Total <span className="stat-change positive">+0%</span></span>
                                    </div>
                                </div>

                                <div className="glass-card marketplace-overview">
                                    <div className="card-header-row">
                                        <div>
                                            <h3>Marketplace Listings Overview</h3>
                                            <p className="sub-text">Live feed of recent listings</p>
                                        </div>
                                        <button className="dots-btn"><i className="fa-solid fa-ellipsis"></i></button>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="mini-table">
                                            <thead>
                                                <tr>
                                                    <th>Item Name</th>
                                                    <th>Category</th>
                                                    <th>Price</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {listings.slice(0, 5).map(l => (
                                                    <tr key={l.id}>
                                                        <td>{l.title}</td>
                                                        <td style={{ textTransform: 'capitalize' }}>{l.category}</td>
                                                        <td>${parseFloat(l.price).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* USERS PANEL */}
                    {activePanel === 'users-panel' && (
                        <section id="users-panel" className="panel-section active">
                            <div className="glass-card full-width-card">
                                <div className="card-header-row">
                                    <h3>All Registered Users</h3>
                                </div>
                                <div className="table-responsive">
                                    <table className="glass-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Province</th>
                                                <th>Status</th>
                                                <th>Joined</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(u => (
                                                <tr key={u.id}>
                                                    <td>#{u.id}</td>
                                                    <td>{u.full_name}</td>
                                                    <td>{u.email}</td>
                                                    <td>{u.province || 'N/A'}</td>
                                                    <td>
                                                        {u.is_verified ? 
                                                            <span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>Verified</span> : 
                                                            <span style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>Pending</span>}
                                                    </td>
                                                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                                    <td>
                                                        <button className="glass-btn" onClick={() => handleVerifyUser(u.id, u.is_verified)}>
                                                            {u.is_verified ? 'Revoke' : 'Verify'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* VERIFICATION PANEL */}
                    {activePanel === 'verification-panel' && (
                        <section id="verification-panel" className="panel-section active">
                            <div className="glass-card full-width-card">
                                <div className="card-header-row">
                                    <h3>Pending Verification Requests</h3>
                                </div>
                                <div className="table-responsive">
                                    <table className="glass-table">
                                        <thead>
                                            <tr>
                                                <th>Request ID</th>
                                                <th>User Name</th>
                                                <th>Email</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingVerifications.length === 0 ? (
                                                <tr><td colSpan="5" style={{ textAlign: 'center' }}>No pending verifications.</td></tr>
                                            ) : (
                                                pendingVerifications.map(u => (
                                                    <tr key={u.id}>
                                                        <td>#{u.id}</td>
                                                        <td>{u.full_name}</td>
                                                        <td>{u.email}</td>
                                                        <td><span style={{ color: 'var(--accent-gold)' }}>Pending Review</span></td>
                                                        <td>
                                                            <button className="glass-btn" onClick={() => handleVerifyUser(u.id, u.is_verified)}>
                                                                Approve Verification
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* LISTINGS PANEL */}
                    {activePanel === 'listings-panel' && (
                        <section id="listings-panel" className="panel-section active">
                            <div className="glass-card full-width-card">
                                <div className="card-header-row">
                                    <h3>All Marketplace Listings</h3>
                                </div>
                                <div className="table-responsive">
                                    <table className="glass-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Title</th>
                                                <th>Category</th>
                                                <th>Seller</th>
                                                <th>Price</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {listings.map(l => (
                                                <tr key={l.id}>
                                                    <td>#{l.id}</td>
                                                    <td>{l.title}</td>
                                                    <td style={{ textTransform: 'capitalize' }}>{l.category}</td>
                                                    <td>{l.seller_name || `User #${l.user_id}`}</td>
                                                    <td>${parseFloat(l.price).toLocaleString()}</td>
                                                    <td>
                                                        <button className="glass-btn" style={{ color: 'var(--accent-red)', borderColor: 'var(--accent-red)' }} onClick={() => handleDeleteListing(l.id)}>
                                                            <i className="fa-solid fa-trash"></i> Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    )}
                    
                    {/* PLACEHOLDER PANELS */}
                    {activePanel === 'payments-panel' && (
                        <section className="panel-section active">
                            <div className="glass-card full-width-card" style={{ textAlign: 'center', padding: '4rem' }}>
                                <i className="fa-solid fa-credit-card" style={{ fontSize: '3rem', color: 'var(--accent-blue)', marginBottom: '1rem' }}></i>
                                <h3>Payments Module</h3>
                                <p className="sub-text">Coming soon — EcoCash, Innbucks, Visa integrations</p>
                            </div>
                        </section>
                    )}
                    
                    {activePanel === 'analytics-panel' && (
                        <section className="panel-section active">
                            <div className="glass-card full-width-card" style={{ textAlign: 'center', padding: '4rem' }}>
                                <i className="fa-solid fa-chart-line" style={{ fontSize: '3rem', color: 'var(--accent-green)', marginBottom: '1rem' }}></i>
                                <h3>Analytics Engine</h3>
                                <p className="sub-text">Traffic, conversion, and revenue analytics coming soon</p>
                            </div>
                        </section>
                    )}
                    
                    {activePanel === 'settings-panel' && (
                        <section className="panel-section active">
                            <div className="glass-card full-width-card" style={{ textAlign: 'center', padding: '4rem' }}>
                                <i className="fa-solid fa-gear" style={{ fontSize: '3rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}></i>
                                <h3>Platform Settings</h3>
                                <p className="sub-text">Site configuration, admin management, and security settings</p>
                            </div>
                        </section>
                    )}

                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
