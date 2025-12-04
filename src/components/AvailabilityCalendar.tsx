import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useCalendarMonth } from '../src/hooks/useCalendar';
import type { CalendarDaySlots } from '../src/api/calendar';

interface DateCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  status: 'available' | 'booked' | 'partial' | null;
}

function DateCell({ date, isCurrentMonth, isToday, isPast, status }: DateCellProps) {
  const day = date.getDate();

  // Determine cell styling with pastel colors
  let cellStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    aspectRatio: '1 / 1',
    borderRadius: '10px',
    fontSize: '0.875rem',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'default',
    position: 'relative',
    boxSizing: 'border-box',
  };

  if (!isCurrentMonth) {
    cellStyles.color = '#9ca3af';
    cellStyles.opacity = '0.4';
    cellStyles.background = 'transparent';
  } else if (isPast) {
    cellStyles.color = '#9ca3af';
    cellStyles.opacity = '0.5';
    cellStyles.background = 'transparent';
  } else if (status === 'booked' || status === 'full') {
    // Pastel yellow for booked days
    cellStyles.background = '#fff4c2';
    cellStyles.color = '#8b6914';
    cellStyles.border = '2px solid #f5d96c';
    cellStyles.fontWeight = '600';
  } else if (status === 'available') {
    // Pastel green for available days
    cellStyles.background = '#ccf4ce';
    cellStyles.color = '#2d5016';
    cellStyles.border = '2px solid #87e18a';
    cellStyles.fontWeight = '600';
    cellStyles.cursor = 'pointer';
  } else if (status === 'partial') {
    // Pastel yellow for partial days
    cellStyles.background = '#fff4c2';
    cellStyles.color = '#8b6914';
    cellStyles.border = '2px solid #f5d96c';
    cellStyles.fontWeight = '600';
  } else {
    cellStyles.color = '#374151';
    cellStyles.background = 'transparent';
  }

  // Today styling with lime accent
  if (isToday) {
    cellStyles.border = '3px solid #C8D46B';
    cellStyles.fontWeight = '700';
    cellStyles.boxShadow = '0 0 0 3px rgba(200, 212, 107, 0.2)';
  }

  return (
    <motion.div
      style={cellStyles}
      whileHover={
        status === 'available' && !isPast
          ? { scale: 1.05, boxShadow: '0 2px 8px rgba(135, 225, 138, 0.4)' }
          : {}
      }
      whileTap={
        status === 'available' && !isPast
          ? { scale: 0.98 }
          : {}
      }
    >
      {day}
    </motion.div>
  );
}

function CalendarGrid({ 
  currentDate, 
  availabilityData 
}: { 
  currentDate: Date;
  availabilityData: Record<string, CalendarDaySlots>;
}) {
  const today = useMemo(() => new Date(), []);
  
  // Get calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from Sunday (Indian calendar format)
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    startDate.setDate(firstDay.getDate() - dayOfWeek); // Go back to Sunday
    
    // Generate 6 weeks of dates (42 days)
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    
    return days;
  }, [currentDate]);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Day headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '6px',
          marginBottom: '12px',
          width: '100%',
        }}
      >
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
          <div
            key={day}
            style={{
              textAlign: 'center',
              fontSize: '0.7rem',
              color: '#9ca3af',
              fontWeight: '600',
              letterSpacing: '0.5px',
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar dates */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '6px',
          width: '100%',
        }}
      >
        {calendarDays.map((date, idx) => {
          const dateStr = date.toISOString().split('T')[0];
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const isToday = 
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
          const isPast = date < today && !isToday;
          
          // Get status from availability data using get_calendar_month logic
          let status: 'available' | 'booked' | 'partial' | null = null;
          if (availabilityData && availabilityData[dateStr]) {
            const dayData: CalendarDaySlots = availabilityData[dateStr];
            
            // full_day = true → fully booked (red/booked)
            if (dayData.full_day) {
              status = 'booked';
            } 
            // any of morning/evening/night/short_duration = true → partially booked (yellow)
            else if (dayData.morning || dayData.evening || dayData.night || dayData.short_duration) {
              status = 'partial';
            } 
            // all false → available (green)
            else {
              status = 'available';
            }
          } else if (isCurrentMonth && !isPast) {
            // Default to available if no booking data
            status = 'available';
          }

          return (
            <DateCell
              key={idx}
              date={date}
              isCurrentMonth={isCurrentMonth}
              isToday={isToday}
              isPast={isPast}
              status={status}
            />
          );
        })}
      </div>
    </div>
  );
}

