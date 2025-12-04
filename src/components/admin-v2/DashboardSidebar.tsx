import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/auth/useAuth';
import { 
  LayoutDashboard, 
  Package, 
  Building2, 
  Image, 
  Calendar, 
  Star, 
  CalendarCheck, 
  ClipboardList, 
  BookOpen,
  LogOut,
  X,
  Home,
  Sparkles,
  UserPlus,
  TrendingUp,
  Bell,
  Terminal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface DashboardSidebarProps {
  currentPage: string;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, path: '/admin/dashboard' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, path: '/admin/analytics' },
  { id: 'notifications', label: 'Notifications', icon: Bell, path: '/admin/notifications' },
  { id: 'packages', label: 'Packages', icon: Package, path: '/admin/packages' },
  { id: 'facilities', label: 'Facilities', icon: Building2, path: '/admin/facilities' },
  { id: 'gallery', label: 'Gallery', icon: Image, path: '/admin/gallery' },
  { id: 'availability', label: 'Availability', icon: CalendarCheck, path: '/admin/availability' },
  { id: 'bookings', label: 'Bookings', icon: BookOpen, path: '/admin/bookings' },
  { id: 'requests', label: 'Admin Requests', icon: UserPlus, path: '/admin/requests' },
];

export function DashboardSidebar({ currentPage, isOpen, onClose, isCollapsed = false, onToggleCollapse }: DashboardSidebarProps) {
  const navigate = useNavigate();
  const { supabase } = useAuth();

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      try {
        await supabase.auth.signOut();
        navigate('/admin/login');
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          admin-sidebar
          ${isOpen ? 'open' : ''}
          ${isCollapsed ? 'collapsed' : ''}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="admin-sidebar-logo">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center sidebar-logo-icon"
              style={{ 
                background: 'linear-gradient(135deg, #B6F500, #A4DD00)',
                boxShadow: '0 4px 12px rgba(182, 245, 0, 0.25)'
              }}
            >
              <Sparkles size={24} style={{ color: '#2A2A2A' }} />
            </div>
            <div className="flex-1 sidebar-logo-text-wrapper">
              <h1 className="admin-sidebar-logo-text">
                Dream Avenue
              </h1>
              <p style={{ fontSize: '0.75rem', color: '#A4DD00', marginTop: '2px', fontWeight: '500' }}>
                Admin Dashboard
              </p>
            </div>
            
            {/* Mobile close button */}
            <button 
              onClick={onClose}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
              style={{
                color: '#666666'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)';
                e.currentTarget.style.color = '#FF6B6B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#666666';
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="admin-sidebar-nav overflow-y-auto">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`admin-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => onClose()}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon size={20} />
                  <span className="nav-link-text">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div 
            className="mt-auto p-4 border-t sidebar-footer"
            style={{ borderColor: '#E6E6E6' }}
          >
            {/* Desktop Collapse Toggle - only visible on lg+ screens */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="admin-nav-link mb-2 hidden lg:flex sidebar-collapse-toggle"
                title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                style={{ 
                  background: 'rgba(182, 245, 0, 0.08)',
                  justifyContent: isCollapsed ? 'center' : 'flex-start'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(182, 245, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(182, 245, 0, 0.08)';
                }}
              >
                {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                <span className="nav-link-text">{isCollapsed ? '' : 'Collapse'}</span>
              </button>
            )}
            
            <Link 
              to="/" 
              className="admin-nav-link mb-2"
              title={isCollapsed ? 'Back to Website' : undefined}
            >
              <Home size={20} />
              <span className="nav-link-text">Back to Website</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="admin-nav-link w-full"
              title={isCollapsed ? 'Logout' : undefined}
              style={{ color: '#FF6B6B' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <LogOut size={20} />
              <span className="nav-link-text">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}