import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Footer = () => {
    const location = useLocation();

    // Hide Footer on authentication, dashboard, admin, and post-ad pages
    if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/account' || location.pathname === '/admin' || location.pathname === '/post-ad') {
        return null;
    }

    return (
        <footer className="main-footer">
            <div className="footer-container">
                <div className="footer-row">
                    <div className="footer-col">
                        <h4>Home</h4>
                        <ul>
                            <li><Link to="/">About</Link></li>
                            <li><Link to="/contact">Contact Us</Link></li>
                            <li><Link to="#">Terms of Use</Link></li>
                            <li><Link to="#">Privacy Policy</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>About Us</h4>
                        <ul>
                            <li><Link to="/contact">Contact Us</Link></li>
                            <li><Link to="#">Privacy & Transparency</Link></li>
                            <li><Link to="#">Cookie Policy</Link></li>
                            <li><Link to="#">Disclaimer</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Contact links</h4>
                        <p className="website-link">Website: <Link to="/">www.zimautoagri.co.zw</Link></p>
                        <div className="social-links">
                            <a href="#"><i className="fa-brands fa-facebook-f"></i></a>
                            <a href="#"><i className="fa-brands fa-twitter"></i></a>
                            <a href="#"><i className="fa-brands fa-instagram"></i></a>
                            <a href="#"><i className="fa-brands fa-linkedin-in"></i></a>
                        </div>
                        <p className="copyright-text">&copy; 2026 Zim AutoAgri.<br/>All Rights reserved.</p>
                    </div>
                    <div className="footer-col">
                        <h4>Safety Tips</h4>
                        <ul>
                            <li><Link to="#">Meet in a public place</Link></li>
                            <li><Link to="#">Don't pay in advance</Link></li>
                            <li><Link to="#">Inspect the item</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
            <Link to="/contact" className="whatsapp-float">
                <i className="fa-brands fa-whatsapp"></i>
                <span className="notification-badge">1</span>
            </Link>
        </footer>
    );
};

export default Footer;
