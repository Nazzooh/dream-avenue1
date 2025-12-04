// Real-time Booking Notifications Hook for Admins
// Subscribes to Supabase Realtime INSERT events on bookings table
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

export interface BookingNotification {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  booking_date: string;
  time_slot: string | null;
  guest_count: number | null;
  status: string;
  created_at: string;
  package_id: string | null;
}

interface UseBookingNotificationsReturn {
  notifications: BookingNotification[];
  unreadCount: number;
  markAsRead: () => void;
  clearNotifications: () => void;
  isConnected: boolean;
}

export function useBookingNotifications(): UseBookingNotificationsReturn {
  const [notifications, setNotifications] = useState<BookingNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const markAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    // Check if user is admin
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('🔔 No user authenticated - notifications disabled');
        return null;
      }

      // Get profile to check admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      // 🔥 TEMPORARY PATCH: Check both JWT root role AND metadata role as fallback
      const jwtRole = user.role;
      const metadataRole = user.user_metadata?.role;
      const profileIsAdmin = profile?.role === 'admin';
      
      // Accept admin role from any of these sources
      const isAdmin = profileIsAdmin || jwtRole === 'admin' || metadataRole === 'admin';
      
      if (!isAdmin) {
        console.log('🔔 User is not admin - notifications disabled');
        return null;
      }

      return user;
    };

    const setupRealtimeSubscription = async () => {
      const user = await checkAdminStatus();
      
      if (!user) {
        return;
      }

      console.log('🔔 Setting up real-time booking notifications for admin...');

      // Create Supabase Realtime channel
      const channel = supabase
        .channel('admin-booking-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'bookings',
          },
          (payload) => {
            console.log('🔔 New booking received:', payload.new);
            
            const newBooking = payload.new as BookingNotification;

            // Add to notifications list
            setNotifications((prev) => [newBooking, ...prev].slice(0, 10)); // Keep only last 10
            
            // Increment unread count
            setUnreadCount((count) => count + 1);

            // Show toast notification
            toast.success('New Booking Received! 🎉', {
              description: `${newBooking.full_name} booked for ${new Date(newBooking.booking_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}`,
              duration: 5000,
            });

            // Play notification sound (optional)
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
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Connected to booking notifications channel');
            setIsConnected(true);
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Error connecting to notifications channel');
            setIsConnected(false);
          } else if (status === 'TIMED_OUT') {
            console.error('⏱️ Connection timed out');
            setIsConnected(false);
          }
        });

      // Cleanup function
      return () => {
        console.log('🔕 Unsubscribing from booking notifications');
        supabase.removeChannel(channel);
        setIsConnected(false);
      };
    };

    const cleanup = setupRealtimeSubscription();

    return () => {
      cleanup.then((cleanupFn) => cleanupFn?.());
    };
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearNotifications,
    isConnected,
  };
}