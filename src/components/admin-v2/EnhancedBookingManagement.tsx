import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { Search, Calendar, Users, Mail, Phone, FileText, Download, Trash2, Eye, Filter, X } from 'lucide-react';
import { useBookings } from '../../src/hooks/useBookings';
import { toast } from 'sonner@2.0.3';
import {
  confirmBooking,
  cancelBooking,
  updateBookingDetails,
  updateBookingExtras,
  getBookingActions
} from '../../src/api/adminBookings';
import { isAdmin, getCurrentProfile } from '../../src/lib/adminAuth';
import { supabase } from '../../src/lib/supabase';

export function EnhancedBookingManagement() {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [hasUpdateError, setHasUpdateError] = useState(false);

  const { data: bookings = [], isLoading } = useBookings();
  const updateStatusMutation = useUpdateBookingStatus();
  const deleteBookingMutation = useDeleteBooking();

  // Advanced filtering
  const filteredBookings = bookings.filter((booking) => {
    // Status filter
    if (statusFilter !== 'all' && booking.status !== statusFilter) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchableFields = [
        booking.full_name,
        booking.mobile,
        booking.email,
        booking.booking_date,
      ].filter(Boolean);

      if (!searchableFields.some(field => field?.toLowerCase().includes(query))) {
        return false;
      }
    }

    // Date range filter
    if (dateRange.from && booking.booking_date < dateRange.from) {
      return false;
    }
    if (dateRange.to && booking.booking_date > dateRange.to) {
      return false;
    }

    return true;
  });

  const handleStatusUpdate = async (bookingId: string, newStatus: BookingStatus) => {
    // Guard - check admin access first
    if (!(await isAdmin())) {
      toast.error('You are not authorized as admin');
      return;
    }

    try {
      // Get session for admin ID
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      if (newStatus === 'confirmed') {
        // Use admin_confirm_booking RPC for confirmation
        await confirmBooking({ bookingId, adminId: session.user.id });
        toast.success('Booking confirmed', {
          description: 'Status updated successfully with audit trail',
        });
      } else if (newStatus === 'cancelled') {
        // Use admin_cancel_booking RPC for cancellation
        await cancelBooking({ adminId: session.user.id, bookingId });
        toast.success('Booking cancelled', {
          description: 'Calendar slots freed automatically',
        });
      } else {
        // For other status updates, use the regular mutation
        await updateStatusMutation.mutateAsync({ id: bookingId, status: newStatus });
        toast.success(`Booking ${newStatus}`, {
          description: 'Status updated successfully',
        });
      }
      
      // Refresh bookings list
      // The parent component should handle this via react-query invalidation
      setHasUpdateError(false);
    } catch (error: any) {
      setHasUpdateError(true);
      toast.error('Failed to update status', {
        description: error.message || 'Please check your admin permissions',
        duration: 7000,
      });
      console.error('Status update error:', error);
    }
  };

  const handleDelete = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteBookingMutation.mutateAsync(bookingId);
      setSelectedBooking(null);
      toast.success('Booking deleted', {
        description: 'Record removed and date freed automatically',
      });
    } catch (error: any) {
      toast.error('Failed to delete booking', {
        description: error.message,
      });
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Name', 'Mobile', 'Email', 'Guests', 'Status', 'Slot'];
    const rows = filteredBookings.map(b => [
      b.booking_date,
      b.full_name,
      b.mobile || '',
      b.email || '',
      b.guest_count || '',
      b.status,
      b.time_slot || b.preferred_slot || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = {
    total: filteredBookings.length,
    pending: filteredBookings.filter(b => b.status === 'pending').length,
    confirmed: filteredBookings.filter(b => b.status === 'confirmed').length,
    cancelled: filteredBookings.filter(b => b.status === 'cancelled').length,
  };

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#343A40',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <Sparkles size={28} style={{ color: '#C8D46B' }} />
          Booking Management
        </motion.h1>
        <p style={{ color: '#6c757d', fontSize: '1rem' }}>
          Manage all venue bookings with advanced filtering and audit trail
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatsCard title="Total Bookings" value={stats.total} color="#3B82F6" icon={<Calendar />} />
        <StatsCard title="Pending" value={stats.pending} color="#F59E0B" icon={<Clock />} />
        <StatsCard title="Confirmed" value={stats.confirmed} color="#10B981" icon={<CheckCircle />} />
        <StatsCard title="Cancelled" value={stats.cancelled} color="#EF4444" icon={<XCircle />} />
      </div>

      {/* Search and Filters */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
            <input
              type="text"
              placeholder="Search by name, mobile, email, or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.875rem 1rem 0.875rem 3rem',
                border: '2px solid #E0E0E0',
                borderRadius: '12px',
                fontSize: '0.9375rem',
              }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'all')}
            style={{
              padding: '0.875rem 1rem',
              border: '2px solid #E0E0E0',
              borderRadius: '12px',
              fontSize: '0.9375rem',
              cursor: 'pointer',
              minWidth: '150px',
            }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Toggle Filters */}
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.875rem 1.25rem',
              background: showFilters ? 'linear-gradient(135deg, #C8D46B, #E0C097)' : '#fff',
              color: showFilters ? '#343A40' : '#6c757d',
              border: '2px solid #E0E0E0',
              borderRadius: '12px',
              fontSize: '0.9375rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Filter size={18} />
            Filters
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </motion.button>

          {/* Export */}
          <motion.button
            onClick={exportToCSV}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.875rem 1.25rem',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '0.9375rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Download size={18} />
            Export CSV
          </motion.button>
        </div>

        {/* Date Range Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                marginTop: '1rem',
                padding: '1.5rem',
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                border: '2px solid #E0E0E0',
              }}
            >
              <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600, color: '#343A40' }}>
                Date Range Filter
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#6c757d' }}>
                    From Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #E0E0E0',
                      borderRadius: '8px',
                      fontSize: '0.9375rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#6c757d' }}>
                    To Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #E0E0E0',
                      borderRadius: '8px',
                      fontSize: '0.9375rem',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    onClick={() => setDateRange({ from: '', to: '' })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#6c757d',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Clear Dates
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Count */}
      <div style={{ marginBottom: '1rem', color: '#6c757d', fontSize: '0.9375rem' }}>
        Showing <strong>{filteredBookings.length}</strong> of <strong>{bookings.length}</strong> bookings
      </div>

      {/* Bookings Table */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
          Loading bookings...
        </div>
      ) : filteredBookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
          <AlertTriangle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>No bookings found</p>
          <p style={{ marginTop: '0.5rem' }}>Try adjusting your filters</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E0E0E0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(200, 212, 107, 0.1)', borderBottom: '2px solid #E0E0E0' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 700, color: '#343A40' }}>Date</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 700, color: '#343A40' }}>Customer</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 700, color: '#343A40' }}>Contact</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 700, color: '#343A40' }}>Guests</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 700, color: '#343A40' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 700, color: '#343A40' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking, index) => (
                  <BookingRow
                    key={booking.id}
                    booking={booking}
                    index={index}
                    onStatusUpdate={handleStatusUpdate}
                    onDelete={handleDelete}
                    onViewDetails={(b) => setSelectedBooking(b)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <BookingDetailsModal
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
            onStatusUpdate={handleStatusUpdate}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatsCard({ title, value, color, icon }: { title: string; value: number; color: string; icon: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      style={{
        padding: '1.5rem',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px',
        border: '1px solid #E0E0E0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.875rem', color: '#6c757d', fontWeight: 500 }}>{title}</span>
        <div style={{ color, opacity: 0.8 }}>{icon}</div>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#343A40' }}>
        {value}
      </div>
    </motion.div>
  );
}

function BookingRow({ booking, index, onStatusUpdate, onDelete, onViewDetails }: {
  booking: Booking;
  index: number;
  onStatusUpdate: (id: string, status: BookingStatus) => void;
  onDelete: (id: string) => void;
  onViewDetails: (booking: Booking) => void;
}) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{
        borderBottom: '1px solid #E0E0E0',
        transition: 'background-color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(200, 212, 107, 0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#343A40', fontWeight: 600 }}>
        {format(new Date(booking.booking_date), 'MMM dd, yyyy')}
      </td>
      <td style={{ padding: '1rem' }}>
        <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#343A40' }}>{booking.full_name}</div>
        <div style={{ fontSize: '0.8125rem', color: '#6c757d', marginTop: '0.25rem' }}>
          {booking.time_slot || booking.preferred_slot || 'No slot'}
        </div>
      </td>
      <td style={{ padding: '1rem' }}>
        <div style={{ fontSize: '0.875rem', color: '#343A40', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Phone size={14} style={{ opacity: 0.6 }} />
          {booking.mobile || 'N/A'}
        </div>
        {booking.email && (
          <div style={{ fontSize: '0.8125rem', color: '#6c757d', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Mail size={14} style={{ opacity: 0.6 }} />
            {booking.email}
          </div>
        )}
      </td>
      <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', color: '#343A40' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
          <Users size={16} style={{ opacity: 0.6 }} />
          {booking.guest_count || 'N/A'}
        </div>
      </td>
      <td style={{ padding: '1rem', textAlign: 'center' }}>
        <StatusBadge status={booking.status} />
      </td>
      <td style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <ActionButton
            onClick={() => onViewDetails(booking)}
            icon={<Eye size={16} />}
            color="#3B82F6"
            tooltip="View Details"
          />
          {booking.status === 'pending' && (
            <ActionButton
              onClick={() => onStatusUpdate(booking.id, 'confirmed')}
              icon={<CheckCircle size={16} />}
              color="#10B981"
              tooltip="Confirm"
            />
          )}
          {booking.status !== 'cancelled' && (
            <ActionButton
              onClick={() => onStatusUpdate(booking.id, 'cancelled')}
              icon={<Ban size={16} />}
              color="#F59E0B"
              tooltip="Cancel"
            />
          )}
          <ActionButton
            onClick={() => onDelete(booking.id)}
            icon={<Trash2 size={16} />}
            color="#EF4444"
            tooltip="Delete"
          />
        </div>
      </td>
    </motion.tr>
  );
}

function ActionButton({ onClick, icon, color, tooltip }: {
  onClick: () => void;
  icon: React.ReactNode;
  color: string;
  tooltip: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={tooltip}
      style={{
        padding: '0.5rem',
        background: `${color}15`,
        color: color,
        border: `1px solid ${color}40`,
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon}
    </motion.button>
  );
}

function BookingDetailsModal({ booking, onClose, onStatusUpdate, onDelete }: {
  booking: Booking;
  onClose: () => void;
  onStatusUpdate: (id: string, status: BookingStatus) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#343A40', marginBottom: '1.5rem' }}>
          Booking Details
        </h2>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <DetailRow label="Customer Name" value={booking.full_name} />
          <DetailRow label="Mobile" value={booking.mobile || 'N/A'} />
          <DetailRow label="Email" value={booking.email || 'N/A'} />
          <DetailRow label="Booking Date" value={format(new Date(booking.booking_date), 'MMMM dd, yyyy')} />
          <DetailRow label="Time Slot" value={booking.time_slot || booking.preferred_slot || 'N/A'} />
          <DetailRow label="Guest Count" value={booking.guest_count?.toString() || 'N/A'} />
          <DetailRow label="Status" value={<StatusBadge status={booking.status} />} />
          {booking.special_requests && (
            <DetailRow label="Special Requests" value={booking.special_requests} />
          )}
          <DetailRow 
            label="Created" 
            value={booking.created_at ? format(new Date(booking.created_at), 'MMM dd, yyyy HH:mm') : 'N/A'} 
          />
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {booking.status === 'pending' && (
            <button
              onClick={() => {
                onStatusUpdate(booking.id, 'confirmed');
                onClose();
              }}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Confirm Booking
            </button>
          )}
          {booking.status !== 'cancelled' && (
            <button
              onClick={() => {
                onStatusUpdate(booking.id, 'cancelled');
                onClose();
              }}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel Booking
            </button>
          )}
          <button
            onClick={() => {
              onDelete(booking.id);
              onClose();
            }}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'linear-gradient(135deg, #EF4444, #DC2626)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Delete Booking
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: '#E5E7EB',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#F9FAFB', borderRadius: '8px' }}>
      <span style={{ fontSize: '0.875rem', color: '#6c757d', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: '0.9375rem', color: '#343A40', fontWeight: 600 }}>{value}</span>
    </div>
  );
}