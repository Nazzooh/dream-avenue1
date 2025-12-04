import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { AdminGrid } from './AdminGrid';
import { 
  CalendarCheck, 
  PartyPopper, 
  Users, 
  ThumbsUp,
  Package,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react';
import { useBookings } from '../../src/hooks/useBookings';
import { usePackages } from '../../src/hooks/usePackages';
import { useEvents } from '../../src/hooks/useEvents';
import { motion } from 'motion/react';

interface RecentBooking {
  id: string;
  customer_name: string;
  event_date: string;
  status: string;
  package_name?: string;
}

export default function DashboardOverviewNew() {
  const { data: bookings, isLoading: bookingsLoading } = useBookings();
  const { data: packages, isLoading: packagesLoading } = usePackages();
  const { data: events, isLoading: eventsLoading } = useEvents();

  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);

  useEffect(() => {
    if (bookings) {
      const sorted = [...bookings]
        .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
        .slice(0, 5);
      setRecentBookings(sorted);
    }
  }, [bookings]);

  const isLoading = bookingsLoading || packagesLoading || eventsLoading;

  // Calculate metrics
  const totalBookings = bookings?.length || 0;
  const confirmedBookings = bookings?.filter(b => b.status === 'confirmed').length || 0;
  const completedEvents = events?.filter(e => new Date(e.date) < new Date()).length || 0;
  
  // Calculate total guests
  const totalGuests = bookings?.reduce((sum, booking) => {
    return sum + (booking.guest_count || 50);
  }, 0) || 0;

  // Default client satisfaction rating
  const avgRating = '5.0';

  // Active packages
  const activePackages = packages?.filter(p => p.is_active).length || 0;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
          <div className="text-center">
            <div className="w-24 h-24 rounded-full mx-auto mb-6 animate-pulse" 
                 style={{ background: 'rgba(0, 255, 65, 0.2)', border: '2px solid rgba(0, 255, 65, 0.4)' }}>
            </div>
            <p style={{ color: 'var(--dream-text-secondary)' }}>Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard Overview</h1>
          <p className="admin-page-description">
            Welcome to Dream Avenue Admin. Here's your venue's performance at a glance.
          </p>
        </div>
      </div>

      {/* Animated Metrics Grid - 3 columns */}
      <AdminGrid columns="3" className="mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0, duration: 0.4 }}
          className="metric-card"
        >
          <div className="metric-card-header">
            <div className="metric-card-icon">
              <CalendarCheck size={28} />
            </div>
          </div>
          <div className="metric-card-value">{totalBookings}</div>
          <div className="metric-card-label">Total Bookings</div>
          <div className="metric-card-change positive">
            <TrendingUp size={16} />
            {confirmedBookings} confirmed
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="metric-card"
        >
          <div className="metric-card-header">
            <div className="metric-card-icon">
              <PartyPopper size={28} />
            </div>
          </div>
          <div className="metric-card-value">{completedEvents}</div>
          <div className="metric-card-label">Events Hosted</div>
          <div className="metric-card-change positive">
            <CheckCircle size={16} />
            Successfully completed
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="metric-card"
        >
          <div className="metric-card-header">
            <div className="metric-card-icon">
              <Users size={28} />
            </div>
          </div>
          <div className="metric-card-value">{totalGuests.toLocaleString()}</div>
          <div className="metric-card-label">Total Guests</div>
          <div className="metric-card-change positive">
            <TrendingUp size={16} />
            Across all events
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="metric-card"
        >
          <div className="metric-card-header">
            <div className="metric-card-icon">
              <Star size={28} />
            </div>
          </div>
          <div className="metric-card-value">{avgRating}/5</div>
          <div className="metric-card-label">Client Rating</div>
          <div className="metric-card-change positive">
            <ThumbsUp size={16} />
            {testimonials?.length || 0} reviews
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="metric-card"
        >
          <div className="metric-card-header">
            <div className="metric-card-icon">
              <Package size={28} />
            </div>
          </div>
          <div className="metric-card-value">{activePackages}</div>
          <div className="metric-card-label">Active Packages</div>
          <div className="metric-card-change positive">
            <CheckCircle size={16} />
            Available for booking
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="metric-card"
        >
          <div className="metric-card-header">
            <div className="metric-card-icon">
              <Calendar size={28} />
            </div>
          </div>
          <div className="metric-card-value">{events?.length || 0}</div>
          <div className="metric-card-label">Total Events</div>
          <div className="metric-card-change positive">
            <TrendingUp size={16} />
            Scheduled events
          </div>
        </motion.div>
      </AdminGrid>

      {/* Recent Bookings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="admin-table-wrapper"
      >
        <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--dream-text-primary)' }}>
          Recent Bookings
        </h3>
        
        {recentBookings.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Event Date</th>
                <th>Package</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => (
                <tr key={booking.id}>
                  <td style={{ color: 'var(--dream-text-primary)', fontWeight: 600 }}>
                    {booking.customer_name}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Clock size={16} style={{ color: 'var(--dream-text-muted)' }} />
                      {new Date(booking.event_date).toLocaleDateString('en-IN')}
                    </div>
                  </td>
                  <td>{booking.package_name || 'N/A'}</td>
                  <td>
                    <span className={`admin-badge ${
                      booking.status === 'confirmed' ? 'admin-badge-success' :
                      booking.status === 'pending' ? 'admin-badge-warning' :
                      'admin-badge-danger'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    <button className="admin-btn admin-btn-outline admin-btn-sm">
                      View
                      <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <CalendarCheck size={48} className="mx-auto mb-4" style={{ color: 'var(--dream-text-muted)' }} />
            <p style={{ color: 'var(--dream-text-secondary)' }}>
              No recent bookings to display
            </p>
          </div>
        )}
      </motion.div>

      {/* Quick Actions - Optional */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="mt-8"
      >
        <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--dream-text-primary)' }}>
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="admin-btn admin-btn-primary w-full">
            <Package size={18} />
            Manage Packages
          </button>
          <button className="admin-btn admin-btn-gold w-full">
            <Calendar size={18} />
            View Calendar
          </button>
          <button className="admin-btn admin-btn-outline w-full">
            <Users size={18} />
            Manage Bookings
          </button>
          <button className="admin-btn admin-btn-outline w-full">
            <Star size={18} />
            View Reviews
          </button>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
