import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const navRef = useRef(null);

    // Hide Navbar on authentication, dashboard, admin, and post-ad pages
    if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/account' || location.pathname === '/admin' || location.pathname === '/post-ad') {
        return null;
    }

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    // Close menu when route changes
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    // Close menu when restoring from bfcache (browser back button)
    useEffect(() => {
        const handlePageShow = (e) => {
            if (e.persisted) {
                setMenuOpen(false);
            }
        };
        window.addEventListener('pageshow', handlePageShow);
        return () => window.removeEventListener('pageshow', handlePageShow);
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuOpen && navRef.current && !navRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);

    const touchStartY = useRef(0);
    const touchEndY = useRef(0);

    const handleTouchStart = (e) => {
        touchStartY.current = e.changedTouches[0].screenY;
        touchEndY.current = e.changedTouches[0].screenY; // Reset end Y on new touch
    };

    const handleTouchMove = (e) => {
        touchEndY.current = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = (e) => {
        if (touchStartY.current - touchEndY.current > 50) {
            // Swiped up by more than 50px
            setMenuOpen(false);
            // Prevent ghost clicks from hitting elements underneath after menu hides
            if (e.cancelable) {
                e.preventDefault();
            }
        }
    };

    const handleHardNav = (e, url) => {
        e.preventDefault();
        setMenuOpen(false);
        // Delay navigation slightly so React can re-render the DOM with the menu closed
        // This ensures the browser's bfcache takes a snapshot of the closed state
        setTimeout(() => {
            window.location.href = url;
        }, 150);
    };

    return (
        <>
            <header className="top-header">
                <div className="header-container">
                    <div className="brand-section" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                        <img src="/logo.png" alt="Zim AutoAgri Logo" className="brand-logo" />
                        <div className="brand-text">
                            <h1>ZIM AUTO<span className="brand-green">AGRI</span></h1>
                            <p>Zimbabwe's Premier Automotive & Agriculture Marketplace</p>
                        </div>
                    </div>

                    <div className="location-section">
                        <img src="/zim-flag.png" alt="Zimbabwe Flag" className="zim-flag" />
                        <span className="location-label">All Provinces, Zim</span>
                    </div>
                </div>  
            </header>

            <nav className="main-nav" ref={navRef}>
                <div className="nav-container">
                    <div className="hamburger" onClick={toggleMenu}>
                        <i className="fa-solid fa-bars"></i>
                    </div>

                    <ul 
                        className={`nav-links ${menuOpen ? 'active' : ''}`}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>HOME</Link></li>
                        <li><Link to="/vehicles" className={location.pathname === '/vehicles' ? 'active' : ''}>VEHICLES</Link></li>
                        <li><Link to="/machinery" className={location.pathname === '/machinery' ? 'active' : ''}>MACHINERY</Link></li>
                        <li><Link to="/spares" className={location.pathname === '/spares' ? 'active' : ''}>SPARES</Link></li>
                        
                        <li className="dropdown">
                            <a href="#" className="dropbtn" onClick={(e) => e.preventDefault()}>
                                FARMING <i className="fa-solid fa-chevron-down" style={{ fontSize: '12px', marginLeft: '4px' }}></i>
                            </a>
                            <div className="dropdown-content">
                                <Link to="/equipment">Equipments</Link>
                                <Link to="/livestock">Livestocks</Link>
                                <Link to="/produce">Crop & Produce</Link>
                            </div>
                        </li>

                        <li><a href="/account" id="account-nav-link" onClick={(e) => handleHardNav(e, '/account')}>MY ACCOUNT</a></li>
                    </ul>
                    <a href="/post-ad" id="post-ad-nav-link" className="post-ad-btn" onClick={(e) => handleHardNav(e, '/post-ad')} style={{ padding: '10px 24px', backgroundColor: '#FF6B00', color: 'white', borderRadius: '50px', fontWeight: 'bold', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(255, 107, 0, 0.4)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                        <i className="fa-solid fa-plus"></i> SELL
                    </a>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
