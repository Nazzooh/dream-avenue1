import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Unlock, Plus, Eye, Loader2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner@2.0.3';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../src/auth/useAuth';
import { useBlockDate, useUnblockDate, useCalendarEvents } from '../../src/hooks/useCalendar';
import type { CalendarEvent } from '../../src/api/calendar';
import { AdminManualBookingModal } from './AdminManualBookingModal';
import { getEventTimes } from '../../src/utils/timeFallbacks';

interface AdminDateActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
}

/**
 * TASK 2: Admin modal uses get_calendar_events for single date
 */
export function AdminDateActionModal({ isOpen, onClose, date }: AdminDateActionModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showManualBooking, setShowManualBooking] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');

  const dateStr = format(date, 'yyyy-MM-dd');
  // Fetch events for single date (using date range RPC with same start/end)
  const { data: events = [] } = useCalendarEvents(dateStr, dateStr);
  const blockDateMutation = useBlockDate();
  const unblockDateMutation = useUnblockDate();

  const hasEvents = events.length > 0;
  const isBlocked = events.some((event) => event.event_type === 'blocked');

  const handleEventClick = (bookingId: string | null) => {
    if (bookingId) {
      navigate(`/admin/bookings`);
      onClose();
    }
  };

  const handleBlock = async () => {
    if (!user?.id) {
      toast.error('Not authenticated');
      return;
    }

    try {
      await blockDateMutation.mutateAsync({
        date: dateStr,
        reason: blockReason,
        admin_id: user.id,
      });
      toast.success(`Date ${format(date, 'MMM d, yyyy')} blocked successfully`);
      setShowBlockModal(false);
      setBlockReason('');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to block date');
    }
  };

  const handleUnblock = async () => {
    if (!user?.id) {
      toast.error('Not authenticated');
      return;
    }

    try {
      await unblockDateMutation.mutateAsync({
        date: dateStr,
        admin_id: user.id,
      });
      toast.success(`Date ${format(date, 'MMM d, yyyy')} unblocked successfully`);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to unblock date');
    }
  };

  if (!isOpen) return null;

  if (showManualBooking) {
    return (
      <AdminManualBookingModal
        isOpen={showManualBooking}
        onClose={() => {
          setShowManualBooking(false);
          onClose();
        }}
        preselectedDate={dateStr}
      />
    );
  }

  if (showBlockModal) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60,
            padding: '16px',
          }}
          onClick={() => {
            setShowBlockModal(false);
            setBlockReason('');
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
              background: 'linear-gradient(135deg, #FAFAF7, #FFFFFF)',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '450px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.25rem', fontWeight: '600', color: '#2A2A2A' }}>
                Block Date
              </h3>
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setBlockReason('');
                }}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: '1px solid #E6E6E6',
                  background: '#FFFFFF',
                  cursor: 'pointer',
                }}
              >
                <X size={20} color="#666666" />
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '0.875rem', color: '#666666', marginBottom: '16px' }}>
                Block <strong>{format(date, 'MMMM d, yyyy')}</strong> from bookings?
              </p>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '600', color: '#2A2A2A' }}>
                Reason (Optional)
              </label>
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="e.g., Maintenance, Private event"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #E6E6E6',
                  fontSize: '0.875rem',
                  fontFamily: 'Poppins, sans-serif',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setBlockReason('');
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #E6E6E6',
                  background: '#FFFFFF',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleBlock}
                disabled={blockDateMutation.isPending}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #FF6B6B, #FF8B8B)',
                  color: 'white',
                  cursor: blockDateMutation.isPending ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontFamily: 'Poppins, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {blockDateMutation.isPending ? <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block' }}><Lock size={16} /></motion.div> : <Lock size={16} />}
                Block Date
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (showEventsModal) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60,
            padding: '16px',
          }}
          onClick={() => {
            setShowEventsModal(false);
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
              background: 'linear-gradient(135deg, #FAFAF7, #FFFFFF)',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.25rem', fontWeight: '600', color: '#2A2A2A' }}>
                Events on {format(date, 'MMMM d, yyyy')}
              </h3>
              <button
                onClick={() => {
                  setShowEventsModal(false);
                }}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: '1px solid #E6E6E6',
                  background: '#FFFFFF',
                  cursor: 'pointer',
                }}
              >
                <X size={20} color="#666666" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {events.map((event) => {
                // Display event times (already formatted from RPC)
                const displayTime = event.start_time && event.end_time 
                  ? `${event.start_time} - ${event.end_time}`
                  : 'Time TBD';
                
                return (
                <motion.button
                  key={event.booking_id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleEventClick(event.booking_id)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #3B82F6',
                    background: 'rgba(59, 130, 246, 0.1)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: '#3B82F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Eye size={20} color="#FFFFFF" />
                  </div>
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.9375rem', color: '#2A2A2A', fontFamily: 'Poppins, sans-serif' }}>
                      {event.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#666666', fontFamily: 'Poppins, sans-serif' }}>
                      {displayTime}
                    </div>
                  </div>
                </motion.button>
                );
              })}
            </div>

            <button
              onClick={() => {
                setShowEventsModal(false);
              }}
              style={{
                marginTop: '24px',
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #E6E6E6',
                background: '#FFFFFF',
                cursor: 'pointer',
                fontWeight: '600',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 60,
          padding: '16px',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          style={{
            background: 'linear-gradient(135deg, #FAFAF7, #FFFFFF)',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.25rem', fontWeight: '600', color: '#2A2A2A' }}>
              {format(date, 'MMMM d, yyyy')}
            </h3>
            <button
              onClick={onClose}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                border: '1px solid #E6E6E6',
                background: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <X size={20} color="#666666" />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Add Manual Booking */}
            {!isBlocked && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowManualBooking(true)}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #B6F500',
                  background: 'rgba(182, 245, 0, 0.1)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: '#B6F500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Plus size={20} color="#2A2A2A" />
                </div>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '0.9375rem', color: '#2A2A2A', fontFamily: 'Poppins, sans-serif' }}>
                    Add Manual Booking
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#666666', fontFamily: 'Poppins, sans-serif' }}>
                    Create a booking for this date
                  </div>
                </div>
              </motion.button>
            )}

            {/* Block/Unblock Date */}
            {isBlocked ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUnblock}
                disabled={unblockDateMutation.isPending}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #B6F500',
                  background: 'rgba(182, 245, 0, 0.1)',
                  cursor: unblockDateMutation.isPending ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: '#B6F500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {unblockDateMutation.isPending ? <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block' }}><Unlock size={20} color="#2A2A2A" /></motion.div> : <Unlock size={20} color="#2A2A2A" />}
                </div>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '0.9375rem', color: '#2A2A2A', fontFamily: 'Poppins, sans-serif' }}>
                    Unblock Date
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#666666', fontFamily: 'Poppins, sans-serif' }}>
                    Make this date available for bookings
                  </div>
                </div>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowBlockModal(true)}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #FF6B6B',
                  background: 'rgba(255, 107, 107, 0.1)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: '#FF6B6B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Lock size={20} color="#FFFFFF" />
                </div>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '0.9375rem', color: '#2A2A2A', fontFamily: 'Poppins, sans-serif' }}>
                    Block Date
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#666666', fontFamily: 'Poppins, sans-serif' }}>
                    Prevent bookings on this date
                  </div>
                </div>
              </motion.button>
            )}

            {/* View Events */}
            {hasEvents && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowEventsModal(true)}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #3B82F6',
                  background: 'rgba(59, 130, 246, 0.1)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: '#3B82F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Eye size={20} color="#FFFFFF" />
                </div>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '0.9375rem', color: '#2A2A2A', fontFamily: 'Poppins, sans-serif' }}>
                    View Events ({events.length})
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#666666', fontFamily: 'Poppins, sans-serif' }}>
                    {events.map((e) => e.event_name).join(', ')}
                  </div>
                </div>
              </motion.button>
            )}
          </div>

          <button
            onClick={onClose}
            style={{
              marginTop: '24px',
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid #E6E6E6',
              background: '#FFFFFF',
              cursor: 'pointer',
              fontWeight: '600',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}