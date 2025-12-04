import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, X, Calendar, Clock, Users, Mail, Phone, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface ConfirmBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails?: {
    date: string;
    timeSlot?: string;
    guestCount: string;
    fullName: string;
    email: string;
    phone: string;
  };
}

export function ConfirmBookingModal({ isOpen, onClose, bookingDetails }: ConfirmBookingModalProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#B6F500', '#E0C097', '#FFD97D'],
      });
    }
  }, [isOpen]);

  if (!bookingDetails) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 9998,
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '500px',
              background: 'white',
              borderRadius: '24px',
              padding: '2rem',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              zIndex: 9999,
            }}
          >
            {/* Close Button */}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                background: '#F5F5F5',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <X size={18} />
            </motion.button>

            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 1.5rem',
                background: 'linear-gradient(135deg, #B6F500, #E0C097)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(182, 245, 0, 0.4)',
              }}
            >
              <CheckCircle size={48} color="white" />
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                textAlign: 'center',
                fontSize: '1.75rem',
                fontWeight: 600,
                marginBottom: '0.5rem',
                color: '#2D2D2D',
              }}
            >
              🎉 Booking Request Submitted!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{
                textAlign: 'center',
                color: '#666',
                marginBottom: '2rem',
                fontSize: '0.9375rem',
                lineHeight: '1.6',
              }}
            >
              Thank you for choosing Dream Avenue! We've received your booking request and will contact you shortly to confirm.
            </motion.p>

            {/* Booking Details */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                background: 'linear-gradient(135deg, #FAF9F6, #FFF)',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                border: '2px solid rgba(182, 245, 0, 0.2)',
              }}
            >
              <h3
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#666',
                  marginBottom: '1rem',
                }}
              >
                Booking Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Calendar size={18} style={{ color: '#B6F500' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#999' }}>Date</div>
                    <div style={{ fontWeight: 600 }}>
                      {new Date(bookingDetails.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>

                {bookingDetails.timeSlot && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Clock size={18} style={{ color: '#E0C097' }} />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#999' }}>Time Slot</div>
                      <div style={{ fontWeight: 600 }}>
                        {bookingDetails.timeSlot.charAt(0).toUpperCase() + bookingDetails.timeSlot.slice(1)}
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Users size={18} style={{ color: '#FFD97D' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#999' }}>Guests</div>
                    <div style={{ fontWeight: 600 }}>{bookingDetails.guestCount} people</div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #E0E0E0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Mail size={16} style={{ color: '#666' }} />
                  <span style={{ fontSize: '0.875rem', color: '#666' }}>{bookingDetails.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={16} style={{ color: '#666' }} />
                  <span style={{ fontSize: '0.875rem', color: '#666' }}>{bookingDetails.phone}</span>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{ display: 'flex', gap: '1rem' }}
            >
              <motion.button
                onClick={() => navigate('/')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  flex: 1,
                  padding: '0.875rem 1.5rem',
                  borderRadius: '12px',
                  border: '2px solid #E0E0E0',
                  background: 'white',
                  color: '#2D2D2D',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <Home size={18} />
                Back to Home
              </motion.button>

              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  flex: 1,
                  padding: '0.875rem 1.5rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #B6F500, #E0C097)',
                  color: '#2D2D2D',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(182, 245, 0, 0.3)',
                  transition: 'all 0.2s ease',
                }}
              >
                Got It!
              </motion.button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
