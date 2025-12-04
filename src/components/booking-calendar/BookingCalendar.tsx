// BookingCalendar.tsx - Main interactive booking calendar component
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from 'lucide-react';
import { CalendarCell, CellStatus } from './CalendarCell';
import { TimeSlotSelector, TimeSlot, generateDefaultTimeSlots } from './TimeSlotSelector';
import { CalendarLegend } from './CalendarLegend';
import { useCalendarMonth } from '../../src/hooks/useCalendar';
import type { CalendarDaySlots } from '../../src/api/calendar';
import { toast } from 'sonner@2.0.3';

interface BookingCalendarProps {
  onBookingComplete?: (date: string, timeSlot: TimeSlot) => void;
  initialDate?: Date;
  className?: string;
}

export function BookingCalendar({
  onBookingComplete,
  initialDate,
  className = '',
}: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isTimeSlotModalOpen, setIsTimeSlotModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const today = useMemo(() => new Date(), []);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  // Use new calendar month RPC
  const { data: calendarData = {}, isLoading, error } = useCalendarMonth(year, month);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    startDate.setDate(firstDay.getDate() - dayOfWeek); // Go back to Sunday

    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }

    return days;
  }, [currentDate]);

  // Get status for a date using get_calendar_month logic
  const getDateStatus = (date: Date): { status: CellStatus; bookedSlots: number; totalSlots: number } => {
    const dateStr = date.toISOString().split('T')[0];
    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
    const isPast = date < today && !(
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );

    if (!isCurrentMonth || isPast) {
      return { status: null, bookedSlots: 0, totalSlots: 3 };
    }

    const dayData: CalendarDaySlots | undefined = calendarData[dateStr];
    
    if (!dayData) {
      // No data means available
      return { status: 'available', bookedSlots: 0, totalSlots: 3 };
    }

    // full_day = true → fully booked (red)
    if (dayData.full_day) {
      return { status: 'fully-booked', bookedSlots: 3, totalSlots: 3 };
    }

    // any of morning/evening/night/short_duration = true → partially booked (yellow)
    const bookedSlots = [dayData.morning, dayData.evening, dayData.night, dayData.short_duration].filter(Boolean).length;
    if (bookedSlots > 0) {
      return { status: 'partially-booked', bookedSlots, totalSlots: 3 };
    }

    // all false → available (green)
    return { status: 'available', bookedSlots: 0, totalSlots: 3 };
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    const { status } = getDateStatus(date);
    
    if (status === 'fully-booked') {
      toast.error('Date Fully Booked', {
        description: 'This date is no longer available. Please select another date.',
      });
      return;
    }

    setSelectedDate(date);
    setIsTimeSlotModalOpen(true);
  };

  // Handle time slot confirmation
  const handleTimeSlotConfirm = (timeSlot: TimeSlot) => {
    if (!selectedDate) return;

    const dateStr = selectedDate.toISOString().split('T')[0];

    // Show success toast
    toast.success('Booking Confirmed!', {
      description: `${selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })} - ${timeSlot.charAt(0).toUpperCase() + timeSlot.slice(1)} slot`,
      duration: 5000,
    });

    // Call callback
    onBookingComplete?.(dateStr, timeSlot);

    // Close modal
    setIsTimeSlotModalOpen(false);
    setSelectedDate(null);
  };

  // Handle month navigation
  const handlePrevMonth = () => {
    setSlideDirection('right');
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSlideDirection('left');
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Format month/year
  const monthYear = useMemo(() => {
    return currentDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }, [currentDate]);

  // Generate time slots for selected date
  const timeSlots = useMemo(() => {
    if (!selectedDate) return generateDefaultTimeSlots();
    
    // TODO: Fetch actual booked slots from API
    // For now, return default slots (all available)
    return generateDefaultTimeSlots();
  }, [selectedDate]);

  if (error) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '48px',
          background: 'rgba(255, 107, 107, 0.1)',
          borderRadius: '16px',
        }}
      >
        <CalendarIcon size={48} style={{ color: '#FF6B6B', margin: '0 auto 16px' }} />
        <p style={{ color: '#721c24', fontFamily: 'Poppins, sans-serif' }}>
          Unable to load calendar. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: '#FFFADC',
          borderRadius: '24px',
          padding: isMobile ? '24px' : '40px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(224, 192, 151, 0.2)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            style={{
              width: '72px',
              height: '72px',
              background: 'linear-gradient(135deg, #B6F500, #A4DD00)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 24px rgba(182, 245, 0, 0.3)',
            }}
          >
            <CalendarIcon size={36} color="#2A4516" strokeWidth={2.5} />
          </motion.div>
          <h2
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: isMobile ? '1.5rem' : '2rem',
              fontWeight: '600',
              color: '#2a2a2a',
              marginBottom: '12px',
            }}
          >
            Select Your Date
          </h2>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.9375rem',
              color: '#666666',
              maxWidth: '560px',
              margin: '0 auto',
              lineHeight: '1.6',
            }}
          >
            Choose an available date to view time slots and complete your booking at Dream Avenue
          </p>
        </div>

        {/* Month Navigation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '32px',
          }}
        >
          <motion.button
            onClick={handlePrevMonth}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: isMobile ? '40px' : '48px',
              height: isMobile ? '40px' : '48px',
              background: 'rgba(224, 192, 151, 0.12)',
              border: '1.5px solid #E0C097',
              borderRadius: '14px',
              cursor: 'pointer',
            }}
            whileHover={{
              background: 'rgba(224, 192, 151, 0.2)',
              scale: 1.05,
              boxShadow: '0 4px 16px rgba(224, 192, 151, 0.25)',
            }}
            whileTap={{ scale: 0.95 }}
            aria-label="Previous month"
          >
            <ChevronLeft size={isMobile ? 20 : 24} color="#C29A5D" />
          </motion.button>

          <motion.h3
            key={monthYear}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: isMobile ? '1.25rem' : '1.75rem',
              fontWeight: '600',
              color: '#2a2a2a',
              margin: 0,
            }}
          >
            {monthYear}
          </motion.h3>

          <motion.button
            onClick={handleNextMonth}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: isMobile ? '40px' : '48px',
              height: isMobile ? '40px' : '48px',
              background: 'rgba(224, 192, 151, 0.12)',
              border: '1.5px solid #E0C097',
              borderRadius: '14px',
              cursor: 'pointer',
            }}
            whileHover={{
              background: 'rgba(224, 192, 151, 0.2)',
              scale: 1.05,
              boxShadow: '0 4px 16px rgba(224, 192, 151, 0.25)',
            }}
            whileTap={{ scale: 0.95 }}
            aria-label="Next month"
          >
            <ChevronRight size={isMobile ? 20 : 24} color="#C29A5D" />
          </motion.button>
        </div>

        {/* Calendar Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${year}-${month}`}
            initial={{ opacity: 0, x: slideDirection === 'left' ? 30 : -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: slideDirection === 'left' ? -30 : 30 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            {isLoading ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: isMobile ? '320px' : '400px',
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{
                    width: '56px',
                    height: '56px',
                    border: '5px solid rgba(224, 192, 151, 0.2)',
                    borderTop: '5px solid #E0C097',
                    borderRadius: '50%',
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: isMobile ? '8px' : '12px',
                  marginBottom: '32px',
                }}
              >
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div
                    key={day}
                    style={{
                      textAlign: 'center',
                      fontSize: isMobile ? '0.6875rem' : '0.8125rem',
                      fontFamily: 'Poppins, sans-serif',
                      color: '#B6F500',
                      fontWeight: '600',
                      padding: isMobile ? '6px 0' : '10px 0',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {day}
                  </div>
                ))}

                {/* Calendar dates */}
                {calendarDays.map((date, idx) => {
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                  const isToday =
                    date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear();
                  const isPast = date < today && !isToday;

                  const { status, bookedSlots, totalSlots } = getDateStatus(date);

                  return (
                    <CalendarCell
                      key={idx}
                      date={date}
                      isCurrentMonth={isCurrentMonth}
                      isToday={isToday}
                      isPast={isPast}
                      isDisabled={false}
                      status={status}
                      bookedSlots={bookedSlots}
                      totalSlots={totalSlots}
                      onClick={() => handleDateClick(date)}
                    />
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Legend */}
        <CalendarLegend />

        {/* Info Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            marginTop: '24px',
            padding: '16px',
            background: 'rgba(182, 245, 0, 0.06)',
            borderRadius: '12px',
            border: '1px solid rgba(182, 245, 0, 0.15)',
          }}
        >
          <Info size={20} color="#B6F500" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p
            style={{
              fontSize: '0.875rem',
              fontFamily: 'Inter, sans-serif',
              color: '#666666',
              lineHeight: '1.6',
              margin: 0,
            }}
          >
            Click on an available or partially booked date to view time slots. Fully booked dates cannot be selected.
          </p>
        </motion.div>
      </motion.div>

      {/* Time Slot Selector Modal */}
      <TimeSlotSelector
        isOpen={isTimeSlotModalOpen}
        onClose={() => {
          setIsTimeSlotModalOpen(false);
          setSelectedDate(null);
        }}
        selectedDate={selectedDate}
        timeSlots={timeSlots}
        onConfirm={handleTimeSlotConfirm}
        isMobile={isMobile}
      />
    </div>
  );
}