import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import api from '../../config/api';
import toast from 'react-hot-toast';
import { getQuantityDiscount } from '../../utils/price';

export default function ProductPage() {
    const { id } = useParams();
    const { addToCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        api
            .get(`/products/${id}`)
            .then((res) => setProduct(res.data.data))
            .catch(() => setProduct(null))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (!product?._id) return;
        api.get(`/reviews/product/${product._id}`).then((r) => setReviews(r.data.data || [])).catch(() => setReviews([]));
    }, [product?._id]);

    useEffect(() => {
        if (!product?._id) return;
        try {
            const raw = localStorage.getItem('shofy_recently_viewed');
            const list = raw ? JSON.parse(raw) : [];
            const compact = [
                { _id: product._id, title: product.title, price: product.price, image: product.image, category: product.category },
                ...list.filter((p) => p._id !== product._id),
            ].slice(0, 12);
            localStorage.setItem('shofy_recently_viewed', JSON.stringify(compact));
        } catch {
            // ignore
        }
    }, [product]);

    const handleAddToCart = () => {
        if (!product || product.stock < quantity) {
            toast.error('Insufficient stock');
            return;
        }
        addToCart(product, quantity);
        toast.success('Added to cart');
    };

    if (loading || !product) {
        return (
            <div className="container" style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                {loading ? 'Loading...' : 'Product not found.'}
            </div>
        );
    }

    const avgRating = reviews.length ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length : 0;

    return (
        <div className="container" style={{ padding: '32px 0 60px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
                <motion.div
                    className="card"
                    style={{ overflow: 'hidden', aspectRatio: '1', maxHeight: 500, position: 'relative' }}
                    initial={{ opacity: 0, scale: 0.96, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                    <img
                        src={product.image || 'https://via.placeholder.com/400'}
                        alt={product.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                        type="button"
                        onClick={() => toggleWishlist(product)}
                        style={{
                            position: 'absolute',
                            top: 14,
                            right: 14,
                            borderRadius: 999,
                            border: '1px solid rgba(248,250,252,0.3)',
                            width: 40,
                            height: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(15,23,42,0.8)',
                            color: isInWishlist(product._id) ? '#fb7185' : 'var(--text-muted)',
                            fontSize: 18,
                        }}
                    >
                        ♥
                    </button>
                </motion.div>
                <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 8 }}>{product.category}</div>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: 12 }}>{product.title}</h1>
                    {reviews.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                            <span style={{ color: 'var(--primary)' }}>★ {avgRating.toFixed(1)}</span>
                            <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>({reviews.length} reviews)</span>
                        </div>
                    )}
                    {(() => {
                        const { unitPrice, totalPrice, originalPrice, hasDiscount, discountPercent, tiers } = getQuantityDiscount(product, quantity);
                        return (
                            <>
                                <div style={{ marginBottom: 16 }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                                        {hasDiscount && (
                                            <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', marginRight: 12, fontSize: '1.1rem' }}>
                                                PKR {originalPrice.toFixed(2)}
                                            </span>
                                        )}
                                        PKR {unitPrice.toFixed(2)} per unit
                                        {hasDiscount && <span style={{ fontSize: '0.875rem', marginLeft: 10, color: 'var(--success)', fontWeight: 600 }}>{discountPercent}% off</span>}
                                    </div>
                                    <div style={{ marginTop: 8, color: 'var(--text-muted)' }}>
                                        Total for {quantity} × PKR {unitPrice.toFixed(2)} = <strong style={{ color: 'var(--text)' }}>PKR {totalPrice.toFixed(2)}</strong>
                                    </div>
                                </div>
                                {tiers?.length > 0 && (
                                    <div className="card" style={{ padding: 12, marginBottom: 24 }}>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Quantity discounts</div>
                                        {tiers.map((t, i) => (
                                            <div key={i} style={{ fontSize: 13 }}>Buy {t.minQty}+ → {t.discountPercent}% off</div>
                                        ))}
                                    </div>
                                )}
                            </>
                        );
                    })()}
                    <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{product.description || 'No description.'}</p>
                    <div style={{ marginBottom: 24 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Stock: </span>
                        <span style={{ color: product.stock > 10 ? 'var(--success)' : product.stock > 0 ? '#f59e0b' : 'var(--error)' }}>{product.stock > 0 ? product.stock : 'Out of stock'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                        <input
                            type="number"
                            min={1}
                            max={product.stock || 1}
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            className="input"
                            style={{ width: 80, textAlign: 'center' }}
                        />
                        <button type="button" className="btn btn-primary" onClick={handleAddToCart} disabled={!product.stock || product.stock < 1}>
                            Add to cart
                        </button>
                    </div>

                    {reviews.length > 0 && (
                        <div className="card" style={{ padding: 20, marginTop: 24 }}>
                            <h3 style={{ marginBottom: 12 }}>Reviews</h3>
                            {reviews.slice(0, 5).map((r) => (
                                <div key={r._id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <span style={{ color: 'var(--primary)' }}>{'★'.repeat(r.rating || 0)}</span>
                                        <span style={{ fontWeight: 500 }}>{r.user?.name || 'User'}</span>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{r.comment || '—'}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
