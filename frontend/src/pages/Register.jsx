import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        confirm_password: '',
        province: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (formData.password !== formData.confirm_password) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Registration failed');

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            setSuccess('Account created! Redirecting...');
            setTimeout(() => navigate('/account'), 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-wrapper">
            <div className="register-container">
                <div className="register-header">
                    <h2>Create an Account</h2>
                    <p>Join Zimbabwe's premier marketplace today.</p>
                </div>
                
                {error && <div className="alert alert-error" style={{ padding: '10px', background: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}
                {success && <div className="alert alert-success" style={{ padding: '10px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', marginBottom: '15px', textAlign: 'center' }}>{success}</div>}

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required placeholder="John Doe" />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" />
                        </div>
                        <div className="form-group">
                            <label>Phone Number (WhatsApp preferred)</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+263 71 234 5678" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Province / Region</label>
                        <select name="province" value={formData.province} onChange={handleChange} required>
                            <option value="" disabled>Select your province</option>
                            <option value="Harare">Harare Metropolitan</option>
                            <option value="Bulawayo">Bulawayo Metropolitan</option>
                            <option value="Manicaland">Manicaland</option>
                            <option value="Mashonaland Central">Mashonaland Central</option>
                            <option value="Mashonaland East">Mashonaland East</option>
                            <option value="Mashonaland West">Mashonaland West</option>
                            <option value="Masvingo">Masvingo</option>
                            <option value="Matabeleland North">Matabeleland North</option>
                            <option value="Matabeleland South">Matabeleland South</option>
                            <option value="Midlands">Midlands</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Password</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" />
                        </div>
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} required placeholder="••••••••" />
                        </div>
                    </div>

                    <div className="form-options">
                        <label className="terms-label">
                            <input type="checkbox" required />
                            I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                        </label>
                    </div>

                    <button type="submit" className="register-btn" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p className="login-prompt">Already have an account? <Link to="/login">Sign in</Link></p>
            </div>
        </div>
    );
};

export default Register;
