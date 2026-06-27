import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="main-footer">
            <div className="footer-container">
                <div className="footer-row">
                    <div className="footer-col">
                        <h4>Home</h4>
                        <ul>
                            <li><Link to="/">About</Link></li>
                            <li><Link to="/contact">Contact Us</Link></li>
                            <li><a href="#">Terms of Use</a></li>
                            <li><a href="#">Privacy Policy</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>About Us</h4>
                        <ul>
                            <li><Link to="/contact">Contact Us</Link></li>
                            <li><a href="#">Privacy & Transparency</a></li>
                            <li><a href="#">Cookie Policy</a></li>
                            <li><a href="#">Disclaimer</a></li>
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
                        <p className="copyright-text">&copy; 2026 Zim AutoAgri.<br />All Rights reserved.</p>
                    </div>
                    <div className="footer-col">
                        <h4>Safety Tips</h4>
                        <ul>
                            <li><a href="#">Meet in a public place</a></li>
                            <li><a href="#">Don't pay in advance</a></li>
                            <li><a href="#">Inspect the item</a></li>
                        </ul>
                        <div className="social-links mt-15">
                            <a href="#"><i className="fa-brands fa-facebook-f"></i></a>
                            <a href="#"><i className="fa-brands fa-twitter"></i></a>
                            <a href="#"><i className="fa-brands fa-youtube"></i></a>
                            <a href="#"><i className="fa-brands fa-linkedin-in"></i></a>
                        </div>
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
