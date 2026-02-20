import React, { useState, useEffect } from 'react';
import api from '../config/api';
import toast from 'react-hot-toast';

const statusOptions = [
  'Pending - Cash on Delivery',
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dateFilter, setDateFilter] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/admin/all');
      let filteredOrders = res.data.data || [];

      // Client-side filtering
      if (search) {
        const searchLower = search.toLowerCase();
        filteredOrders = filteredOrders.filter(
          (o) =>
            o._id?.toLowerCase().includes(searchLower) ||
            o.user?.name?.toLowerCase().includes(searchLower) ||
            o.user?.email?.toLowerCase().includes(searchLower)
        );
      }

      if (statusFilter) {
        filteredOrders = filteredOrders.filter((o) => o.status === statusFilter);
      }

      if (dateFilter) {
        filteredOrders = filteredOrders.filter((o) =>
          o.createdAt?.startsWith(dateFilter)
        );
      }

      // Sort by date (newest first)
      filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setOrders(filteredOrders);
    } catch (err) {
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter, dateFilter]);

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success('Status updated');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return '#22c55e';
      case 'Shipped':
      case 'Processing':
        return '#6366f1';
      case 'Cancelled':
        return '#dc2626';
      default:
        return '#94a3b8';
    }
  };

  const exportToCSV = () => {
    const headers = ['Order ID', 'Customer', 'Email', 'Total', 'Payment Method', 'Status', 'Date'];
    const rows = orders.map((o) => [
      o._id,
      o.user?.name || 'N/A',
      o.user?.email || 'N/A',
      o.total?.toFixed(2),
      o.paymentMethod || 'N/A',
      o.status,
      new Date(o.createdAt).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Orders exported to CSV');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Orders Management</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={exportToCSV} style={{ ...btnStyle, background: '#10b981' }}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 250 }}>
          <input
            type="text"
            placeholder="Search by order ID, customer name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={inputStyle}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ ...inputStyle, minWidth: 180 }}
        >
          <option value="">All Statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          style={{ ...inputStyle, minWidth: 150 }}
        />
        {(search || statusFilter || dateFilter) && (
          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('');
              setDateFilter('');
            }}
            style={{ ...btnStyle, background: '#475569' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ color: '#94a3b8' }}>Loading orders...</div>
      ) : (
        <>
          <div style={{ marginBottom: 16, color: '#94a3b8', fontSize: 14 }}>
            Showing {orders.length} order{orders.length !== 1 ? 's' : ''}
          </div>
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
                  <th style={thStyle}>Order ID</th>
                  <th style={thStyle}>Customer</th>
                  <th style={thStyle}>Total</th>
                  <th style={thStyle}>Payment</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ ...tdStyle, textAlign: 'center', padding: 40 }}>
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o._id} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={tdStyle}>
                        <code style={{ fontFamily: 'monospace', fontSize: 12 }}>
                          #{o._id?.slice(-8).toUpperCase()}
                        </code>
                      </td>
                      <td style={tdStyle}>
                        {o.user?.name || '-'}
                        <br />
                        <span style={{ fontSize: 12, color: '#64748b' }}>{o.user?.email}</span>
                      </td>
                      <td style={tdStyle}>
                        <strong>PKR {o.total?.toFixed(2)}</strong>
                      </td>
                      <td style={tdStyle}>{o.paymentMethod || '-'}</td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 600,
                            background: getStatusColor(o.status) + '33',
                            color: getStatusColor(o.status),
                          }}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontSize: 12 }}>
                          {new Date(o.createdAt).toLocaleDateString()}
                          <br />
                          <span style={{ color: '#64748b' }}>
                            {new Date(o.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button
                            onClick={() => setSelectedOrder(o)}
                            style={{ ...btnStyle, background: '#334155', fontSize: 12 }}
                          >
                            View
                          </button>
                          <select
                            value={o.status}
                            onChange={(e) => updateStatus(o._id, e.target.value)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 6,
                              background: '#0f172a',
                              color: '#fff',
                              border: '1px solid #334155',
                              fontSize: 12,
                              cursor: 'pointer',
                            }}
                          >
                            {statusOptions.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
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
          onClick={() => setSelectedOrder(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1e293b',
              padding: 24,
              borderRadius: 16,
              width: '100%',
              maxWidth: 700,
              maxHeight: '90vh',
              overflow: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: 24,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#94a3b8' }}>Order Information</h3>
                <div style={{ background: '#0f172a', padding: 16, borderRadius: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <div style={{ color: '#64748b', fontSize: 12 }}>Order ID</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 14 }}>#{selectedOrder._id?.slice(-8).toUpperCase()}</div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b', fontSize: 12 }}>Date</div>
                      <div>{new Date(selectedOrder.createdAt).toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b', fontSize: 12 }}>Status</div>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          background: getStatusColor(selectedOrder.status) + '33',
                          color: getStatusColor(selectedOrder.status),
                        }}
                      >
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div>
                      <div style={{ color: '#64748b', fontSize: 12 }}>Total</div>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>PKR {selectedOrder.total?.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#94a3b8' }}>Customer Information</h3>
                <div style={{ background: '#0f172a', padding: 16, borderRadius: 8 }}>
                  <div>Name: {selectedOrder.user?.name || 'N/A'}</div>
                  <div style={{ marginTop: 8 }}>Email: {selectedOrder.user?.email || 'N/A'}</div>
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#94a3b8' }}>Items</h3>
                <div style={{ background: '#0f172a', padding: 16, borderRadius: 8 }}>
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: idx < selectedOrder.items.length - 1 ? '1px solid #334155' : 'none' }}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{item.product?.title || 'N/A'}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>Qty: {item.quantity} × PKR {item.price?.toFixed(2)}</div>
                      </div>
                      <div style={{ fontWeight: 600 }}>PKR {(item.quantity * item.price)?.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
const inputStyle = {
  width: '100%',
  padding: 12,
  borderRadius: 8,
  border: '1px solid #334155',
  background: '#0f172a',
  color: '#fff',
  marginBottom: 0,
};

export default OrdersPage;
