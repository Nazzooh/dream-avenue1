// Supabase Notification System Hook
// Real-time notifications using Supabase only

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'system' | 'admin' | 'info';
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  created_at: string;
  user_id: string | null;
  metadata?: any;
}

interface UseNotificationsReturn {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  isRealtimeConnected: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  // Fetch notifications from Supabase
  const fetchNotifications = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('📢 No user authenticated');
        setNotifications([]);
        setUnreadCount(0);
        setIsLoading(false);
        return;
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      const isAdmin = profile?.role === 'admin';

      if (!isAdmin) {
        console.log('📢 User is not admin - notifications disabled');
        setNotifications([]);
        setUnreadCount(0);
        setIsLoading(false);
        return;
      }

      // Fetch notifications for admin
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.read).length || 0);
      setIsLoading(false);
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
      setIsLoading(false);
    }
  }, []);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false);

      if (error) throw error;

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      // Update local state
      setNotifications((prev) => {
        const deleted = prev.find((n) => n.id === notificationId);
        if (deleted && !deleted.read) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
        return prev.filter((n) => n.id !== notificationId);
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, []);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  // Setup real-time subscription
  useEffect(() => {
    let channel: any;

    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      const isAdmin = profile?.role === 'admin';

      if (!isAdmin) {
        setIsLoading(false);
        return;
      }

      // Initial fetch
      await fetchNotifications();

      // Setup Supabase Realtime channel
      console.log('📢 Setting up real-time notifications...');

      channel = supabase
        .channel('admin-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
          },
          (payload) => {
            console.log('📢 New notification received:', payload.new);
            
            const newNotification = payload.new as NotificationItem;

            // Add to notifications list
            setNotifications((prev) => [newNotification, ...prev]);
            
            if (!newNotification.read) {
              setUnreadCount((count) => count + 1);
            }

            // Show toast notification
            const typeEmoji = {
              booking: '📅',
              system: '⚙️',
              admin: '👤',
              info: 'ℹ️',
            }[newNotification.type] || '🔔';

            toast.success(`${typeEmoji} ${newNotification.title}`, {
              description: newNotification.message,
              duration: 5000,
            });

            // Play notification sound
            try {
              const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDGH0fPTgjMGHm7A7+OZURE=');
              audio.volume = 0.3;
              audio.play().catch(() => {
                // Ignore if autoplay is blocked
              });
            } catch (err) {
              // Ignore audio errors
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
          },
          (payload) => {
            console.log('📢 Notification updated:', payload.new);
            
            const updated = payload.new as NotificationItem;
            
            setNotifications((prev) =>
              prev.map((n) => (n.id === updated.id ? updated : n))
            );

            // Update unread count
            const oldNotification = notifications.find((n) => n.id === updated.id);
            if (oldNotification && !oldNotification.read && updated.read) {
              setUnreadCount((count) => Math.max(0, count - 1));
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'notifications',
          },
          (payload) => {
            console.log('📢 Notification deleted:', payload.old);
            
            const deletedId = (payload.old as any).id;
            
            setNotifications((prev) => {
              const deleted = prev.find((n) => n.id === deletedId);
              if (deleted && !deleted.read) {
                setUnreadCount((count) => Math.max(0, count - 1));
              }
              return prev.filter((n) => n.id !== deletedId);
            });
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Connected to notifications channel');
            setIsRealtimeConnected(true);
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Error connecting to notifications channel');
            setIsRealtimeConnected(false);
          } else if (status === 'TIMED_OUT') {
            console.error('⏱️ Connection timed out');
            setIsRealtimeConnected(false);
          }
        });
    };

    setupRealtimeSubscription();

    // Cleanup
    return () => {
      if (channel) {
        console.log('🔕 Unsubscribing from notifications');
        supabase.removeChannel(channel);
        setIsRealtimeConnected(false);
      }
    };
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    isRealtimeConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  };
}
