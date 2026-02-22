import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';

const statusColor = (status) => {
    switch (status) {
        case 'Delivered': return 'var(--success)';
        case 'Shipped':
        case 'Processing': return 'var(--primary)';
        case 'Cancelled': return 'var(--error)';
        default: return 'var(--text-muted)';
    }
};

export default function WebOrdersPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login', { replace: true });
            return;
        }
        api.get('/orders').then((r) => setOrders(r.data.data || [])).catch(() => setOrders([])).finally(() => setLoading(false));
    }, [user, navigate]);

    if (!user) return null;

    return (
        <div className="container" style={{ padding: '32px 0 60px' }}>
            <h1 style={{ marginBottom: 24 }}>My Orders</h1>
            {loading ? (
                <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
            ) : orders.length === 0 ? (
                <div className="card" style={{ padding: 48, textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>No orders yet.</p>
                    <Link to="/shop" className="btn btn-primary">Start shopping</Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {orders.map((order) => (
                        <Link key={order._id} to={`/orders/${order._id}`} className="card" style={{ padding: 20, color: 'inherit', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                            <div>
                                <div style={{ fontWeight: 600 }}>Order #{String(order._id).slice(-8).toUpperCase()}</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>PKR {Number(order.total || 0).toFixed(2)}</span>
                                <span style={{ background: statusColor(order.status), color: '#fff', padding: '4px 12px', borderRadius: 8, fontSize: '0.875rem' }}>{order.status}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
