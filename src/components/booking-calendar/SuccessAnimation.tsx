// SuccessAnimation.tsx - Animated success confirmation component
import { motion } from 'motion/react';
import { Check, Calendar, Clock } from 'lucide-react';
import { getTimeSlotDisplay, isValidTimeSlot } from '../../src/constants/timeSlots';

interface SuccessAnimationProps {
  date: string;
  timeSlot: string;
  onClose?: () => void;
}

export function SuccessAnimation({ date, timeSlot, onClose }: SuccessAnimationProps) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTimeSlot = (slot: string) => {
    if (isValidTimeSlot(slot)) {
      return getTimeSlotDisplay(slot);
    }
    return slot;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      transition={{ 
        type: 'spring',
        stiffness: 300,
        damping: 25,
        duration: 0.5,
      }}
      style={{
        position: 'fixed',
        bottom: '32px',
        right: '32px',
        zIndex: 9999,
        maxWidth: '420px',
        background: 'linear-gradient(135deg, #B6F500, #A4DD00)',
        padding: '24px',
        borderRadius: '20px',
        boxShadow: '0 12px 40px rgba(182, 245, 0, 0.35)',
        border: '2px solid rgba(255, 255, 255, 0.3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: 'spring',
            delay: 0.2,
            stiffness: 200,
            damping: 15,
          }}
          style={{
            width: '56px',
            height: '56px',
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Check size={32} color="#2A4516" strokeWidth={3} />
          </motion.div>

          {/* Ripple Effect */}
          <motion.div
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ 
              scale: [1, 1.5, 2],
              opacity: [0.6, 0.3, 0],
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut',
            }}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              border: '3px solid rgba(255, 255, 255, 0.6)',
              borderRadius: '50%',
            }}
          />
        </motion.div>

        {/* Content */}
        <div style={{ flex: 1, paddingTop: '4px' }}>
          <motion.h4
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#2A4516',
              marginBottom: '12px',
            }}
          >
            Booking Confirmed! 🎉
          </motion.h4>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {/* Date */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '10px',
              }}
            >
              <Calendar size={18} color="#2A4516" />
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.9375rem',
                  fontWeight: '500',
                  color: '#2A4516',
                }}
              >
                {formatDate(date)}
              </span>
            </div>

            {/* Time Slot */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '10px',
              }}
            >
              <Clock size={18} color="#2A4516" />
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.9375rem',
                  fontWeight: '500',
                  color: '#2A4516',
                }}
              >
                {timeSlot.charAt(0).toUpperCase() + timeSlot.slice(1)} • {formatTimeSlot(timeSlot)}
              </span>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
              color: '#2A4516',
              marginTop: '12px',
              opacity: 0.8,
            }}
          >
            Your booking has been confirmed. We'll contact you shortly!
          </motion.p>
        </div>

        {/* Close Button */}
        {onClose && (
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              background: 'rgba(42, 69, 22, 0.2)',
              border: 'none',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            aria-label="Close"
          >
            <span style={{ fontSize: '18px', color: '#2A4516' }}>×</span>
          </motion.button>
        )}
      </div>

      {/* Confetti particles (optional visual enhancement) */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 1,
            scale: 0,
            x: 0,
            y: 0,
          }}
          animate={{
            opacity: 0,
            scale: [0, 1, 0.5],
            x: Math.cos(i * 45 * (Math.PI / 180)) * 60,
            y: Math.sin(i * 45 * (Math.PI / 180)) * 60,
          }}
          transition={{
            duration: 0.8,
            delay: 0.2,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '8px',
            height: '8px',
            background: i % 2 === 0 ? '#FFFFFF' : '#2A4516',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />
      ))}
    </motion.div>
  );
}

// Minimal inline success banner (for embedding in forms)
export function SuccessBanner({ date, timeSlot }: { date: string; timeSlot: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      style={{
        background: 'linear-gradient(135deg, #B6F500, #A4DD00)',
        padding: '20px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
        boxShadow: '0 8px 24px rgba(182, 245, 0, 0.25)',
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        style={{
          width: '48px',
          height: '48px',
          background: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Check size={28} color="#2A4516" strokeWidth={3} />
      </motion.div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#2A4516',
            marginBottom: '4px',
          }}
        >
          Date & Time Selected
        </div>
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.9375rem',
            color: '#2A4516',
            opacity: 0.9,
          }}
        >
          {new Date(date).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          })} • {timeSlot.charAt(0).toUpperCase() + timeSlot.slice(1)}
        </div>
      </div>
    </motion.div>
  );
}
