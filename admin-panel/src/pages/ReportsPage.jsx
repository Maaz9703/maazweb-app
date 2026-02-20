import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import api from '../config/api';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const ReportsPage = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [reportType, setReportType] = useState('sales');

  useEffect(() => {
    fetchData();
  }, [dateRange, reportType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, productsRes] = await Promise.all([
        api.get('/orders/admin/all'),
        api.get('/products'),
      ]);

      let filteredOrders = ordersRes.data.data || [];
      const allProducts = productsRes.data.data || [];

      // Filter by date range
      if (dateRange.start) {
        filteredOrders = filteredOrders.filter((o) => o.createdAt >= dateRange.start);
      }
      if (dateRange.end) {
        filteredOrders = filteredOrders.filter((o) => o.createdAt <= dateRange.end + 'T23:59:59');
      }

      setOrders(filteredOrders);
      setProducts(allProducts);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getSalesData = () => {
    const last30Days = [];
    const sales = [];
    const revenue = [];

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOrders = orders.filter((o) => o.createdAt?.startsWith(dateStr));
      const dayRevenue = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

      last30Days.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      sales.push(dayOrders.length);
      revenue.push(dayRevenue);
    }

    return { labels: last30Days, sales, revenue };
  };

  const getProductPerformance = () => {
    const productSales = {};
    
    orders.forEach((order) => {
      order.items?.forEach((item) => {
        const productId = item.product?._id || item.product;
        const productName = item.product?.title || 'Unknown';
        if (!productSales[productId]) {
          productSales[productId] = {
            name: productName,
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[productId].quantity += item.quantity;
        productSales[productId].revenue += item.quantity * item.price;
      });
    });

    const sorted = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      labels: sorted.map((p) => p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name),
      revenue: sorted.map((p) => p.revenue),
      quantity: sorted.map((p) => p.quantity),
    };
  };

  const getCategoryPerformance = () => {
    const categorySales = {};
    
    orders.forEach((order) => {
      order.items?.forEach((item) => {
        const category = item.product?.category || 'Uncategorized';
        if (!categorySales[category]) {
          categorySales[category] = { revenue: 0, orders: 0 };
        }
        categorySales[category].revenue += item.quantity * item.price;
        categorySales[category].orders += 1;
      });
    });

    const sorted = Object.entries(categorySales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      labels: sorted.map((c) => c.name),
      revenue: sorted.map((c) => c.revenue),
    };
  };

  const getStatusDistribution = () => {
    const statusCounts = {};
    orders.forEach((o) => {
      const status = o.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return {
      labels: Object.keys(statusCounts),
      values: Object.values(statusCounts),
    };
  };

  const exportReport = () => {
    const reportData = {
      period: dateRange.start && dateRange.end 
        ? `${dateRange.start} to ${dateRange.end}`
        : 'All Time',
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
      completedOrders: orders.filter((o) => o.status === 'Delivered').length,
      averageOrderValue: orders.length > 0 
        ? orders.reduce((sum, o) => sum + (o.total || 0), 0) / orders.length 
        : 0,
    };

    const content = JSON.stringify(reportData, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('Report exported');
  };

  const salesData = getSalesData();
  const productData = getProductPerformance();
  const categoryData = getCategoryPerformance();
  const statusData = getStatusDistribution();

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Reports & Analytics</h1>
        <button onClick={exportReport} style={primaryButtonStyle}>
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          style={inputStyle}
        >
          <option value="sales">Sales Report</option>
          <option value="products">Product Performance</option>
          <option value="categories">Category Performance</option>
        </select>
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          placeholder="Start Date"
          style={inputStyle}
        />
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          placeholder="End Date"
          style={inputStyle}
        />
        {(dateRange.start || dateRange.end) && (
          <button
            onClick={() => setDateRange({ start: '', end: '' })}
            style={{ ...btnStyle, background: '#475569' }}
          >
            Clear Dates
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
        <div style={{ background: '#1e293b', padding: 24, borderRadius: 12, borderLeft: '4px solid #22c55e' }}>
          <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>Total Revenue</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>PKR {totalRevenue.toFixed(2)}</p>
        </div>
        <div style={{ background: '#1e293b', padding: 24, borderRadius: 12, borderLeft: '4px solid #6366f1' }}>
          <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>Total Orders</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{totalOrders}</p>
        </div>
        <div style={{ background: '#1e293b', padding: 24, borderRadius: 12, borderLeft: '4px solid #f59e0b' }}>
          <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>Avg Order Value</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>PKR {avgOrderValue.toFixed(2)}</p>
        </div>
        <div style={{ background: '#1e293b', padding: 24, borderRadius: 12, borderLeft: '4px solid #10b981' }}>
          <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>Completed Orders</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>
            {orders.filter((o) => o.status === 'Delivered').length}
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ color: '#94a3b8' }}>Loading reports...</div>
      ) : (
        <>
          {reportType === 'sales' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
              <div style={{ background: '#1e293b', padding: 24, borderRadius: 12, height: 400 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: '#fff' }}>
                  Sales & Revenue (Last 30 Days)
                </h2>
                <Line
                  data={{
                    labels: salesData.labels,
                    datasets: [
                      {
                        label: 'Revenue (PKR)',
                        data: salesData.revenue,
                        borderColor: '#22c55e',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        yAxisID: 'y',
                      },
                      {
                        label: 'Orders',
                        data: salesData.sales,
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        yAxisID: 'y1',
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { labels: { color: '#94a3b8' } },
                    },
                    scales: {
                      y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        grid: { color: '#334155' },
                        ticks: { color: '#94a3b8' },
                      },
                      y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: { drawOnChartArea: false },
                        ticks: { color: '#94a3b8' },
                      },
                      x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8' },
                      },
                    },
                  }}
                />
              </div>
            </div>
          )}

          {reportType === 'products' && (
            <div style={{ background: '#1e293b', padding: 24, borderRadius: 12, height: 500 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: '#fff' }}>
                Top 10 Products by Revenue
              </h2>
              <Bar
                data={{
                  labels: productData.labels,
                  datasets: [
                    {
                      label: 'Revenue (PKR)',
                      data: productData.revenue,
                      backgroundColor: 'rgba(99, 102, 241, 0.8)',
                      borderRadius: 8,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
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
                }}
              />
            </div>
          )}

          {reportType === 'categories' && (
            <div style={{ background: '#1e293b', padding: 24, borderRadius: 12, height: 500 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: '#fff' }}>
                Category Performance
              </h2>
              <Bar
                data={{
                  labels: categoryData.labels,
                  datasets: [
                    {
                      label: 'Revenue (PKR)',
                      data: categoryData.revenue,
                      backgroundColor: 'rgba(34, 197, 94, 0.8)',
                      borderRadius: 8,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
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
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

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
const inputStyle = {
  padding: 12,
  borderRadius: 8,
  border: '1px solid #334155',
  background: '#0f172a',
  color: '#fff',
  minWidth: 150,
};

export default ReportsPage;
