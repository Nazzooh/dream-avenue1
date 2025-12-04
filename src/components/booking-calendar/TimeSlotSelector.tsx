// TimeSlotSelector.tsx - Time slot selection modal/panel
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sun, Sunset, Moon, Check } from 'lucide-react';
import { TIME_SLOT_DEFINITIONS, type TimeSlot } from '../../src/constants/timeSlots';

export type { TimeSlot };

export interface TimeSlotOption {
  id: TimeSlot;
  label: string;
  icon: React.ReactNode;
  time: string;
  available: boolean;
  remainingSlots?: number;
}

interface TimeSlotSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  timeSlots: TimeSlotOption[];
  onConfirm: (slot: TimeSlot) => void;
  isMobile?: boolean;
}

export function TimeSlotSelector({
  isOpen,
  onClose,
  selectedDate,
  timeSlots,
  onConfirm,
  isMobile = false,
}: TimeSlotSelectorProps) {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    
    setIsConfirming(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onConfirm(selectedSlot);
    setIsConfirming(false);
    setSelectedSlot(null);
  };

  const handleClose = () => {
    setSelectedSlot(null);
    onClose();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getSlotStyles = (slot: TimeSlotOption, isSelected: boolean) => {
    const baseStyles: React.CSSProperties = {
      padding: '20px',
      borderRadius: '16px',
      cursor: slot.available ? 'pointer' : 'not-allowed',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
    };

    if (!slot.available) {
      return {
        ...baseStyles,
        background: 'rgba(255, 107, 107, 0.1)',
        border: '2px solid rgba(255, 107, 107, 0.3)',
        opacity: 0.6,
      };
    }

    if (isSelected) {
      return {
        ...baseStyles,
        background: 'linear-gradient(135deg, #C8D46B, #E0C097)',
        border: '2px solid #B6F500',
        boxShadow: '0 8px 24px rgba(200, 212, 107, 0.35)',
      };
    }

    return {
      ...baseStyles,
      background: 'rgba(182, 245, 0, 0.08)',
      border: '2px solid rgba(182, 245, 0, 0.2)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    };
  };

  const getSlotHoverStyles = (slot: TimeSlotOption, isSelected: boolean) => {
    if (!slot.available) return {};

    if (isSelected) {
      return {
        scale: 1.02,
        boxShadow: '0 12px 32px rgba(200, 212, 107, 0.45)',
      };
    }

    return {
      scale: 1.02,
      background: 'rgba(182, 245, 0, 0.15)',
      boxShadow: '0 4px 16px rgba(182, 245, 0, 0.2)',
    };
  };

  if (!isOpen) return null;

  // Mobile full-screen modal
  if (isMobile) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-end',
          }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxHeight: '90vh',
              background: '#FFFADC',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '24px',
              overflowY: 'auto',
              boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.15)',
            }}
          >
            {/* Swipe indicator */}
            <div
              style={{
                width: '48px',
                height: '4px',
                background: 'rgba(42, 42, 42, 0.2)',
                borderRadius: '2px',
                margin: '0 auto 20px',
              }}
            />

            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
              <h3
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#2a2a2a',
                  marginBottom: '8px',
                }}
              >
                Select Time Slot
              </h3>
              {selectedDate && (
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.9375rem',
                    color: '#666666',
                  }}
                >
                  {formatDate(selectedDate)}
                </p>
              )}
            </div>

            {/* Time slots */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {timeSlots.map((slot) => {
                const isSelected = selectedSlot === slot.id;
                return (
                  <motion.button
                    key={slot.id}
                    style={getSlotStyles(slot, isSelected)}
                    whileHover={getSlotHoverStyles(slot, isSelected)}
                    whileTap={slot.available ? { scale: 0.98 } : {}}
                    onClick={() => slot.available && setSelectedSlot(slot.id)}
                    disabled={!slot.available}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          background: isSelected
                            ? 'rgba(255, 255, 255, 0.3)'
                            : slot.available
                            ? 'rgba(182, 245, 0, 0.15)'
                            : 'rgba(255, 107, 107, 0.15)',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {slot.icon}
                      </div>

                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <div
                          style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            color: isSelected ? '#2A4516' : slot.available ? '#2a2a2a' : '#721c24',
                            marginBottom: '4px',
                          }}
                        >
                          {slot.label}
                        </div>
                        <div
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '0.875rem',
                            color: isSelected ? '#2A4516' : slot.available ? '#666666' : '#856404',
                          }}
                        >
                          {slot.available ? slot.time : 'Booked'}
                        </div>
                      </div>

                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', duration: 0.4 }}
                          style={{
                            width: '32px',
                            height: '32px',
                            background: '#B6F500',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Check size={20} color="#2A4516" strokeWidth={3} />
                        </motion.div>
                      )}

                      {!slot.available && (
                        <div
                          style={{
                            padding: '4px 12px',
                            background: '#FF6B6B',
                            color: '#FFFFFF',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: '600',
                          }}
                        >
                          Booked
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Confirm button */}
            <motion.button
              style={{
                width: '100%',
                padding: '16px',
                background: selectedSlot
                  ? 'linear-gradient(135deg, #B6F500, #A4DD00)'
                  : 'rgba(182, 245, 0, 0.3)',
                color: selectedSlot ? '#2A4516' : '#999999',
                border: 'none',
                borderRadius: '12px',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '1.0625rem',
                fontWeight: '600',
                cursor: selectedSlot ? 'pointer' : 'not-allowed',
                boxShadow: selectedSlot ? '0 4px 16px rgba(182, 245, 0, 0.3)' : 'none',
                position: 'sticky',
                bottom: 0,
              }}
              whileHover={selectedSlot ? { scale: 1.02 } : {}}
              whileTap={selectedSlot ? { scale: 0.98 } : {}}
              onClick={handleConfirm}
              disabled={!selectedSlot || isConfirming}
            >
              {isConfirming ? 'Confirming...' : 'Confirm Booking'}
            </motion.button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Desktop side panel
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '480px',
            background: '#FFFADC',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
            position: 'relative',
          }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '36px',
              height: '36px',
              background: 'rgba(42, 42, 42, 0.05)',
              border: 'none',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            aria-label="Close"
          >
            <X size={20} color="#666666" />
          </button>

          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <h3
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '1.75rem',
                fontWeight: '600',
                color: '#2a2a2a',
                marginBottom: '8px',
              }}
            >
              Select Time Slot
            </h3>
            {selectedDate && (
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.9375rem',
                  color: '#666666',
                }}
              >
                {formatDate(selectedDate)}
              </p>
            )}
          </div>

          {/* Time slots */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
            {timeSlots.map((slot) => {
              const isSelected = selectedSlot === slot.id;
              return (
                <motion.button
                  key={slot.id}
                  style={getSlotStyles(slot, isSelected)}
                  whileHover={getSlotHoverStyles(slot, isSelected)}
                  whileTap={slot.available ? { scale: 0.98 } : {}}
                  onClick={() => slot.available && setSelectedSlot(slot.id)}
                  disabled={!slot.available}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        background: isSelected
                          ? 'rgba(255, 255, 255, 0.3)'
                          : slot.available
                          ? 'rgba(182, 245, 0, 0.15)'
                          : 'rgba(255, 107, 107, 0.15)',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {slot.icon}
                    </div>

                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div
                        style={{
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '1.1875rem',
                          fontWeight: '600',
                          color: isSelected ? '#2A4516' : slot.available ? '#2a2a2a' : '#721c24',
                          marginBottom: '4px',
                        }}
                      >
                        {slot.label}
                      </div>
                      <div
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '0.875rem',
                          color: isSelected ? '#2A4516' : slot.available ? '#666666' : '#856404',
                        }}
                      >
                        {slot.available ? slot.time : 'Booked'}
                        {slot.available && slot.remainingSlots !== undefined && (
                          <span style={{ marginLeft: '8px', opacity: 0.7 }}>
                            • {slot.remainingSlots} slot{slot.remainingSlots !== 1 ? 's' : ''} left
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', duration: 0.4 }}
                        style={{
                          width: '36px',
                          height: '36px',
                          background: '#B6F500',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Check size={22} color="#2A4516" strokeWidth={3} />
                      </motion.div>
                    )}

                    {!slot.available && (
                      <div
                        style={{
                          padding: '6px 14px',
                          background: '#FF6B6B',
                          color: '#FFFFFF',
                          borderRadius: '8px',
                          fontSize: '0.8125rem',
                          fontFamily: 'Poppins, sans-serif',
                          fontWeight: '600',
                        }}
                      >
                        Booked
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Confirm button */}
          <motion.button
            style={{
              width: '100%',
              padding: '18px',
              background: selectedSlot
                ? 'linear-gradient(135deg, #B6F500, #A4DD00)'
                : 'rgba(182, 245, 0, 0.3)',
              color: selectedSlot ? '#2A4516' : '#999999',
              border: 'none',
              borderRadius: '14px',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '1.0625rem',
              fontWeight: '600',
              cursor: selectedSlot ? 'pointer' : 'not-allowed',
              boxShadow: selectedSlot ? '0 4px 16px rgba(182, 245, 0, 0.3)' : 'none',
            }}
            whileHover={selectedSlot ? { scale: 1.02, boxShadow: '0 6px 24px rgba(182, 245, 0, 0.4)' } : {}}
            whileTap={selectedSlot ? { scale: 0.98 } : {}}
            onClick={handleConfirm}
            disabled={!selectedSlot || isConfirming}
          >
            {isConfirming ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{
                    width: '20px',
                    height: '20px',
                    border: '3px solid rgba(42, 69, 22, 0.3)',
                    borderTop: '3px solid #2A4516',
                    borderRadius: '50%',
                  }}
                />
                Confirming...
              </span>
            ) : (
              'Confirm Booking'
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Helper to generate default time slots
export function generateDefaultTimeSlots(bookedSlots: TimeSlot[] = []): TimeSlotOption[] {
  const morningDef = TIME_SLOT_DEFINITIONS.morning;
  const eveningDef = TIME_SLOT_DEFINITIONS.evening;
  const nightDef = TIME_SLOT_DEFINITIONS.night;

  return [
    {
      id: 'morning',
      label: morningDef.label,
      icon: <Sun size={24} color="#F59E0B" />,
      time: morningDef.displayTime,
      available: !bookedSlots.includes('morning'),
      remainingSlots: bookedSlots.includes('morning') ? 0 : 1,
    },
    {
      id: 'evening',
      label: eveningDef.label,
      icon: <Sunset size={24} color="#F97316" />,
      time: eveningDef.displayTime,
      available: !bookedSlots.includes('evening'),
      remainingSlots: bookedSlots.includes('evening') ? 0 : 1,
    },
    {
      id: 'night',
      label: nightDef.label,
      icon: <Moon size={24} color="#6366F1" />,
      time: nightDef.displayTime,
      available: !bookedSlots.includes('night'),
      remainingSlots: bookedSlots.includes('night') ? 0 : 1,
    },
  ];
}
