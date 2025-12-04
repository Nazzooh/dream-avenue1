import { motion } from 'motion/react';
import { CalendarDays, Clock } from 'lucide-react';

export type BookingMode = 'full_day' | 'duration';

interface BookingModeToggleProps {
  mode: BookingMode;
  onChange: (mode: BookingMode) => void;
}

export function BookingModeToggle({ mode, onChange }: BookingModeToggleProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '1rem',
        background: '#FAF9F6',
        borderRadius: '12px',
        padding: '0.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      }}
    >
      <motion.button
        onClick={() => onChange('full_day')}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          flex: 1,
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          border: 'none',
          background: mode === 'full_day'
            ? 'linear-gradient(90deg, #B6F500, #E0C097)'
            : '#F0EDE9',
          color: mode === 'full_day' ? '#2D2D2D' : '#666',
          transition: 'all 0.3s ease',
          fontWeight: 500,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          boxShadow: mode === 'full_day'
            ? '0 4px 16px rgba(182, 245, 0, 0.3)'
            : 'none',
        }}
      >
        <CalendarDays size={20} />
        <span>🕓 Full Day</span>
      </motion.button>

      <motion.button
        onClick={() => onChange('duration')}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          flex: 1,
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          border: 'none',
          background: mode === 'duration'
            ? 'linear-gradient(90deg, #E0C097, #B6F500)'
            : '#F0EDE9',
          color: mode === 'duration' ? '#2D2D2D' : '#666',
          transition: 'all 0.3s ease',
          fontWeight: 500,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          boxShadow: mode === 'duration'
            ? '0 4px 16px rgba(224, 192, 151, 0.3)'
            : 'none',
        }}
      >
        <Clock size={20} />
        <span>⏰ Duration</span>
      </motion.button>
    </div>
  );
}
