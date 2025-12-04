import { motion } from 'motion/react';
import { Sun, Sunset, Moon, Clock, Check } from 'lucide-react';

export type TimeSlotOption = {
  key: string;
  label: string;
  time: string;
  discount: number;
  icon: typeof Sun;
  color: string;
  bgColor: string;
};

export const SLOT_OPTIONS: TimeSlotOption[] = [
  {
    key: 'full_day',
    label: 'Full Day',
    time: '10 AM – 6 PM',
    discount: 0,
    icon: Clock,
    color: '#B6F500',
    bgColor: 'rgba(182, 245, 0, 0.1)',
  },
  {
    key: 'half_day_morning',
    label: 'Half Day (Morning)',
    time: '10 AM – 2 PM',
    discount: 0,
    icon: Sun,
    color: '#FFD97D',
    bgColor: 'rgba(255, 217, 125, 0.1)',
  },
  {
    key: 'half_day_evening',
    label: 'Half Day (Evening)',
    time: '2 PM – 6 PM',
    discount: 0,
    icon: Sunset,
    color: '#FFAB73',
    bgColor: 'rgba(255, 171, 115, 0.1)',
  },
  {
    key: 'night',
    label: 'Night',
    time: '6 PM – 10 PM',
    discount: 0,
    icon: Moon,
    color: '#D5C6FF',
    bgColor: 'rgba(213, 198, 255, 0.1)',
  },
];

export const SHORT_DURATION_SLOT: TimeSlotOption = {
  key: 'short_duration',
  label: 'Short Duration',
  time: '4-5 Hours (Flexible)',
  discount: 0,
  icon: Clock,
  color: '#FF6B9D',
  bgColor: 'rgba(255, 107, 157, 0.1)',
};

// Event types that qualify for short duration booking
export const SHORT_DURATION_EVENT_TYPES = ['birthday', 'meeting', 'get-together', 'awareness-class'];

interface SlotSelectorGridProps {
  selectedSlot: string;
  onSlotChange: (slot: string) => void;
  basePrice: number;
  eventType?: string;
}

export function SlotSelectorGrid({ selectedSlot, onSlotChange, basePrice, eventType }: SlotSelectorGridProps) {
  // Check if event type qualifies for short duration
  const showShortDuration = eventType && SHORT_DURATION_EVENT_TYPES.includes(eventType);
  
  // Build the slots array
  const slotsToShow = showShortDuration 
    ? [SHORT_DURATION_SLOT, ...SLOT_OPTIONS]
    : SLOT_OPTIONS;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Select Your Time Slot
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>
          Choose the time period that best fits your event schedule
        </p>
        {showShortDuration && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '0.75rem',
              padding: '0.75rem 1rem',
              background: 'linear-gradient(135deg, rgba(255, 107, 157, 0.15), rgba(255, 107, 157, 0.05))',
              borderRadius: '8px',
              borderLeft: '3px solid #FF6B9D',
              fontSize: '0.8125rem',
              color: '#343A40',
            }}
          >
            ✨ <strong>Special Offer:</strong> Short Duration slot available at ₹26,000 for your {eventType.replace('-', ' ')} event!
          </motion.div>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem',
        }}
      >
        {slotsToShow.map((slot, index) => {
          const isSelected = selectedSlot === slot.key;
          const Icon = slot.icon;

          return (
            <motion.button
              key={slot.key}
              onClick={() => onSlotChange(slot.key)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                position: 'relative',
                padding: '1.25rem',
                background: isSelected ? slot.bgColor : 'white',
                border: isSelected
                  ? `3px solid ${slot.color}`
                  : '2px solid rgba(224, 224, 224, 0.5)',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isSelected
                  ? `0 8px 24px ${slot.color}40`
                  : '0 2px 8px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden',
              }}
            >
              {/* Glow effect for selected */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(circle at 50% 0%, ${slot.color}30, transparent 70%)`,
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* Checkmark badge */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: slot.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 12px ${slot.color}60`,
                    zIndex: 2,
                  }}
                >
                  <Check size={16} color="white" />
                </motion.div>
              )}

              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Icon */}
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    background: isSelected ? `${slot.color}30` : 'rgba(240, 240, 240, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                    border: `2px solid ${isSelected ? slot.color : 'transparent'}`,
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Icon size={28} style={{ color: isSelected ? slot.color : '#666' }} />
                </div>

                {/* Label */}
                <h4
                  style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    marginBottom: '0.25rem',
                    color: isSelected ? '#2D2D2D' : '#4A4A4A',
                    transition: 'color 0.3s ease',
                  }}
                >
                  {slot.label}
                </h4>

                {/* Time */}
                <p
                  style={{
                    fontSize: '0.8125rem',
                    color: '#666',
                    marginBottom: '0.75rem',
                  }}
                >
                  {slot.time}
                </p>

                {/* Price */}
                <div
                  style={{
                    padding: '0.5rem',
                    background: isSelected ? 'rgba(255, 255, 255, 0.8)' : 'rgba(250, 249, 246, 1)',
                    borderRadius: '8px',
                    marginTop: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: isSelected ? slot.color : '#2D2D2D',
                    }}
                  >
                    {slot.key === 'short_duration' 
                      ? '₹26,000' 
                      : `₹${basePrice.toLocaleString('en-IN')}`
                    }
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}