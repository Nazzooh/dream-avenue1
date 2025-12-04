import { motion } from 'motion/react';
import { Sun, Sunset, Moon, Check } from 'lucide-react';

export type TimeSlot = 'morning' | 'noon' | 'evening' | 'night';

interface TimeSlotOption {
  id: TimeSlot;
  label: string;
  icon: typeof Sun;
  time: string;
  color: string;
}

const TIME_SLOTS: TimeSlotOption[] = [
  {
    id: 'morning',
    label: 'Morning',
    icon: Sun,
    time: '6 AM - 12 PM',
    color: '#FFD97D',
  },
  {
    id: 'noon',
    label: 'Afternoon',
    icon: Sun,
    time: '12 PM - 5 PM',
    color: '#F4A261',
  },
  {
    id: 'evening',
    label: 'Evening',
    icon: Sunset,
    time: '5 PM - 9 PM',
    color: '#E76F51',
  },
  {
    id: 'night',
    label: 'Night',
    icon: Moon,
    time: '9 PM - 12 AM',
    color: '#8884D8',
  },
];

interface TimeSlotSelectorProps {
  selectedSlot?: TimeSlot;
  onSelect: (slot: TimeSlot) => void;
  disabledSlots?: TimeSlot[];
}

export function TimeSlotSelector({ 
  selectedSlot, 
  onSelect,
  disabledSlots = []
}: TimeSlotSelectorProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '1rem',
        marginTop: '1rem',
      }}
    >
      {TIME_SLOTS.map((slot) => {
        const isSelected = selectedSlot === slot.id;
        const isDisabled = disabledSlots.includes(slot.id);
        const Icon = slot.icon;

        return (
          <motion.button
            key={slot.id}
            onClick={() => !isDisabled && onSelect(slot.id)}
            whileHover={!isDisabled ? { scale: 1.05 } : {}}
            whileTap={!isDisabled ? { scale: 0.95 } : {}}
            disabled={isDisabled}
            style={{
              position: 'relative',
              padding: '1rem',
              background: isSelected
                ? `linear-gradient(135deg, ${slot.color}20, ${slot.color}10)`
                : isDisabled
                ? '#F5F5F5'
                : 'white',
              border: isSelected
                ? `2px solid ${slot.color}`
                : '2px solid #E0E0E0',
              borderRadius: '12px',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              opacity: isDisabled ? 0.5 : 1,
              transition: 'all 0.3s ease',
              textAlign: 'center',
            }}
          >
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '24px',
                  height: '24px',
                  background: slot.color,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Check size={14} color="white" />
              </motion.div>
            )}

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                background: isSelected ? `${slot.color}30` : '#F5F5F5',
                borderRadius: '12px',
                marginBottom: '0.5rem',
              }}
            >
              <Icon
                size={24}
                style={{ color: isSelected ? slot.color : '#666' }}
              />
            </div>

            <div style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
              {slot.label}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#666' }}>
              {slot.time}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
