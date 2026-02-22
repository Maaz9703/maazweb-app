import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) {
        navigate('/login', { replace: true });
        return null;
    }

    return (
        <div className="container" style={{ padding: '32px 0 60px' }}>
            <h1 style={{ marginBottom: 24 }}>Profile</h1>
            <div className="card" style={{ padding: 24, maxWidth: 480 }}>
                <p style={{ marginBottom: 8 }}><strong>Name</strong> {user.name}</p>
                <p style={{ marginBottom: 24, color: 'var(--text-muted)' }}><strong>Email</strong> {user.email}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Link to="/profile/addresses" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>Manage addresses</Link>
                    <Link to="/orders" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>My orders</Link>
                    <button type="button" className="btn btn-ghost" style={{ justifyContent: 'flex-start', color: 'var(--error)' }} onClick={() => { logout(); navigate('/'); }}>Logout</button>
                </div>
            </div>
        </div>
    );
}
