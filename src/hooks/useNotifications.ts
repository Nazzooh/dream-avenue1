// Dream Avenue — Notifications Hook
// Manages realtime notifications for admin users with Supabase integration

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase/client';

export interface NotificationItem {
  id: string;
  title?: string;
  message: string;
  type?: string;
  priority?: string;
  is_read: boolean;
  created_at: string;
  user_id?: string | null;
  booking_data?: {
    booking_date?: string;
    guest_count?: number;
    [key: string]: any;
  };
  metadata?: Record<string, any>;
}

interface UseNotificationsReturn {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  isRealtimeConnected: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        // Check admin status via profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.log('Profile check error:', profileError);
          setIsAdmin(false);
        } else {
          setIsAdmin(profile?.role === 'admin');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAdmin) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        // Silently handle permission errors (RLS policies)
        if (error.code === '42501') {
          console.log('📢 Notifications table requires database function permissions');
          setNotifications([]);
          setUnreadCount(0);
          setIsLoading(false);
          return;
        }
        console.error('Error fetching notifications:', error);
        setNotifications([]);
        setUnreadCount(0);
        setIsLoading(false);
        return;
      }

      // Transform data to match NotificationItem interface
      const transformedNotifications: NotificationItem[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        message: item.message || item.title || '',
        type: item.type,
        priority: item.priority,
        is_read: item.read || item.is_read || false,
        created_at: item.created_at,
        user_id: item.user_id,
        booking_data: item.booking_data || item.metadata?.booking_data,
        metadata: item.metadata,
      }));

      setNotifications(transformedNotifications);
      setUnreadCount(transformedNotifications.filter(n => !n.is_read).length);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
    }
  }, [isAdmin]);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, is_read: true })
        .eq('id', id);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true, is_read: true })
        .in('id', unreadIds);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }

      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [notifications]);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    setIsLoading(true);
    await fetchNotifications();
  }, [fetchNotifications]);

  // Initial fetch and setup realtime subscription
  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    fetchNotifications();

    // Set up realtime subscription
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          console.log('Realtime notification update:', payload);
          fetchNotifications();
        }
      )
      .subscribe((status) => {
        setIsRealtimeConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    isRealtimeConnected,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  };
}

