// BookingModeSelector.tsx - Toggle between slot-based and duration-based booking
import { motion } from 'motion/react';
import { Clock, Calendar } from 'lucide-react';

export type BookingMode = 'slot' | 'duration';

interface BookingModeSelectorProps {
  selectedMode: BookingMode;
  onModeChange: (mode: BookingMode) => void;
}

export function BookingModeSelector({ selectedMode, onModeChange }: BookingModeSelectorProps) {
  const modes = [
    {
      id: 'slot' as BookingMode,
      label: 'By Time Slot',
      description: 'Select a predefined slot',
      icon: <Clock size={20} />,
    },
    {
      id: 'duration' as BookingMode,
      label: 'By Duration',
      description: 'Choose start & end date/time',
      icon: <Calendar size={20} />,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        marginBottom: '32px',
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(182, 245, 0, 0.06), rgba(224, 192, 151, 0.04))',
        borderRadius: '16px',
        border: '1px solid rgba(182, 245, 0, 0.15)',
      }}
    >
      <h3
        style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#1a1a1a',
          marginBottom: '16px',
          textAlign: 'center',
        }}
      >
        How would you like to book?
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
        }}
      >
        {modes.map((mode) => {
          const isSelected = selectedMode === mode.id;
          
          return (
            <motion.button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: '16px',
                background: isSelected
                  ? 'linear-gradient(135deg, #B6F500, #A4DD00)'
                  : '#FFFFFF',
                border: isSelected
                  ? '2px solid #B6F500'
                  : '2px solid rgba(182, 245, 0, 0.2)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: isSelected
                  ? '0 8px 24px rgba(182, 245, 0, 0.25)'
                  : '0 2px 8px rgba(0, 0, 0, 0.04)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  layoutId="booking-mode-indicator"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '8px',
                    height: '8px',
                    background: '#2A4516',
                    borderRadius: '50%',
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.4 }}
                />
              )}

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    background: isSelected
                      ? 'rgba(42, 69, 22, 0.15)'
                      : 'rgba(182, 245, 0, 0.1)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isSelected ? '#2A4516' : '#C29A5D',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {mode.icon}
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontFamily: 'Playfair Display, serif',
                      fontSize: '0.9375rem',
                      fontWeight: '600',
                      color: isSelected ? '#2A4516' : '#1a1a1a',
                      marginBottom: '4px',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {mode.label}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.75rem',
                      color: isSelected ? '#2A4516' : '#6B7280',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {mode.description}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
