import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useCalendarMonth } from '../src/hooks/useCalendar';
import type { CalendarDaySlots } from '../src/api/calendar';
import { CalendarLoadingSpinner } from './LoadingFallback';

interface PublicBookingCalendarProps {
  selectedDate?: string;
  onDateSelect: (date: string) => void;
  minDate?: Date;
}

/**
 * PUBLIC BOOKING PAGE CALENDAR
 * Uses get_calendar_month(p_year, p_month) RPC
 * Shows: Green (available), Yellow (partial), Red (fully booked)
 * 
 * IMPORTANT: This component uses the EXACT SAME logic as AdminAvailabilityCalendar
 */
export function PublicBookingCalendar({
  selectedDate,
  onDateSelect,
  minDate = new Date(),
}: PublicBookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

    return { daysInMonth, startingDayOfWeek, year, month, firstDay, lastDay };
  };

  const { year, month, daysInMonth, startingDayOfWeek, firstDay, lastDay } = getDaysInMonth(currentMonth);

  // Use get_calendar_month RPC (SAME AS ADMIN)
  const { data: calendarData = {}, isLoading, error } = useCalendarMonth(year, month + 1);

  // Comprehensive logging for debugging
  console.log('[PublicBookingCalendar] Render state:', {
    year,
    month: month + 1,
    isLoading,
    hasError: !!error,
    errorMessage: error?.message,
    dataKeyCount: Object.keys(calendarData).length,
    dataKeys: Object.keys(calendarData).slice(0, 10),
    sampleData: Object.entries(calendarData).slice(0, 5),
    fullData: calendarData,
  });

  const previousMonth = () => {
    const newMonth = new Date(year, month - 1);
    console.log('[PublicBookingCalendar] Previous month clicked', {
      from: `${year}-${month + 1}`,
      to: `${newMonth.getFullYear()}-${newMonth.getMonth() + 1}`,
    });
    setCurrentMonth(newMonth);
  };

  const nextMonth = () => {
    const newMonth = new Date(year, month + 1);
    console.log('[PublicBookingCalendar] Next month clicked', {
      from: `${year}-${month + 1}`,
      to: `${newMonth.getFullYear()}-${newMonth.getMonth() + 1}`,
    });
    setCurrentMonth(newMonth);
  };

  const formatDateString = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  /**
   * Calendar Status Logic using get_calendar_month
   * EXACT SAME LOGIC AS ADMIN CALENDAR
   * 
   * - full_day = true → Red (fully booked)
   * - any of morning/evening/night/short_duration = true → Yellow (partially booked)
   * - all false → Green (available)
   */
  const getDateStatus = (dateStr: string, date: Date) => {
    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      console.log(`[PublicBookingCalendar] Date ${dateStr} is in the past`);
      return 'past';
    }

    const dayData: CalendarDaySlots | undefined = calendarData[dateStr];
    
    console.log(`[PublicBookingCalendar] getDateStatus for ${dateStr}:`, {
      hasDayData: !!dayData,
      dayData: dayData,
    });

    if (!dayData) {
      // No data means available
      console.log(`[PublicBookingCalendar] ${dateStr} has no data → available`);
      return 'available';
    }

    // Red → fully booked (full_day = true)
    if (dayData.full_day) {
      console.log(`[PublicBookingCalendar] ${dateStr} is full_day → full`);
      return 'full';
    }

    // Yellow → partial availability (any slot booked)
    if (dayData.morning || dayData.evening || dayData.night || dayData.short_duration) {
      console.log(`[PublicBookingCalendar] ${dateStr} has partial bookings → partial`, {
        morning: dayData.morning,
        evening: dayData.evening,
        night: dayData.night,
        short_duration: dayData.short_duration,
      });
      return 'partial';
    }

    // Green → available (all slots false)
    console.log(`[PublicBookingCalendar] ${dateStr} all slots free → available`);
    return 'available';
  };

  const isDateDisabled = (day: number, status: string) => {
    const date = new Date(year, month, day);
    return date < minDate || status === 'full' || status === 'past';
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (isLoading) {
    console.log('[PublicBookingCalendar] Showing loading state');
    return (
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <CalendarLoadingSpinner size="md" />
      </div>
    );
  }

  if (error) {
    console.error('[PublicBookingCalendar] Error state:', error);
    return (
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          textAlign: 'center',
        }}
      >
        <CalendarIcon size={48} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
        <p style={{ color: '#ef4444', marginBottom: '16px' }}>
          Error loading calendar
        </p>
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          {error.message}
        </p>
      </div>
    );
  }

  console.log('[PublicBookingCalendar] Rendering calendar grid');

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}
      >
        <motion.button
          onClick={previousMonth}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            border: '2px solid #E0E0E0',
            background: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          <ChevronLeft size={20} />
        </motion.button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
            fontSize: '1.125rem',
          }}
        >
          <CalendarIcon size={20} style={{ color: '#B6F500' }} />
          <span>
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        <motion.button
          onClick={nextMonth}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            border: '2px solid #E0E0E0',
            background: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          <ChevronRight size={20} />
        </motion.button>
      </div>

      {/* Week days */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '0.5rem',
          marginBottom: '0.75rem',
        }}
      >
        {weekDays.map((day) => (
          <div
            key={day}
            style={{
              textAlign: 'center',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#666',
              padding: '0.5rem 0',
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '0.5rem',
        }}
      >
        {/* Empty cells for days before month starts */}
        {Array.from({ length: startingDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const dateStr = formatDateString(day);
          const date = new Date(year, month, day);
          const isSelected = selectedDate === dateStr;
          const status = getDateStatus(dateStr, date);
          const isDisabled = isDateDisabled(day, status);

          let backgroundColor = 'white';
          let borderColor = '#E0E0E0';
          let textColor = '#2D2D2D';

          if (isSelected) {
            backgroundColor = '#B6F500';
            borderColor = '#B6F500';
            textColor = 'white';
          } else if (status === 'full') {
            // Red → fully booked
            backgroundColor = '#FFE5E5';
            borderColor = '#FF6B6B';
            textColor = '#721c24';
          } else if (status === 'partial') {
            // Yellow → partially booked
            backgroundColor = '#FFF8E1';
            borderColor = '#FFD97D';
            textColor = '#856404';
          } else if (status === 'available') {
            // Green → available
            backgroundColor = '#E8F5E9';
            borderColor = '#B6F500';
            textColor = '#2D5016';
          } else if (status === 'past') {
            backgroundColor = '#F5F5F5';
            borderColor = '#E0E0E0';
            textColor = '#999';
          }

          return (
            <motion.button
              key={day}
              onClick={() => {
                if (!isDisabled) {
                  console.log(`[PublicBookingCalendar] Date selected: ${dateStr}`, {
                    status,
                    dayData: calendarData[dateStr],
                  });
                  onDateSelect(dateStr);
                }
              }}
              whileHover={!isDisabled ? { scale: 1.1 } : {}}
              whileTap={!isDisabled ? { scale: 0.9 } : {}}
              disabled={isDisabled}
              title={
                status === 'full'
                  ? 'Fully booked'
                  : status === 'partial'
                  ? 'Partially available'
                  : status === 'available'
                  ? 'Available'
                  : ''
              }
              style={{
                padding: '0.75rem',
                borderRadius: '10px',
                border: `2px solid ${borderColor}`,
                background: backgroundColor,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                fontWeight: isSelected ? 600 : 400,
                color: textColor,
                opacity: isDisabled ? 0.5 : 1,
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
            >
              {day}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '1.5rem',
          fontSize: '0.75rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '4px',
              background: '#E8F5E9',
              border: '2px solid #B6F500',
            }}
          />
          <span>Available</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '4px',
              background: '#FFF8E1',
              border: '2px solid #FFD97D',
            }}
          />
          <span>Partial</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '4px',
              background: '#FFE5E5',
              border: '2px solid #FF6B6B',
            }}
          />
          <span>Full</span>
        </div>
      </div>
    </div>
  );
}