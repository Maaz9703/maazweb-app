import React, { useState, useEffect } from 'react';
import api from '../config/api';
import toast from 'react-hot-toast';

const CouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form, setForm] = useState({
    code: '',
    discount: '',
    discountType: 'percentage',
    minPurchase: '',
    maxDiscount: '',
    validFrom: '',
    validUntil: '',
    usageLimit: '',
    isActive: true,
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get('/coupons');
      setCoupons(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load coupons');
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setForm({
        code: coupon.code,
        discount: String(coupon.discount),
        discountType: coupon.discountType || 'percentage',
        minPurchase: String(coupon.minPurchase || ''),
        maxDiscount: String(coupon.maxDiscount || ''),
        validFrom: coupon.validFrom ? coupon.validFrom.split('T')[0] : '',
        validUntil: coupon.validUntil ? coupon.validUntil.split('T')[0] : '',
        usageLimit: String(coupon.usageLimit || ''),
        isActive: coupon.isActive !== false,
      });
    } else {
      setEditingCoupon(null);
      setForm({
        code: '',
        discount: '',
        discountType: 'percentage',
        minPurchase: '',
        maxDiscount: '',
        validFrom: '',
        validUntil: '',
        usageLimit: '',
        isActive: true,
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCoupon(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      discount: parseFloat(form.discount),
      minPurchase: form.minPurchase ? parseFloat(form.minPurchase) : undefined,
      maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : undefined,
      usageLimit: form.usageLimit ? parseInt(form.usageLimit, 10) : undefined,
    };

    if (!data.code || !data.discount) {
      toast.error('Code and discount are required');
      return;
    }

    try {
      if (editingCoupon) {
        await api.put(`/coupons/${editingCoupon._id}`, data);
        toast.success('Coupon updated');
      } else {
        await api.post('/coupons', data);
        toast.success('Coupon created');
      }
      closeModal();
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save coupon');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (err) {
      toast.error('Failed to delete coupon');
    }
  };

  const getStatusBadge = (coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);

    if (!coupon.isActive) {
      return { text: 'Inactive', color: '#94a3b8' };
    }
    if (now < validFrom) {
      return { text: 'Upcoming', color: '#f59e0b' };
    }
    if (now > validUntil) {
      return { text: 'Expired', color: '#dc2626' };
    }
    return { text: 'Active', color: '#22c55e' };
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Coupons Management</h1>
        <button onClick={() => openModal()} style={primaryButtonStyle}>
          + Add Coupon
        </button>
      </div>

      {loading ? (
        <div style={{ color: '#94a3b8' }}>Loading coupons...</div>
      ) : (
        <div style={{ background: '#1e293b', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0f172a' }}>
                <th style={thStyle}>Code</th>
                <th style={thStyle}>Discount</th>
                <th style={thStyle}>Min Purchase</th>
                <th style={thStyle}>Valid Period</th>
                <th style={thStyle}>Usage Limit</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ ...tdStyle, textAlign: 'center', padding: 40 }}>
                    No coupons found. Create your first coupon!
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => {
                  const status = getStatusBadge(coupon);
                  return (
                    <tr key={coupon._id} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={tdStyle}>
                        <code
                          style={{
                            background: '#0f172a',
                            padding: '4px 8px',
                            borderRadius: 4,
                            fontFamily: 'monospace',
                            fontWeight: 600,
                          }}
                        >
                          {coupon.code}
                        </code>
                      </td>
                      <td style={tdStyle}>
                        {coupon.discountType === 'percentage'
                          ? `${coupon.discount}%`
                          : `PKR ${coupon.discount}`}
                      </td>
                      <td style={tdStyle}>
                        {coupon.minPurchase ? `PKR ${coupon.minPurchase}` : 'No minimum'}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontSize: 12 }}>
                          {new Date(coupon.validFrom).toLocaleDateString()} -{' '}
                          {new Date(coupon.validUntil).toLocaleDateString()}
                        </div>
                      </td>
                      <td style={tdStyle}>{coupon.usageLimit || 'Unlimited'}</td>
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
                          {status.text}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => openModal(coupon)}
                          style={{ ...btnStyle, background: '#334155', marginRight: 8 }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          style={{ ...btnStyle, background: '#dc2626' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
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
              maxWidth: 600,
              maxHeight: '90vh',
              overflow: 'auto',
            }}
          >
            <h2 style={{ marginBottom: 20, fontSize: 20, fontWeight: 700 }}>
              {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Coupon Code *</label>
                  <input
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                    required
                    style={inputStyle}
                    placeholder="SAVE20"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Discount Type *</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
              </div>
              <label style={labelStyle}>Discount Value *</label>
              <input
                type="number"
                step="0.01"
                value={form.discount}
                onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))}
                required
                style={inputStyle}
                placeholder={form.discountType === 'percentage' ? '20' : '500'}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Min Purchase (PKR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.minPurchase}
                    onChange={(e) => setForm((f) => ({ ...f, minPurchase: e.target.value }))}
                    style={inputStyle}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Max Discount (PKR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.maxDiscount}
                    onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))}
                    style={inputStyle}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Valid From *</label>
                  <input
                    type="date"
                    value={form.validFrom}
                    onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))}
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Valid Until *</label>
                  <input
                    type="date"
                    value={form.validUntil}
                    onChange={(e) => setForm((f) => ({ ...f, validUntil: e.target.value }))}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>
              <label style={labelStyle}>Usage Limit</label>
              <input
                type="number"
                value={form.usageLimit}
                onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                style={inputStyle}
                placeholder="Leave empty for unlimited"
              />
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  style={{ width: 'auto', margin: 0 }}
                />
                Active
              </label>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button type="submit" style={{ ...btnStyle, flex: 1, background: '#6366f1' }}>
                  {editingCoupon ? 'Update' : 'Create'}
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
const primaryButtonStyle = {
  ...btnStyle,
  background: '#6366f1',
  padding: '12px 20px',
  fontWeight: 600,
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

export default CouponsPage;
