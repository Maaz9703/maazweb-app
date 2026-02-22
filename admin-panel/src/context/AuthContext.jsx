import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    const customerToken = localStorage.getItem('token');
    const token = adminToken || customerToken;

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.data);
      })
      .catch(() => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('token');
      })
      .finally(() => setLoading(false));
  }, []);

  // Admin login — stores admin_token
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const data = res.data.data;
    if (data.role !== 'admin') {
      throw new Error('Access denied. Admin only.');
    }
    localStorage.setItem('admin_token', data.token);
    setUser({ _id: data._id, name: data.name, email: data.email, role: data.role });
    return res.data;
  };

  // Customer login — stores token
  const loginCustomer = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const data = res.data.data;
    localStorage.setItem('token', data.token);
    const { token, ...userData } = data;
    setUser(userData);
    return res.data;
  };

  // Customer register — stores token
  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const data = res.data.data;
    localStorage.setItem('token', data.token);
    const { token, ...userData } = data;
    setUser(userData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginCustomer, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
