import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function WebLoginPage() {
    const { loginCustomer, user } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    if (user) {
        navigate('/', { replace: true });
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await loginCustomer(email, password);
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '60px 0', maxWidth: 420, margin: '0 auto' }}>
            <h1 style={{ marginBottom: 8 }}>Login</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Sign in to your Shofy account.</p>
            <form onSubmit={handleSubmit} className="card" style={{ padding: 24 }}>
                <div style={{ marginBottom: 16 }}>
                    <label className="label">Email</label>
                    <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                </div>
                <div style={{ marginBottom: 24 }}>
                    <label className="label">Password</label>
                    <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
                <p style={{ marginTop: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Don't have an account? <Link to="/register">Sign up</Link>
                </p>
            </form>
        </div>
    );
}
