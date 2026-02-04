// TasaTrust - Main Application
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase, supabaseHelpers } from './lib/supabase';

// Layout Components
import Layout from './components/Layout';
import PublicLayout from './components/PublicLayout';

// Public Pages
import HomePage from './pages/HomePage';
import PricingPage from './pages/PricingPage';
import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Member Pages
import MemberDashboard from './pages/member/Dashboard';
import MemberServices from './pages/member/Services';
import MemberBooking from './pages/member/Booking';
import MemberSubscription from './pages/member/Subscription';
import MemberSettings from './pages/member/Settings';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminServices from './pages/admin/Services';
import AdminPricing from './pages/admin/Pricing';
import AdminOrders from './pages/admin/Orders';
import AdminMembers from './pages/admin/Members';
import AdminWebsiteBuilds from './pages/admin/WebsiteBuilds';
import AdminAnalytics from './pages/admin/Analytics';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route Component
function ProtectedRoute({ 
  children, 
  requiredTier 
}: { 
  children: React.ReactNode;
  requiredTier?: string[];
}) {
  const { user, subscription, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!user) {
    return <div>Please log in</div>;
  }
  
  if (requiredTier && subscription && !requiredTier.includes(subscription.tier)) {
    return <div>Access denied</div>;
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          
          {/* Member Routes */}
          <Route element={<Layout />}>
            <Route path="/member" element={
              <ProtectedRoute>
                <MemberDashboard />
              </ProtectedRoute>
            } />
            <Route path="/member/services" element={
              <ProtectedRoute>
                <MemberServices />
              </ProtectedRoute>
            } />
            <Route path="/member/booking" element={
              <ProtectedRoute>
                <MemberBooking />
              </ProtectedRoute>
            } />
            <Route path="/member/subscription" element={
              <ProtectedRoute>
                <MemberSubscription />
              </ProtectedRoute>
            } />
            <Route path="/member/settings" element={
              <ProtectedRoute>
                <MemberSettings />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* Admin Routes */}
          <Route element={<Layout />}>
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/services" element={
              <ProtectedRoute>
                <AdminServices />
              </ProtectedRoute>
            } />
            <Route path="/admin/pricing" element={
              <ProtectedRoute>
                <AdminPricing />
              </ProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <ProtectedRoute>
                <AdminOrders />
              </ProtectedRoute>
            } />
            <Route path="/admin/members" element={
              <ProtectedRoute>
                <AdminMembers />
              </ProtectedRoute>
            } />
            <Route path="/admin/website-builds" element={
              <ProtectedRoute>
                <AdminWebsiteBuilds />
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute>
                <AdminAnalytics />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
