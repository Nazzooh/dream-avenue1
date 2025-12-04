import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner@2.0.3';
import { queryClient } from './src/lib/queryClient';
import { LoadingFallback, AdminLoadingFallback } from './components/LoadingFallback';
import { initializePerformanceOptimizations } from './src/utils/performanceOptimizations';

// 🌿 Main Website - Load immediately (critical path)
import { MainWebsite } from './pages/MainWebsite';

// 📅 Booking Page - Lazy load (user action required)
const SmartSlotBookingPage = lazy(() => import('./pages/SmartSlotBookingPage'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));

// 🧩 Admin Pages - Lazy load (auth required)
const AdminLogin = lazy(() => import('./pages/admin/Login').then(m => ({ default: m.AdminLogin })));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard').then(m => ({ default: m.AdminDashboard })));
const AdminPackages = lazy(() => import('./pages/admin/Packages').then(m => ({ default: m.AdminPackages })));
const AdminFacilities = lazy(() => import('./pages/admin/Facilities').then(m => ({ default: m.AdminFacilities })));
const AdminGallery = lazy(() => import('./pages/admin/Gallery').then(m => ({ default: m.AdminGallery })));

const AdminAvailability = lazy(() => import('./pages/admin/Availability').then(m => ({ default: m.AdminAvailability })));
const AdminRequests = lazy(() => import('./pages/admin/Requests').then(m => ({ default: m.AdminRequests })));
const AdminBookings = lazy(() => import('./pages/admin/Bookings').then(m => ({ default: m.AdminBookings })));
const AnalyticsSettings = lazy(() => import('./pages/admin/AnalyticsSettings').then(m => ({ default: m.AnalyticsSettings })));
const NotificationCenter = lazy(() => import('./pages/admin/NotificationCenter'));

// 🔐 Auth
import { ProtectedRoute } from './src/auth/ProtectedRoute';

// 🎨 Styles
import './styles/admin-dashboard.css';        // Admin Dashboard - Light pastel neon theme
import './styles/admin-login-pastel.css';     // Admin Login - Pastel theme
import './styles/new-booking-page.css';       // Booking Page - Elegant Split Layout (Pastel Luxury)

export default function App() {
  // Initialize performance optimizations on mount
  useEffect(() => {
    initializePerformanceOptimizations();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* 🌐 Main Website - No suspense needed (loaded immediately) */}
            <Route path="/" element={<MainWebsite />} />

            {/* 📅 Booking Page - Lazy loaded */}
            <Route path="/booking" element={<SmartSlotBookingPage />} />
            <Route path="/slot-booking" element={<SmartSlotBookingPage />} />
            
            {/* 📜 Terms and Conditions */}
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

            {/* 🔑 Admin Login */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* 🧭 Admin Dashboard (Protected) - Lazy loaded */}
            <Route
              path="/admin"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                </Suspense>
              }
            />

            {/* 🗂 Admin Management Routes - Lazy loaded */}
            <Route 
              path="/admin/dashboard" 
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>
                </Suspense>
              } 
            />
            <Route 
              path="/admin/packages" 
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <ProtectedRoute requireAdmin={true}><AdminPackages /></ProtectedRoute>
                </Suspense>
              } 
            />
            <Route 
              path="/admin/facilities" 
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <ProtectedRoute requireAdmin={true}><AdminFacilities /></ProtectedRoute>
                </Suspense>
              } 
            />
            <Route 
              path="/admin/gallery" 
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <ProtectedRoute requireAdmin={true}><AdminGallery /></ProtectedRoute>
                </Suspense>
              } 
            />

            <Route 
              path="/admin/availability" 
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <ProtectedRoute requireAdmin={true}><AdminAvailability /></ProtectedRoute>
                </Suspense>
              } 
            />
            <Route 
              path="/admin/requests" 
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <ProtectedRoute requireAdmin={true}><AdminRequests /></ProtectedRoute>
                </Suspense>
              } 
            />
            <Route 
              path="/admin/bookings" 
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <ProtectedRoute requireAdmin={true}><AdminBookings /></ProtectedRoute>
                </Suspense>
              } 
            />
            <Route 
              path="/admin/analytics" 
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <ProtectedRoute requireAdmin={true}><AnalyticsSettings /></ProtectedRoute>
                </Suspense>
              } 
            />
            <Route 
              path="/admin/notifications" 
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <ProtectedRoute requireAdmin={true}><NotificationCenter /></ProtectedRoute>
                </Suspense>
              } 
            />

            {/* 🚫 Redirect all other routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>

      {/* 🔔 Toast Notifications */}
      <Toaster position="top-right" richColors />

      {/* 🧰 React Query Devtools - Only in development */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}