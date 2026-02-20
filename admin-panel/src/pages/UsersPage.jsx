import React, { useState, useEffect } from 'react';
import api from '../config/api';
import toast from 'react-hot-toast';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      let filteredUsers = res.data.data || [];

      // Client-side filtering
      if (search) {
        const searchLower = search.toLowerCase();
        filteredUsers = filteredUsers.filter(
          (u) =>
            u.name?.toLowerCase().includes(searchLower) ||
            u.email?.toLowerCase().includes(searchLower)
        );
      }

      if (filterRole) {
        filteredUsers = filteredUsers.filter((u) => u.role === filterRole);
      }

      // Sorting
      filteredUsers.sort((a, b) => {
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

      setUsers(filteredUsers);
    } catch (err) {
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, filterRole, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: '#dc2626',
      user: '#6366f1',
    };
    return (
      <span
        style={{
          padding: '4px 10px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 600,
          background: colors[role] + '33',
          color: colors[role],
        }}
      >
        {role?.toUpperCase()}
      </span>
    );
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Users Management</h1>
        <div style={{ color: '#94a3b8', fontSize: 14 }}>
          Total: {users.length} users
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 250 }}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={inputStyle}
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          style={{ ...inputStyle, minWidth: 150 }}
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        {(search || filterRole) && (
          <button
            onClick={() => {
              setSearch('');
              setFilterRole('');
            }}
            style={{ ...btnStyle, background: '#475569' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ color: '#94a3b8' }}>Loading users...</div>
      ) : (
        <div style={{ background: '#1e293b', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0f172a' }}>
                <th style={thStyle}>
                  <button
                    onClick={() => handleSort('name')}
                    style={{ ...sortButtonStyle }}
                  >
                    Name <SortIcon field="name" />
                  </button>
                </th>
                <th style={thStyle}>
                  <button
                    onClick={() => handleSort('email')}
                    style={{ ...sortButtonStyle }}
                  >
                    Email <SortIcon field="email" />
                  </button>
                </th>
                <th style={thStyle}>
                  <button
                    onClick={() => handleSort('role')}
                    style={{ ...sortButtonStyle }}
                  >
                    Role <SortIcon field="role" />
                  </button>
                </th>
                <th style={thStyle}>
                  <button
                    onClick={() => handleSort('createdAt')}
                    style={{ ...sortButtonStyle }}
                  >
                    Joined <SortIcon field="createdAt" />
                  </button>
                </th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', padding: 40 }}>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{user.name || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}>{user.email}</td>
                    <td style={tdStyle}>{getRoleBadge(user.role)}</td>
                    <td style={tdStyle}>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => setSelectedUser(user)}
                        style={{ ...btnStyle, background: '#334155' }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
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
          onClick={() => setSelectedUser(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1e293b',
              padding: 24,
              borderRadius: 16,
              width: '100%',
              maxWidth: 500,
              maxHeight: '90vh',
              overflow: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Name</label>
                <div style={{ ...inputStyle, background: '#0f172a', marginBottom: 0 }}>
                  {selectedUser.name || 'N/A'}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <div style={{ ...inputStyle, background: '#0f172a', marginBottom: 0 }}>
                  {selectedUser.email}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Role</label>
                <div style={{ marginTop: 8 }}>{getRoleBadge(selectedUser.role)}</div>
              </div>
              <div>
                <label style={labelStyle}>Joined</label>
                <div style={{ ...inputStyle, background: '#0f172a', marginBottom: 0 }}>
                  {selectedUser.createdAt
                    ? new Date(selectedUser.createdAt).toLocaleString()
                    : 'N/A'}
                </div>
              </div>
              <div>
                <label style={labelStyle}>User ID</label>
                <div
                  style={{
                    ...inputStyle,
                    background: '#0f172a',
                    marginBottom: 0,
                    fontSize: 12,
                    fontFamily: 'monospace',
                  }}
                >
                  {selectedUser._id}
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
  padding: '8px 16px',
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
  marginBottom: 16,
};
const labelStyle = { display: 'block', marginBottom: 8, color: '#94a3b8', fontSize: 14, fontWeight: 500 };
const sortButtonStyle = {
  background: 'transparent',
  border: 'none',
  color: '#94a3b8',
  fontWeight: 600,
  cursor: 'pointer',
  padding: 0,
  fontSize: 14,
};

export default UsersPage;
