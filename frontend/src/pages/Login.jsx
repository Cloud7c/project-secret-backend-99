import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import '../assets/css/login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        // If user is ALREADY logged in, respect redirect param or go to dashboard
        const token = localStorage.getItem('zaa_token');
        const userJson = localStorage.getItem('zaa_user');
        
        if (token && userJson) {
            try {
                // Verify user JSON is valid before redirecting
                const user = JSON.parse(userJson);
                const isAdmin = user.is_admin === true;
                let redirect = searchParams.get('redirect');
                if (!redirect) {
                    redirect = isAdmin ? '/admin' : '/account';
                }
                navigate(redirect, { replace: true });
            } catch (err) {
                // If JSON is corrupted, clear it so they can log in again
                localStorage.removeItem('zaa_token');
                localStorage.removeItem('zaa_user');
            }
        }
    }, [navigate, searchParams]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !password) {
            setError('Please enter your email and password.');
            return;
        }

        setLoading(true);

        try {
            // Call our real backend API
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                // Show the error from the server
                setError(data.error || 'Login failed. Please try again.');
                setPassword(''); // Clear password on failure
                setLoading(false);
                return;
            }

            // Save the token and user to localStorage
            localStorage.setItem('zaa_token', data.token);
            localStorage.setItem('zaa_user', JSON.stringify(data.user));

            // Check if user is an admin from the database flag
            const isAdmin = data.user.is_admin === true;

            // Redirect
            let redirect = searchParams.get('redirect');
            
            // If they are an admin trying to access the normal account page, route to admin
            if (isAdmin && redirect === '/account') {
                redirect = '/admin';
            } else if (!redirect) {
                redirect = isAdmin ? '/admin' : '/account';
            }
            
            navigate(redirect, { replace: true });

        } catch (err) {
            setError('Network error. Please check your connection.');
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <main className="login-container">
                <div className="login-card">
                    
                    <div className="brand-header">
                        <Link to="/" style={{ textDecoration: 'none' }}>
                            <div className="logo-lockup">
                                <img src="/logo.png" alt="Zim AutoAgri Logo" className="logo-img" />
                                <h2>Zim AutoAgri</h2>
                            </div>
                            <p>Vehicles, Machinery & Agriculture</p>
                        </Link>
                    </div>

                    <div className="welcome-text">
                        <h1>Welcome Back</h1>
                        <p>Please sign in to manage your account.</p>
                    </div>

                    <form id="login-form" autoComplete="off" onSubmit={handleLogin}>
                        
                        <div className="premium-input-group">
                            <i className="fa-regular fa-envelope input-icon"></i>
                            <div className="input-content">
                                <label>Email Address</label>
                                <input 
                                    type="email" 
                                    placeholder="example@email.com" 
                                    autoComplete="off" 
                                    required 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="premium-input-group">
                            <i className="fa-solid fa-key input-icon"></i>
                            <div className="input-content">
                                <label>Password</label>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="••••••••" 
                                    autoComplete="new-password" 
                                    required 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <button 
                                type="button" 
                                className="toggle-password" 
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <i className={`fa-solid ${showPassword ? 'fa-lock' : 'fa-lock-open'}`}></i> 
                                <span>{showPassword ? 'Hide' : 'Show'}</span>
                            </button>
                        </div>

                        <div className="form-options">
                            <a href="#" className="forgot-link">Forgot your password?</a>
                            <label className="remember-me">
                                <input type="checkbox" /> 
                                <span className="custom-checkbox"></span>
                                Remember me
                            </label>
                        </div>

                        {error && (
                            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" className="primary-btn" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>

                        <div className="divider">
                            <span>OR</span>
                        </div>

                        <Link to="/register">
                            <button type="button" className="secondary-btn">Create Account</button>
                        </Link>

                    </form>

                    <div className="card-footer">
                        <p>Need Help? <a href="#">Contact Support</a></p>
                        <p className="security-text"><i className="fa-solid fa-lock"></i> Secured by Zim AutoAgri Security | © 2026 Zim AutoAgri Inc.</p>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Login;
