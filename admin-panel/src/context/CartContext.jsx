import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

const CART_STORAGE = 'shofy_cart';

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
};

const loadCart = () => {
    try {
        const raw = localStorage.getItem(CART_STORAGE);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const saveCart = (items) => {
    localStorage.setItem(CART_STORAGE, JSON.stringify(items));
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(loadCart);

    useEffect(() => {
        saveCart(cartItems);
    }, [cartItems]);

    const addToCart = (product, quantity = 1) => {
        setCartItems((prev) => {
            const existing = prev.find((i) => i.product._id === product._id);
            if (existing) {
                return prev.map((i) =>
                    i.product._id === product._id
                        ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock || 999) }
                        : i
                );
            }
            return [...prev, { product, quantity }];
        });
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) return removeFromCart(productId);
        setCartItems((prev) =>
            prev.map((i) => (i.product._id === productId ? { ...i, quantity } : i))
        );
    };

    const removeFromCart = (productId) => {
        setCartItems((prev) => prev.filter((i) => i.product._id !== productId));
    };

    const clearCart = () => setCartItems([]);

    const cartTotal = cartItems.reduce(
        (sum, i) => sum + (i.product.price || 0) * i.quantity,
        0
    );
    const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                cartTotal,
                cartCount,
                addToCart,
                updateQuantity,
                removeFromCart,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
