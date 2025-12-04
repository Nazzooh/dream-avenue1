import { motion } from 'framer-motion';
import { useState, ReactNode } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardTopbar } from './DashboardTopbar';
import { MobileBottomNav } from './MobileBottomNav';
import { useAdmin } from '../../src/auth/useAdmin';

// Map routes to page info
const routeMap: Record<string, { title: string; id: string }> = {
  '/admin': { title: 'Dashboard', id: 'dashboard' },
  '/admin/dashboard': { title: 'Dashboard', id: 'dashboard' },
  '/admin/packages': { title: 'Packages Management', id: 'packages' },
  '/admin/facilities': { title: 'Facilities Management', id: 'facilities' },
  '/admin/gallery': { title: 'Gallery Management', id: 'gallery' },
  '/admin/availability': { title: 'Availability Management', id: 'availability' },
  '/admin/requests': { title: 'Admin Access Requests', id: 'requests' },
  '/admin/bookings': { title: 'Bookings Management', id: 'bookings' },
};

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const { loading, isAdmin } = useAdmin();

  // Show loading state while checking auth
  if (loading) {
    console.log('🎨 AdminLayout: Loading auth state...');
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: 'var(--bg-cream)' }}>
        <div className="text-center">
          <motion.div 
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"
          />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not admin
  if (!isAdmin) {
    console.log('🎨 AdminLayout: Not admin, redirecting to login...');
    return <Navigate to="/admin/login" replace />;
  }

  console.log('✅ AdminLayout: Admin authenticated, rendering layout');

  // Get current page info based on route
  const currentRoute = routeMap[location.pathname] || { title: 'Dashboard', id: 'dashboard' };

  return (
    <div className={`admin-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <DashboardSidebar 
        currentPage={currentRoute.id} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      {/* Main Content Area */}
      <div className="admin-main-content">
        <DashboardTopbar 
          pageTitle={currentRoute.title} 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        
        {/* Scrollable Content - Fluid Layout */}
        <main 
          className="w-full mx-auto"
          style={{ 
            background: 'var(--bg-cream)',
            padding: 'clamp(1rem,3vw,3rem) clamp(1rem,4vw,3rem)',
            maxWidth: '1600px'
          }}
        >
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav currentPage={currentRoute.id} />
    </div>
  );
}