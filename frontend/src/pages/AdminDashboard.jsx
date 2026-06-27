import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
                // We'll fetch users and listings in parallel
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
                // If unauthorized, redirect home or login
                // navigate('/');
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
                <button onClick={() => navigate('/')} style={{ padding: '10px 20px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '20px' }}>Go Home</button>
            </div>
        );
    }

    if (loading) {
        return <div style={{ padding: '50px', textAlign: 'center' }}><i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px' }}></i></div>;
    }

    const pendingVerifications = users.filter(u => !u.is_verified).length;
    const activeListingsCount = listings.length;

    return (
        <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            
            {/* Sidebar */}
            <aside className="glass-sidebar" style={{ width: '280px', backgroundColor: '#fff', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
                <div className="sidebar-brand" style={{ padding: '20px', borderBottom: '1px solid #e0e0e0', textAlign: 'center' }}>
                    <h2 style={{ margin: 0, color: '#2e7d32', fontWeight: 900 }}>ZIM AUTOAGRI</h2>
                    <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>ADMIN DASHBOARD</p>
                </div>
                
                <nav className="sidebar-nav" style={{ flex: 1, padding: '20px 0' }}>
                    <a href="#" className={`nav-item ${activePanel === 'dashboard-panel' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActivePanel('dashboard-panel'); }} style={{ display: 'block', padding: '15px 25px', color: activePanel === 'dashboard-panel' ? '#2e7d32' : '#333', backgroundColor: activePanel === 'dashboard-panel' ? '#e8f5e9' : 'transparent', textDecoration: 'none', fontWeight: activePanel === 'dashboard-panel' ? 'bold' : 'normal' }}>
                        <i className="fa-solid fa-grid-2" style={{ width: '30px' }}></i> Dashboard
                    </a>
                    <a href="#" className={`nav-item ${activePanel === 'users-panel' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActivePanel('users-panel'); }} style={{ display: 'block', padding: '15px 25px', color: activePanel === 'users-panel' ? '#2e7d32' : '#333', backgroundColor: activePanel === 'users-panel' ? '#e8f5e9' : 'transparent', textDecoration: 'none', fontWeight: activePanel === 'users-panel' ? 'bold' : 'normal' }}>
                        <i className="fa-solid fa-users" style={{ width: '30px' }}></i> Users & Verification
                    </a>
                    <a href="#" className={`nav-item ${activePanel === 'listings-panel' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActivePanel('listings-panel'); }} style={{ display: 'block', padding: '15px 25px', color: activePanel === 'listings-panel' ? '#2e7d32' : '#333', backgroundColor: activePanel === 'listings-panel' ? '#e8f5e9' : 'transparent', textDecoration: 'none', fontWeight: activePanel === 'listings-panel' ? 'bold' : 'normal' }}>
                        <i className="fa-solid fa-layer-group" style={{ width: '30px' }}></i> Manage Listings
                    </a>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="glass-main" style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1>Admin // <span style={{ color: '#2e7d32' }}>SECRET DASHBOARD</span></h1>
                </header>

                {activePanel === 'dashboard-panel' && (
                    <section>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Total Registered Users</h3>
                                <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#111' }}>{users.length}</p>
                            </div>
                            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Pending Verifications</h3>
                                <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#d32f2f' }}>{pendingVerifications}</p>
                            </div>
                            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Active Listings</h3>
                                <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#2e7d32' }}>{activeListingsCount}</p>
                            </div>
                        </div>
                        
                        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                            <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px' }}>Recent Listings</h2>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                        <th style={{ padding: '12px 10px' }}>Item</th>
                                        <th style={{ padding: '12px 10px' }}>Category</th>
                                        <th style={{ padding: '12px 10px' }}>Price</th>
                                        <th style={{ padding: '12px 10px' }}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listings.slice(0, 5).map(l => (
                                        <tr key={l.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '12px 10px' }}>{l.title}</td>
                                            <td style={{ padding: '12px 10px', textTransform: 'capitalize' }}>{l.category}</td>
                                            <td style={{ padding: '12px 10px' }}>${parseFloat(l.price).toLocaleString()}</td>
                                            <td style={{ padding: '12px 10px' }}>{new Date(l.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {activePanel === 'users-panel' && (
                    <section>
                        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                            <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px' }}>Manage Users</h2>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                        <th style={{ padding: '12px 10px' }}>Name</th>
                                        <th style={{ padding: '12px 10px' }}>Email</th>
                                        <th style={{ padding: '12px 10px' }}>Verified</th>
                                        <th style={{ padding: '12px 10px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '12px 10px' }}>{u.full_name}</td>
                                            <td style={{ padding: '12px 10px' }}>{u.email}</td>
                                            <td style={{ padding: '12px 10px' }}>
                                                {u.is_verified ? 
                                                    <span style={{ color: '#2e7d32', fontWeight: 'bold' }}><i className="fa-solid fa-check-circle"></i> Yes</span> : 
                                                    <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>No</span>}
                                            </td>
                                            <td style={{ padding: '12px 10px' }}>
                                                <button 
                                                    onClick={() => handleVerifyUser(u.id, u.is_verified)}
                                                    style={{ padding: '6px 12px', background: u.is_verified ? '#f57c00' : '#2e7d32', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    {u.is_verified ? 'Revoke Verification' : 'Verify User'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {activePanel === 'listings-panel' && (
                    <section>
                        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                            <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px' }}>Manage Listings</h2>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                        <th style={{ padding: '12px 10px' }}>ID</th>
                                        <th style={{ padding: '12px 10px' }}>Title</th>
                                        <th style={{ padding: '12px 10px' }}>Category</th>
                                        <th style={{ padding: '12px 10px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listings.map(l => (
                                        <tr key={l.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '12px 10px' }}>#{l.id}</td>
                                            <td style={{ padding: '12px 10px' }}>{l.title}</td>
                                            <td style={{ padding: '12px 10px', textTransform: 'capitalize' }}>{l.category}</td>
                                            <td style={{ padding: '12px 10px' }}>
                                                <button 
                                                    onClick={() => handleDeleteListing(l.id)}
                                                    style={{ padding: '6px 12px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    <i className="fa-solid fa-trash"></i> Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
