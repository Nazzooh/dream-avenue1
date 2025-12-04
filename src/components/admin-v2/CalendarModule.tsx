import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, Users, ChevronLeft, ChevronRight, X, CheckCircle } from 'lucide-react';
import { useBookings } from '../../src/hooks/useBookings';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

interface BookingDetail {
  id: string;
  full_name: string;
  booking_date: string;
  status: string;
  guest_count: number;
  event_type: string;
}

interface CalendarModuleProps {
  onDateSelect?: (date: Date) => void;
}

export function CalendarModule({ onDateSelect }: CalendarModuleProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState<'bookings' | 'availability' | 'staff'>('bookings');

  const { data: bookings = [] } = useBookings();

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

  const getDayStatus = (date: Date) => {
    const dayBookings = getBookingsForDate(date);
    
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
      setShowModal(true);
    }
    
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div>
      {/* Header with View Toggle */}
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
              Manage bookings and track availability
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
          {['bookings', 'availability', 'staff'].map((tab) => (
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

      {/* Main Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-2 admin-card"
        >
          {/* Calendar Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{ 
              fontFamily: 'Poppins, sans-serif',
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#2A2A2A'
            }}>
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={prevMonth}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: '1px solid #E6E6E6',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#B6F500';
                  e.currentTarget.style.background = 'rgba(182, 245, 0, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E6E6E6';
                  e.currentTarget.style.background = '#FFFFFF';
                }}
              >
                <ChevronLeft size={18} />
              </button>
              
              <button
                onClick={nextMonth}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: '1px solid #E6E6E6',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#B6F500';
                  e.currentTarget.style.background = 'rgba(182, 245, 0, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E6E6E6';
                  e.currentTarget.style.background = '#FFFFFF';
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '8px' }}>
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
                  padding: '8px 0'
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {calendarDays.map((day, index) => {
              const status = getDayStatus(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());
              const bookingsCount = getBookingsForDate(day).length;

              return (
                <motion.button
                  key={index}
                  onClick={() => handleDayClick(day)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.01 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '12px',
                    border: status === 'available' ? '1.5px solid #B6F500' : 
                           status === 'partial' ? '1.5px dashed #B6F500' :
                           status === 'booked' ? '1.5px solid #FFB6B6' : '1px solid #E6E6E6',
                    background: status === 'booked' ? 'rgba(255, 182, 182, 0.3)' :
                               status === 'partial' ? 'rgba(255, 229, 157, 0.3)' :
                               isToday ? 'linear-gradient(135deg, rgba(182, 245, 0, 0.2), rgba(164, 221, 0, 0.15))' :
                               '#FFFFFF',
                    color: !isCurrentMonth ? '#CCCCCC' : '#2A2A2A',
                    fontWeight: isToday ? '700' : '500',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2px',
                    transition: 'all 0.25s ease',
                    position: 'relative',
                    boxShadow: isToday ? '0 0 12px rgba(182, 245, 0, 0.25)' : 'none'
                  }}
                >
                  <span>{format(day, 'd')}</span>
                  {bookingsCount > 0 && (
                    <span style={{
                      fontSize: '0.625rem',
                      fontWeight: '600',
                      color: status === 'booked' ? '#721c24' : '#B6F500',
                      background: status === 'booked' ? 'rgba(255, 107, 107, 0.2)' : 'rgba(182, 245, 0, 0.15)',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {bookingsCount}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Available', color: '#B6F500', border: 'solid' },
              { label: 'Booked', color: '#FFB6B6', border: 'solid' },
              { label: 'Partial', color: '#FFE59D', border: 'dashed' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  border: `1.5px ${item.border} ${item.color}`,
                  background: `${item.color}40`
                }} />
                <span style={{ fontSize: '0.75rem', color: '#666666' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="admin-card"
        >
          <h4 style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#2A2A2A',
            marginBottom: '1rem'
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
                    borderRadius: '8px',
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
                    setShowModal(true);
                  }}
                >
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: booking.status === 'confirmed' ? '#C6F68D' : '#FFE59D',
                    boxShadow: booking.status === 'confirmed' 
                      ? '0 0 8px rgba(198, 246, 141, 0.5)' 
                      : '0 0 8px rgba(255, 229, 157, 0.5)'
                  }} />
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#2A2A2A',
                      marginBottom: '2px'
                    }}>
                      {booking.full_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#666666' }}>
                      {format(new Date(booking.booking_date), 'MMM d, yyyy')}
                    </div>
                  </div>
                </motion.div>
              ))}

            {bookings.filter(b => new Date(b.booking_date) >= new Date()).length === 0 && (
              <div style={{
                padding: '24px',
                textAlign: 'center',
                color: '#999999',
                fontSize: '0.875rem'
              }}>
                <Calendar size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                No upcoming bookings
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Booking Detail Modal */}
      <AnimatePresence>
        {showModal && selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="admin-modal-overlay"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="admin-modal"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '500px' }}
            >
              <div className="admin-modal-header">
                <h3 className="admin-modal-title">Booking Details</h3>
                <button 
                  className="admin-modal-close"
                  onClick={() => setShowModal(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="admin-modal-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    padding: '16px',
                    background: 'linear-gradient(135deg, rgba(182, 245, 0, 0.1), rgba(164, 221, 0, 0.05))',
                    borderRadius: '12px',
                    border: '1px solid rgba(182, 245, 0, 0.3)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <Users size={24} style={{ color: '#B6F500' }} />
                      <div>
                        <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#2A2A2A' }}>
                          {selectedBooking.full_name}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#666666' }}>
                          {selectedBooking.event_type || 'Event'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{
                      padding: '12px',
                      background: '#FAFAF7',
                      borderRadius: '8px',
                      border: '1px solid #E6E6E6'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: '#666666', marginBottom: '4px' }}>
                        Date
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#2A2A2A' }}>
                        {format(new Date(selectedBooking.booking_date), 'MMM d, yyyy')}
                      </div>
                    </div>

                    <div style={{
                      padding: '12px',
                      background: '#FAFAF7',
                      borderRadius: '8px',
                      border: '1px solid #E6E6E6'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: '#666666', marginBottom: '4px' }}>
                        Guests
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#2A2A2A' }}>
                        {selectedBooking.guest_count || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    padding: '12px',
                    background: '#FAFAF7',
                    borderRadius: '8px',
                    border: '1px solid #E6E6E6'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#666666', marginBottom: '4px' }}>
                      Status
                    </div>
                    <span className={`admin-badge admin-badge-${
                      selectedBooking.status === 'confirmed' ? 'success' :
                      selectedBooking.status === 'pending' ? 'warning' : 'danger'
                    }`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  className="admin-btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
                <button className="admin-btn-primary">
                  <CheckCircle size={18} />
                  View Full Details
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}