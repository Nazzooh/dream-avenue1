import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Lock } from 'lucide-react';
import { useCalendarMonth, useCalendarEvents } from '../../src/hooks/useCalendar';
import { format } from 'date-fns';
import type { CalendarDaySlots, CalendarEvent } from '../../src/api/calendar';
import { AdminDateActionModal } from './AdminDateActionModal';
import { CalendarLoadingSpinner } from '../LoadingFallback';

interface AdminAvailabilityCalendarProps {
  onDateSelect?: (date: Date) => void;
}

/**
 * ADMIN AVAILABILITY CALENDAR
 * Uses get_calendar_month(p_year, p_month) RPC
 * Loads both availability and events, overlays them on calendar
 */
export function AdminAvailabilityCalendar({ onDateSelect }: AdminAvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month, firstDay, lastDay };
  };

  const { year, month, daysInMonth, startingDayOfWeek, firstDay, lastDay } = getDaysInMonth(currentMonth);

  // Format date range for events RPC
  const monthStart = firstDay.toISOString().split('T')[0];
  const monthEnd = lastDay.toISOString().split('T')[0];

  // Use new calendar month RPC
  const { data: calendarData = {}, isLoading: loadingStatus, error } = useCalendarMonth(year, month + 1);
  const { data: events = [], isLoading: loadingEvents } = useCalendarEvents(monthStart, monthEnd);

  const isLoading = loadingStatus || loadingEvents;

  console.log('[AdminAvailabilityCalendar] Render state:', {
    year,
    month: month + 1,
    isLoadingStatus: loadingStatus,
    isLoadingEvents: loadingEvents,
    hasError: !!error,
    errorMessage: error?.message,
    dataKeys: Object.keys(calendarData),
    eventsCount: events.length,
    sampleData: Object.entries(calendarData).slice(0, 3),
  });

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((event) => {
      if (!event.event_date) return;
      if (!map.has(event.event_date)) {
        map.set(event.event_date, []);
      }
      map.get(event.event_date)!.push(event);
    });
    return map;
  }, [events]);

  const previousMonth = () => {
    setCurrentMonth(new Date(year, month - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1));
  };

  const formatDateString = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  /**
   * Admin Calendar Status Logic using get_calendar_month
   * - full_day = true → Red (fully booked)
   * - any of morning/evening/night/short_duration = true → Yellow (partially booked)
   * - all false → Green (available)
   */
  const getDateStatus = (dateStr: string) => {
    const dayData: CalendarDaySlots | undefined = calendarData[dateStr];
    const dayEvents = eventsByDate.get(dateStr) || [];
    const hasEvent = dayEvents.length > 0;

    if (!dayData) {
      return { status: 'available', hasEvent, eventCount: dayEvents.length };
    }

    // Full day booked/blocked
    if (dayData.full_day) {
      return { status: 'full', hasEvent, eventCount: dayEvents.length };
    }

    // Partial availability (any slot booked)
    if (dayData.morning || dayData.evening || dayData.night || dayData.short_duration) {
      return { status: 'partial', hasEvent, eventCount: dayEvents.length };
    }

    return { status: 'available', hasEvent, eventCount: dayEvents.length };
  };

  const handleDayClick = (day: number) => {
    const date = new Date(year, month, day);
    setSelectedDate(date);
    setShowActionModal(true);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (isLoading) {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #FAFAF7, #FFFFFF)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(224, 192, 151, 0.15)',
        }}
      >
        <CalendarLoadingSpinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <CalendarIcon size={48} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
        <p style={{ color: '#ef4444' }}>Error loading calendar</p>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          background: 'linear-gradient(135deg, #FAFAF7, #FFFFFF)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(224, 192, 151, 0.15)',
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
          <h3
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#2A2A2A',
            }}
          >
            {format(currentMonth, 'MMMM yyyy')}
          </h3>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={previousMonth}
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
                transition: 'all 0.25s ease',
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
                transition: 'all 0.25s ease',
              }}
            >
              <ChevronRight size={20} color="#C29A5D" />
            </button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '8px',
            marginBottom: '12px',
          }}
        >
          {weekDays.map((day) => (
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
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const dateStr = formatDateString(day);
            const { status, hasEvent, eventCount } = getDateStatus(dateStr);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            let cellStyles: React.CSSProperties = {
              aspectRatio: '1',
              borderRadius: '14px',
              border: '2px solid',
              background: '#FFFFFF',
              color: '#2A2A2A',
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

            if (status === 'full') {
              cellStyles.background = 'linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 153, 153, 0.15))';
              cellStyles.borderColor = '#FF6B6B';
            } else if (status === 'partial') {
              cellStyles.background = 'linear-gradient(135deg, rgba(255, 215, 125, 0.2), rgba(255, 229, 157, 0.15))';
              cellStyles.borderColor = '#FFD97D';
            } else {
              cellStyles.background = 'linear-gradient(135deg, rgba(182, 245, 0, 0.15), rgba(198, 246, 141, 0.08))';
              cellStyles.borderColor = '#B6F500';
            }

            if (isToday) {
              cellStyles.boxShadow = '0 0 16px rgba(224, 192, 151, 0.4)';
              cellStyles.borderColor = '#E0C097';
              cellStyles.borderWidth = '3px';
            }

            return (
              <motion.button
                key={day}
                onClick={() => handleDayClick(day)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                style={cellStyles}
              >
                {hasEvent && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '6px',
                      left: '6px',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#3B82F6',
                      boxShadow: '0 0 4px rgba(59, 130, 246, 0.6)',
                    }}
                  />
                )}
                <span>{day}</span>
                {eventCount > 0 && (
                  <span
                    style={{
                      fontSize: '0.625rem',
                      fontWeight: '600',
                      color: status === 'full' ? '#721c24' : '#856404',
                      background: status === 'full' ? 'rgba(255, 107, 107, 0.2)' : 'rgba(255, 215, 125, 0.2)',
                      padding: '2px 6px',
                      borderRadius: '6px',
                    }}
                  >
                    {eventCount}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '24px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {[
            { label: 'Available', color: 'rgba(182, 245, 0, 0.15)', border: '#B6F500' },
            { label: 'Partial', color: 'rgba(255, 215, 125, 0.2)', border: '#FFD97D' },
            { label: 'Full', color: 'rgba(255, 107, 107, 0.2)', border: '#FF6B6B' },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '6px',
                  background: item.color,
                  border: `2px solid ${item.border}`,
                }}
              />
              <span
                style={{
                  fontSize: '0.875rem',
                  color: '#4A4A4A',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {selectedDate && (
        <AdminDateActionModal
          date={selectedDate}
          isOpen={showActionModal}
          onClose={() => {
            setShowActionModal(false);
            setSelectedDate(null);
          }}
        />
      )}
    </>
  );
}