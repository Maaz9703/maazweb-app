import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    borderRadius: 8,
    color: isActive ? '#fff' : '#94a3b8',
    background: isActive ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
    textDecoration: 'none',
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside
        style={{
          width: 260,
          background: '#1e293b',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ 
            fontSize: 28, 
            fontWeight: 800, 
            letterSpacing: '2px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
            padding: 0
          }}>Shofy</h1>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>{user?.email}</p>
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <NavLink to="/" end style={navStyle}>
            <span>📊</span> Dashboard
          </NavLink>
          <NavLink to="/products" style={navStyle}>
            <span>📦</span> Products
          </NavLink>
          <NavLink to="/orders" style={navStyle}>
            <span>🛒</span> Orders
          </NavLink>
          <NavLink to="/users" style={navStyle}>
            <span>👥</span> Users
          </NavLink>
          <NavLink to="/coupons" style={navStyle}>
            <span>🎫</span> Coupons
          </NavLink>
          <NavLink to="/reviews" style={navStyle}>
            <span>⭐</span> Reviews
          </NavLink>
          <NavLink to="/reports" style={navStyle}>
            <span>📈</span> Reports
          </NavLink>
          <NavLink to="/activity" style={navStyle}>
            <span>📋</span> Activity Feed
          </NavLink>
          <NavLink to="/inventory" style={navStyle}>
            <span>📦</span> Inventory Alerts
          </NavLink>
          <NavLink to="/customers" style={navStyle}>
            <span>👥</span> Customer Insights
          </NavLink>
          <NavLink to="/settings" style={navStyle}>
            <span>⚙️</span> Settings
          </NavLink>
        </nav>
        <button
          onClick={handleLogout}
          style={{
            padding: '12px 16px',
            background: 'transparent',
            border: '1px solid #475569',
            borderRadius: 8,
            color: '#f87171',
            fontSize: 14,
          }}
        >
          Logout
        </button>
      </aside>
      <main style={{ flex: 1, padding: 24, overflow: 'auto', background: '#0f172a' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
