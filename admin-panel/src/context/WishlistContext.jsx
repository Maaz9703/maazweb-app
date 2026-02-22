import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext(null);

const STORAGE_KEY = 'shofy_wishlist';

const loadWishlist = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const saveWishlist = (items) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const WishlistProvider = ({ children }) => {
    const [items, setItems] = useState(loadWishlist);

    useEffect(() => {
        saveWishlist(items);
    }, [items]);

    const isInWishlist = (productId) => items.some((p) => p._id === productId);

    const toggleWishlist = (product) => {
        setItems((prev) => {
            const exists = prev.some((p) => p._id === product._id);
            if (exists) {
                return prev.filter((p) => p._id !== product._id);
            }
            return [{ _id: product._id, title: product.title, price: product.price, image: product.image, category: product.category }, ...prev].slice(0, 50);
        });
    };

    return (
        <WishlistContext.Provider value={{ items, isInWishlist, toggleWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
    return ctx;
};
