import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Users } from 'lucide-react';
import { useEvents } from '../src/hooks/useEvents';
import { EventSkeleton } from './SkeletonLoader';
import { AvailabilityCalendar } from './AvailabilityCalendar';

export function Events() {
  const { data: allEvents = [], isLoading, error, refetch } = useEvents();
  
  // Filter to only show upcoming events
  const events = useMemo(() => {
    return allEvents.filter((event: any) => new Date(event.event_date) >= new Date());
  }, [allEvents]);

  if (isLoading) {
    return (
      <section id="availability-calendar" className="section" style={{ background: 'var(--white)' }}>
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="section-badge">Availability</div>
            <h2 className="section-title">Availability Calendar</h2>
            <p className="section-description">
              Check when Dream Avenue is available for your next event
            </p>
          </motion.div>
          
          {/* Calendar Loading Skeleton */}
          <div
            style={{
              background: 'var(--white)',
              borderRadius: 'var(--radius-2xl)',
              padding: 'var(--space-8)',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid rgba(182, 245, 0, 0.15)',
              maxWidth: '900px',
              margin: '0 auto',
            }}
          >
            {/* Header Skeleton */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-8)',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  background: 'var(--gray-200)',
                  borderRadius: 'var(--radius-full)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
              <div
                style={{
                  width: '200px',
                  height: '32px',
                  background: 'var(--gray-200)',
                  borderRadius: 'var(--radius-md)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  background: 'var(--gray-200)',
                  borderRadius: 'var(--radius-full)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            </div>

            {/* Calendar Grid Skeleton */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-6)',
              }}
            >
              {/* Day headers skeleton */}
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={`header-${i}`}
                  style={{
                    height: '28px',
                    background: 'var(--gray-200)',
                    borderRadius: 'var(--radius-sm)',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    animationDelay: `${i * 0.05}s`,
                  }}
                />
              ))}

              {/* Date cells skeleton (42 cells for 6 weeks) */}
              {Array.from({ length: 42 }).map((_, i) => (
                <div
                  key={`cell-${i}`}
                  style={{
                    aspectRatio: '1',
                    background: 'var(--gray-200)',
                    borderRadius: 'var(--radius-md)',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    animationDelay: `${(i % 7) * 0.05}s`,
                  }}
                />
              ))}
            </div>

            {/* Legend Skeleton */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--space-4)',
                justifyContent: 'center',
              }}
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={`legend-${i}`}
                  style={{
                    width: '140px',
                    height: '24px',
                    background: 'var(--gray-200)',
                    borderRadius: 'var(--radius-full)',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="events" className="section" style={{ background: 'var(--white)' }}>
        <div className="container">
          <div className="text-center">
            <p style={{ color: '#ef4444', marginBottom: 'var(--space-4)' }}>
              Error: {error instanceof Error ? error.message : 'Failed to load events'}
            </p>
            <button onClick={() => refetch()} className="btn btn-primary">
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="availability-calendar" className="section" style={{ background: 'var(--white)', width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      <div className="container" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        {/* Section Header */}
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-badge">Availability</div>
          <h2 className="section-title">Availability Calendar</h2>
          <p className="section-description">
            Check when Dream Avenue is available for your next event
          </p>
        </motion.div>

        {/* Availability Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}
        >
          <AvailabilityCalendar />
        </motion.div>
      </div>
    </section>
  );
}