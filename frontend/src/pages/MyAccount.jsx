import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const MyAccount = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const profilePicInput = useRef(null);
    const coverPicInput = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');
            if (!token || !userData) {
                navigate('/login?redirect=account');
                return;
            }
            setUser(JSON.parse(userData));
            setLoading(false);
        };
        checkAuth();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleProfileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        setUploadStatus('Uploading profile picture...');
        try {
            const formData = new FormData();
            formData.append('profile_picture', file);
            const token = localStorage.getItem('token');
            const res = await fetch('/api/users/profile-picture', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            setUploadStatus('Profile picture updated successfully!');
            setTimeout(() => setUploadStatus(''), 3000);
        } catch (err) {
            setUploadStatus(`Error: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleCoverUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        setUploadStatus('Uploading cover picture...');
        try {
            const formData = new FormData();
            formData.append('cover_picture', file);
            const token = localStorage.getItem('token');
            const res = await fetch('/api/users/cover-picture', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            setUploadStatus('Cover picture updated successfully!');
            setTimeout(() => setUploadStatus(''), 3000);
        } catch (err) {
            setUploadStatus(`Error: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return 'S';
        const parts = name.split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    if (loading || !user) return <div style={{ padding: '100px', textAlign: 'center' }}><i className="fa-solid fa-spinner fa-spin"></i> Loading...</div>;

    const joinYear = new Date(user.created_at).getFullYear();

    return (
        <main className="account-layout">
            <aside className="account-sidebar">
                <div className="sidebar-header">
                    <h2>My Account</h2>
                </div>
                <nav className="sidebar-nav">
                    <a href="#" className={activeTab === 'dashboard' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}><i className="fa-solid fa-chart-line"></i> Dashboard</a>
                    <a href="#" className={activeTab === 'ads' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('ads'); }}><i className="fa-solid fa-list"></i> My Ads</a>
                    <a href="#" className={activeTab === 'favorites' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('favorites'); }}><i className="fa-solid fa-heart"></i> Favorites</a>
                    <a href="#" className={activeTab === 'messages' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('messages'); }}><i className="fa-solid fa-envelope"></i> Messages <span className="badge-new">New</span></a>
                    <a href="#" className={activeTab === 'settings' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('settings'); }}><i className="fa-solid fa-gear"></i> Settings</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="logout-btn"><i className="fa-solid fa-arrow-right-from-bracket"></i> Logout</a>
                </nav>
            </aside>

            <section className="account-content">
                <div className="profile-banner">
                    <img src={user.cover_picture || "/account-banner-placeholder.jpg"} alt="Cover" className="cover-photo" />
                    <button className="edit-cover-btn" onClick={() => coverPicInput.current.click()}><i className="fa-solid fa-camera"></i> Edit Cover</button>
                    <input type="file" ref={coverPicInput} style={{ display: 'none' }} accept="image/*" onChange={handleCoverUpload} />
                    
                    <div className="profile-info-overlay">
                        <div className="profile-avatar-wrapper">
                            {user.profile_picture ? (
                                <img src={user.profile_picture} alt="Profile" className="profile-avatar" />
                            ) : (
                                <div className="profile-avatar" style={{ backgroundColor: '#2b7a4b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '40px' }}>
                                    {getInitials(user.full_name)}
                                </div>
                            )}
                            <button className="edit-avatar-btn" onClick={() => profilePicInput.current.click()}><i className="fa-solid fa-camera"></i></button>
                            <input type="file" ref={profilePicInput} style={{ display: 'none' }} accept="image/*" onChange={handleProfileUpload} />
                        </div>
                        <div className="profile-details">
                            <h2 className="profile-name">
                                {user.full_name} 
                                {user.is_verified && <i className="fa-solid fa-circle-check verification-badge" style={{ color: '#1da1f2' }}></i>}
                            </h2>
                            <p className="profile-meta"><i className="fa-solid fa-location-dot"></i> {user.province}</p>
                            <p className="profile-meta"><i className="fa-solid fa-calendar-days"></i> Member since {joinYear}</p>
                        </div>
                    </div>
                </div>

                {uploading && <div style={{ padding: '10px', background: '#fff3cd', color: '#856404', borderRadius: '4px', marginTop: '20px', textAlign: 'center' }}><i className="fa-solid fa-spinner fa-spin"></i> {uploadStatus}</div>}
                {!uploading && uploadStatus && <div style={{ padding: '10px', background: '#d4edda', color: '#155724', borderRadius: '4px', marginTop: '20px', textAlign: 'center' }}>{uploadStatus}</div>}

                {activeTab === 'dashboard' && (
                    <div className="dashboard-grid">
                        <div className="stat-card">
                            <i className="fa-solid fa-bullhorn stat-icon text-green"></i>
                            <div className="stat-info">
                                <h3>Total Ads</h3>
                                <p className="stat-value">0</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <i className="fa-solid fa-eye stat-icon text-blue"></i>
                            <div className="stat-info">
                                <h3>Total Views</h3>
                                <p className="stat-value">0</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <i className="fa-solid fa-phone-volume stat-icon text-orange"></i>
                            <div className="stat-info">
                                <h3>Phone Reveals</h3>
                                <p className="stat-value">0</p>
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab !== 'dashboard' && (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#666', background: 'white', borderRadius: '8px', marginTop: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <i className="fa-solid fa-person-digging" style={{ fontSize: '40px', marginBottom: '15px', color: '#ccc' }}></i>
                        <h3>Under Construction</h3>
                        <p>This section is currently being built.</p>
                    </div>
                )}
            </section>
        </main>
    );
};

export default MyAccount;
