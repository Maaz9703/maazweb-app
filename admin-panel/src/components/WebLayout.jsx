import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function WebLayout({ children }) {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const { items: wishlistItems } = useWishlist();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
        setMobileMenuOpen(false);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header
                style={{
                    background: 'var(--bg-card)',
                    borderBottom: '1px solid var(--border)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                }}
            >
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, gap: 12, minWidth: 0 }}>
                    <Link to="/" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', flexShrink: 0 }} className="header-logo">
                        Shofy
                    </Link>

                    <form onSubmit={handleSearch} style={{ flex: '1', maxWidth: 400, display: 'flex', margin: '0 16px' }}>
                        <input
                            type="search"
                            className="input"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                        />
                        <button type="submit" className="btn btn-primary" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                            Search
                        </button>
                    </form>

                    <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Link to="/shop" className="btn btn-ghost" style={{ padding: '8px 16px' }}>Shop</Link>
                        <Link to="/wishlist" className="btn btn-ghost" style={{ padding: '8px 16px', position: 'relative' }}>
                            ♥ Wishlist
                            {wishlistItems.length > 0 && (
                                <span
                                    style={{
                                        position: 'absolute',
                                        top: 4,
                                        right: 4,
                                        background: 'var(--accent)',
                                        color: '#fff',
                                        borderRadius: 999,
                                        minWidth: 18,
                                        height: 18,
                                        fontSize: 11,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {wishlistItems.length}
                                </span>
                            )}
                        </Link>
                        <Link to="/cart" className="btn btn-ghost" style={{ padding: '8px 16px', position: 'relative' }}>
                            Cart
                            {cartCount > 0 && (
                                <span
                                    style={{
                                        position: 'absolute',
                                        top: 4,
                                        right: 4,
                                        background: 'var(--primary)',
                                        color: '#fff',
                                        borderRadius: 999,
                                        minWidth: 18,
                                        height: 18,
                                        fontSize: 11,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        {user ? (
                            <>
                                <Link to="/orders" className="btn btn-ghost" style={{ padding: '8px 16px' }}>Orders</Link>
                                <Link to="/profile" className="btn btn-ghost" style={{ padding: '8px 16px' }}>Profile</Link>
                                {user.role === 'admin' && (
                                    <Link to="/admin" className="btn btn-ghost" style={{ padding: '8px 16px', color: 'var(--accent)' }}>Admin</Link>
                                )}
                                <button type="button" className="btn btn-ghost" style={{ padding: '8px 16px' }} onClick={() => { logout(); navigate('/'); }}>Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-ghost" style={{ padding: '8px 16px' }}>Login</Link>
                                <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px' }}>Sign up</Link>
                            </>
                        )}
                    </nav>

                    <button
                        type="button"
                        className="btn btn-ghost mobile-menu-btn"
                        style={{ padding: 8 }}
                        onClick={() => setMobileMenuOpen((o) => !o)}
                        aria-label="Menu"
                    >
                        ☰
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="mobile-menu-drawer" style={{ borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <form onSubmit={handleSearch}>
                            <input type="search" className="input" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ marginBottom: 8 }} />
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Search</button>
                        </form>
                        <Link to="/shop" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
                        <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)}>Wishlist ({wishlistItems.length})</Link>
                        <Link to="/cart" onClick={() => setMobileMenuOpen(false)}>Cart ({cartCount})</Link>
                        {user ? (
                            <>
                                <Link to="/orders" onClick={() => setMobileMenuOpen(false)}>Orders</Link>
                                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                                {user.role === 'admin' && (
                                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--accent)' }}>Admin Panel</Link>
                                )}
                                <button type="button" className="btn btn-ghost" onClick={() => { logout(); setMobileMenuOpen(false); navigate('/'); }}>Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Sign up</Link>
                            </>
                        )}
                    </div>
                )}
            </header>

            <main style={{ flex: 1 }}>{children}</main>

            <footer
                style={{
                    background: 'var(--bg-card)',
                    borderTop: '1px solid var(--border)',
                    padding: '32px 0',
                    marginTop: 'auto',
                }}
            >
                <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 24 }}>
                    <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>Shofy</div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Your store. One place for everything.</p>
                    </div>
                    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                        <Link to="/shop" style={{ color: 'var(--text-muted)' }}>Shop</Link>
                        <Link to="/cart" style={{ color: 'var(--text-muted)' }}>Cart</Link>
                        {user && <Link to="/orders" style={{ color: 'var(--text-muted)' }}>Orders</Link>}
                        <Link to="/admin/login" style={{ color: 'var(--primary)' }}>Admin Panel</Link>
                    </div>
                </div>
                <div className="container" style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    © {new Date().getFullYear()} Shofy. Created By RT. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
