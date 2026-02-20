import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import api from '../config/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const CustomerInsightsPage = () => {
  const [insights, setInsights] = useState({
    topCustomers: [],
    customerLifetimeValue: [],
    newVsReturning: { new: 0, returning: 0 },
    ordersByCustomer: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const [ordersRes, usersRes] = await Promise.all([
        api.get('/orders/admin/all'),
        api.get('/users'),
      ]);

      const orders = ordersRes.data.data || [];
      const users = usersRes.data.data || [];

      // Calculate customer spending
      const customerSpending = {};
      orders.forEach((order) => {
        const userId = order.user?._id;
        if (userId) {
          if (!customerSpending[userId]) {
            customerSpending[userId] = {
              name: order.user?.name || 'Unknown',
              email: order.user?.email || '',
              totalSpent: 0,
              orderCount: 0,
            };
          }
          customerSpending[userId].totalSpent += order.total || 0;
          customerSpending[userId].orderCount += 1;
        }
      });

      // Top customers
      const topCustomers = Object.values(customerSpending)
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10);

      // New vs Returning customers
      const userOrderCounts = {};
      orders.forEach((order) => {
        const userId = order.user?._id;
        if (userId) {
          userOrderCounts[userId] = (userOrderCounts[userId] || 0) + 1;
        }
      });

      const newCustomers = Object.keys(userOrderCounts).filter((id) => userOrderCounts[id] === 1).length;
      const returningCustomers = Object.keys(userOrderCounts).filter((id) => userOrderCounts[id] > 1).length;

      // Orders distribution by customer
      const orderDistribution = {};
      Object.values(userOrderCounts).forEach((count) => {
        orderDistribution[count] = (orderDistribution[count] || 0) + 1;
      });

      setInsights({
        topCustomers,
        customerLifetimeValue: topCustomers.slice(0, 5),
        newVsReturning: { new: newCustomers, returning: returningCustomers },
        ordersByCustomer: Object.entries(orderDistribution)
          .map(([orders, customers]) => ({ orders: parseInt(orders), customers }))
          .sort((a, b) => a.orders - b.orders),
      });
    } catch (error) {
      console.error('Fetch insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const topCustomersData = {
    labels: insights.topCustomers.map((c) => c.name || c.email.substring(0, 15)),
    datasets: [
      {
        label: 'Total Spent (PKR)',
        data: insights.topCustomers.map((c) => c.totalSpent),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderRadius: 8,
      },
    ],
  };

  const newVsReturningData = {
    labels: ['New Customers', 'Returning Customers'],
    datasets: [
      {
        data: [insights.newVsReturning.new, insights.newVsReturning.returning],
        backgroundColor: ['#6366f1', '#22c55e'],
        borderWidth: 0,
      },
    ],
  };

  if (loading) {
    return <div style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>Loading insights...</div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Customer Insights</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 32 }}>
        <div style={{ background: '#1e293b', padding: 24, borderRadius: 12, height: 400 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: '#fff' }}>
            Top 10 Customers by Spending
          </h2>
          <Bar
            data={topCustomersData}
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
                  ticks: { color: '#94a3b8', maxRotation: 45 },
                },
              },
            }}
          />
        </div>

        <div style={{ background: '#1e293b', padding: 24, borderRadius: 12, height: 400 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: '#fff' }}>
            New vs Returning Customers
          </h2>
          <Doughnut
            data={newVsReturningData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'bottom', labels: { color: '#94a3b8' } },
              },
            }}
          />
        </div>
      </div>

      <div style={{ background: '#1e293b', padding: 24, borderRadius: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: '#fff' }}>
          Top Customers Details
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155' }}>
              <th style={thStyle}>Rank</th>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Total Orders</th>
              <th style={thStyle}>Total Spent</th>
              <th style={thStyle}>Avg Order Value</th>
            </tr>
          </thead>
          <tbody>
            {insights.topCustomers.map((customer, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #334155' }}>
                <td style={tdStyle}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: index < 3 ? '#fbbf24' : '#334155',
                      color: '#fff',
                      textAlign: 'center',
                      lineHeight: '32px',
                      fontWeight: 600,
                    }}
                  >
                    {index + 1}
                  </span>
                </td>
                <td style={tdStyle}>{customer.name || 'Unknown'}</td>
                <td style={tdStyle}>{customer.email}</td>
                <td style={tdStyle}>{customer.orderCount}</td>
                <td style={tdStyle}>PKR {customer.totalSpent.toFixed(2)}</td>
                <td style={tdStyle}>
                  PKR {(customer.totalSpent / customer.orderCount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const thStyle = { padding: 14, textAlign: 'left', fontWeight: 600, color: '#94a3b8' };
const tdStyle = { padding: 14, color: '#e2e8f0' };

export default CustomerInsightsPage;
