// Dream Avenue — Notification Dropdown Component
// Displays realtime notifications with pastel luxury theme

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  CheckCheck, 
  ExternalLink, 
  X, 
  Wifi, 
  WifiOff,
  Calendar,
  Users,
  Clock
} from 'lucide-react';
import { NotificationItem } from '../../src/hooks/useNotifications';

interface NotificationDropdownProps {
  isOpen: boolean;
  notifications: NotificationItem[];
  unreadCount: number;
  isRealtimeConnected: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
  onMarkAsRead: (id: string) => void;
  onViewAll: () => void;
}

export function NotificationDropdown({
  isOpen,
  notifications,
  unreadCount,
  isRealtimeConnected,
  onClose,
  onMarkAllRead,
  onMarkAsRead,
  onViewAll,
}: NotificationDropdownProps) {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .notification-dropdown-panel {
            position: fixed !important;
            left: 8px !important;
            right: 8px !important;
            top: 72px !important;
          }
        }
        @media (max-width: 480px) {
          .notification-dropdown-panel {
            left: 4px !important;
            right: 4px !important;
            top: 68px !important;
          }
        }
      `}</style>
      
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={onClose}
              style={{ background: 'rgba(0, 0, 0, 0.1)' }}
            />

          {/* Dropdown Panel */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="notification-dropdown-panel"
            style={{
              position: 'absolute',
              right: '0',
              top: 'calc(100% + 12px)',
              width: '100vw',
              maxWidth: '420px',
              minWidth: '320px',
              maxHeight: '85vh',
              background: '#FAF9F6',
              borderRadius: '16px',
              boxShadow: '0 12px 40px rgba(224, 192, 151, 0.25), 0 0 0 1px rgba(182, 245, 0, 0.15)',
              overflow: 'hidden',
              zIndex: 50,
              border: '2px solid rgba(224, 192, 151, 0.3)',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '16px 16px',
                borderBottom: '2px solid rgba(182, 245, 0, 0.15)',
                background: 'linear-gradient(135deg, rgba(182, 245, 0, 0.08), rgba(224, 192, 151, 0.08))',
              }}
              className="notification-header"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #B6F500, #98CD00)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(182, 245, 0, 0.3)',
                      flexShrink: 0,
                    }}
                    className="md:w-10 md:h-10"
                  >
                    <Bell size={18} style={{ color: '#1a1a1a' }} className="md:w-5 md:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 style={{ fontWeight: '700', color: '#2A2A2A', fontSize: 'clamp(0.938rem, 2vw, 1.125rem)' }}>
                      Notifications
                    </h3>
                    <p style={{ fontSize: 'clamp(0.688rem, 1.5vw, 0.75rem)', color: '#666666', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {notifications.length === 0 
                        ? 'All caught up!' 
                        : `${notifications.length} notification${notifications.length !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={onClose}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.05)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    flexShrink: 0,
                    marginLeft: '8px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(231, 76, 60, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
                  }}
                >
                  <X size={16} style={{ color: '#666666' }} />
                </button>
              </div>

              {/* Connection Status */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* Realtime Status */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {isRealtimeConnected ? (
                    <>
                      <Wifi size={12} style={{ color: '#10B981' }} className="sm:w-3.5 sm:h-3.5" />
                      <span style={{ fontSize: 'clamp(0.625rem, 1.5vw, 0.7rem)', color: '#10B981', fontWeight: '500' }}>
                        Live
                      </span>
                    </>
                  ) : (
                    <>
                      <WifiOff size={12} style={{ color: '#999999' }} className="sm:w-3.5 sm:h-3.5" />
                      <span style={{ fontSize: 'clamp(0.625rem, 1.5vw, 0.7rem)', color: '#999999', fontWeight: '500' }}>
                        Offline
                      </span>
                    </>
                  )}
                </div>

                {/* Mark All Read Button */}
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    style={{
                      fontSize: 'clamp(0.625rem, 1.5vw, 0.7rem)',
                      color: '#E0C097',
                      fontWeight: '600',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginLeft: 'auto',
                      padding: '4px 6px',
                      borderRadius: '6px',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                    className="sm:px-2"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(224, 192, 151, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <CheckCheck size={11} className="sm:w-3 sm:h-3" />
                    <span className="hidden sm:inline">Mark All</span>
                    <span className="inline sm:hidden">All</span>
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div 
              style={{ 
                maxHeight: 'calc(85vh - 220px)', 
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(182, 245, 0, 0.3) transparent',
              }}
              className="notification-list"
            >
              {notifications.length === 0 ? (
                <div 
                  style={{
                    padding: 'clamp(40px, 8vw, 60px) clamp(16px, 4vw, 24px)',
                    textAlign: 'center',
                    color: '#999999',
                  }}
                >
                  <div
                    style={{
                      width: 'clamp(60px, 15vw, 80px)',
                      height: 'clamp(60px, 15vw, 80px)',
                      margin: '0 auto 20px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(182, 245, 0, 0.1), rgba(224, 192, 151, 0.1))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Bell size={36} style={{ color: '#CCCCCC' }} className="sm:w-10 sm:h-10" />
                  </div>
                  <p style={{ fontWeight: '600', marginBottom: '6px', color: '#666666', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>
                    No notifications yet
                  </p>
                  <p style={{ fontSize: 'clamp(0.813rem, 1.8vw, 0.875rem)' }}>
                    You're all caught up! 🎉
                  </p>
                </div>
              ) : (
                notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="notification-item-card"
                    style={{
                      padding: 'clamp(12px, 2.5vw, 16px) clamp(12px, 3vw, 20px)',
                      borderBottom: index !== notifications.length - 1 ? '1px solid rgba(182, 245, 0, 0.1)' : 'none',
                      borderLeft: '3px solid transparent',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      background: notification.is_read ? 'transparent' : 'rgba(182, 245, 0, 0.05)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(182, 245, 0, 0.08)';
                      e.currentTarget.style.borderLeftColor = '#B6F500';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = notification.is_read ? 'transparent' : 'rgba(182, 245, 0, 0.05)';
                      e.currentTarget.style.borderLeftColor = 'transparent';
                    }}
                    onClick={() => {
                      onMarkAsRead(notification.id);
                      onViewAll();
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 sm:gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-2">
                          {!notification.is_read && (
                            <span
                              style={{
                                width: '7px',
                                height: '7px',
                                background: 'linear-gradient(135deg, #B6F500, #98CD00)',
                                borderRadius: '50%',
                                boxShadow: '0 0 8px rgba(182, 245, 0, 0.6)',
                                flexShrink: 0,
                                marginTop: '4px',
                              }}
                              className="sm:w-2 sm:h-2"
                            />
                          )}
                          <p 
                            style={{ 
                              fontSize: 'clamp(0.813rem, 1.8vw, 0.875rem)', 
                              color: '#2A2A2A',
                              fontWeight: notification.is_read ? '400' : '600',
                              lineHeight: '1.5',
                              wordBreak: 'break-word',
                            }}
                          >
                            {notification.message}
                          </p>
                        </div>

                        {/* Booking metadata */}
                        {notification.booking_data && (
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {notification.booking_data.booking_date && (
                              <span
                                style={{
                                  fontSize: 'clamp(0.625rem, 1.4vw, 0.7rem)',
                                  color: '#E0C097',
                                  background: 'rgba(224, 192, 151, 0.1)',
                                  padding: '3px 6px',
                                  borderRadius: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  whiteSpace: 'nowrap',
                                }}
                                className="sm:px-2"
                              >
                                <Calendar size={9} className="sm:w-2.5 sm:h-2.5" />
                                {new Date(notification.booking_data.booking_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            )}
                            {notification.booking_data.guest_count && (
                              <span style={{ 
                                fontSize: 'clamp(0.625rem, 1.4vw, 0.7rem)', 
                                color: '#999999', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '3px',
                                whiteSpace: 'nowrap',
                              }}>
                                <Users size={9} className="sm:w-2.5 sm:h-2.5" />
                                {notification.booking_data.guest_count} guests
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span style={{ fontSize: 'clamp(0.594rem, 1.3vw, 0.65rem)', color: '#999999', whiteSpace: 'nowrap' }}>
                          {formatTimeAgo(notification.created_at)}
                        </span>
                        {!notification.is_read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkAsRead(notification.id);
                            }}
                            style={{
                              fontSize: 'clamp(0.594rem, 1.3vw, 0.65rem)',
                              color: '#10B981',
                              background: 'rgba(16, 185, 129, 0.1)',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '2px 5px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              whiteSpace: 'nowrap',
                            }}
                            className="sm:px-1.5"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div
                style={{
                  padding: 'clamp(12px, 2.5vw, 16px) clamp(16px, 3vw, 24px)',
                  borderTop: '2px solid rgba(182, 245, 0, 0.15)',
                  background: 'rgba(250, 250, 246, 0.8)',
                }}
              >
                <button
                  onClick={onViewAll}
                  style={{
                    width: '100%',
                    padding: 'clamp(10px, 2vw, 12px)',
                    background: 'linear-gradient(135deg, #E0C097, #C9A77D)',
                    color: '#1a1a1a',
                    borderRadius: '10px',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: 'clamp(0.813rem, 1.8vw, 0.875rem)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'clamp(6px, 1.5vw, 8px)',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(224, 192, 151, 0.3)',
                  }}
                  className="sm:rounded-xl"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(224, 192, 151, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(224, 192, 151, 0.3)';
                  }}
                >
                  View All Bookings
                  <ExternalLink size={13} className="sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}