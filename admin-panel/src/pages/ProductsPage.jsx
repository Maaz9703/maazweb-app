import React, { useState, useEffect } from 'react';
import api from '../config/api';
import toast from 'react-hot-toast';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    image: '',
    stock: '',
    category: '',
    quantityDiscounts: [{ minQty: '', discountPercent: '' }],
  });

  const fetchCategories = async () => {
    try {
      const res = await api.get('/products/categories/list');
      setCategories(res.data.data || []);
    } catch (err) {
      console.error('Failed to load categories');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search && search.trim()) params.search = search.trim();
      if (selectedCategory && selectedCategory.trim()) params.category = selectedCategory.trim();
      const res = await api.get('/products', { params });
      let fetchedProducts = res.data.data || [];
      
      // Store all products for filtering
      setAllProducts(fetchedProducts);
      
      // Apply sorting
      if (sortBy) {
        fetchedProducts.sort((a, b) => {
          let aVal = a[sortBy];
          let bVal = b[sortBy];
          if (sortBy === 'createdAt') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
          }
          if (sortOrder === 'asc') {
            return aVal > bVal ? 1 : -1;
          }
          return aVal < bVal ? 1 : -1;
        });
      }
      
      setProducts(fetchedProducts);
    } catch (err) {
      toast.error('Failed to load products');
      setProducts([]);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory, sortBy, sortOrder]);

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      const tiers = product.quantityDiscounts && product.quantityDiscounts.length > 0
        ? product.quantityDiscounts.map((t) => ({ minQty: String(t.minQty), discountPercent: String(t.discountPercent) }))
        : [{ minQty: '', discountPercent: '' }];
      setForm({
        title: product.title,
        description: product.description,
        price: String(product.price),
        image: product.image || '',
        stock: String(product.stock),
        category: product.category,
        quantityDiscounts: tiers,
      });
    } else {
      setEditingProduct(null);
      setForm({ title: '', description: '', price: '', image: '', stock: '', category: '', quantityDiscounts: [{ minQty: '', discountPercent: '' }] });
    }
    setModalOpen(true);
  };

  const addDiscountTier = () => {
    setForm((f) => ({ ...f, quantityDiscounts: [...f.quantityDiscounts, { minQty: '', discountPercent: '' }] }));
  };

  const removeDiscountTier = (index) => {
    setForm((f) => ({
      ...f,
      quantityDiscounts: f.quantityDiscounts.filter((_, i) => i !== index),
    }));
  };

  const updateDiscountTier = (index, field, value) => {
    setForm((f) => ({
      ...f,
      quantityDiscounts: f.quantityDiscounts.map((t, i) => (i === index ? { ...t, [field]: value } : t)),
    }));
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const quantityDiscounts = (form.quantityDiscounts || [])
      .map((t) => ({
        minQty: parseInt(String(t.minQty).trim(), 10),
        discountPercent: parseFloat(String(t.discountPercent).trim()),
      }))
      .filter((t) => !isNaN(t.minQty) && t.minQty > 0 && !isNaN(t.discountPercent) && t.discountPercent > 0)
      .sort((a, b) => a.minQty - b.minQty);
    const data = {
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10),
      image: form.image || undefined,
      category: form.category,
      quantityDiscounts: quantityDiscounts.length > 0 ? quantityDiscounts.map((t) => ({ ...t, discountPercent: Math.min(100, Math.max(0, t.discountPercent)) })) : undefined,
    };
    if (!data.title || !data.description || isNaN(data.price) || isNaN(data.stock) || !data.category) {
      toast.error('Please fill required fields');
      return;
    }
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, data);
        toast.success('Product updated');
      } else {
        await api.post('/products', data);
        toast.success('Product created');
      }
      closeModal();
      fetchProducts();
      fetchCategories(); // Refresh categories in case new one was added
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      setSelectedProducts(selectedProducts.filter(p => p !== id));
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      toast.error('No products selected');
      return;
    }
    if (!confirm(`Delete ${selectedProducts.length} product(s)?`)) return;
    
    try {
      await Promise.all(selectedProducts.map(id => api.delete(`/products/${id}`)));
      toast.success(`${selectedProducts.length} product(s) deleted`);
      setSelectedProducts([]);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete some products');
    }
  };

  const handleBulkStockUpdate = async (newStock) => {
    if (selectedProducts.length === 0) {
      toast.error('No products selected');
      return;
    }
    
    try {
      await Promise.all(
        selectedProducts.map(id => 
          api.put(`/products/${id}`, { stock: parseInt(newStock) })
        )
      );
      toast.success(`Stock updated for ${selectedProducts.length} product(s)`);
      setSelectedProducts([]);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to update stock');
    }
  };

  const toggleProductSelection = (id) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p._id));
    }
  };

  const exportToCSV = () => {
    const headers = ['Title', 'Category', 'Price', 'Stock', 'Quantity discounts', 'Description'];
    const rows = products.map((p) => [
      p.title,
      p.category,
      p.price?.toFixed(2),
      p.stock,
      p.quantityDiscounts?.length > 0 ? p.quantityDiscounts.map((t) => `${t.discountPercent}%@≥${t.minQty}`).join('; ') : '',
      p.description?.replace(/,/g, ';'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Products exported to CSV');
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Products</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          {selectedProducts.length > 0 && (
            <>
              <button
                onClick={() => {
                  const newStock = prompt(`Update stock for ${selectedProducts.length} product(s):`);
                  if (newStock && !isNaN(newStock)) {
                    handleBulkStockUpdate(newStock);
                  }
                }}
                style={{ ...btnStyle, background: '#f59e0b' }}
              >
                Bulk Update Stock ({selectedProducts.length})
              </button>
              <button
                onClick={handleBulkDelete}
                style={{ ...btnStyle, background: '#dc2626' }}
              >
                Bulk Delete ({selectedProducts.length})
              </button>
            </>
          )}
          <button onClick={exportToCSV} style={{ ...btnStyle, background: '#10b981' }}>
            Export CSV
          </button>
          <button
            onClick={() => openModal()}
            style={{
              padding: '12px 20px',
              background: '#6366f1',
              color: '#fff',
              borderRadius: 8,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Add Product
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          marginBottom: 24,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ flex: 1, minWidth: 250 }}>
          <input
            type="text"
            placeholder="Search products by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              ...inputStyle,
              marginBottom: 0,
              padding: '10px 16px',
            }}
          />
        </div>
        <div style={{ minWidth: 200 }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              ...inputStyle,
              marginBottom: 0,
              padding: '10px 16px',
              cursor: 'pointer',
            }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        {(search || selectedCategory) && (
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('');
            }}
            style={{
              ...btnStyle,
              background: '#475569',
              padding: '10px 16px',
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ color: '#94a3b8' }}>Loading products...</div>
      ) : (
        <div
          style={{
            background: '#1e293b',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0f172a' }}>
                <th style={thStyle}>
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={toggleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th style={thStyle}>Image</th>
                <th style={thStyle}>
                  <button
                    onClick={() => handleSort('title')}
                    style={{ ...sortButtonStyle }}
                  >
                    Title <SortIcon field="title" />
                  </button>
                </th>
                <th style={thStyle}>
                  <button
                    onClick={() => handleSort('category')}
                    style={{ ...sortButtonStyle }}
                  >
                    Category <SortIcon field="category" />
                  </button>
                </th>
                <th style={thStyle}>
                  <button
                    onClick={() => handleSort('price')}
                    style={{ ...sortButtonStyle }}
                  >
                    Price <SortIcon field="price" />
                  </button>
                </th>
                <th style={thStyle}>
                  <button
                    onClick={() => handleSort('stock')}
                    style={{ ...sortButtonStyle }}
                  >
                    Stock <SortIcon field="stock" />
                  </button>
                </th>
                <th style={thStyle}>Qty discount</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ ...tdStyle, textAlign: 'center', padding: 40 }}>
                    {loading ? (
                      'Loading products...'
                    ) : search || selectedCategory ? (
                      <div>
                        <div style={{ marginBottom: 12 }}>No products found matching your filters</div>
                        <button
                          onClick={() => {
                            setSearch('');
                            setSelectedCategory('');
                          }}
                          style={{ ...btnStyle, background: '#6366f1' }}
                        >
                          Clear Filters
                        </button>
                      </div>
                    ) : (
                      'No products found'
                    )}
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                <tr 
                  key={p._id} 
                  style={{ 
                    borderBottom: '1px solid #334155',
                    background: selectedProducts.includes(p._id) ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  }}
                >
                  <td style={tdStyle}>
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(p._id)}
                      onChange={() => toggleProductSelection(p._id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td style={tdStyle}>
                    <img
                      src={p.image || 'https://via.placeholder.com/60'}
                      alt=""
                      style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }}
                    />
                  </td>
                  <td style={tdStyle}>{p.title}</td>
                  <td style={tdStyle}>{p.category}</td>
                  <td style={tdStyle}>PKR {p.price?.toFixed(2)}</td>
                  <td style={tdStyle}>{p.stock}</td>
                  <td style={{ ...tdStyle, fontSize: 13, color: '#94a3b8' }}>
                    {p.quantityDiscounts?.length > 0
                      ? p.quantityDiscounts.map((t) => `${t.discountPercent}% @ ≥${t.minQty}`).join(', ')
                      : '—'}
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => openModal(p)}
                      style={{ ...btnStyle, background: '#334155', marginRight: 8 }}
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDelete(p._id)} style={{ ...btnStyle, background: '#dc2626' }}>
                      Delete
                    </button>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: 24,
          }}
          onClick={closeModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1e293b',
              padding: 24,
              borderRadius: 16,
              width: '100%',
              maxWidth: 480,
            }}
          >
            <h2 style={{ marginBottom: 20 }}>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit}>
              <label style={labelStyle}>Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                style={inputStyle}
              />
              <label style={labelStyle}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                required
                rows={3}
                style={{ ...inputStyle, minHeight: 80 }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Stock</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>
              <label style={labelStyle}>Category</label>
              <input
                type="text"
                list="categories-list"
                placeholder="Select existing or type new category"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                required
                style={inputStyle}
              />
              <datalist id="categories-list">
                {categories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
              <label style={labelStyle}>Image URL</label>
              <input
                value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                placeholder="https://..."
                style={inputStyle}
              />
              <div style={{ marginBottom: 16, padding: '12px 0', borderTop: '1px solid #334155', borderBottom: '1px solid #334155' }}>
                <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 10 }}>Quantity discounts (different discount for different quantity)</div>
                {(form.quantityDiscounts || [{ minQty: '', discountPercent: '' }]).map((tier, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end', marginBottom: 12 }}>
                    <div>
                      <label style={labelStyle}>Min quantity</label>
                      <input
                        type="number"
                        min={1}
                        value={tier.minQty}
                        onChange={(e) => updateDiscountTier(index, 'minQty', e.target.value)}
                        placeholder="e.g. 2"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Discount %</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        value={tier.discountPercent}
                        onChange={(e) => updateDiscountTier(index, 'discountPercent', e.target.value)}
                        placeholder="e.g. 10"
                        style={inputStyle}
                      />
                    </div>
                    <button type="button" onClick={() => removeDiscountTier(index)} style={{ ...btnStyle, background: '#475569', padding: '12px 14px', marginBottom: 16 }} title="Remove tier">
                      ✕
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addDiscountTier} style={{ ...btnStyle, background: '#334155', padding: '8px 14px', fontSize: 13 }}>
                  + Add another quantity tier
                </button>
                <p style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>e.g. 5% off when buying 2+, 10% off when buying 5+</p>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button type="submit" style={{ ...btnStyle, flex: 1, background: '#6366f1' }}>
                  {editingProduct ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={closeModal} style={{ ...btnStyle, background: '#475569' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const thStyle = { padding: 14, textAlign: 'left', fontWeight: 600, color: '#94a3b8' };
const tdStyle = { padding: 14, color: '#e2e8f0' };
const btnStyle = { 
  padding: '10px 16px', 
  borderRadius: 8, 
  color: '#fff', 
  fontWeight: 500, 
  border: 'none',
  cursor: 'pointer',
  fontSize: 14,
};
const labelStyle = { display: 'block', marginBottom: 8, color: '#94a3b8', fontSize: 14 };
const inputStyle = {
  width: '100%',
  padding: 12,
  borderRadius: 8,
  border: '1px solid #334155',
  background: '#0f172a',
  color: '#fff',
  marginBottom: 16,
};
const sortButtonStyle = {
  background: 'transparent',
  border: 'none',
  color: '#94a3b8',
  fontWeight: 600,
  cursor: 'pointer',
  padding: 0,
  fontSize: 14,
};

export default ProductsPage;
