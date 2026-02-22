import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Admin components
import DashboardLayout from './components/DashboardLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import UsersPage from './pages/UsersPage';
import CouponsPage from './pages/CouponsPage';
import ReviewsPage from './pages/ReviewsPage';
import ReportsPage from './pages/ReportsPage';
import ActivityFeedPage from './pages/ActivityFeedPage';
import InventoryAlertsPage from './pages/InventoryAlertsPage';
import CustomerInsightsPage from './pages/CustomerInsightsPage';
import SettingsPage from './pages/SettingsPage';

// Web / storefront components
import WebLayout from './components/WebLayout';
import HomePage from './pages/web/HomePage';
import ShopPage from './pages/web/ShopPage';
import ProductPage from './pages/web/ProductPage';
import CartPage from './pages/web/CartPage';
import CheckoutPage from './pages/web/CheckoutPage';
import WishlistPage from './pages/web/WishlistPage';
import WebOrdersPage from './pages/web/OrdersPage';
import OrderDetailPage from './pages/web/OrderDetailPage';
import ProfilePage from './pages/web/ProfilePage';
import AddressesPage from './pages/web/AddressesPage';
import WebLoginPage from './pages/web/WebLoginPage';
import RegisterPage from './pages/web/RegisterPage';

const AdminProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
      }}>
        <div style={{ color: '#94a3b8', fontSize: 18 }}>Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* ─── Admin Routes ─── */}
      <Route path="/admin/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <DashboardLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="coupons" element={<CouponsPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="activity" element={<ActivityFeedPage />} />
        <Route path="inventory" element={<InventoryAlertsPage />} />
        <Route path="customers" element={<CustomerInsightsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* ─── Web / Storefront Routes ─── */}
      <Route path="/" element={<WebLayout><HomePage /></WebLayout>} />
      <Route path="/shop" element={<WebLayout><ShopPage /></WebLayout>} />
      <Route path="/product/:id" element={<WebLayout><ProductPage /></WebLayout>} />
      <Route path="/cart" element={<WebLayout><CartPage /></WebLayout>} />
      <Route path="/checkout" element={<WebLayout><CheckoutPage /></WebLayout>} />
      <Route path="/wishlist" element={<WebLayout><WishlistPage /></WebLayout>} />
      <Route path="/orders" element={<WebLayout><WebOrdersPage /></WebLayout>} />
      <Route path="/orders/:id" element={<WebLayout><OrderDetailPage /></WebLayout>} />
      <Route path="/profile" element={<WebLayout><ProfilePage /></WebLayout>} />
      <Route path="/profile/addresses" element={<WebLayout><AddressesPage /></WebLayout>} />
      <Route path="/login" element={<WebLayout><WebLoginPage /></WebLayout>} />
      <Route path="/register" element={<WebLayout><RegisterPage /></WebLayout>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
