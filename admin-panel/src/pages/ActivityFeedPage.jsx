import React, { useState, useEffect } from 'react';
import api from '../config/api';
import toast from 'react-hot-toast';

// Simple date formatting function (fallback if date-fns not available)
const formatDistanceToNow = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
};

const ActivityFeedPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchActivities();
    // Refresh every 30 seconds
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        api.get('/orders/admin/all'),
        api.get('/products'),
        api.get('/users'),
      ]);

      const orders = ordersRes.data.data || [];
      const products = productsRes.data.data || [];
      const users = usersRes.data.data || [];

      const activitiesList = [];

      // Recent orders
      orders.slice(0, 10).forEach((order) => {
        activitiesList.push({
          id: `order-${order._id}`,
          type: 'order',
          action: order.status === 'Delivered' ? 'completed' : order.status.toLowerCase(),
          title: `Order #${order._id.slice(-8).toUpperCase()}`,
          description: `${order.user?.name || 'Customer'} - PKR ${order.total?.toFixed(2)}`,
          timestamp: order.updatedAt || order.createdAt,
          status: order.status,
        });
      });

      // Recent products (if any new ones)
      products
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .forEach((product) => {
          activitiesList.push({
            id: `product-${product._id}`,
            type: 'product',
            action: 'created',
            title: product.title,
            description: `Added to ${product.category}`,
            timestamp: product.createdAt,
          });
        });

      // New users
      users
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .forEach((user) => {
          activitiesList.push({
            id: `user-${user._id}`,
            type: 'user',
            action: 'registered',
            title: user.name || user.email,
            description: 'New user registration',
            timestamp: user.createdAt,
          });
        });

      // Sort by timestamp
      activitiesList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Apply filter
      let filtered = activitiesList;
      if (filter !== 'all') {
        filtered = activitiesList.filter((a) => a.type === filter);
      }

      setActivities(filtered.slice(0, 50));
    } catch (error) {
      console.error('Fetch activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type, action) => {
    if (type === 'order') {
      switch (action) {
        case 'completed':
        case 'delivered':
          return '✅';
        case 'shipped':
          return '🚚';
        case 'processing':
          return '⚙️';
        case 'pending':
          return '⏳';
        default:
          return '📦';
      }
    }
    if (type === 'product') return '📦';
    if (type === 'user') return '👤';
    return '📋';
  };

  const getActivityColor = (type, action) => {
    if (type === 'order') {
      switch (action) {
        case 'completed':
        case 'delivered':
          return '#22c55e';
        case 'shipped':
          return '#6366f1';
        case 'processing':
          return '#f59e0b';
        default:
          return '#94a3b8';
      }
    }
    if (type === 'product') return '#6366f1';
    if (type === 'user') return '#f59e0b';
    return '#94a3b8';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Activity Feed</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'order', 'product', 'user'].map((f) => (
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
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>Loading activities...</div>
      ) : activities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
          No activities found
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {activities.map((activity) => {
            const color = getActivityColor(activity.type, activity.action);
            return (
              <div
                key={activity.id}
                style={{
                  background: '#1e293b',
                  padding: 16,
                  borderRadius: 12,
                  borderLeft: `4px solid ${color}`,
                  display: 'flex',
                  gap: 12,
                }}
              >
                <div style={{ fontSize: 24 }}>{getActivityIcon(activity.type, activity.action)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
                        {activity.title}
                      </div>
                      <div style={{ fontSize: 14, color: '#94a3b8' }}>{activity.description}</div>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap', marginLeft: 16 }}>
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityFeedPage;
