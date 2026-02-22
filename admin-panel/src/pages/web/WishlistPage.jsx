import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';

export default function WishlistPage() {
    const { items } = useWishlist();

    if (items.length === 0) {
        return (
            <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
                <h1 style={{ marginBottom: 16 }}>Wishlist</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>No items saved yet.</p>
                <Link to="/shop" className="btn btn-primary">Browse products</Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '32px 0 60px' }}>
            <h1 style={{ marginBottom: 24 }}>Wishlist</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
                {items.map((p) => (
                    <Link
                        key={p._id}
                        to={`/product/${p._id}`}
                        className="card"
                        style={{ color: 'inherit', overflow: 'hidden', position: 'relative' }}
                    >
                        <div style={{ aspectRatio: '1', background: 'var(--border)', overflow: 'hidden' }}>
                            <img
                                src={p.image || 'https://via.placeholder.com/400'}
                                alt={p.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        <div style={{ padding: 16 }}>
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.title}</div>
                            <div style={{ color: 'var(--primary)', fontWeight: 600 }}>
                                PKR {Number(p.price || 0).toFixed(2)}
                            </div>
                            {p.category && (
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                    {p.category}
                                </div>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
