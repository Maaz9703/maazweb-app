import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import api from '../config/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    completedOrders: 0,
    pendingOrders: 0,
    todayRevenue: 0,
    todayOrders: 0,
    avgOrderValue: 0,
  });
  const [chartData, setChartData] = useState({ labels: [], values: [] });
  const [revenueData, setRevenueData] = useState({ labels: [], values: [] });
  const [statusData, setStatusData] = useState({ labels: [], values: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/users/stats');
        const data = res.data.data || {};
        
        // Calculate additional stats
        const today = new Date().toISOString().split('T')[0];
        const ordersRes = await api.get('/orders/admin/all');
        const allOrders = ordersRes.data.data || [];
        
        const todayOrders = allOrders.filter(o => o.createdAt?.startsWith(today));
        const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const avgOrderValue = data.totalOrders > 0 ? data.totalRevenue / data.totalOrders : 0;
        const pendingOrders = allOrders.filter(o => 
          o.status === 'Pending' || o.status === 'Pending - Cash on Delivery' || o.status === 'Processing'
        ).length;

        setStats({
          ...data,
          todayRevenue,
          todayOrders: todayOrders.length,
          avgOrderValue,
          pendingOrders,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/admin/all');
        const orders = res.data.data || [];
        
        // Orders chart (last 7 days)
        const last7Days = [];
        const counts = [];
        const revenues = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const dayOrders = orders.filter((o) => o.createdAt?.startsWith(dateStr));
          const count = dayOrders.length;
          const revenue = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
          last7Days.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
          counts.push(count);
          revenues.push(revenue);
        }
        setChartData({ labels: last7Days, values: counts });
        setRevenueData({ labels: last7Days, values: revenues });

        // Status distribution
        const statusCounts = {};
        orders.forEach(o => {
          const status = o.status || 'Unknown';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        setStatusData({
          labels: Object.keys(statusCounts),
          values: Object.values(statusCounts),
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchOrders();
  }, []);

  const cards = [
    { 
      label: 'Total Revenue', 
      value: `PKR ${stats.totalRevenue?.toFixed(2) || '0.00'}`, 
      color: '#22c55e',
      icon: '💰',
      change: stats.todayRevenue > 0 ? `+PKR ${stats.todayRevenue.toFixed(2)} today` : null
    },
    { 
      label: 'Total Orders', 
      value: stats.totalOrders, 
      color: '#6366f1',
      icon: '🛒',
      change: stats.todayOrders > 0 ? `+${stats.todayOrders} today` : null
    },
    { 
      label: 'Total Users', 
      value: stats.totalUsers, 
      color: '#f59e0b',
      icon: '👥'
    },
    { 
      label: 'Pending Orders', 
      value: stats.pendingOrders || 0, 
      color: '#ef4444',
      icon: '⏳'
    },
    { 
      label: 'Avg Order Value', 
      value: `PKR ${stats.avgOrderValue?.toFixed(2) || '0.00'}`, 
      color: '#06b6d4',
      icon: '📊'
    },
    { 
      label: 'Completed Orders', 
      value: stats.completedOrders, 
      color: '#10b981',
      icon: '✅'
    },
  ];

  const barData = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Orders',
        data: chartData.values,
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderRadius: 8,
      },
    ],
  };

  const lineData = {
    labels: revenueData.labels,
    datasets: [
      {
        label: 'Revenue (PKR)',
        data: revenueData.values,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const doughnutData = {
    labels: statusData.labels,
    datasets: [
      {
        data: statusData.values,
        backgroundColor: [
          '#6366f1',
          '#22c55e',
          '#f59e0b',
          '#ef4444',
          '#06b6d4',
          '#8b5cf6',
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        position: 'top',
        labels: { color: '#94a3b8' }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#334155' },
        ticks: { color: '#94a3b8' },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' },
      },
    },
  };

  const lineOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: { display: false },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom',
        labels: { color: '#94a3b8', padding: 15 }
      },
    },
  };

  if (loading) {
    return <div style={{ color: '#94a3b8' }}>Loading dashboard...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Dashboard</h1>
        <div style={{ color: '#94a3b8', fontSize: 14 }}>
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 20,
          marginBottom: 32,
        }}
      >
        {cards.map((c) => (
          <div
            key={c.label}
            style={{
              background: '#1e293b',
              padding: 24,
              borderRadius: 12,
              borderLeft: `4px solid ${c.color}`,
              transition: 'transform 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <p style={{ color: '#94a3b8', fontSize: 14 }}>{c.label}</p>
              <span style={{ fontSize: 24 }}>{c.icon}</span>
            </div>
            <p style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{c.value}</p>
            {c.change && (
              <p style={{ color: c.color, fontSize: 12, fontWeight: 500 }}>{c.change}</p>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        <div
          style={{
            background: '#1e293b',
            padding: 24,
            borderRadius: 12,
            height: 350,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: '#fff' }}>Orders (Last 7 Days)</h2>
          <Bar data={barData} options={chartOptions} />
        </div>
        <div
          style={{
            background: '#1e293b',
            padding: 24,
            borderRadius: 12,
            height: 350,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: '#fff' }}>Order Status Distribution</h2>
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>

      <div
        style={{
          background: '#1e293b',
          padding: 24,
          borderRadius: 12,
          height: 350,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: '#fff' }}>Revenue Trend (Last 7 Days)</h2>
        <Line data={lineData} options={lineOptions} />
      </div>
    </div>
  );
};

export default DashboardPage;
