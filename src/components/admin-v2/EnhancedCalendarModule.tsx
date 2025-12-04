// Enhanced Admin Calendar Module - with manual date blocking and real-time sync
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Clock, Users, ChevronLeft, ChevronRight, X, CheckCircle,
  Lock, Unlock, Sparkles, AlertCircle
} from 'lucide-react';
import { useBookings } from '../../src/hooks/useBookings';
import { useEvents, useCreateEvent, useDeleteEvent } from '../../src/hooks/useEvents';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameMonth, isSameDay, addMonths, subMonths, 
  startOfWeek, endOfWeek 
} from 'date-fns';
import { toast } from 'sonner@2.0.3';
import { DateActionModal } from '../admin/DateActionModal';
import { AdminAddBookingModal } from '../admin/AdminAddBookingModal';

interface BookingDetail {
  id: string;
  full_name: string;
  booking_date: string;
  status: string;
  guest_count: number;
  phone: string;
}

interface CalendarModuleProps {
  onDateSelect?: (date: Date) => void;
}

export function EnhancedCalendarModule({ onDateSelect }: CalendarModuleProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showDateActionModal, setShowDateActionModal] = useState(false);
  const [showAddBookingModal, setShowAddBookingModal] = useState(false);
  const [dateToBlock, setDateToBlock] = useState<Date | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [view, setView] = useState<'bookings' | 'availability' | 'staff'>('bookings');

  const { data: bookings = [] } = useBookings();
  const { data: events = [] } = useEvents();
  const createEventMutation = useCreateEvent();
  const deleteEventMutation = useDeleteEvent();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => 
      isSameDay(new Date(booking.booking_date), date)
    );
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter(event => event.event_date === dateStr);
  };

  const isDateManuallyBlocked = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.some(event => 
      event.event_date === dateStr && 
      event.event_type === 'blocked' && 
      event.status === 'blocked'
    );
  };

  const getDayStatus = (date: Date) => {
    const dayBookings = getBookingsForDate(date);
    const isBlocked = isDateManuallyBlocked(date);
    
    if (isBlocked) return 'blocked';
    if (dayBookings.length === 0) return 'available';
    
    const hasConfirmed = dayBookings.some(b => b.status === 'confirmed');
    const hasPending = dayBookings.some(b => b.status === 'pending');
    const hasCancelled = dayBookings.every(b => b.status === 'cancelled');
    
    if (hasConfirmed) return 'booked';
    if (hasPending) return 'partial';
    if (hasCancelled) return 'cancelled';
    
    return 'available';
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    const dayBookings = getBookingsForDate(date);
    
    if (dayBookings.length > 0) {
      setSelectedBooking(dayBookings[0] as BookingDetail);
      setShowBookingModal(true);
    } else {
      // Show date action modal (Add Booking or Block Date)
      setShowDateActionModal(true);
    }
    
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  const handleBlockDate = async () => {
    if (!dateToBlock) return;

    const dateStr = format(dateToBlock, 'yyyy-MM-dd');
    
    try {
      await createEventMutation.mutateAsync({
        event_name: `Blocked: ${blockReason || 'Manual Block'}`,
        event_type: 'blocked',
        event_date: dateStr,
        status: 'blocked',
        description: blockReason || 'Date manually blocked by admin',
      });

      setShowBlockModal(false);
      setDateToBlock(null);
      setBlockReason('');

      toast.success(
        <div>
          <strong>Date Blocked</strong>
          <p style={{ fontSize: '0.875rem', marginTop: '4px', opacity: 0.9 }}>
            {format(dateToBlock, 'MMM d, yyyy')} is now unavailable
          </p>
        </div>,
        { duration: 4000 }
      );
    } catch (error) {
      console.error('Block date error:', error);
    }
  };

  const handleUnblockDate = async (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const blockedEvent = events.find(e => 
      e.event_date === dateStr && 
      e.event_type === 'blocked' &&
      e.status === 'blocked'
    );

    if (!blockedEvent) return;

    try {
      await deleteEventMutation.mutateAsync(blockedEvent.id);

      toast.success(
        <div>
          <strong>Date Unblocked</strong>
          <p style={{ fontSize: '0.875rem', marginTop: '4px', opacity: 0.9 }}>
            {format(date, 'MMM d, yyyy')} is now available
          </p>
        </div>,
        { duration: 4000 }
      );
    } catch (error) {
      console.error('Unblock date error:', error);
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#2A2A2A',
                marginBottom: '0.25rem'
              }}
            >
              Calendar & Availability
            </h2>
            <p style={{ color: '#666666', fontSize: '0.875rem' }}>
              Manage bookings, block dates, and track availability
            </p>
          </div>
        </div>

        {/* Segmented Toggle */}
        <div 
          style={{
            display: 'inline-flex',
            background: '#FFFFFF',
            border: '1px solid #E6E6E6',
            borderRadius: '12px',
            padding: '4px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
          }}
        >
          {['bookings', 'availability'].map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab as typeof view)}
              style={{
                padding: '8px 20px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                fontFamily: 'Poppins, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                background: view === tab 
                  ? 'linear-gradient(135deg, #B6F500, #A4DD00)' 
                  : 'transparent',
                color: view === tab ? '#2A2A2A' : '#666666',
                boxShadow: view === tab 
                  ? '0 2px 8px rgba(182, 245, 0, 0.25)' 
                  : 'none'
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Main Calendar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-2"
          style={{
            background: 'linear-gradient(135deg, #FAFAF7, #FFFFFF)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(224, 192, 151, 0.15)'
          }}
        >
          {/* Calendar Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ 
              fontFamily: 'Poppins, sans-serif',
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#2A2A2A'
            }}>
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={prevMonth}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  border: '1.5px solid #E0C097',
                  background: 'rgba(224, 192, 151, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              >
                <ChevronLeft size={20} color="#C29A5D" />
              </button>
              
              <button
                onClick={nextMonth}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  border: '1.5px solid #E0C097',
                  background: 'rgba(224, 192, 151, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              >
                <ChevronRight size={20} color="#C29A5D" />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '12px' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div
                key={day}
                style={{
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#B6F500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '8px 0',
                  fontFamily: 'Poppins, sans-serif'
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
            {calendarDays.map((day, index) => {
              const status = getDayStatus(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());
              const bookingsCount = getBookingsForDate(day).length;
              const isBlocked = status === 'blocked';

              let cellStyles: React.CSSProperties = {
                aspectRatio: '1',
                borderRadius: '14px',
                border: '2px solid',
                background: '#FFFFFF',
                color: isCurrentMonth ? '#2A2A2A' : '#CCCCCC',
                fontWeight: isToday ? '700' : '500',
                fontSize: '0.9375rem',
                fontFamily: 'Poppins, sans-serif',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.3s ease',
                position: 'relative',
              };

              if (isBlocked) {
                cellStyles.background = 'linear-gradient(135deg, rgba(136, 136, 136, 0.15), rgba(102, 102, 102, 0.1))';
                cellStyles.borderColor = '#888888';
                cellStyles.color = '#666666';
              } else if (status === 'booked') {
                cellStyles.background = 'linear-gradient(135deg, rgba(255, 182, 182, 0.2), rgba(255, 153, 153, 0.15))';
                cellStyles.borderColor = '#FF8B8B';
              } else if (status === 'partial') {
                cellStyles.background = 'linear-gradient(135deg, rgba(255, 229, 157, 0.2), rgba(255, 215, 125, 0.15))';
                cellStyles.borderColor = '#F5C842';
              } else if (status === 'available') {
                cellStyles.background = 'linear-gradient(135deg, rgba(198, 246, 141, 0.15), rgba(182, 245, 0, 0.08))';
                cellStyles.borderColor = '#B6F500';
              } else {
                cellStyles.borderColor = '#E6E6E6';
              }

              if (isToday) {
                cellStyles.boxShadow = '0 0 16px rgba(224, 192, 151, 0.4)';
                cellStyles.borderColor = '#E0C097';
                cellStyles.borderWidth = '3px';
              }

              return (
                <motion.button
                  key={index}
                  onClick={() => handleDayClick(day)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.008 }}
                  whileHover={isCurrentMonth ? { scale: 1.08 } : {}}
                  whileTap={isCurrentMonth ? { scale: 0.95 } : {}}
                  style={cellStyles}
                >
                  {isBlocked && (
                    <Lock size={14} color="#888888" style={{ position: 'absolute', top: '6px', right: '6px' }} />
                  )}
                  <span>{format(day, 'd')}</span>
                  {bookingsCount > 0 && (
                    <span style={{
                      fontSize: '0.625rem',
                      fontWeight: '600',
                      color: status === 'booked' ? '#721c24' : '#2A4516',
                      background: status === 'booked' ? 'rgba(255, 107, 107, 0.2)' : 'rgba(182, 245, 0, 0.2)',
                      padding: '2px 6px',
                      borderRadius: '6px'
                    }}>
                      {bookingsCount}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { label: 'Available', color: 'rgba(182, 245, 0, 0.2)', border: '#B6F500' },
              { label: 'Booked', color: 'rgba(255, 182, 182, 0.2)', border: '#FF8B8B' },
              { label: 'Pending', color: 'rgba(255, 229, 157, 0.2)', border: '#F5C842' },
              { label: 'Blocked', color: 'rgba(136, 136, 136, 0.15)', border: '#888888' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '6px',
                  border: `2px solid ${item.border}`,
                  background: item.color
                }} />
                <span style={{ fontSize: '0.8125rem', color: '#666666', fontFamily: 'Poppins, sans-serif' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{
            background: 'linear-gradient(135deg, #FAFAF7, #FFFFFF)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(224, 192, 151, 0.15)'
          }}
        >
          <h4 style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#2A2A2A',
            marginBottom: '16px'
          }}>
            Upcoming Bookings
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {bookings
              .filter(b => new Date(b.booking_date) >= new Date() && b.status !== 'cancelled')
              .slice(0, 5)
              .map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: '#FAFAF7',
                    border: '1px solid #E6E6E6',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    background: 'rgba(182, 245, 0, 0.06)',
                    borderColor: 'rgba(182, 245, 0, 0.3)'
                  }}
                  onClick={() => {
                    setSelectedBooking(booking as BookingDetail);
                    setShowBookingModal(true);
                  }}
                >
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: booking.status === 'confirmed' ? '#C6F68D' : '#FFE59D',
                    boxShadow: booking.status === 'confirmed' 
                      ? '0 0 10px rgba(198, 246, 141, 0.5)' 
                      : '0 0 10px rgba(255, 229, 157, 0.5)'
                  }} />
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#2A2A2A',
                      marginBottom: '2px',
                      fontFamily: 'Poppins, sans-serif'
                    }}>
                      {booking.full_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#666666', fontFamily: 'Poppins, sans-serif' }}>
                      {format(new Date(booking.booking_date), 'MMM d, yyyy')}
                    </div>
                  </div>
                </motion.div>
              ))}

            {bookings.filter(b => new Date(b.booking_date) >= new Date()).length === 0 && (
              <div style={{
                padding: '32px',
                textAlign: 'center',
                color: '#999999',
                fontSize: '0.875rem',
                fontFamily: 'Poppins, sans-serif'
              }}>
                <Calendar size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                No upcoming bookings
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Booking Detail Modal */}
      <AnimatePresence>
        {showBookingModal && selectedBooking && (
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
              zIndex: 50,
              padding: '16px'
            }}
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              style={{
                background: 'linear-gradient(135deg, #FAFAF7, #FFFFFF)',
                borderRadius: '20px',
                padding: '32px',
                maxWidth: '500px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(224, 192, 151, 0.2)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h3 style={{ 
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#2A2A2A'
                }}>
                  Booking Details
                </h3>
                <button 
                  onClick={() => setShowBookingModal(false)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    border: '1px solid #E6E6E6',
                    background: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <X size={20} color="#666666" />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(182, 245, 0, 0.1), rgba(164, 221, 0, 0.05))',
                  borderRadius: '16px',
                  border: '1px solid rgba(182, 245, 0, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <Users size={24} style={{ color: '#B6F500' }} />
                    <div>
                      <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#2A2A2A', fontFamily: 'Poppins, sans-serif' }}>
                        {selectedBooking.full_name}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#666666', fontFamily: 'Poppins, sans-serif' }}>
                        {selectedBooking.mobile}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{
                    padding: '16px',
                    background: '#FAFAF7',
                    borderRadius: '12px',
                    border: '1px solid #E6E6E6'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#666666', marginBottom: '6px', fontFamily: 'Poppins, sans-serif' }}>
                      Date
                    </div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#2A2A2A', fontFamily: 'Poppins, sans-serif' }}>
                      {format(new Date(selectedBooking.booking_date), 'MMM d, yyyy')}
                    </div>
                  </div>

                  <div style={{
                    padding: '16px',
                    background: '#FAFAF7',
                    borderRadius: '12px',
                    border: '1px solid #E6E6E6'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#666666', marginBottom: '6px', fontFamily: 'Poppins, sans-serif' }}>
                      Guests
                    </div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#2A2A2A', fontFamily: 'Poppins, sans-serif' }}>
                      {selectedBooking.guest_count || 'N/A'}
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '16px',
                  background: '#FAFAF7',
                  borderRadius: '12px',
                  border: '1px solid #E6E6E6'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#666666', marginBottom: '6px', fontFamily: 'Poppins, sans-serif' }}>
                    Status
                  </div>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8125rem',
                    fontWeight: '600',
                    fontFamily: 'Poppins, sans-serif',
                    background: selectedBooking.status === 'confirmed' ? '#C6F68D' :
                               selectedBooking.status === 'pending' ? '#FFE59D' : '#FFB6B6',
                    color: selectedBooking.status === 'confirmed' ? '#2A4516' :
                           selectedBooking.status === 'pending' ? '#856404' : '#721c24'
                  }}>
                    {selectedBooking.status}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowBookingModal(false)}
                style={{
                  marginTop: '24px',
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #E6E6E6',
                  background: '#FFFFFF',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  fontFamily: 'Poppins, sans-serif',
                  color: '#666666',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Block Date Modal */}
      <AnimatePresence>
        {showBlockModal && dateToBlock && (
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
              zIndex: 50,
              padding: '16px'
            }}
            onClick={() => {
              setShowBlockModal(false);
              setDateToBlock(null);
              setBlockReason('');
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              style={{
                background: 'linear-gradient(135deg, #FAFAF7, #FFFFFF)',
                borderRadius: '20px',
                padding: '32px',
                maxWidth: '480px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(224, 192, 151, 0.2)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {isDateManuallyBlocked(dateToBlock) ? (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      background: 'rgba(136, 136, 136, 0.15)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px'
                    }}>
                      <Lock size={32} color="#888888" />
                    </div>
                    <h3 style={{ 
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#2A2A2A',
                      marginBottom: '8px'
                    }}>
                      Date is Blocked
                    </h3>
                    <p style={{
                      fontSize: '0.9375rem',
                      color: '#666666',
                      fontFamily: 'Poppins, sans-serif'
                    }}>
                      {format(dateToBlock, 'MMMM d, yyyy')} is currently unavailable
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => {
                        setShowBlockModal(false);
                        setDateToBlock(null);
                      }}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid #E6E6E6',
                        background: '#FFFFFF',
                        fontSize: '0.9375rem',
                        fontWeight: '600',
                        fontFamily: 'Poppins, sans-serif',
                        color: '#666666',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleUnblockDate(dateToBlock);
                        setShowBlockModal(false);
                        setDateToBlock(null);
                      }}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #B6F500, #A4DD00)',
                        fontSize: '0.9375rem',
                        fontWeight: '600',
                        fontFamily: 'Poppins, sans-serif',
                        color: '#2A2A2A',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <Unlock size={18} />
                      Unblock Date
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      background: 'rgba(182, 245, 0, 0.15)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px'
                    }}>
                      <Lock size={32} color="#B6F500" />
                    </div>
                    <h3 style={{ 
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#2A2A2A',
                      marginBottom: '8px'
                    }}>
                      Block Date
                    </h3>
                    <p style={{
                      fontSize: '0.9375rem',
                      color: '#666666',
                      fontFamily: 'Poppins, sans-serif'
                    }}>
                      Manually block {format(dateToBlock, 'MMMM d, yyyy')}
                    </p>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#2A2A2A',
                      marginBottom: '8px',
                      fontFamily: 'Poppins, sans-serif'
                    }}>
                      Reason (Optional)
                    </label>
                    <textarea
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      placeholder="e.g., Maintenance, Private event, Holiday..."
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid #E6E6E6',
                        background: '#FFFFFF',
                        fontSize: '0.9375rem',
                        fontFamily: 'Poppins, sans-serif',
                        resize: 'vertical',
                        minHeight: '80px'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => {
                        setShowBlockModal(false);
                        setDateToBlock(null);
                        setBlockReason('');
                      }}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid #E6E6E6',
                        background: '#FFFFFF',
                        fontSize: '0.9375rem',
                        fontWeight: '600',
                        fontFamily: 'Poppins, sans-serif',
                        color: '#666666',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBlockDate}
                      disabled={createEventMutation.isPending}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #888888, #666666)',
                        fontSize: '0.9375rem',
                        fontWeight: '600',
                        fontFamily: 'Poppins, sans-serif',
                        color: '#FFFFFF',
                        cursor: createEventMutation.isPending ? 'not-allowed' : 'pointer',
                        opacity: createEventMutation.isPending ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      {createEventMutation.isPending ? (
                        <>
                          <div style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid #FFFFFF',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }} />
                          Blocking...
                        </>
                      ) : (
                        <>
                          <Lock size={18} />
                          Block Date
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Date Action Modal (Add Booking or Block Date) */}
      {selectedDate && (
        <DateActionModal
          isOpen={showDateActionModal}
          onClose={() => setShowDateActionModal(false)}
          selectedDate={selectedDate}
          onAddBooking={() => {
            setShowAddBookingModal(true);
          }}
          onBlockDate={() => {
            setDateToBlock(selectedDate);
            setShowBlockModal(true);
          }}
        />
      )}

      {/* Admin Add Booking Modal */}
      {selectedDate && (
        <AdminAddBookingModal
          isOpen={showAddBookingModal}
          onClose={() => setShowAddBookingModal(false)}
          selectedDate={format(selectedDate, 'yyyy-MM-dd')}
          onSuccess={() => {
            // Refresh calendar data is handled by React Query
            setShowAddBookingModal(false);
          }}
        />
      )}
    </div>
  );
}
