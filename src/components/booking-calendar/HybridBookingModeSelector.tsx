import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Clock, Sparkles } from 'lucide-react';

export type HybridBookingMode = 'full_day' | 'duration';

interface HybridBookingModeSelectorProps {
  selectedMode: HybridBookingMode;
  onModeChange: (mode: HybridBookingMode) => void;
}

export function HybridBookingModeSelector({ selectedMode, onModeChange }: HybridBookingModeSelectorProps) {
  const modes = [
    {
      id: 'full_day' as HybridBookingMode,
      emoji: '🕓',
      label: 'Full Day Booking',
      description: 'Book the entire day for your event',
      features: ['All time slots reserved', 'Best for major events', 'Complete venue access'],
      icon: CalendarIcon,
      color: '#B6F500',
    },
    {
      id: 'duration' as HybridBookingMode,
      emoji: '⏰',
      label: 'Duration Booking',
      description: 'Choose specific time slots that fit your schedule',
      features: ['Flexible timing', 'Cost-effective', 'Pick your slots'],
      icon: Clock,
      color: '#E0C097',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        marginBottom: '48px',
        padding: '32px 24px',
        background: '#FAF9F6',
        borderRadius: '24px',
        border: '2px solid rgba(182, 245, 0, 0.15)',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}
        >
          <Sparkles size={28} style={{ color: '#B6F500' }} />
          <h3
            style={{
              fontFamily: 'Poppins, Inter, sans-serif',
              fontSize: '1.75rem',
              fontWeight: '600',
              color: '#2D2D2D',
              margin: 0,
            }}
          >
            Choose How You'd Like to Book
          </h3>
        </motion.div>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: '#666',
            margin: 0,
            lineHeight: '1.6',
          }}
        >
          You can book for a full day or for a specific part of the day — whichever suits your occasion best
        </p>
      </div>

      {/* Mode Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}
      >
        {modes.map((mode, index) => {
          const isSelected = selectedMode === mode.id;

          return (
            <motion.button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
              whileHover={{ 
                scale: 1.03,
                boxShadow: isSelected 
                  ? '0 12px 40px rgba(182, 245, 0, 0.4)' 
                  : '0 8px 24px rgba(0, 0, 0, 0.1)'
              }}
              whileTap={{ scale: 0.97 }}
              style={{
                position: 'relative',
                padding: '28px',
                background: isSelected
                  ? `linear-gradient(135deg, rgba(182, 245, 0, 0.08), rgba(224, 192, 151, 0.08))`
                  : '#FFFFFF',
                border: isSelected
                  ? `3px solid ${mode.color}`
                  : '2px solid rgba(182, 245, 0, 0.15)',
                borderRadius: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isSelected
                  ? `0 8px 32px ${mode.color}40`
                  : '0 4px 12px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden',
              }}
            >
              {/* Glow Effect for Selected */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(circle at 50% 0%, ${mode.color}30, transparent 70%)`,
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* Gold Trail Animation */}
              {isSelected && (
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '50%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, #E0C09740, transparent)',
                    pointerEvents: 'none',
                  }}
                />
              )}

              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Icon & Emoji */}
                <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                  <motion.div
                    animate={isSelected ? { rotate: [0, 5, -5, 0] } : {}}
                    transition={{ duration: 0.5 }}
                    style={{
                      fontSize: '3rem',
                      marginBottom: '8px',
                    }}
                  >
                    {mode.emoji}
                  </motion.div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '56px',
                      height: '56px',
                      background: isSelected
                        ? `${mode.color}30`
                        : 'rgba(182, 245, 0, 0.08)',
                      borderRadius: '16px',
                      border: `2px solid ${isSelected ? mode.color : 'rgba(182, 245, 0, 0.2)'}`,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <mode.icon
                      size={28}
                      style={{ color: isSelected ? mode.color : '#666' }}
                    />
                  </div>
                </div>

                {/* Title */}
                <h4
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: isSelected ? '#2D2D2D' : '#4A4A4A',
                    marginBottom: '8px',
                    textAlign: 'center',
                    transition: 'color 0.3s ease',
                  }}
                >
                  {mode.label}
                </h4>

                {/* Description */}
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.875rem',
                    color: isSelected ? '#666' : '#888',
                    textAlign: 'center',
                    marginBottom: '16px',
                    lineHeight: '1.5',
                    transition: 'color 0.3s ease',
                  }}
                >
                  {mode.description}
                </p>

                {/* Features */}
                <div style={{ marginTop: '16px' }}>
                  {mode.features.map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px',
                        fontSize: '0.8125rem',
                        color: isSelected ? '#555' : '#999',
                        transition: 'color 0.3s ease',
                      }}
                    >
                      <div
                        style={{
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          background: isSelected ? mode.color : '#CCC',
                          flexShrink: 0,
                        }}
                      />
                      <span>{feature}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Selection Badge */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      width: '32px',
                      height: '32px',
                      background: mode.color,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 12px ${mode.color}60`,
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.3332 4L5.99984 11.3333L2.6665 8"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Helper Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          marginTop: '24px',
          padding: '16px',
          background: 'rgba(182, 245, 0, 0.05)',
          borderRadius: '12px',
          border: '1px solid rgba(182, 245, 0, 0.15)',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.875rem',
            color: '#666',
            margin: 0,
          }}
        >
          {selectedMode === 'full_day' ? (
            <span>
              📌 <strong>Full Day:</strong> Your selected date will be fully booked for the entire day
            </span>
          ) : (
            <span>
              ⏱️ <strong>Duration:</strong> Only your chosen time slot will be marked as unavailable
            </span>
          )}
        </p>
      </motion.div>
    </motion.div>
  );
}