function CalendarHeader({ 
  currentDate, 
  onPrevMonth, 
  onNextMonth 
}: {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}) {
  const monthYear = useMemo(() => {
    return currentDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }, [currentDate]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        width: '100%',
      }}
    >
      <motion.button
        onClick={onPrevMonth}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '42px',
          height: '42px',
          background: '#f0f4c3',
          border: '1px solid #C8D46B',
          borderRadius: '50%',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          flexShrink: 0,
        }}
        whileHover={{
          background: '#C8D46B',
          scale: 1.05,
        }}
        whileTap={{ scale: 0.95 }}
      >
        <ChevronLeft size={20} color="#5a6c0f" />
      </motion.button>

      <motion.h3
        key={monthYear}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(1.125rem, 4vw, 1.5rem)',
          color: '#2a2a2a',
          margin: 0,
          textAlign: 'center',
        }}
      >
        {monthYear}
      </motion.h3>

      <motion.button
        onClick={onNextMonth}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '42px',
          height: '42px',
          background: '#f0f4c3',
          border: '1px solid #C8D46B',
          borderRadius: '50%',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          flexShrink: 0,
        }}
        whileHover={{
          background: '#C8D46B',
          scale: 1.05,
        }}
        whileTap={{ scale: 0.95 }}
      >
        <ChevronRight size={20} color="#5a6c0f" />
      </motion.button>
    </div>
  );
}

function Legend() {
  const items = [
    { label: 'Available', color: '#ccf4ce', borderColor: '#87e18a', textColor: '#2d5016' },
    { label: 'Limited', color: '#fff4c2', borderColor: '#f5d96c', textColor: '#8b6914' },
    { label: 'Fully Booked', color: '#fff4c2', borderColor: '#f5d96c', textColor: '#8b6914' },
    { label: 'Today', color: 'transparent', borderColor: '#C8D46B', textColor: '#2a2a2a' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        justifyContent: 'center',
        marginTop: '24px',
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              background: item.color,
              border: `2px solid ${item.borderColor}`,
              borderRadius: '6px',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: '0.85rem',
              color: '#666',
            }}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function AvailabilityCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const { data, isLoading, error } = useCalendarMonth(year, month);

  const handlePrevMonth = () => {
    setSlideDirection('right');
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSlideDirection('left');
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  if (error) {
    return (
      <div className="text-center" style={{ padding: '48px 16px' }}>
        <CalendarIcon size={48} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
        <p style={{ color: '#ef4444', marginBottom: '16px' }}>
          Error loading calendar: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  return (
    <div
      className="calendar-wrapper"
      style={{
        width: '100%',
        maxWidth: '100%',
        overflowX: 'hidden',
        overflowY: 'visible',
        boxSizing: 'border-box',
        padding: '0',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: 'clamp(16px, 4vw, 32px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(200, 212, 107, 0.15)',
          maxWidth: '500px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <CalendarHeader
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={`${year}-${month}`}
            initial={{ opacity: 0, x: slideDirection === 'left' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: slideDirection === 'left' ? -20 : 20 }}
            transition={{ duration: 0.3 }}
          >
            {isLoading ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '300px',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    border: '4px solid rgba(200, 212, 107, 0.2)',
                    borderTop: '4px solid #C8D46B',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
              </div>
            ) : (
              <CalendarGrid
                currentDate={currentDate}
                availabilityData={data || {}}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <Legend />
      </div>
    </div>
  );
}