import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Lock } from 'lucide-react';
import { format } from 'date-fns';

interface DateActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onAddBooking: () => void;
  onBlockDate: () => void;
}

export function DateActionModal({ isOpen, onClose, selectedDate, onAddBooking, onBlockDate }: DateActionModalProps) {
  if (!isOpen) return null;

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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'calc(10calc(100% - 2rem) - 2rem)',
              maxWidth: '400px',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              zIndex: 9999,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #C8D46B, #E0C097)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#2A2A2A', margin: 0 }}>
                  Actions for
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#4A4A4A', margin: '0.25rem 0 0' }}>
                  {format(selectedDate, 'MMMM d, yyyy')}
                </p>
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.9)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </motion.button>
            </div>

            {/* Action Buttons */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <motion.button
                onClick={() => {
                  onAddBooking();
                  onClose();
                }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: '2px solid #C8D46B',
                  background: 'linear-gradient(135deg, rgba(200, 212, 107, 0.1), rgba(224, 192, 151, 0.1))',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #C8D46B, #E0C097)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Plus size={24} color="white" />
                </div>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: '#2A2A2A', marginBottom: '0.25rem' }}>
                    Add Booking
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#666' }}>
                    Create a new confirmed booking for this date
                  </div>
                </div>
              </motion.button>

              <motion.button
                onClick={() => {
                  onBlockDate();
                  onClose();
                }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: '2px solid #FF6B6B',
                  background: 'rgba(255, 107, 107, 0.05)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Lock size={24} color="white" />
                </div>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: '#2A2A2A', marginBottom: '0.25rem' }}>
                    Block Date
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#666' }}>
                    Mark this date as unavailable for bookings
                  </div>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}