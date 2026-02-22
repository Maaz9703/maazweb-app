import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import api from '../../config/api';
import toast from 'react-hot-toast';
import { getQuantityDiscount } from '../../utils/price';

export default function ShopPage() {
    const [searchParams] = useSearchParams();
    const searchFromUrl = searchParams.get('search') || '';
    const categoryFromUrl = searchParams.get('category') || '';
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchFromUrl);
    const [category, setCategory] = useState(categoryFromUrl);
    const [sort, setSort] = useState('newest');
    const [onlyInStock, setOnlyInStock] = useState(false);
    const [priceFilter, setPriceFilter] = useState('');
    const { addToCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();

    useEffect(() => {
        setSearch(searchFromUrl);
        setCategory(categoryFromUrl);
    }, [searchFromUrl, categoryFromUrl]);

    useEffect(() => {
        setLoading(true);
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (category.trim()) params.category = category.trim();
        if (onlyInStock) params.inStock = true;
        if (priceFilter === 'low') params.maxPrice = 2000;
        if (priceFilter === 'mid') {
            params.minPrice = 2000;
            params.maxPrice = 10000;
        }
        if (priceFilter === 'high') params.minPrice = 10000;
        api
            .get('/products', { params })
            .then((res) => setProducts(res.data.data || []))
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, [search, category]);

    useEffect(() => {
        api.get('/products/categories/list').then((r) => setCategories(r.data.data || [])).catch(() => { });
    }, []);

    const sorted = useMemo(() => {
        const list = [...(products || [])];
        if (sort === 'price-asc') list.sort((a, b) => (a.price || 0) - (b.price || 0));
        if (sort === 'price-desc') list.sort((a, b) => (b.price || 0) - (a.price || 0));
        if (sort === 'name') list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        if (sort === 'newest') list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        return list;
    }, [products, sort]);

    const handleAddToCart = (e, product) => {
        e.preventDefault();
        if (product.stock < 1) {
            toast.error('Out of stock');
            return;
        }
        addToCart(product, 1);
        toast.success('Added to cart');
    };

    return (
        <div className="container" style={{ padding: '32px 0 60px' }}>
            <h1 style={{ fontSize: '1.75rem', marginBottom: 8 }}>Shop</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 14 }}>
                Browse products from the same catalog used by your admin panel and mobile app.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 16, alignItems: 'center' }}>
                <input
                    type="search"
                    className="input"
                    placeholder="Search products"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ maxWidth: 280 }}
                />
                <select className="input" value={category} onChange={(e) => setCategory(e.target.value)} style={{ maxWidth: 200 }}>
                    <option value="">All categories</option>
                    {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                <select className="input" value={sort} onChange={(e) => setSort(e.target.value)} style={{ maxWidth: 160 }}>
                    <option value="newest">Newest</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name">Name A–Z</option>
                </select>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
                <button
                    type="button"
                    className="btn btn-ghost"
                    style={{
                        padding: '6px 14px',
                        fontSize: 13,
                        borderRadius: 999,
                        borderColor: onlyInStock ? 'var(--primary)' : 'rgba(148,163,184,0.5)',
                    }}
                    onClick={() => setOnlyInStock((v) => !v)}
                >
                    {onlyInStock ? '✔ In stock only' : 'In stock only'}
                </button>
                {['', 'low', 'mid', 'high'].map((pf) => (
                    <button
                        key={pf || 'all'}
                        type="button"
                        className="btn btn-ghost"
                        style={{
                            padding: '6px 14px',
                            fontSize: 13,
                            borderRadius: 999,
                            borderColor: priceFilter === pf ? 'var(--primary)' : 'rgba(148,163,184,0.5)',
                        }}
                        onClick={() => setPriceFilter(pf)}
                    >
                        {pf === ''
                            ? 'All prices'
                            : pf === 'low'
                                ? 'Under 2,000'
                                : pf === 'mid'
                                    ? '2,000 – 10,000'
                                    : '10,000+'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="card" style={{ height: 280, background: 'var(--border)' }} />
                    ))}
                </div>
            ) : sorted.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', padding: 40, textAlign: 'center' }}>No products found.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
                    {sorted.map((p, idx) => (
                        <motion.div
                            key={p._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: idx * 0.03 }}
                            whileHover={{ y: -4, scale: 1.01 }}
                            className="card"
                            style={{ overflow: 'hidden', position: 'relative' }}
                        >
                            <Link to={`/product/${p._id}`} style={{ color: 'inherit' }}>
                                <div style={{ aspectRatio: '1', background: 'var(--border)', overflow: 'hidden' }}>
                                    <img
                                        src={p.image || 'https://via.placeholder.com/400'}
                                        alt={p.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                                <div style={{ padding: 16, position: 'relative' }}>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleWishlist(p);
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: 10,
                                            right: 10,
                                            borderRadius: 999,
                                            border: '1px solid rgba(248,250,252,0.25)',
                                            width: 32,
                                            height: 32,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'rgba(15,23,42,0.85)',
                                            color: isInWishlist(p._id) ? '#f9739a' : 'var(--text-muted)',
                                            fontSize: 16,
                                        }}
                                    >
                                        ♥
                                    </button>
                                    <div style={{ fontWeight: 600, marginBottom: 4, paddingRight: 32 }}>{p.title}</div>
                                    <div style={{ color: 'var(--primary)', fontWeight: 600 }}>
                                        PKR {getQuantityDiscount(p, 1).unitPrice.toFixed(2)}
                                        {p.quantityDiscounts?.length > 0 && <span style={{ fontSize: 10, marginLeft: 4, color: 'var(--success)' }}>qty discount</span>}
                                    </div>
                                    {p.stock !== undefined && (
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                            Stock: {p.stock}
                                        </div>
                                    )}
                                </div>
                            </Link>
                            <button
                                type="button"
                                className="btn btn-primary"
                                style={{ margin: '0 16px 16px', width: 'calc(100% - 32px)' }}
                                onClick={(e) => handleAddToCart(e, p)}
                                disabled={p.stock < 1}
                            >
                                Add to cart
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
