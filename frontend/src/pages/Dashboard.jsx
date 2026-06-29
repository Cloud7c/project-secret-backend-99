import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import '../assets/css/account.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ activeAds: 0, weeklyViews: 0 });
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'profile';
    const setActiveTab = (tab) => {
        setSearchParams({ tab });
    };
    const observerTarget = useRef(null);

    const [settingsData, setSettingsData] = useState({
        full_name: '',
        phone: '',
        notify_messages: true,
        notify_approvals: true
    });
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [settingsMessage, setSettingsMessage] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('zaa_token');
        const userJson = localStorage.getItem('zaa_user');
        
        if (!token || !userJson) {
            navigate('/login?redirect=/account', { replace: true });
            return;
        }

        try {
            const parsedUser = JSON.parse(userJson);
            setUser(parsedUser);
            setSettingsData({
                full_name: parsedUser.full_name || '',
                phone: parsedUser.phone || '',
                notify_messages: parsedUser.notify_messages ?? true,
                notify_approvals: parsedUser.notify_approvals ?? true
            });
            fetchUserListings(parsedUser.id, 1, false);
        } catch (err) {
            console.error('Error parsing user data:', err);
            localStorage.removeItem('zaa_token');
            localStorage.removeItem('zaa_user');
            navigate('/login?redirect=/account', { replace: true });
        }
    }, [navigate]);

    const fetchUserListings = async (userId, pageNum, append) => {
        try {
            if (append) setIsFetchingMore(true);
            else setLoading(true);
            
            const res = await fetch(`/api/listings?user_id=${userId}&limit=12&page=${pageNum}`);
            const data = await res.json();

            if (data && data.listings) {
                if (append) {
                    setListings(prev => [...prev, ...data.listings]);
                } else {
                    setListings(data.listings);
                    // Calculate stats from the backend's new window function
                    setStats({
                        activeAds: data.count || 0,
                        weeklyViews: data.totalViews || 0
                    });
                }
                
                setHasMore(data.hasNextPage);
            }
        } catch (err) {
            console.error("Failed to fetch user listings", err);
        } finally {
            setLoading(false);
            setIsFetchingMore(false);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !isFetchingMore && !loading && user) {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    fetchUserListings(user.id, nextPage, true);
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
    }, [hasMore, isFetchingMore, loading, page, user]);

    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem('zaa_token');
        localStorage.removeItem('zaa_user');
        window.location.href = '/';
    };

    const handleSaveSettings = async () => {
        setSettingsLoading(true);
        setSettingsMessage(null);
        try {
            const res = await fetch('/api/users/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('zaa_token')}`
                },
                body: JSON.stringify(settingsData)
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('zaa_user', JSON.stringify(data.user));
                setUser(data.user);
                setSettingsMessage({ type: 'success', text: 'Settings updated successfully!' });
            } else {
                setSettingsMessage({ type: 'error', text: data.error || 'Failed to update settings.' });
            }
        } catch (err) {
            setSettingsMessage({ type: 'error', text: 'An error occurred.' });
        } finally {
            setSettingsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleteError('');
        if (!deletePassword) {
            setDeleteError('Please enter your password.');
            return;
        }

        setDeleteLoading(true);
        try {
            const res = await fetch('/api/users/account', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('zaa_token')}`
                },
                body: JSON.stringify({ password: deletePassword })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.removeItem('zaa_token');
                localStorage.removeItem('zaa_user');
                navigate('/');
            } else {
                setDeleteError(data.error || 'Failed to delete account.');
            }
        } catch (err) {
            setDeleteError('An error occurred. Please try again.');
        } finally {
            setDeleteLoading(false);
        }
    };

    // Calculate fallback avatar initials
    const getInitials = (name) => {
        if (!name) return 'U';
        const names = name.split(' ');
        let initials = names[0].charAt(0).toUpperCase();
        if (names.length > 1) {
            initials += names[names.length - 1].charAt(0).toUpperCase();
        }
        return initials;
    };

    if (!user) return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;

    return (
        <div className="dashboard-wrapper" style={{ minHeight: '100vh', width: '100%' }}>
            <div className="dashboard-bg"></div>

            <main className="dashboard-container">
                <div className="dashboard-card">
                    
                    {/* LEFT COLUMN: Profile Sidebar */}
                    <aside className="profile-sidebar" style={{ display: activeTab !== 'profile' ? 'block' : 'flex', padding: activeTab !== 'profile' ? '10px' : '25px', width: window.innerWidth > 768 ? (activeTab !== 'profile' ? '100px' : '550px') : '100%', margin: '0 auto' }}>
                        {activeTab === 'profile' && (
                            <>
                                <div className="profile-header">
                                    <div className="cover-photo uploadable" id="profile-cover" style={{ position: 'relative', backgroundImage: user.cover_picture ? `url('${user.cover_picture}')` : 'none', backgroundColor: '#2b7a4b', width: '100%', height: window.innerWidth > 768 ? '200px' : '100px' }}>
                                        <input type="file" id="cover-upload" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                                            if(e.target.files[0]) {
                                                const formData = new FormData();
                                                formData.append('image', e.target.files[0]);
                                                const res = await fetch('/api/users/cover-picture', {
                                                    method: 'POST',
                                                    headers: { 'Authorization': `Bearer ${localStorage.getItem('zaa_token')}` },
                                                    body: formData
                                                });
                                                if(res.ok) window.location.reload();
                                            }
                                        }} />
                                        <div className="overlay-icon" onClick={() => document.getElementById('cover-upload').click()} style={{ cursor: 'pointer' }}><i className="fa-solid fa-camera"></i></div>
                                        
                                        {/* Cover Picture Dropdown */}
                                        <div className="dropdown-container" style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                            <div style={{ background: 'rgba(0,0,0,0.6)', color: 'white', padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }} onClick={(e) => {
                                                const menu = e.currentTarget.nextElementSibling;
                                                menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                                            }}>
                                                <i className="fa-solid fa-pencil"></i> Edit Cover
                                            </div>
                                            <div style={{ display: 'none', position: 'absolute', right: 0, top: '35px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', overflow: 'hidden', zIndex: 100, width: '150px' }}>
                                                <div onClick={() => document.getElementById('cover-upload').click()} style={{ padding: '10px 15px', cursor: 'pointer', fontSize: '13px', color: '#333', borderBottom: '1px solid #eee' }}><i className="fa-solid fa-upload" style={{ marginRight: '8px' }}></i> Change Picture</div>
                                                <div onClick={async () => {
                                                    if (window.confirm("Are you sure you want to remove your cover picture?")) {
                                                        const res = await fetch('/api/users/cover-picture', {
                                                            method: 'DELETE',
                                                            headers: { 'Authorization': `Bearer ${localStorage.getItem('zaa_token')}` }
                                                        });
                                                        if(res.ok) window.location.reload();
                                                    }
                                                }} style={{ padding: '10px 15px', cursor: 'pointer', fontSize: '13px', color: '#dc2626' }}><i className="fa-solid fa-trash" style={{ marginRight: '8px' }}></i> Remove Picture</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="avatar-container" style={{ position: 'relative' }}>
                                        <div className="uploadable" style={{ display: 'block', position: 'relative', width: '100px', height: '100px', borderRadius: '50%' }}>
                                            <input type="file" id="avatar-upload" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                                                if(e.target.files[0]) {
                                                    const formData = new FormData();
                                                    formData.append('image', e.target.files[0]);
                                                    const res = await fetch('/api/users/profile-picture', {
                                                        method: 'POST',
                                                        headers: { 'Authorization': `Bearer ${localStorage.getItem('zaa_token')}` },
                                                        body: formData
                                                    });
                                                    if(res.ok) window.location.reload();
                                                }
                                            }} />
                                            {user.profile_picture ? (
                                                <img src={user.profile_picture} alt="Profile" className="avatar" />
                                            ) : (
                                                <div className="avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2e8f0', color: '#475569', fontSize: '32px', fontWeight: 'bold' }}>
                                                    {getInitials(user.full_name)}
                                                </div>
                                            )}
                                            <div className="overlay-icon" onClick={() => document.getElementById('avatar-upload').click()} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fa-solid fa-camera"></i></div>
                                            
                                            {/* Profile Picture Dropdown */}
                                            <div className="dropdown-container" style={{ position: 'absolute', bottom: '0', right: '-15px' }}>
                                                <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }} onClick={(e) => {
                                                    const menu = e.currentTarget.nextElementSibling;
                                                    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                                                }}>
                                                    <i className="fa-solid fa-pencil" style={{ fontSize: '12px', color: '#555' }}></i>
                                                </div>
                                                <div style={{ display: 'none', position: 'absolute', left: '35px', bottom: '-20px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', overflow: 'hidden', zIndex: 100, width: '150px' }}>
                                                    <div onClick={() => document.getElementById('avatar-upload').click()} style={{ padding: '10px 15px', cursor: 'pointer', fontSize: '13px', color: '#333', borderBottom: '1px solid #eee' }}><i className="fa-solid fa-upload" style={{ marginRight: '8px' }}></i> Change Picture</div>
                                                    <div onClick={async () => {
                                                        if (window.confirm("Are you sure you want to remove your profile picture?")) {
                                                            const res = await fetch('/api/users/profile-picture', {
                                                                method: 'DELETE',
                                                                headers: { 'Authorization': `Bearer ${localStorage.getItem('zaa_token')}` }
                                                            });
                                                            if(res.ok) window.location.reload();
                                                        }
                                                    }} style={{ padding: '10px 15px', cursor: 'pointer', fontSize: '13px', color: '#dc2626' }}><i className="fa-solid fa-trash" style={{ marginRight: '8px' }}></i> Remove Picture</div>
                                                </div>
                                            </div>
                                        </div>
                                        {user.is_verified && (
                                            <div className="badge-farm-owner" style={{ marginTop: '-15px' }}>
                                                <i className="fa-solid fa-check-circle"></i> Verified
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="user-info">
                                    <h2>
                                        {user.full_name} 
                                        <svg className="verified-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: user.is_verified ? 'inline-block' : 'none', width: '22px', height: '22px', verticalAlign: 'middle' }}>
                                            <path d="M10.5213 2.62368C11.3147 1.75231 12.6853 1.75231 13.4787 2.62368L14.4989 3.74391C14.8998 4.18418 15.4761 4.42288 16.071 4.39508L17.5845 4.32435C18.7614 4.26934 19.7307 5.23857 19.6757 6.41554L19.6049 7.92905C19.5771 8.52388 19.8158 9.10016 20.2561 9.50111L21.3763 10.5213C22.2477 11.3147 22.2477 12.6853 21.3763 13.4787L20.2561 14.4989C19.8158 14.8998 19.5771 15.4761 19.6049 16.071L19.6757 17.5845C19.7307 18.7614 18.7614 19.7307 17.5845 19.6757L16.071 19.6049C15.4761 19.5771 14.8998 19.8158 14.4989 20.2561L13.4787 21.3763C12.6853 22.2477 11.3147 22.2477 10.5213 21.3763L9.50111 20.2561C9.10016 19.8158 8.52388 19.5771 7.92905 19.6049L6.41554 19.6757C5.23857 19.7307 4.26934 18.7614 4.32435 17.5845L4.39508 16.071C4.42288 15.4761 4.18418 14.8998 3.74391 14.4989L2.62368 13.4787C1.75231 12.6853 1.75231 11.3147 2.62368 10.5213L3.74391 9.50111C4.18418 9.10016 4.42288 8.52388 4.39508 7.92905L4.32435 6.41554C4.26934 5.23857 5.23857 4.26934 6.41554 4.32435L7.92905 4.39508C8.52388 4.42288 9.10016 4.18418 9.50111 3.74391L10.5213 2.62368Z" fill="#1d9bf0"/>
                                            <path d="M10.9303 14.2413L7.75908 11.0701C7.43364 10.7446 7.43364 10.217 7.75908 9.89156C8.08451 9.56613 8.61215 9.56613 8.93759 9.89156L11.5196 12.4735L15.5624 8.43075C15.8878 8.10531 16.4155 8.10531 16.7409 8.43075C17.0663 8.75618 17.0663 9.28382 16.7409 9.60926L12.1088 14.2413C11.7834 14.5668 11.2557 14.5668 10.9303 14.2413Z" fill="#ffffff"/>
                                        </svg>
                                    </h2>
                                    <p className="farm-name" id="profile-email">{user.email}</p>
                                    <p className="member-since" id="profile-joined">Member</p>
                                </div>

                                <div className="action-buttons" style={{ display: 'flex', flexDirection: window.innerWidth > 768 ? 'row' : 'column', justifyContent: 'center', gap: '15px' }}>
                                    <button className="primary-btn" style={{ padding: '12px 25px' }} onClick={() => setActiveTab('settings')}>Edit Profile / Settings</button>
                                    <button className="secondary-btn" style={{ padding: '12px 25px' }}>Messages</button>
                                </div>

                                <div className="analytics-section" style={{ maxWidth: '500px', margin: '30px auto 0 auto', width: '100%', textAlign: 'center' }}>
                                    <h3 style={{ marginBottom: '15px' }}>Listing Analytics</h3>
                                    <div className="stats-grid">
                                        <div className="stat-item">
                                            <div className="stat-icon"><i className="fa-solid fa-bullhorn"></i></div>
                                            <div className="stat-text">
                                                <strong id="analytic-ads-count">{stats.activeAds}</strong>
                                                <span>Active Ads</span>
                                            </div>
                                        </div>

                                        <div className="stat-item">
                                            <div className="stat-icon green-icon"><i className="fa-solid fa-eye"></i></div>
                                            <div className="stat-text">
                                                <strong id="analytic-impressions">{new Intl.NumberFormat('en-US').format(stats.weeklyViews)}</strong>
                                                <span>Weekly Views</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <nav className="bottom-nav" style={activeTab !== 'profile' ? { marginTop: 0, display: 'flex', flexDirection: window.innerWidth > 768 ? 'column' : 'row' } : {}}>
                            <a href="#" className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('profile'); }}>
                                <i className="fa-regular fa-user"></i>
                                <span>Profile</span>
                            </a>
                            <a href="#" className={`nav-item ${activeTab === 'listings' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('listings'); }}>
                                <i className="fa-solid fa-list"></i>
                                <span>Listings</span>
                            </a>
                            <a href="#" className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('settings'); }}>
                                <i className="fa-solid fa-gear"></i>
                                <span>Settings</span>
                            </a>
                            <a href="#" className="nav-item text-danger" id="logout-btn" onClick={handleLogout} style={{ color: '#dc2626', cursor: 'pointer' }}>
                                <i className="fa-solid fa-right-from-bracket"></i>
                                <span>Logout</span>
                            </a>
                        </nav>
                    </aside>

                    {/* RIGHT COLUMN: Active Listings Grid */}
                    {activeTab === 'listings' && (
                        <section className="main-content">
                            <style>{`
                                .user-dashboard-grid {
                                    grid-template-columns: repeat(4, 1fr) !important;
                                }
                                @media (max-width: 768px) {
                                    .user-dashboard-grid {
                                        grid-template-columns: 1fr !important;
                                    }
                                }
                            `}</style>
                            <div className="content-header">
                                <h2>Active Listings</h2>
                                <div className="security-badge">
                                    <i className="fa-solid fa-shield-check"></i> Secure Data Encryption
                                </div>
                            </div>

                            <div className="listings-grid user-dashboard-grid" id="user-listings-grid">
                            {loading ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#666', gridColumn: '1 / -1' }}>
                                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', marginBottom: '10px' }}></i>
                                    <p>Loading your active listings...</p>
                                </div>
                            ) : listings.length > 0 ? (
                                listings.map((listing) => {
                                    let imageUrl = '/logo.png';
                                    if (listing.images && listing.images.length > 0) {
                                        imageUrl = listing.images[0];
                                    } else {
                                        if (listing.category === 'vehicles') imageUrl = '/hilux.jpg';
                                        if (listing.category === 'machinery') imageUrl = '/tractor.jpg';
                                        if (listing.category === 'livestock') imageUrl = '/cow.png';
                                        if (listing.category === 'produce') imageUrl = '/tomatoes.png';
                                    }

                                    return (
                                        <div key={listing.id} className="listing-card">
                                            <div className="listing-img" style={{ overflow: 'hidden' }}>
                                                <img src={imageUrl} alt={listing.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <div className="listing-info">
                                                <h4>{listing.title}</h4>
                                                <p>Price: {listing.currency || 'USD'} {listing.price}</p>
                                                <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                                                    <i className="fa-solid fa-eye" style={{ marginRight: '4px' }}></i>
                                                    {listing.views || 0} Views
                                                </p>
                                                <Link to={`/manage-listing/${listing.id}`} style={{ color: '#28a745', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', marginTop: '10px', display: 'block' }}>
                                                    Manage Listing <i className="fa-solid fa-arrow-right" style={{ fontSize: '12px' }}></i>
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#666', gridColumn: '1 / -1' }}>
                                    <p>You don't have any active listings yet.</p>
                                    <Link to="/post-ad" className="post-ad-btn" style={{ marginTop: '15px', display: 'inline-block' }}>Post Your First Ad</Link>
                                </div>
                            )}

                            {isFetchingMore && (
                                <div style={{ textAlign: 'center', padding: '20px', gridColumn: '1 / -1', color: '#666' }}>
                                    <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading more...
                                </div>
                            )}
                            <div ref={observerTarget} style={{ height: '20px', gridColumn: '1 / -1' }}></div>
                        </div>
                    </section>
                    )}

                    {/* SETTINGS TAB */}
                    {activeTab === 'settings' && (
                        <section className="main-content">
                            <div className="content-header">
                                <h2>Account Settings</h2>
                                <p style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>Manage your preferences and account details</p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {/* Personal Info */}
                                <div style={{ background: '#fff', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px', color: '#144027' }}><i className="fa-regular fa-id-badge" style={{ marginRight: '8px' }}></i>Personal Details</h3>
                                    
                                    {settingsMessage && (
                                        <div style={{ padding: '10px 15px', borderRadius: '8px', marginBottom: '15px', background: settingsMessage.type === 'success' ? '#dcfce7' : '#fee2e2', color: settingsMessage.type === 'success' ? '#166534' : '#991b1b', fontSize: '14px' }}>
                                            {settingsMessage.text}
                                        </div>
                                    )}

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px', fontWeight: '600' }}>Full Name</label>
                                            <input type="text" value={settingsData.full_name} onChange={(e) => setSettingsData({...settingsData, full_name: e.target.value})} style={{ width: '100%', padding: '10px 15px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px', fontWeight: '600' }}>Email Address</label>
                                            <input type="email" value={user.email} disabled style={{ width: '100%', padding: '10px 15px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', background: '#f9fafb', color: '#9ca3af' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px', fontWeight: '600' }}>Phone Number</label>
                                            <input type="tel" placeholder="+1 (555) 000-0000" value={settingsData.phone} onChange={(e) => setSettingsData({...settingsData, phone: e.target.value})} style={{ width: '100%', padding: '10px 15px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }} />
                                        </div>
                                    </div>
                                    <button onClick={handleSaveSettings} disabled={settingsLoading} style={{ marginTop: '20px', background: settingsLoading ? '#9ca3af' : '#2b7a4b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: settingsLoading ? 'not-allowed' : 'pointer' }}>
                                        {settingsLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>

                                {/* Notifications */}
                                <div style={{ background: '#fff', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px', color: '#144027' }}><i className="fa-regular fa-bell" style={{ marginRight: '8px' }}></i>Notifications</h3>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #f3f4f6' }}>
                                        <div>
                                            <h4 style={{ fontSize: '14px', fontWeight: '600' }}>New Messages</h4>
                                            <p style={{ fontSize: '12px', color: '#666' }}>Receive an email when a buyer messages you.</p>
                                        </div>
                                        <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                                            <input type="checkbox" checked={settingsData.notify_messages} onChange={(e) => setSettingsData({...settingsData, notify_messages: e.target.checked})} style={{ opacity: 0, width: 0, height: 0 }} />
                                            <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: settingsData.notify_messages ? '#10b981' : '#e5e7eb', borderRadius: '24px', transition: '.4s' }}></span>
                                            <span style={{ position: 'absolute', height: '18px', width: '18px', left: '3px', bottom: '3px', backgroundColor: 'white', borderRadius: '50%', transition: '.4s', transform: settingsData.notify_messages ? 'translateX(20px)' : 'translateX(0)' }}></span>
                                        </label>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0' }}>
                                        <div>
                                            <h4 style={{ fontSize: '14px', fontWeight: '600' }}>Listing Approvals</h4>
                                            <p style={{ fontSize: '12px', color: '#666' }}>Get notified when your new listing is approved and goes live.</p>
                                        </div>
                                        <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                                            <input type="checkbox" checked={settingsData.notify_approvals} onChange={(e) => setSettingsData({...settingsData, notify_approvals: e.target.checked})} style={{ opacity: 0, width: 0, height: 0 }} />
                                            <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: settingsData.notify_approvals ? '#10b981' : '#e5e7eb', borderRadius: '24px', transition: '.4s' }}></span>
                                            <span style={{ position: 'absolute', height: '18px', width: '18px', left: '3px', bottom: '3px', backgroundColor: 'white', borderRadius: '50%', transition: '.4s', transform: settingsData.notify_approvals ? 'translateX(20px)' : 'translateX(0)' }}></span>
                                        </label>
                                    </div>
                                </div>

                                {/* Danger Zone */}
                                <div style={{ background: '#fff', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #fee2e2' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px', color: '#dc2626' }}><i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '8px' }}></i>Danger Zone</h3>
                                    <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>Once you delete your account, there is no going back. All your active listings and data will be permanently removed.</p>
                                    <button onClick={() => setShowDeleteModal(true)} style={{ background: 'transparent', color: '#dc2626', border: '1px solid #dc2626', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: '0.2s' }} onMouseOver={(e) => { e.target.style.background = '#fef2f2'; }} onMouseOut={(e) => { e.target.style.background = 'transparent'; }}>Delete Account</button>
                                </div>
                            </div>
                        </section>
                    )}

                </div>
            </main>

            {/* DELETE ACCOUNT MODAL */}
            {showDeleteModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', maxWidth: '400px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <h2 style={{ color: '#dc2626', marginBottom: '10px', fontSize: '20px' }}><i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '8px' }}></i>Permanently Delete Account</h2>
                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5' }}>
                            You are about to permanently remove your account and all associated listings. This action cannot be undone. Please enter your password to confirm.
                        </p>
                        
                        {deleteError && (
                            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px' }}>
                                {deleteError}
                            </div>
                        )}

                        <input 
                            type="password" 
                            placeholder="Enter your password" 
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', marginBottom: '20px' }}
                        />

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button 
                                onClick={() => { setShowDeleteModal(false); setDeleteError(''); setDeletePassword(''); }}
                                disabled={deleteLoading}
                                style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', color: '#666', fontWeight: '600', cursor: deleteLoading ? 'not-allowed' : 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDeleteAccount}
                                disabled={deleteLoading}
                                style={{ padding: '10px 15px', borderRadius: '8px', border: 'none', background: '#dc2626', color: 'white', fontWeight: '600', cursor: deleteLoading ? 'not-allowed' : 'pointer' }}
                            >
                                {deleteLoading ? 'Deleting...' : 'Delete Permanently'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
