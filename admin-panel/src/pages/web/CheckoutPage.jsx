import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../config/api';
import toast from 'react-hot-toast';
import { getQuantityDiscount } from '../../utils/price';

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cartItems, clearCart } = useCart();
    const cartTotal = cartItems.reduce((sum, i) => sum + getQuantityDiscount(i.product, i.quantity).totalPrice, 0);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState(null);
    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login', { replace: true });
            return;
        }
        api.get('/addresses').then((r) => {
            const list = r.data.data || [];
            setAddresses(list);
            setSelectedAddress(list.find((a) => a.isDefault) || list[0] || null);
        }).catch(() => setAddresses([])).finally(() => setLoading(false));
    }, [user, navigate]);

    const applyCoupon = () => {
        if (!couponCode.trim()) return;
        api.post('/coupons/apply', { code: couponCode.trim() }).then((r) => {
            setCouponApplied(r.data.data);
            toast.success('Coupon applied');
        }).catch((e) => toast.error(e.response?.data?.message || 'Invalid coupon'));
    };

    const discount = couponApplied?.discount || 0;
    const finalTotal = Math.max(0, cartTotal - discount);

    const handlePlaceOrder = async () => {
        if (!selectedAddress && addresses.length > 0) {
            toast.error('Please select a shipping address');
            return;
        }
        if (addresses.length === 0) {
            toast.error('Please add a shipping address first');
            navigate('/profile/addresses');
            return;
        }
        if (cartItems.length === 0) {
            toast.error('Cart is empty');
            return;
        }

        setPlacing(true);
        try {
            const orderData = {
                items: cartItems.map((i) => ({ product: i.product._id, quantity: i.quantity })),
                shippingAddress: {
                    fullName: selectedAddress.fullName,
                    address: selectedAddress.address,
                    city: selectedAddress.city,
                    state: selectedAddress.state,
                    zipCode: selectedAddress.zipCode,
                    phone: selectedAddress.phone,
                },
                paymentMethod,
                ...(couponApplied?.code && { couponCode: couponApplied.code }),
            };
            await api.post('/orders', orderData);
            setSuccess(true);
            clearCart();
            toast.success('Order placed successfully');
        } catch (e) {
            toast.error(e.response?.data?.message || 'Order failed');
        } finally {
            setPlacing(false);
        }
    };

    if (!user) return null;

    if (success) {
        return (
            <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
                <h2 style={{ marginBottom: 16, color: 'var(--success)' }}>Order placed!</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Thank you for your order.</p>
                <Link to="/orders" className="btn btn-primary">View orders</Link>
            </div>
        );
    }

    if (cartItems.length === 0 && !success) {
        return (
            <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
                <p style={{ marginBottom: 16 }}>Your cart is empty.</p>
                <Link to="/shop" className="btn btn-primary">Go to shop</Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '32px 0 60px' }}>
            <h1 style={{ marginBottom: 24 }}>Checkout</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32 }}>
                <div>
                    <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                        <h3 style={{ marginBottom: 16 }}>Shipping address</h3>
                        {loading ? (
                            <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
                        ) : addresses.length === 0 ? (
                            <>
                                <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>No addresses. Add one in profile.</p>
                                <Link to="/profile/addresses" className="btn btn-ghost">Add address</Link>
                            </>
                        ) : (
                            addresses.map((addr) => (
                                <label key={addr._id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                                    <input type="radio" name="address" checked={selectedAddress?._id === addr._id} onChange={() => setSelectedAddress(addr)} />
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{addr.fullName}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{addr.address}, {addr.city}, {addr.state} {addr.zipCode} · {addr.phone}</div>
                                    </div>
                                </label>
                            ))
                        )}
                    </div>

                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ marginBottom: 16 }}>Payment</h3>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <input type="radio" name="payment" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                            Cash on Delivery
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                            Card (placeholder)
                        </label>
                    </div>
                </div>

                <div>
                    <div className="card" style={{ padding: 24, position: 'sticky', top: 88 }}>
                        <h3 style={{ marginBottom: 16 }}>Order summary</h3>
                        {cartItems.map((i) => {
                            const { totalPrice, hasDiscount, unitPrice } = getQuantityDiscount(i.product, i.quantity);
                            return (
                                <div key={i.product._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                                    <span>{i.product.title} × {i.quantity}{hasDiscount && ` (${unitPrice.toFixed(2)}/unit)`}</span>
                                    <span>PKR {totalPrice.toFixed(2)}</span>
                                </div>
                            );
                        })}
                        <div style={{ marginTop: 16 }}>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                                <input className="input" placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} style={{ flex: 1 }} />
                                <button type="button" className="btn btn-ghost" onClick={applyCoupon}>Apply</button>
                            </div>
                            {couponApplied && <p style={{ fontSize: '0.875rem', color: 'var(--success)' }}>Coupon applied: -PKR {discount}</p>}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontWeight: 700 }}>
                            <span>Total</span>
                            <span>PKR {finalTotal.toFixed(2)}</span>
                        </div>
                        <button type="button" className="btn btn-primary" style={{ width: '100%', marginTop: 24 }} onClick={handlePlaceOrder} disabled={placing || addresses.length === 0}>
                            {placing ? 'Placing...' : 'Place order'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
