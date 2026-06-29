import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../assets/css/register.css';

const Register = () => {
    const navigate = useNavigate();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [company, setCompany] = useState('');
    const [address, setAddress] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [passwordStrength, setPasswordStrength] = useState(0);

    // Redirect if already logged in
    useEffect(() => {
        const token = localStorage.getItem('zaa_token');
        if (token) {
            navigate('/account');
        }
    }, [navigate]);

    // Password strength logic
    useEffect(() => {
        let strength = 0;
        if (password.length === 0) {
            setPasswordStrength(0);
            return;
        }

        if (password.length >= 8) strength += 1; // Good length
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1; // Has upper & lower
        if (/\d/.test(password)) strength += 1; // Has numbers
        if (/[^a-zA-Z\d]/.test(password)) strength += 1; // Has special characters
        if (password.length >= 12) strength += 1; // Bonus point for super long passwords

        setPasswordStrength(strength);
    }, [password]);

    const getStrengthClasses = (index) => {
        if (passwordStrength === 0) return 'bar';
        if (passwordStrength <= 1) return index === 0 ? 'bar active-weak' : 'bar';
        if (passwordStrength === 2) return index < 2 ? 'bar active-fair' : 'bar';
        if (passwordStrength === 3 || passwordStrength === 4) return index < (passwordStrength === 4 ? 4 : 3) ? 'bar active-good' : 'bar';
        return 'bar active-strong'; // 5+
    };

    const getStrengthText = () => {
        if (passwordStrength === 0) return <>Password must be at least 8 characters</>;
        if (passwordStrength <= 1) return <><span style={{ color: '#ef4444' }}>Weak:</span> Too short or simple</>;
        if (passwordStrength === 2) return <><span style={{ color: '#f59e0b' }}>Fair:</span> Add numbers or symbols</>;
        if (passwordStrength === 3 || passwordStrength === 4) return <><span style={{ color: '#10b981' }}>Good:</span> Almost there</>;
        return <><span style={{ color: 'var(--dark-green)' }}>Strong:</span> Uppercase, lowercase, numbers, special character</>;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (!agreeTerms) {
            setError('You must agree to the Terms of Service to register.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    full_name: fullName, 
                    email, 
                    phone, 
                    password, 
                    province: address // Following original code's mapping
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Registration failed.');
                setLoading(false);
            } else {
                alert(data.message || 'Account created successfully!');
                // Save the token and redirect to dashboard
                localStorage.setItem('zaa_token', data.token); // Modified to zaa_token
                localStorage.setItem('zaa_user', JSON.stringify(data.user));
                navigate('/account');
            }
        } catch (err) {
            console.error('Error during registration:', err);
            setError('A network error occurred. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="register-wrapper">
            <main className="register-container login-container">
                <div className="register-card login-card">
                    
                    <div className="brand-header">
                        <Link to="/" style={{ textDecoration: 'none' }}>
                            <div className="logo-lockup">
                                <img src="/logo.png" alt="Zim AutoAgri Logo" className="logo-img" />
                                <h2>Zim AutoAgri</h2>
                            </div>
                        </Link>
                    </div>

                    <div className="welcome-text">
                        <h1>Create Your Zim AutoAgri Account</h1>
                        <p>Register for the leading enterprise agricultural marketplace</p>
                    </div>

                    <form id="register-form" onSubmit={handleRegister}>
                        
                        <div className="premium-input-group">
                            <i className="fa-regular fa-user input-icon"></i>
                            <div className="input-content">
                                <input 
                                    type="text" 
                                    placeholder="Full Name" 
                                    required 
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="premium-input-group">
                            <i className="fa-regular fa-envelope input-icon"></i>
                            <div className="input-content">
                                <input 
                                    type="email" 
                                    placeholder="Business Email Address" 
                                    required 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="premium-input-group">
                            <i className="fa-solid fa-phone input-icon"></i>
                            <div className="input-content">
                                <input 
                                    type="tel" 
                                    placeholder="Phone Number" 
                                    required 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="premium-input-group">
                            <i className="fa-regular fa-building input-icon"></i>
                            <div className="input-content">
                                <input 
                                    type="text" 
                                    placeholder="Company Name" 
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="premium-input-group">
                            <i className="fa-solid fa-location-dot input-icon"></i>
                            <div className="input-content">
                                <input 
                                    type="text" 
                                    placeholder="Farm/Business Address" 
                                    required 
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="premium-input-group password-group">
                            <i className="fa-solid fa-lock input-icon"></i>
                            <div className="input-content">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Password" 
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
                                <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>

                        <div className="password-strength-container">
                            <div className="strength-bars">
                                <div className={getStrengthClasses(0)}></div>
                                <div className={getStrengthClasses(1)}></div>
                                <div className={getStrengthClasses(2)}></div>
                                <div className={getStrengthClasses(3)}></div>
                                <div className={getStrengthClasses(4)}></div>
                            </div>
                            <p className="strength-text">{getStrengthText()}</p>
                        </div>

                        <div className="terms-container">
                            <label className="terms-label">
                                <input 
                                    type="checkbox" 
                                    required 
                                    checked={agreeTerms}
                                    onChange={(e) => setAgreeTerms(e.target.checked)}
                                /> 
                                <span className="custom-checkbox"></span>
                                <span className="terms-text">I agree to the Zim AutoAgri <strong>Terms of Service</strong> and <strong>Privacy Policy</strong>.</span>
                            </label>
                        </div>

                        {error && (
                            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '10px', textAlign: 'center' }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" className="primary-btn" disabled={loading}>
                            {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Creating...</> : 'Create Account'}
                        </button>

                    </form>

                    <div className="card-footer">
                        <p>Already have an account? <Link to="/login">Sign In</Link></p>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Register;
