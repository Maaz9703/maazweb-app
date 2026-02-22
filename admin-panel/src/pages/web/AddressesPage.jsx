import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import toast from 'react-hot-toast';

export default function AddressesPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ fullName: '', address: '', city: '', state: '', zipCode: '', phone: '', isDefault: false });

    useEffect(() => {
        if (!user) {
            navigate('/login', { replace: true });
            return;
        }
        api.get('/addresses').then((r) => setAddresses(r.data.data || [])).catch(() => setAddresses([])).finally(() => setLoading(false));
    }, [user, navigate]);

    const saveAddress = async (e) => {
        e.preventDefault();
        const payload = { ...form };
        try {
            if (editing) {
                await api.put(`/addresses/${editing._id}`, payload);
                toast.success('Address updated');
            } else {
                await api.post('/addresses', payload);
                toast.success('Address added');
            }
            const res = await api.get('/addresses');
            setAddresses(res.data.data || []);
            setEditing(null);
            setForm({ fullName: '', address: '', city: '', state: '', zipCode: '', phone: '', isDefault: false });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save');
        }
    };

    const setDefault = async (id) => {
        try {
            await api.put(`/addresses/${id}/default`);
            toast.success('Default address updated');
            const res = await api.get('/addresses');
            setAddresses(res.data.data || []);
        } catch {
            toast.error('Failed to set default');
        }
    };

    const deleteAddress = async (id) => {
        if (!window.confirm('Delete this address?')) return;
        try {
            await api.delete(`/addresses/${id}`);
            setAddresses((prev) => prev.filter((a) => a._id !== id));
            toast.success('Address removed');
            if (editing?._id === id) setEditing(null);
        } catch {
            toast.error('Failed to delete');
        }
    };

    if (!user) return null;

    return (
        <div className="container" style={{ padding: '32px 0 60px' }}>
            <Link to="/profile" style={{ display: 'inline-block', marginBottom: 24, color: 'var(--primary)' }}>← Profile</Link>
            <h1 style={{ marginBottom: 24 }}>Addresses</h1>

            <form onSubmit={saveAddress} className="card" style={{ padding: 24, marginBottom: 24, maxWidth: 480 }}>
                <h3 style={{ marginBottom: 16 }}>{editing ? 'Edit address' : 'Add address'}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label className="label">Full name</label>
                        <input className="input" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} required />
                    </div>
                    <div>
                        <label className="label">Address</label>
                        <input className="input" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <label className="label">City</label>
                            <input className="input" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} required />
                        </div>
                        <div>
                            <label className="label">State</label>
                            <input className="input" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <label className="label">ZIP</label>
                            <input className="input" value={form.zipCode} onChange={(e) => setForm((f) => ({ ...f, zipCode: e.target.value }))} />
                        </div>
                        <div>
                            <label className="label">Phone</label>
                            <input className="input" type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required />
                        </div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} />
                        Default address
                    </label>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add'}</button>
                        {editing && <button type="button" className="btn btn-ghost" onClick={() => { setEditing(null); setForm({ fullName: '', address: '', city: '', state: '', zipCode: '', phone: '', isDefault: false }); }}>Cancel</button>}
                    </div>
                </div>
            </form>

            {loading ? (
                <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {addresses.map((addr) => (
                        <div key={addr._id} className="card" style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                            <div>
                                <div style={{ fontWeight: 600 }}>{addr.fullName} {addr.isDefault && <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Default</span>}</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{addr.address}, {addr.city}, {addr.state} {addr.zipCode} · {addr.phone}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {!addr.isDefault && <button type="button" className="btn btn-ghost" style={{ padding: '8px 12px' }} onClick={() => setDefault(addr._id)}>Set default</button>}
                                <button type="button" className="btn btn-ghost" style={{ padding: '8px 12px' }} onClick={() => { setEditing(addr); setForm({ fullName: addr.fullName, address: addr.address, city: addr.city, state: addr.state, zipCode: addr.zipCode, phone: addr.phone, isDefault: !!addr.isDefault }); }}>Edit</button>
                                <button type="button" className="btn btn-ghost" style={{ padding: '8px 12px', color: 'var(--error)' }} onClick={() => deleteAddress(addr._id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
