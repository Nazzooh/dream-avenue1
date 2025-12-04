// Dream Avenue — Advanced Notification Management Panel
// Admin component for managing notification system settings and viewing detailed logs

import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { 
  Bell, 
  BellOff, 
  Trash2, 
  RefreshCw, 
  Settings, 
  CheckCircle2,
  XCircle,
  Wifi,
  WifiOff,
  Database,
  Zap,
  Clock,
  TrendingUp,
  AlertCircle,
  Download,
  Filter,
  Search
} from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { useNotifications } from '../../src/hooks/useNotifications';

interface NotificationLog {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  read: boolean;
  created_at: string;
  user_id: string | null;
  metadata: Record<string, any>;
}

interface NotificationStats {
  total: number;
  unread: number;
  today: number;
  thisWeek: number;
}

export function NotificationManagementPanel() {
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    today: 0,
    thisWeek: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'settings'>('overview');
  const [filterRead, setFilterRead] = useState<'all' | 'read' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    isRealtimeConnected,
    refreshNotifications,
  } = useNotifications();

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([
      loadNotificationLogs(),
      loadStats(),
    ]);
    setIsLoading(false);
  };

  const loadNotificationLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setNotificationLogs(data || []);
    } catch (error) {
      console.error('Error loading notification logs:', error);
      toast.error('Failed to load notification logs');
    }
  };

  const loadStats = async () => {
    try {
      // Get all notifications
      const { data: allNotifications, error: notifError } = await supabase
        .from('notifications')
        .select('id, read, created_at');

      if (notifError) throw notifError;

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const unread = allNotifications?.filter(n => !n.read).length || 0;
      const today = allNotifications?.filter(n => new Date(n.created_at) >= todayStart).length || 0;
      const thisWeek = allNotifications?.filter(n => new Date(n.created_at) >= weekStart).length || 0;

      setStats({
        total: allNotifications?.length || 0,
        unread,
        today,
        thisWeek,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const clearAllNotifications = async () => {
    if (!confirm('Are you sure you want to delete ALL notifications? This cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;

      toast.success('All notifications cleared');
      await loadData();
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Failed to clear notifications');
    }
  };

  const deleteOldNotifications = async (days: number) => {
    if (!confirm(`Delete notifications older than ${days} days?`)) {
      return;
    }

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { error } = await supabase
        .from('notifications')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (error) throw error;

      toast.success(`Deleted notifications older than ${days} days`);
      await loadData();
    } catch (error) {
      console.error('Error deleting old notifications:', error);
      toast.error('Failed to delete old notifications');
    }
  };

  const exportNotifications = () => {
    const csvContent = [
      ['ID', 'Title', 'Message', 'Type', 'Priority', 'Read', 'Created At', 'User ID'].join(','),
      ...notificationLogs.map(n => 
        [n.id, `"${n.title}"`, `"${n.message}"`, n.type, n.priority, n.read, n.created_at, n.user_id].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notifications-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Notifications exported');
  };

  const filteredLogs = notificationLogs
    .filter(n => {
      if (filterRead === 'read') return n.read;
      if (filterRead === 'unread') return !n.read;
      return true;
    })
    .filter(n => 
      searchQuery === '' || 
      n.message.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const StatCard = ({ icon: Icon, label, value, color, trend }: any) => (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(250, 249, 246, 0.9), rgba(255, 255, 255, 0.9))',
        borderRadius: '16px',
        padding: '20px',
        border: '2px solid rgba(182, 245, 0, 0.15)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${color}20, ${color}10)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={22} style={{ color }} />
        </div>
        {trend && (
          <div className="flex items-center gap-1" style={{ fontSize: '0.75rem', color: '#10B981' }}>
            <TrendingUp size={12} />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#2A2A2A', marginBottom: '4px' }}>
        {value}
      </p>
      <p style={{ fontSize: '0.875rem', color: '#666666' }}>{label}</p>
    </div>
  );

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2A2A2A', marginBottom: '4px' }}>
            Notification Center
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#666666' }}>
            Manage and monitor your notification system
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          style={{
            padding: '10px 18px',
            background: 'linear-gradient(135deg, #B6F500, #98CD00)',
            color: '#1a1a1a',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '600',
            fontSize: '0.875rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: isLoading ? 0.6 : 1,
            boxShadow: '0 4px 12px rgba(182, 245, 0, 0.3)',
          }}
        >
          <motion.div animate={isLoading ? { rotate: [0, 360] } : {}} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block' }}>
            <RefreshCw size={16} />
          </motion.div>
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto" style={{ borderBottom: '2px solid rgba(182, 245, 0, 0.15)' }}>
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'logs', label: 'Notification Logs', icon: Bell },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '12px 20px',
                background: isActive ? 'linear-gradient(135deg, #B6F500, #98CD00)' : 'transparent',
                color: isActive ? '#1a1a1a' : '#666666',
                border: 'none',
                borderRadius: '10px 10px 0 0',
                fontWeight: isActive ? '600' : '500',
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                icon={Bell}
                label="Total Notifications"
                value={stats.total}
                color="#E0C097"
              />
              <StatCard
                icon={AlertCircle}
                label="Unread"
                value={stats.unread}
                color="#FF6B6B"
              />
              <StatCard
                icon={Clock}
                label="Today"
                value={stats.today}
                color="#B6F500"
                trend="+12%"
              />
            </div>

            {/* System Status */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(250, 249, 246, 0.9), rgba(255, 255, 255, 0.9))',
                borderRadius: '16px',
                padding: '24px',
                border: '2px solid rgba(182, 245, 0, 0.15)',
                marginBottom: '20px',
              }}
            >
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#2A2A2A', marginBottom: '16px' }}>
                System Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  {isRealtimeConnected ? (
                    <>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Wifi size={20} style={{ color: '#10B981' }} />
                      </div>
                      <div>
                        <p style={{ fontWeight: '600', color: '#2A2A2A' }}>Realtime Connected</p>
                        <p style={{ fontSize: '0.813rem', color: '#10B981' }}>Live updates active</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <WifiOff size={20} style={{ color: '#EF4444' }} />
                      </div>
                      <div>
                        <p style={{ fontWeight: '600', color: '#2A2A2A' }}>Realtime Disconnected</p>
                        <p style={{ fontSize: '0.813rem', color: '#EF4444' }}>Reconnecting...</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'logs' && (
          <motion.div
            key="logs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Search size={18} style={{ color: '#666666' }} />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: '2px solid rgba(182, 245, 0, 0.2)',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
              </div>
              <select
                value={filterRead}
                onChange={(e) => setFilterRead(e.target.value as any)}
                style={{
                  padding: '10px 12px',
                  border: '2px solid rgba(182, 245, 0, 0.2)',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  background: 'white',
                }}
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>
              <button
                onClick={exportNotifications}
                style={{
                  padding: '10px 16px',
                  background: 'linear-gradient(135deg, #E0C097, #C9A77D)',
                  color: '#1a1a1a',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Download size={16} />
                Export
              </button>
            </div>

            {/* Notification List */}
            <div
              style={{
                background: 'white',
                borderRadius: '12px',
                border: '2px solid rgba(182, 245, 0, 0.15)',
                overflow: 'hidden',
              }}
            >
              {filteredLogs.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#999999' }}>
                  <Bell size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                  <p>No notifications found</p>
                </div>
              ) : (
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {filteredLogs.map((log, index) => (
                    <div
                      key={log.id}
                      style={{
                        padding: '16px 20px',
                        borderBottom: index !== filteredLogs.length - 1 ? '1px solid rgba(182, 245, 0, 0.1)' : 'none',
                        background: log.read ? 'transparent' : 'rgba(182, 245, 0, 0.03)',
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {log.read ? (
                              <CheckCircle2 size={14} style={{ color: '#10B981' }} />
                            ) : (
                              <span
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  background: '#B6F500',
                                  borderRadius: '50%',
                                  boxShadow: '0 0 6px rgba(182, 245, 0, 0.6)',
                                }}
                              />
                            )}
                            <p style={{ fontSize: '0.875rem', color: '#2A2A2A', fontWeight: log.read ? '400' : '600' }}>
                              {log.message}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 text-xs" style={{ color: '#999999' }}>
                            <span>{new Date(log.created_at).toLocaleString()}</span>
                            <span>•</span>
                            <span>By: {log.user_id || 'system'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="space-y-4">
              {/* Cleanup Options */}
              <div
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  border: '2px solid rgba(182, 245, 0, 0.15)',
                  padding: '20px',
                }}
              >
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#2A2A2A', marginBottom: '16px' }}>
                  Cleanup Options
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p style={{ fontWeight: '600', color: '#2A2A2A' }}>Delete old notifications (30 days)</p>
                      <p style={{ fontSize: '0.813rem', color: '#666666' }}>Remove notifications older than 30 days</p>
                    </div>
                    <button
                      onClick={() => deleteOldNotifications(30)}
                      style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, #E0C097, #C9A77D)',
                        color: '#1a1a1a',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                      }}
                    >
                      Clean Up
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p style={{ fontWeight: '600', color: '#2A2A2A' }}>Delete old notifications (90 days)</p>
                      <p style={{ fontSize: '0.813rem', color: '#666666' }}>Remove notifications older than 90 days</p>
                    </div>
                    <button
                      onClick={() => deleteOldNotifications(90)}
                      style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, #E0C097, #C9A77D)',
                        color: '#1a1a1a',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                      }}
                    >
                      Clean Up
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.05)',
                  borderRadius: '12px',
                  border: '2px solid rgba(239, 68, 68, 0.2)',
                  padding: '20px',
                }}
              >
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#EF4444', marginBottom: '16px' }}>
                  Danger Zone
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p style={{ fontWeight: '600', color: '#2A2A2A' }}>Clear all notifications</p>
                    <p style={{ fontSize: '0.813rem', color: '#666666' }}>Permanently delete all notifications</p>
                  </div>
                  <button
                    onClick={clearAllNotifications}
                    style={{
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Trash2 size={14} />
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}