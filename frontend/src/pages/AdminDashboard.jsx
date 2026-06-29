import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/admin.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activePanel, setActivePanel] = useState('dashboard');
    const [stats, setStats] = useState({ totalUsers: 0, totalListings: 0, activeListings: 0 });
    const [users, setUsers] = useState([]);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Authenticate admin (in a real app, verify admin role via token)
        const token = localStorage.getItem('zaa_token');
        const userJson = localStorage.getItem('zaa_user');
        if (!token || !userJson) {
            navigate('/login?redirect=/admin', { replace: true });
            return;
        }

        try {
            const parsedUser = JSON.parse(userJson);
            // Example: if (parsedUser.email !== 'admin@zimautoagri.com') navigate('/');
        } catch (e) {
            navigate('/login?redirect=/admin', { replace: true });
            return;
        }

        fetchDashboardData();
    }, [navigate]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('zaa_token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [usersRes, listingsRes, statsRes] = await Promise.all([
                fetch('/api/admin/users', { headers }),
                fetch('/api/admin/listings', { headers }),
                fetch('/api/admin/stats', { headers })
            ]);
            
            if (usersRes.ok && listingsRes.ok && statsRes.ok) {
                const usersData = await usersRes.json();
                const listingsData = await listingsRes.json();
                const statsData = await statsRes.json();
                
                setUsers(usersData);
                setListings(listingsData);
                setStats({
                    totalUsers: usersData.length,
                    totalListings: listingsData.length,
                    activeListings: listingsData.length, // Assuming all are active for now
                    ...statsData // Spread real backend stats (total_traffic, categories, etc)
                });
            } else {
                setError('Failed to fetch admin data.');
            }
        } catch (err) {
            console.error(err);
            setError('Network error loading admin data.');
        } finally {
            setLoading(false);
        }
    };

    const toggleVerification = async (userId) => {
        try {
            const token = localStorage.getItem('zaa_token');
            const res = await fetch(`/api/admin/users/${userId}/verify`, { 
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchDashboardData();
            }
        } catch (err) {
            console.error('Error toggling verification', err);
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            const token = localStorage.getItem('zaa_token');
            const res = await fetch(`/api/admin/users/${userId}`, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchDashboardData();
            }
        } catch (err) {
            console.error('Error deleting user', err);
        }
    };
    
    const deleteListing = async (listingId) => {
        if (!window.confirm("Are you sure you want to delete this listing?")) return;
        try {
            const token = localStorage.getItem('zaa_token');
            const res = await fetch(`/api/admin/listings/${listingId}`, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchDashboardData();
            }
        } catch (err) {
            console.error('Error deleting listing', err);
        }
    };

    const toggleFeatureListing = async (listingId) => {
        try {
            const token = localStorage.getItem('zaa_token');
            const res = await fetch(`/api/admin/listings/${listingId}/feature`, { 
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchDashboardData();
            }
        } catch (err) {
            console.error('Error toggling feature status', err);
        }
    };


    // Calculate current datetime string
    const now = new Date();
    const dateString = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    if (loading) {
        return (
            <div className="admin-wrapper" style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0a0e1a' }}>
                <h2 style={{ color: 'white' }}><i className="fa-solid fa-spinner fa-spin"></i> Loading Secure Admin Data...</h2>
            </div>
        );
    }

    return (
        <div className="admin-wrapper">
            <div className="admin-layout">
                
                {/* LEFT SIDEBAR */}
                <aside className="glass-sidebar">
                    <div className="sidebar-brand">
                        <img src="/logo.png" alt="Logo" className="brand-logo" />
                        <h2>ZIM AUTOAGRI</h2>
                    </div>

                    <nav className="sidebar-nav">
                        <a href="#" className={`nav-item ${activePanel === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActivePanel('dashboard'); }}>
                            <i className="fa-solid fa-grid-2"></i> Dashboard
                        </a>
                        <a href="#" className={`nav-item ${activePanel === 'users' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActivePanel('users'); }}>
                            <i className="fa-solid fa-users"></i> Users
                        </a>
                        <a href="#" className={`nav-item ${activePanel === 'verification' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActivePanel('verification'); }}>
                            <i className="fa-solid fa-shield-check"></i> Verification
                        </a>
                        <a href="#" className={`nav-item ${activePanel === 'listings' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActivePanel('listings'); }}>
                            <i className="fa-solid fa-layer-group"></i> Listings
                        </a>
                        <a href="#" className="nav-item">
                            <i className="fa-solid fa-credit-card"></i> Payments
                        </a>
                        <a href="#" className={`nav-item ${activePanel === 'analytics' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActivePanel('analytics'); }}>
                            <i className="fa-solid fa-chart-mixed"></i> Analytics
                        </a>
                        <a href="#" className="nav-item" onClick={(e) => { 
                            e.preventDefault(); 
                            localStorage.removeItem('zaa_token');
                            localStorage.removeItem('zaa_user');
                            window.location.href = '/'; 
                        }}>
                            <i className="fa-solid fa-right-from-bracket"></i> Exit Admin
                        </a>
                    </nav>

                    <div className="sidebar-profile">
                        <img src="/avatar.jpeg" alt="Admin" className="profile-avatar" onError={(e) => { e.target.onerror = null; e.target.src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff&size=40" }} />
                        <div className="profile-info">
                            <span className="profile-name">Admin</span>
                            <span className="profile-role">Super Admin</span>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT AREA */}
                <main className="glass-main">
                    
                    {/* TOP BAR */}
                    <header className="top-bar">
                        <div className="top-bar-left">
                            <p className="breadcrumb">Pages / Dashboard</p>
                            <h1>Overview</h1>
                        </div>
                        <div className="top-bar-right">
                            <div className="search-box">
                                <i className="fa-solid fa-magnifying-glass"></i>
                                <input type="text" placeholder="Search..." />
                            </div>
                            <button className="icon-btn"><i className="fa-regular fa-bell"></i></button>
                            <img src="/avatar.jpeg" alt="Admin" className="header-avatar" onError={(e) => { e.target.onerror = null; e.target.src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff&size=40" }} />
                        </div>
                    </header>

                    {error && <div style={{ background: '#ef4444', color: 'white', padding: '1rem', borderRadius: '8px' }}>{error}</div>}

                    {/* DASHBOARD PANEL */}
                    <section className={`panel-section ${activePanel === 'dashboard' ? 'active' : ''}`}>
                        
                        <h2 className="section-title">Top Metrics</h2>
                        <div className="stats-row">
                            <div className="glass-card stat-card">
                                <span className="stat-label">Total Users</span>
                                <p className="stat-number">{stats.totalUsers}</p>
                                <div className="stat-change positive">
                                    <i className="fa-solid fa-arrow-trend-up"></i> +12.4% <span className="stat-vs">vs last mo.</span>
                                </div>
                            </div>
                            <div className="glass-card stat-card">
                                <span className="stat-label">New Listings</span>
                                <p className="stat-number">{stats.totalListings}</p>
                                <div className="stat-change positive">
                                    <i className="fa-solid fa-arrow-trend-up"></i> +8.1%
                                </div>
                            </div>
                            <div className="glass-card stat-card">
                                <span className="stat-label">Total Active Listings</span>
                                <p className="stat-number">{stats.activeListings || stats.totalListings}</p>
                                <div className="stat-change positive">
                                    <i className="fa-solid fa-arrow-trend-up"></i> +5.2%
                                </div>
                            </div>
                            <div className="glass-card stat-card">
                                <span className="stat-label">Pending Verifications</span>
                                <p className="stat-number">{users.filter(u => !u.is_verified).length}</p>
                                <div className="stat-change negative">
                                    <i className="fa-solid fa-arrow-trend-down"></i> Requires Action
                                </div>
                            </div>
                        </div>

                        <div className="main-split-grid">
                            
                            {/* LEFT COLUMN: Chart + Table */}
                            <div className="left-column">
                                <div className="glass-card" style={{ padding: '1.5rem 1.5rem 2rem 1.5rem' }}>
                                    <div className="card-header-row" style={{ marginBottom: '2rem' }}>
                                        <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>Platform Overview</h3>
                                        <button className="card-action-btn" style={{ background: 'var(--bg-light)', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '8px', color: 'var(--text-secondary)' }}>
                                            Monthly <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.8rem' }}></i>
                                        </button>
                                    </div>
                                    
                                    {/* High Fidelity Chart Replica */}
                                    <div style={{ position: 'relative', height: '280px', width: '100%', paddingLeft: '40px', paddingBottom: '30px' }}>
                                        
                                        {/* Y-Axis Grid Lines & Labels */}
                                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 1 }}>
                                            {['160K', '145K', '90K', '45K', '0'].map((val, idx) => (
                                                <div key={idx} style={{ position: 'relative', width: '100%', borderTop: idx !== 4 ? '1px dashed var(--border-color)' : '1px solid var(--border-color)', height: '0' }}>
                                                    <span style={{ position: 'absolute', left: '-40px', top: '-10px', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', width: '35px', textAlign: 'right' }}>{val}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* SVG Chart Area */}
                                        <div style={{ position: 'absolute', top: 0, left: '40px', right: 0, bottom: '30px', zIndex: 2 }}>
                                            <svg viewBox="0 0 1000 250" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                                <defs>
                                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="var(--accent-blue)" stopOpacity="0.15" />
                                                        <stop offset="100%" stopColor="var(--accent-blue)" stopOpacity="0" />
                                                    </linearGradient>
                                                </defs>
                                                {/* Area Fill */}
                                                <path d="M 0 200 L 166 140 L 333 180 L 500 120 L 666 60 L 833 130 L 1000 40 L 1000 250 L 0 250 Z" fill="url(#chartGradient)" />
                                                
                                                {/* Stroke Line */}
                                                <path d="M 0 200 L 166 140 L 333 180 L 500 120 L 666 60 L 833 130 L 1000 40" fill="none" stroke="var(--accent-blue)" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
                                                
                                                {/* Final Data Point Marker */}
                                                <circle cx="1000" cy="40" r="6" fill="white" stroke="var(--accent-blue)" strokeWidth="3" />
                                            </svg>

                                            {/* Tooltip */}
                                            <div style={{ position: 'absolute', top: '15px', right: '-25px', background: 'var(--text-primary)', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>July</span>
                                                $148K
                                                {/* Tooltip Arrow */}
                                                <div style={{ position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: '8px', height: '8px', background: 'var(--text-primary)' }}></div>
                                            </div>
                                        </div>

                                        {/* X-Axis Labels */}
                                        <div style={{ position: 'absolute', bottom: 0, left: '40px', right: 0, display: 'flex', justifyContent: 'space-between', zIndex: 1, padding: '0 5px' }}>
                                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((month, idx) => (
                                                <span key={idx} style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{month}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-card" style={{ padding: '1.5rem 1.5rem 2rem 1.5rem' }}>
                                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)' }}>Recent Listings</h3>
                                    <div className="table-responsive">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>DATE</th>
                                                    <th>SELLER / TITLE</th>
                                                    <th>CATEGORY</th>
                                                    <th>PRICE</th>
                                                    <th>STATUS</th>
                                                    <th>ACTIONS</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {listings.slice(0, 5).map(listing => (
                                                    <tr key={listing.id}>
                                                        <td style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                                                            {new Date(listing.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
                                                        </td>
                                                        <td>
                                                            <div style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{listing.seller_name || 'Admin'}</div>
                                                            <div className="td-sub" style={{ marginTop: '4px' }}>{listing.title}</div>
                                                        </td>
                                                        <td style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{listing.category}</td>
                                                        <td style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{listing.currency || 'USD'} {listing.price}</td>
                                                        <td>
                                                            <span className="status-badge status-active">Active</span>
                                                        </td>
                                                        <td><a href="#" className="action-link" style={{ color: 'var(--accent-blue)' }}>View Details</a></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Actions + Activity */}
                            <div className="right-column">
                                <div className="glass-card">
                                    <button className="action-btn-large">
                                        <i className="fa-solid fa-file-invoice"></i> Generate Report
                                    </button>
                                    <button className="action-btn-large" style={{ marginBottom: 0 }}>
                                        <i className="fa-solid fa-bell"></i> Send Notification
                                    </button>
                                </div>

                                <div className="glass-card">
                                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700' }}>Quick Actions</h3>
                                    <button className="action-btn-large" onClick={() => setActivePanel('listings')}>
                                        <i className="fa-solid fa-plus"></i> Add Listing
                                    </button>
                                    <button className="action-btn-large" onClick={() => setActivePanel('users')} style={{ marginBottom: 0 }}>
                                        <i className="fa-solid fa-user-plus"></i> Manage Users
                                    </button>
                                </div>

                                <div className="glass-card">
                                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: '700' }}>Recent Activity</h3>
                                    <div className="activity-list">
                                        {users.slice(0, 3).map((user, idx) => (
                                            <div className="activity-item" key={user.id}>
                                                {idx === 1 ? (
                                                    <div className="activity-icon-container"><i className="fa-solid fa-shield-check"></i></div>
                                                ) : (
                                                    <img src="/avatar.jpeg" alt="user" className="activity-avatar" onError={(e) => { e.target.onerror = null; e.target.src=`https://ui-avatars.com/api/?name=${user.full_name}&background=random&color=fff` }} />
                                                )}
                                                <div className="activity-details">
                                                    <p>{user.full_name} | {idx === 1 ? 'Verified' : 'New User'}</p>
                                                    <span>{idx * 15 + 4} minutes ago</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>


                    {/* USERS PANEL */}
                    <section className={`panel-section ${activePanel === 'users' ? 'active' : ''}`}>
                        <div className="glass-card full-width-card" style={{ padding: '1.5rem 1.5rem 2rem 1.5rem' }}>
                            <div className="card-header-row" style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)' }}>User Management</h3>
                                <div className="filter-group">
                                    <button className="filter-btn active">All Users</button>
                                    <button className="filter-btn">Verified</button>
                                </div>
                            </div>
                            
                            <div className="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>USER / EMAIL</th>
                                            <th>CONTACT</th>
                                            <th>LOCATION</th>
                                            <th>STATUS</th>
                                            <th>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <div className="td-avatar">{user.full_name.charAt(0)}</div>
                                                        <div>
                                                            <div style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{user.full_name}</div>
                                                            <div className="td-sub" style={{ marginTop: '4px' }}>{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{user.phone}</td>
                                                <td style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{user.province}</td>
                                                <td>
                                                    {user.is_verified 
                                                        ? <span className="status-badge status-active">Verified</span>
                                                        : <span className="status-badge status-pending">Pending</span>
                                                    }
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                        <button className="action-link-btn" style={{ color: 'var(--text-primary)', background: 'none', border: 'none', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} title="Edit User">
                                                            <i className="fa-solid fa-pen" style={{ fontSize: '0.75rem' }}></i> Edit
                                                        </button>
                                                        <button className="action-link-btn" onClick={() => deleteUser(user.id)} style={{ color: 'var(--accent-red)', background: 'none', border: 'none', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} title="Delete User">
                                                            <i className="fa-solid fa-trash" style={{ fontSize: '0.75rem' }}></i> Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>


                    {/* VERIFICATION PANEL */}
                    <section className={`panel-section ${activePanel === 'verification' ? 'active' : ''}`}>
                        <div className="glass-card full-width-card" style={{ padding: '1.5rem 1.5rem 2rem 1.5rem', background: 'transparent', boxShadow: 'none' }}>
                            <div className="card-header-row" style={{ marginBottom: '1.5rem', padding: '0 0.5rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>Verification Requests</h3>
                                <span className="badge-count" style={{ background: 'var(--accent-red)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700' }}>
                                    {users.filter(u => !u.is_verified).length} Pending
                                </span>
                            </div>
                            
                            <div className="verification-grid">
                                {users.filter(u => !u.is_verified).map(user => (
                                    <div className="verify-card" key={user.id}>
                                        <div className="verify-header">
                                            <div className="td-avatar" style={{ width: '48px', height: '48px', fontSize: '1.25rem' }}>{user.full_name.charAt(0)}</div>
                                            <div>
                                                <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{user.full_name}</h4>
                                                <p>{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="verify-docs">
                                            <div className="doc-item" style={{ background: 'var(--bg-light)' }}>
                                                <i className="fa-solid fa-file-lines" style={{ color: 'var(--accent-blue)' }}></i> ID Document
                                            </div>
                                            <div className="doc-item" style={{ background: 'var(--bg-light)' }}>
                                                <i className="fa-solid fa-file-invoice" style={{ color: 'var(--accent-gold)' }}></i> Proof of Address
                                            </div>
                                        </div>
                                        <div className="verify-actions" style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                            <button className="v-btn approve" onClick={() => toggleVerification(user.id)} style={{ flex: 1, padding: '0.6rem', border: '1px solid var(--accent-green)', background: 'rgba(5, 205, 153, 0.05)', color: 'var(--accent-green)', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                <i className="fa-solid fa-check"></i> Approve
                                            </button>
                                            <button className="v-btn reject" style={{ flex: 1, padding: '0.6rem', border: '1px solid var(--accent-red)', background: 'rgba(238, 93, 80, 0.05)', color: 'var(--accent-red)', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                <i className="fa-solid fa-xmark"></i> Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {users.filter(u => !u.is_verified).length === 0 && (
                                    <p style={{ color: 'var(--text-secondary)', padding: '1rem' }}>No pending verifications.</p>
                                )}
                            </div>
                        </div>
                    </section>


                    {/* LISTINGS PANEL */}
                    <section className={`panel-section ${activePanel === 'listings' ? 'active' : ''}`}>
                        <div className="glass-card full-width-card" style={{ padding: '1.5rem 1.5rem 2rem 1.5rem' }}>
                            <div className="card-header-row" style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)' }}>Marketplace Listings</h3>
                                <div className="filter-group">
                                    <button className="filter-btn active">All Listings</button>
                                    <button className="filter-btn">Featured</button>
                                </div>
                            </div>
                            
                            <div className="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ITEM DETAILS</th>
                                            <th>CATEGORY</th>
                                            <th>PRICE</th>
                                            <th>SELLER</th>
                                            <th>STATUS</th>
                                            <th>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {listings.map(listing => (
                                            <tr key={listing.id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <img src={listing.images && listing.images.length > 0 ? listing.images[0] : '/logo.png'} alt="item" style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }} />
                                                        <div>
                                                            <div style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1rem' }}>{listing.title}</div>
                                                            <div className="td-sub" style={{ marginTop: '4px' }}>#{listing.id.toString().padStart(4, '0')} • Posted {new Date(listing.created_at).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{listing.category}</td>
                                                <td style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1.05rem' }}>{listing.currency || 'USD'} {listing.price}</td>
                                                <td style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{listing.seller_name}</td>
                                                <td>
                                                    {listing.is_featured 
                                                        ? <span className="status-badge status-featured" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><i className="fa-solid fa-star"></i> Featured</span>
                                                        : <span className="status-badge status-active">Active</span>
                                                    }
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                        <button className="action-link-btn" onClick={() => toggleFeatureListing(listing.id)} style={{ color: listing.is_featured ? 'var(--accent-gold)' : 'var(--text-primary)', background: 'none', border: 'none', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} title={listing.is_featured ? "Remove Feature" : "Make Featured"}>
                                                            <i className={listing.is_featured ? "fa-solid fa-star" : "fa-regular fa-star"} style={{ fontSize: '0.75rem' }}></i> {listing.is_featured ? "Unfeature" : "Feature"}
                                                        </button>
                                                        <button className="action-link-btn" onClick={() => deleteListing(listing.id)} style={{ color: 'var(--accent-red)', background: 'none', border: 'none', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} title="Delete Listing">
                                                            <i className="fa-solid fa-trash" style={{ fontSize: '0.75rem' }}></i> Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    {/* ANALYTICS PANEL */}
                    <section className={`panel-section ${activePanel === 'analytics' ? 'active' : ''}`}>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            {/* Revenue Chart */}
                            <div className="glass-card" style={{ padding: '1.5rem 1.5rem 2rem 1.5rem' }}>
                                <div className="card-header-row" style={{ marginBottom: '2rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Platform Fees Collected</h3>
                                        <p style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>$12,450.00 <span style={{ fontSize: '0.85rem', color: 'var(--accent-green)', fontWeight: '600' }}>+5.2%</span></p>
                                    </div>
                                    <button className="card-action-btn" style={{ background: 'var(--bg-light)', padding: '0.5rem', borderRadius: '8px', color: 'var(--text-secondary)', border: 'none' }}>
                                        <i className="fa-solid fa-chart-bar"></i>
                                    </button>
                                </div>
                                <div style={{ position: 'relative', height: '220px', width: '100%', paddingLeft: '0' }}>
                                    <svg viewBox="0 0 1000 250" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                        <defs>
                                            <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="var(--accent-gold)" stopOpacity="0.2" />
                                                <stop offset="100%" stopColor="var(--accent-gold)" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        <path d="M 0 220 L 150 180 L 300 190 L 450 130 L 600 160 L 750 90 L 900 110 L 1000 30 L 1000 250 L 0 250 Z" fill="url(#revGradient)" />
                                        <path d="M 0 220 L 150 180 L 300 190 L 450 130 L 600 160 L 750 90 L 900 110 L 1000 30" fill="none" stroke="var(--accent-gold)" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
                                    </svg>
                                </div>
                            </div>

                            {/* Traffic Bar Chart */}
                            <div className="glass-card" style={{ padding: '1.5rem 1.5rem 2rem 1.5rem' }}>
                                <div className="card-header-row" style={{ marginBottom: '2rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Total Traffic</h3>
                                        <p style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>{(stats?.total_traffic || 0).toLocaleString()} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Views</span></p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '220px', padding: '0 1rem' }}>
                                    {[60, 80, 45, 90, 110, 75, 120].map((h, i) => (
                                        <div key={i} style={{ width: '12%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '100%', height: `${(h/120)*100}%`, background: i === 6 ? 'var(--accent-blue)' : 'var(--bg-light)', borderRadius: '6px', transition: '0.3s' }}></div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="glass-card full-width-card" style={{ padding: '1.5rem' }}>
                            <div className="card-header-row" style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)' }}>Top Performing Categories in Zimbabwe</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {(() => {
                                    const cats = stats?.categories || [];
                                    const getCount = (keys) => {
                                        const lowerKeys = keys.map(k => k.toLowerCase());
                                        return cats.filter(c => c.category && lowerKeys.includes(c.category.toLowerCase())).reduce((sum, c) => sum + Number(c.count), 0);
                                    };
                                    
                                    const displayCats = [
                                        { name: 'Vehicles', count: getCount(['vehicles']), color: 'var(--accent-blue)' },
                                        { name: 'Machinery', count: getCount(['machinery']), color: 'var(--accent-gold)' },
                                        { name: 'Farming (Equipments, Livestocks, Produce)', count: getCount(['equipment', 'livestock', 'produce']), color: 'var(--accent-green)' },
                                        { name: 'Spares', count: getCount(['spares']), color: 'var(--accent-red)' }
                                    ];
                                    
                                    const maxCount = Math.max(...displayCats.map(c => c.count)) || 1; // prevent divide by zero
                                    
                                    return displayCats.map((cat, i) => (
                                        <div key={i}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{cat.name}</span>
                                                <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>{cat.count} listings</span>
                                            </div>
                                            <div style={{ width: '100%', height: '8px', background: 'var(--bg-light)', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${(cat.count/maxCount)*100}%`, background: cat.color, borderRadius: '4px', transition: 'width 0.5s ease-out' }}></div>
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>
                    </section>

                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
