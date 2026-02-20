import React, { useState, useEffect } from 'react';
import api from '../config/api';
import toast from 'react-hot-toast';

const InventoryAlertsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [filter, setFilter] = useState('low'); // low, out, all

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      let allProducts = res.data.data || [];

      // Filter products
      if (filter === 'low') {
        allProducts = allProducts.filter((p) => p.stock > 0 && p.stock <= lowStockThreshold);
      } else if (filter === 'out') {
        allProducts = allProducts.filter((p) => p.stock === 0);
      }

      // Sort by stock (lowest first)
      allProducts.sort((a, b) => a.stock - b.stock);

      setProducts(allProducts);
    } catch (error) {
      toast.error('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStockUpdate = async (productIds, newStock) => {
    if (!newStock || isNaN(newStock)) {
      toast.error('Please enter a valid stock number');
      return;
    }

    try {
      await Promise.all(
        productIds.map((id) => api.put(`/products/${id}`, { stock: parseInt(newStock) }))
      );
      toast.success(`Stock updated for ${productIds.length} product(s)`);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', color: '#dc2626' };
    if (stock <= lowStockThreshold) return { label: 'Low Stock', color: '#f59e0b' };
    return { label: 'In Stock', color: '#22c55e' };
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Inventory Alerts</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ color: '#94a3b8', fontSize: 14 }}>Low Stock Threshold:</label>
            <input
              type="number"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 10)}
              style={{
                width: 80,
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #334155',
                background: '#0f172a',
                color: '#fff',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['low', 'out', 'all'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: filter === f ? '#6366f1' : '#334155',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {f === 'low' ? 'Low Stock' : f === 'out' ? 'Out of Stock' : 'All'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>Loading...</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
          {filter === 'low' && 'No products with low stock'}
          {filter === 'out' && 'No products out of stock'}
          {filter === 'all' && 'No products found'}
        </div>
      ) : (
        <div style={{ background: '#1e293b', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0f172a' }}>
                <th style={thStyle}>Product</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Current Stock</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const status = getStockStatus(product.stock);
                return (
                  <tr key={product._id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img
                          src={product.image || 'https://via.placeholder.com/40'}
                          alt=""
                          style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 500 }}>{product.title}</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>PKR {product.price?.toFixed(2)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}>{product.category}</td>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 600, fontSize: 18 }}>{product.stock}</span>
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          background: status.color + '33',
                          color: status.color,
                        }}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => {
                          const newStock = prompt(`Update stock for ${product.title}:`, product.stock);
                          if (newStock && !isNaN(newStock)) {
                            handleBulkStockUpdate([product._id], newStock);
                          }
                        }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 8,
                          background: '#6366f1',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 14,
                        }}
                      >
                        Update Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const thStyle = { padding: 14, textAlign: 'left', fontWeight: 600, color: '#94a3b8' };
const tdStyle = { padding: 14, color: '#e2e8f0' };

export default InventoryAlertsPage;
