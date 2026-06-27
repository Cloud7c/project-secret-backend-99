import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            setSuccess('Login successful! Redirecting...');
            setTimeout(() => {
                const searchParams = new URLSearchParams(location.search);
                const redirect = searchParams.get('redirect') || '/';
                if (redirect.includes('account')) {
                    navigate('/account');
                } else if (redirect.includes('post-ad')) {
                    navigate('/post-ad');
                } else {
                    navigate('/');
                }
            }, 1000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <div className="login-image-side">
                    <img src="/tractor-johndeere.jpg" alt="Farm Tractor" />
                    <div className="login-overlay-text">
                        <h2>Welcome Back to Zim AutoAgri</h2>
                        <p>Your gateway to the best deals in Zimbabwe.</p>
                    </div>
                </div>
                
                <div className="login-form-side">
                    <div className="form-header">
                        <h2>Sign In</h2>
                        <p>Welcome back! Please enter your details.</p>
                    </div>
                    
                    {error && <div className="alert alert-error" style={{ padding: '10px', background: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '15px' }}>{error}</div>}
                    {success && <div className="alert alert-success" style={{ padding: '10px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', marginBottom: '15px' }}>{success}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter your email" />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
                        </div>
                        <div className="form-options">
                            <label><input type="checkbox" /> Remember me</label>
                            <a href="#" className="forgot-password">Forgot Password?</a>
                        </div>
                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                    
                    <div className="social-login">
                        <p>Or sign in with</p>
                        <div className="social-buttons">
                            <button className="social-btn google"><i className="fa-brands fa-google"></i> Google</button>
                            <button className="social-btn facebook"><i className="fa-brands fa-facebook-f"></i> Facebook</button>
                        </div>
                    </div>

                    <p className="signup-prompt">Don't have an account? <Link to="/register">Sign up for free</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
