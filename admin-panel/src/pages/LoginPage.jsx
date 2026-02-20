import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user && user.role === 'admin') {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill all fields');
      return;
    }
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success('Login successful');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: 24,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: 400,
          background: '#1e293b',
          padding: 32,
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
          Admin Login
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: 24 }}>Sign in to manage your store</p>

        <label style={{ display: 'block', marginBottom: 8, color: '#e2e8f0' }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 8,
            border: '1px solid #334155',
            background: '#0f172a',
            color: '#fff',
            marginBottom: 20,
          }}
        />

        <label style={{ display: 'block', marginBottom: 8, color: '#e2e8f0' }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 8,
            border: '1px solid #334155',
            background: '#0f172a',
            color: '#fff',
            marginBottom: 24,
          }}
        />

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 8,
            background: submitting ? '#475569' : '#6366f1',
            color: '#fff',
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          {submitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
