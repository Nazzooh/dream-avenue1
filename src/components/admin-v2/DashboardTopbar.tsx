import { Menu, Bell, Settings, Search, LogOut } from 'lucide-react';
import { useAuth } from '../../src/auth/useAuth';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications } from '../../src/hooks/useNotifications';
import { NotificationDropdown } from './NotificationDropdown';

interface DashboardTopbarProps {
  pageTitle: string;
  onMenuClick: () => void;
}

export function DashboardTopbar({ pageTitle, onMenuClick }: DashboardTopbarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Supabase notification system
  const { 
    notifications, 
    unreadCount, 
    markAsRead,
    markAllAsRead,
    isRealtimeConnected,
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get user initials
  const getUserInitials = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'A';
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      try {
        await signOut();
        navigate('/admin/login');
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  };

  const handleNotificationClick = () => {
    setIsNotificationOpen((prev) => !prev);
  };

  const handleCloseNotifications = () => {
    setIsNotificationOpen(false);
  };

  const handleViewAllBookings = () => {
    navigate('/admin/bookings');
    setIsNotificationOpen(false);
  };

  return (
    <div className="admin-topbar">
      {/* Left: Menu + Page Title (Mobile) */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg transition-colors"
          style={{ color: '#666666' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(182, 245, 0, 0.08)';
            e.currentTarget.style.color = '#B6F500';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#666666';
          }}
        >
          <Menu size={22} />
        </button>
        
        <h2 
          className="hidden lg:block"
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#2A2A2A'
          }}
        >
          {pageTitle}
        </h2>
      </div>

      {/* Center: Search Bar */}
      <div className="admin-search-bar">
        <Search className="admin-search-icon" />
        <input 
          type="text"
          placeholder="Search..."
          className="admin-search-input"
        />
      </div>

      {/* Right: Actions */}
      <div className="admin-topbar-actions">
        {/* Notifications with Hybrid System */}
        <div ref={notificationRef} style={{ position: 'relative' }} className="notification-container">
          <button 
            onClick={handleNotificationClick}
            className="admin-notification-btn"
            style={{ position: 'relative' }}
            aria-label="Notifications"
          >
            <motion.div
              animate={unreadCount > 0 ? { 
                color: ['#666666', '#E0C097', '#666666'],
                scale: [1, 1.1, 1]
              } : {}}
              transition={{ 
                duration: 2, 
                repeat: unreadCount > 0 ? Infinity : 0,
                ease: 'easeInOut'
              }}
            >
              <Bell size={20} />
            </motion.div>
            
            {/* Badge with Animation */}
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="admin-notification-badge"
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    minWidth: '18px',
                    height: '18px',
                    background: 'linear-gradient(135deg, #FF6B6B, #FF5252)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: '700',
                    color: 'white',
                    padding: '2px',
                    boxShadow: '0 0 12px rgba(255, 107, 107, 0.6)',
                    animation: 'pulse-glow 1.5s infinite alternate',
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Connection Status Indicator */}
            {isRealtimeConnected && (
              <span
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '8px',
                  height: '8px',
                  background: '#10B981',
                  borderRadius: '50%',
                  border: '2px solid white',
                  boxShadow: '0 0 6px rgba(16, 185, 129, 0.5)',
                }}
              />
            )}
          </button>

          {/* Notifications Dropdown Component */}
          <NotificationDropdown
            isOpen={isNotificationOpen}
            notifications={notifications}
            unreadCount={unreadCount}
            isRealtimeConnected={isRealtimeConnected}
            onClose={handleCloseNotifications}
            onMarkAllRead={markAllAsRead}
            onMarkAsRead={markAsRead}
            onViewAll={handleViewAllBookings}
          />
        </div>

        {/* Settings */}
        <button 
          className="admin-notification-btn"
          style={{ position: 'relative' }}
        >
          <Settings size={20} style={{ color: '#666666' }} />
        </button>

        {/* User Profile with Dropdown */}
        <div className="relative group">
          <button className="admin-profile-btn">
            <div className="admin-profile-avatar">
              {getUserInitials()}
            </div>
            <div className="hidden md:block text-left">
              <p style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: '#2A2A2A' 
              }}>
                Admin
              </p>
              <p style={{ 
                fontSize: '0.75rem', 
                color: '#999999',
                marginTop: '2px'
              }}>
                {user?.email || 'admin@dreamavenue.com'}
              </p>
            </div>
          </button>
          
          {/* Dropdown Menu */}
          <div 
            className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E5E7EB',
            }}
          >
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 flex items-center gap-3 transition-colors rounded-xl"
              style={{ color: '#EF4444' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FEE2E2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <LogOut size={18} />
              <span style={{ fontWeight: '500' }}>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add keyframes for pulse animation */}
      <style>{`
        @keyframes pulse-glow {
          from {
            box-shadow: 0 0 8px rgba(255, 107, 107, 0.4);
            transform: scale(1);
          }
          to {
            box-shadow: 0 0 16px rgba(255, 107, 107, 0.8);
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}