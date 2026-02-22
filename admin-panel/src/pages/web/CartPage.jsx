import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { getQuantityDiscount } from '../../utils/price';

export default function CartPage() {
    const { cartItems, updateQuantity, removeFromCart } = useCart();
    const cartTotal = cartItems.reduce((sum, item) => sum + getQuantityDiscount(item.product, item.quantity).totalPrice, 0);

    if (cartItems.length === 0) {
        return (
            <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
                <h2 style={{ marginBottom: 16 }}>Your cart is empty</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Add items from the shop to get started.</p>
                <Link to="/shop" className="btn btn-primary">Go to Shop</Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '32px 0 60px' }}>
            <h1 style={{ marginBottom: 24 }}>Cart ({cartItems.length} items)</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {cartItems.map((item) => (
                    <div key={item.product._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 24, padding: 20 }}>
                        <Link to={`/product/${item.product._id}`} style={{ flexShrink: 0, width: 100, height: 100, borderRadius: 8, overflow: 'hidden', background: 'var(--border)' }}>
                            <img src={item.product.image || 'https://via.placeholder.com/100'} alt={item.product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Link>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <Link to={`/product/${item.product._id}`} style={{ fontWeight: 600, color: 'var(--text)' }}>{item.product.title}</Link>
                            {(() => {
                                const { unitPrice, hasDiscount, discountPercent } = getQuantityDiscount(item.product, item.quantity);
                                return (
                                    <div style={{ color: 'var(--primary)', marginTop: 4 }}>
                                        PKR {unitPrice.toFixed(2)} each {hasDiscount && <span style={{ fontSize: 11, color: 'var(--success)' }}>({discountPercent}% off)</span>}
                                    </div>
                                );
                            })()}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <input
                                type="number"
                                min={1}
                                max={item.product.stock || 999}
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.product._id, Math.max(1, parseInt(e.target.value, 10) || 1))}
                                className="input"
                                style={{ width: 64, textAlign: 'center' }}
                            />
                            <button type="button" className="btn btn-ghost" style={{ color: 'var(--error)' }} onClick={() => removeFromCart(item.product._id)}>Remove</button>
                        </div>
                        <div style={{ fontWeight: 600 }}>PKR {getQuantityDiscount(item.product, item.quantity).totalPrice.toFixed(2)}</div>
                    </div>
                ))}
            </div>
            <div className="card" style={{ marginTop: 24, padding: 24, maxWidth: 400, marginLeft: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span>Subtotal</span>
                    <span style={{ fontWeight: 700 }}>PKR {cartTotal.toFixed(2)}</span>
                </div>
                <Link to="/checkout" className="btn btn-primary" style={{ width: '100%' }}>Proceed to checkout</Link>
            </div>
        </div>
    );
}
