import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
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

            <nav className="main-nav">
                <div className="nav-container">
                    <div className="hamburger" onClick={toggleMenu}>
                        <i className="fa-solid fa-bars"></i>
                    </div>

                    <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
                        <li><Link to="/">HOME</Link></li>
                        <li><Link to="/?category=vehicles">VEHICLES</Link></li>
                        <li><Link to="/?category=machinery">MACHINERY</Link></li>
                        <li><Link to="/?category=spares">SPARES</Link></li>
                        
                        <li className="dropdown">
                            <a href="#" className="dropbtn" onClick={(e) => e.preventDefault()}>
                                FARMING <i className="fa-solid fa-chevron-down" style={{ fontSize: '12px', marginLeft: '4px' }}></i>
                            </a>
                            <div className="dropdown-content">
                                <Link to="/?category=equipment">Equipments</Link>
                                <Link to="/?category=livestock">Livestocks</Link>
                                <Link to="/?category=produce">Crop & Produce</Link>
                            </div>
                        </li>

                        <li><Link to="/account">MY ACCOUNT</Link></li>
                    </ul>
                    <Link to="/post-ad" className="post-ad-btn">POST FREE AD</Link>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
