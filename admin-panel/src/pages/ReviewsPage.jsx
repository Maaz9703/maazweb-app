import React, { useState, useEffect } from 'react';
import api from '../config/api';
import toast from 'react-hot-toast';

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data.data || []);
      fetchAllReviews(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load products');
    }
  };

  const fetchAllReviews = async (productsList) => {
    try {
      setLoading(true);
      const allReviews = [];
      
      // Fetch reviews for each product
      for (const product of productsList) {
        try {
          const res = await api.get(`/reviews/product/${product._id}`);
          const productReviews = (res.data.data?.reviews || []).map(review => ({
            ...review,
            productName: product.title,
            productId: product._id,
          }));
          allReviews.push(...productReviews);
        } catch (err) {
          // Skip products without reviews
        }
      }

      // Apply filters
      let filteredReviews = allReviews;
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredReviews = filteredReviews.filter(
          (r) =>
            r.user?.name?.toLowerCase().includes(searchLower) ||
            r.comment?.toLowerCase().includes(searchLower) ||
            r.productName?.toLowerCase().includes(searchLower)
        );
      }

      if (productFilter) {
        filteredReviews = filteredReviews.filter((r) => r.productId === productFilter);
      }

      if (ratingFilter) {
        filteredReviews = filteredReviews.filter((r) => r.rating === parseInt(ratingFilter));
      }

      // Sort by date (newest first)
      filteredReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setReviews(filteredReviews);
    } catch (err) {
      toast.error('Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('Delete this review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success('Review deleted');
      fetchProducts(); // Refresh
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} style={{ color: i < rating ? '#fbbf24' : '#475569', fontSize: 16 }}>
        ★
      </span>
    ));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Reviews Management</h1>
        <div style={{ color: '#94a3b8', fontSize: 14 }}>
          Total: {reviews.length} review{reviews.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 250 }}>
          <input
            type="text"
            placeholder="Search by user, product or comment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={inputStyle}
          />
        </div>
        <select
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          style={{ ...inputStyle, minWidth: 200 }}
        >
          <option value="">All Products</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.title}
            </option>
          ))}
        </select>
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          style={{ ...inputStyle, minWidth: 150 }}
        >
          <option value="">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
        {(search || productFilter || ratingFilter) && (
          <button
            onClick={() => {
              setSearch('');
              setProductFilter('');
              setRatingFilter('');
            }}
            style={{ ...btnStyle, background: '#475569' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ color: '#94a3b8' }}>Loading reviews...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reviews.length === 0 ? (
            <div style={{ background: '#1e293b', padding: 40, borderRadius: 12, textAlign: 'center', color: '#94a3b8' }}>
              No reviews found
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review._id}
                style={{
                  background: '#1e293b',
                  padding: 20,
                  borderRadius: 12,
                  borderLeft: `4px solid ${review.rating >= 4 ? '#22c55e' : review.rating >= 3 ? '#f59e0b' : '#ef4444'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: '#6366f1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: 16,
                        }}
                      >
                        {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{review.user?.name || 'Anonymous'}</div>
                        <div style={{ fontSize: 14, color: '#64748b' }}>{review.productName}</div>
                      </div>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      {renderStars(review.rating)}
                      <span style={{ marginLeft: 8, color: '#94a3b8', fontSize: 14 }}>
                        {review.rating} / 5
                      </span>
                    </div>
                    {review.comment && (
                      <div style={{ color: '#e2e8f0', lineHeight: 1.6, marginTop: 8 }}>
                        {review.comment}
                      </div>
                    )}
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
                      {new Date(review.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(review._id)}
                    style={{
                      ...btnStyle,
                      background: '#dc2626',
                      padding: '8px 12px',
                      fontSize: 12,
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const btnStyle = {
  padding: '10px 16px',
  borderRadius: 8,
  color: '#fff',
  fontWeight: 500,
  border: 'none',
  cursor: 'pointer',
  fontSize: 14,
};
const inputStyle = {
  width: '100%',
  padding: 12,
  borderRadius: 8,
  border: '1px solid #334155',
  background: '#0f172a',
  color: '#fff',
  marginBottom: 0,
};

export default ReviewsPage;
