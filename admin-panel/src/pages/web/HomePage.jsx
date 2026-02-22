import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../config/api';
import { getQuantityDiscount } from '../../utils/price';

export default function HomePage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recentlyViewed, setRecentlyViewed] = useState([]);

    useEffect(() => {
        Promise.all([
            api.get('/products', { params: { limit: 8 } }).then((r) => r.data.data || []),
            api.get('/products/categories/list').then((r) => r.data.data || []),
        ])
            .then(([prods, cats]) => {
                setProducts(Array.isArray(prods) ? prods.slice(0, 8) : []);
                setCategories(Array.isArray(cats) ? cats : []);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        try {
            const raw = localStorage.getItem('shofy_recently_viewed');
            setRecentlyViewed(raw ? JSON.parse(raw) : []);
        } catch {
            setRecentlyViewed([]);
        }
    }, []);

    return (
        <div>
            <section
                style={{
                    padding: '80px 0 64px',
                    textAlign: 'center',
                    background:
                        'radial-gradient(circle at 20% 30%, rgba(167, 139, 250, 0.25), transparent 50%), radial-gradient(circle at 80% 70%, rgba(244, 114, 182, 0.25), transparent 50%), linear-gradient(180deg, #020617 0%, var(--bg) 75%)',
                    borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'radial-gradient(circle at 50% 0%, rgba(129, 140, 248, 0.1), transparent 70%)',
                        pointerEvents: 'none',
                    }}
                />
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{ position: 'relative', zIndex: 1 }}
                >
                    <p
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '4px 12px',
                            borderRadius: 999,
                            border: '1px solid rgba(148, 163, 184, 0.4)',
                            color: 'var(--text-muted)',
                            fontSize: 12,
                            marginBottom: 16,
                            background: 'rgba(15,23,42,0.7)',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        <span style={{ fontSize: 18 }}>✨</span> New: Everthing Available in one Shop
                    </p>
                    <h1
                        style={{
                            fontSize: 'clamp(2.4rem, 5vw, 3.4rem)',
                            fontWeight: 700,
                            marginBottom: 16,
                            letterSpacing: '-0.04em',
                        }}
                    >
                        Shop beautifully. Manage powerfully.
                    </h1>
                    <p
                        style={{
                            color: 'var(--text-muted)',
                            fontSize: '1.05rem',
                            maxWidth: 560,
                            margin: '0 auto 28px',
                        }}
                    >
                        Shofy connects a fast web storefront, seamless checkout, and powerful admin tools to help you grow your online business with ease.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link to="/shop" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 28px' }}>
                                🛍️ Start shopping
                            </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link to="/orders" className="btn btn-ghost" style={{ fontSize: '0.95rem', padding: '14px 24px' }}>
                                📦 My orders
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {categories.length > 0 && (
                <section className="container" style={{ padding: '48px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                        <div
                            style={{
                                width: 4,
                                height: 28,
                                background: 'linear-gradient(180deg, var(--primary), var(--accent))',
                                borderRadius: 2,
                                flexShrink: 0,
                            }}
                        />
                        <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', fontWeight: 700, margin: 0 }}>Shop by Category</h2>
                    </div>
                    <div className="categories-grid">
                        {categories.map((cat, idx) => (
                            <motion.div
                                key={cat}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: idx * 0.05 }}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Link
                                    to={`/shop?category=${encodeURIComponent(cat)}`}
                                    className="category-card"
                                    style={{
                                        display: 'block',
                                        padding: '14px 20px',
                                        color: 'var(--text)',
                                        fontWeight: 600,
                                        fontSize: 'clamp(13px, 3vw, 14px)',
                                        borderRadius: 12,
                                        border: '1px solid rgba(148,163,184,0.3)',
                                        background: 'linear-gradient(135deg, rgba(167,139,250,0.12), rgba(244,114,182,0.08))',
                                        backdropFilter: 'blur(10px)',
                                        transition: 'all 0.25s ease',
                                        textAlign: 'center',
                                        textDecoration: 'none',
                                        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.4)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(167,139,250,0.6)';
                                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(244,114,182,0.15))';
                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(167, 139, 250, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(148,163,184,0.3)';
                                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(167,139,250,0.12), rgba(244,114,182,0.08))';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.4)';
                                    }}
                                >
                                    {cat}
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            <section className="container" style={{ padding: '48px 0 60px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                            style={{
                                width: 4,
                                height: 28,
                                background: 'linear-gradient(180deg, var(--primary), var(--accent))',
                                borderRadius: 2,
                            }}
                        />
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Featured Products</h2>
                    </div>
                    <Link
                        to="/shop"
                        className="btn btn-ghost"
                        style={{ fontSize: '0.875rem', padding: '8px 16px' }}
                    >
                        View all →
                    </Link>
                </div>
                {loading ? (
                    <div className="products-grid">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="card" style={{ height: 280, background: 'var(--border)' }} />
                        ))}
                    </div>
                ) : (
                    <div className="products-grid">
                        {products.map((p, idx) => (
                            <motion.div
                                key={p._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: idx * 0.04 }}
                                whileHover={{ y: -6, scale: 1.02 }}
                                style={{ position: 'relative' }}
                            >
                                <Link to={`/product/${p._id}`} className="card" style={{ color: 'inherit', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ aspectRatio: '1', background: 'var(--border)', overflow: 'hidden', position: 'relative' }}>
                                        <img
                                            src={p.image || 'https://via.placeholder.com/400'}
                                            alt={p.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                        />
                                        {p.stock !== undefined && p.stock > 0 && p.stock <= 10 && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    left: 8,
                                                    background: 'rgba(245, 158, 11, 0.9)',
                                                    color: '#fff',
                                                    padding: '4px 8px',
                                                    borderRadius: 6,
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                Low Stock
                                            </div>
                                        )}
                                        {p.category && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    right: 8,
                                                    background: 'rgba(15, 23, 42, 0.85)',
                                                    backdropFilter: 'blur(10px)',
                                                    color: 'var(--text-muted)',
                                                    padding: '4px 10px',
                                                    borderRadius: 6,
                                                    fontSize: 11,
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {p.category}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 15, lineHeight: 1.3 }}>{p.title}</div>
                                            <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.1rem' }}>
                                                PKR {getQuantityDiscount(p, 1).unitPrice.toFixed(2)}
                                                {p.quantityDiscounts?.length > 0 && (
                                                    <span style={{ fontSize: 11, marginLeft: 6, color: 'var(--success)', fontWeight: 500 }}>qty discount</span>
                                                )}
                                            </div>
                                        </div>
                                        {p.stock !== undefined && (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
                                                {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            {recentlyViewed.length > 0 && (
                <section className="container" style={{ padding: '0 0 60px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <div
                            style={{
                                width: 4,
                                height: 24,
                                background: 'linear-gradient(180deg, var(--accent), var(--primary))',
                                borderRadius: 2,
                            }}
                        />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Recently Viewed</h2>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20, marginLeft: 16 }}>
                        Quick access to items you opened recently on this device.
                    </p>
                    <div className="products-grid-recent">
                        {recentlyViewed.slice(0, 6).map((p, idx) => (
                            <motion.div
                                key={p._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.25, delay: idx * 0.05 }}
                                whileHover={{ y: -4, scale: 1.02 }}
                            >
                                <Link
                                    to={`/product/${p._id}`}
                                    className="card"
                                    style={{ color: 'inherit', overflow: 'hidden', height: '100%' }}
                                >
                                    <div style={{ aspectRatio: '4 / 3', background: 'var(--border)', overflow: 'hidden' }}>
                                        <img
                                            src={p.image || 'https://via.placeholder.com/400'}
                                            alt={p.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div style={{ padding: 12 }}>
                                        <div style={{ fontWeight: 500, marginBottom: 4, fontSize: 14, lineHeight: 1.3 }}>{p.title}</div>
                                        <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 14 }}>
                                            PKR {getQuantityDiscount(p, 1).unitPrice.toFixed(2)}
                                            {p.quantityDiscounts?.length > 0 && <span style={{ fontSize: 10, marginLeft: 4, color: 'var(--success)' }}>qty discount</span>}
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
