import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useCalendarMonth } from '../../src/hooks/useCalendar';
import type { CalendarDaySlots } from '../../src/api/calendar';
import { supabase } from '../../utils/supabase/client';

interface CalendarViewProps {
  selectedDate?: string;
  onDateSelect: (date: string) => void;
  minDate?: Date;
}

export function CalendarView({ 
  selectedDate, 
  onDateSelect,
  minDate = new Date()
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1;
  
  // Use new calendar month RPC
  const { data: calendarData = {}, refetch } = useCalendarMonth(year, month);

  // Realtime updates for availability
  useEffect(() => {
    const channel = supabase
      .channel('availability-updates')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'events'
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year: currentYear, month: currentMonthIndex } = getDaysInMonth(currentMonth);

  const previousMonth = () => {
    setCurrentMonth(new Date(currentYear, currentMonthIndex - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentYear, currentMonthIndex + 1));
  };

  const formatDateString = (day: number) => {
    return `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  /**
   * Get date status using get_calendar_month logic
   * - full_day = true → Red (fully booked / 'full')
   * - any of morning/evening/night/short_duration = true → Yellow (partially booked / 'partial')
   * - all false → Green (available / 'available')
   */
  const getDateStatus = (dateStr: string): 'available' | 'partial' | 'full' => {
    const dayData: CalendarDaySlots | undefined = calendarData[dateStr];
    
    if (!dayData) {
      return 'available';
    }

    // full_day = true → fully booked
    if (dayData.full_day) {
      return 'full';
    }

    // any of morning/evening/night/short_duration = true → partially booked
    if (dayData.morning || dayData.evening || dayData.night || dayData.short_duration) {
      return 'partial';
    }

    // all false → available
    return 'available';
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(currentYear, currentMonthIndex, day);
    return date < minDate;
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
          const isSelected = selectedDate === dateStr;
          const isDisabled = isDateDisabled(day);
          const status = getDateStatus(dateStr);

          let backgroundColor = 'white';
          let borderColor = '#E0E0E0';

          if (isSelected) {
            backgroundColor = '#B6F500';
            borderColor = '#B6F500';
          } else if (isDisabled) {
            backgroundColor = '#F5F5F5';
            borderColor = '#E0E0E0';
          } else if (status === 'full') {
            backgroundColor = '#FFE5E5';
            borderColor = '#FF6B6B';
          } else if (status === 'partial') {
            backgroundColor = '#FFF8E1';
            borderColor = '#FFD97D';
          } else {
            backgroundColor = '#E8F5E9';
            borderColor = '#B6F500';
          }

          return (
            <motion.button
              key={day}
              onClick={() => !isDisabled && status !== 'full' && onDateSelect(dateStr)}
              whileHover={!isDisabled && status !== 'full' ? { scale: 1.1 } : {}}
              whileTap={!isDisabled && status !== 'full' ? { scale: 0.9 } : {}}
              disabled={isDisabled || status === 'full'}
              style={{
                padding: '0.75rem',
                borderRadius: '10px',
                border: `2px solid ${borderColor}`,
                background: backgroundColor,
                cursor: isDisabled || status === 'full' ? 'not-allowed' : 'pointer',
                fontWeight: isSelected ? 600 : 400,
                color: isSelected ? 'white' : isDisabled ? '#999' : '#2D2D2D',
                opacity: isDisabled ? 0.5 : 1,
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
            >
              {day}
              {status === 'partial' && !isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: '#FFD97D',
                  }}
                />
              )}
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
          <span>Partially Booked</span>
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
          <span>Fully Booked</span>
        </div>
      </div>
    </div>
  );
}