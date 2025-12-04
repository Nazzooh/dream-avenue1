import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useCreateManualBooking } from '../../src/hooks/useCalendar';
import { usePackages } from '../../src/hooks/usePackages';

interface AdminManualBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedDate: string;
}

export function AdminManualBookingModal({ isOpen, onClose, preselectedDate }: AdminManualBookingModalProps) {
  const { data: packages = [] } = usePackages();
  const createBookingMutation = useCreateManualBooking();

  const [formData, setFormData] = useState({
    full_name: '',
    mobile: '',
    email: '',
    guest_count: '',
    event_type: 'wedding',
    package_id: '',
    special_requests: '',
    additional_notes: '',
    time_slot: 'full_day',
    start_time: '',
    end_time: '',
  });

  const timeSlots = [
    { value: 'morning', label: 'Morning (10:00 - 14:00)' },
    { value: 'evening', label: 'Evening (14:00 - 18:00)' },
    { value: 'night', label: 'Night (18:00 - 22:00)' },
    { value: 'full_day', label: 'Full Day (10:00 - 18:00)' },
    { value: 'short_duration', label: 'Short Duration (Custom Times)' },
  ];

  const eventTypes = [
    { value: 'wedding', label: 'Wedding' },
    { value: 'birthday', label: 'Birthday' },
    { value: 'conference', label: 'Conference' },
    { value: 'corporate', label: 'Corporate Event' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name || !formData.mobile) {
      toast.error('Please fill in required fields (Name and Mobile)');
      return;
    }

    try {
      const payload: any = {
        full_name: formData.full_name,
        mobile: formData.mobile,
        email: formData.email || undefined,
        guest_count: formData.guest_count ? parseInt(formData.guest_count) : undefined,
        event_type: formData.event_type,
        package_id: formData.package_id || undefined,
        special_requests: formData.special_requests || undefined,
        additional_notes: formData.additional_notes || undefined,
        time_slot: formData.time_slot,
        booking_date: preselectedDate,
        status: 'confirmed',
      };

      // Only send start/end times for short_duration
      if (formData.time_slot === 'short_duration') {
        if (!formData.start_time || !formData.end_time) {
          toast.error('Please specify start and end times for short duration');
          return;
        }
        payload.start_time = formData.start_time;
        payload.end_time = formData.end_time;
      }

      await createBookingMutation.mutateAsync(payload);
      toast.success('Manual booking created successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create booking');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 70,
          padding: '16px',
          overflowY: 'auto',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          style={{
            background: 'linear-gradient(135deg, #FAFAF7, #FFFFFF)',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '600px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.25rem', fontWeight: '600', color: '#2A2A2A' }}>
                Create Manual Booking
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#666666', marginTop: '4px' }}>
                Date: {new Date(preselectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                border: '1px solid #E6E6E6',
                background: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <X size={20} color="#666666" />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Full Name */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '600', color: '#2A2A2A' }}>
                Full Name <span style={{ color: '#FF6B6B' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #E6E6E6',
                  fontSize: '0.875rem',
                  fontFamily: 'Poppins, sans-serif',
                }}
              />
            </div>

            {/* Mobile */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '600', color: '#2A2A2A' }}>
                Mobile <span style={{ color: '#FF6B6B' }}>*</span>
              </label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #E6E6E6',
                  fontSize: '0.875rem',
                  fontFamily: 'Poppins, sans-serif',
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '600', color: '#2A2A2A' }}>
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #E6E6E6',
                  fontSize: '0.875rem',
                  fontFamily: 'Poppins, sans-serif',
                }}
              />
            </div>

            {/* Guest Count */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '600', color: '#2A2A2A' }}>
                Guest Count
              </label>
              <input
                type="number"
                value={formData.guest_count}
                onChange={(e) => setFormData({ ...formData, guest_count: e.target.value })}
                min="0"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #E6E6E6',
                  fontSize: '0.875rem',
                  fontFamily: 'Poppins, sans-serif',
                }}
              />
            </div>

            {/* Event Type */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '600', color: '#2A2A2A' }}>
                Event Type
              </label>
              <select
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #E6E6E6',
                  fontSize: '0.875rem',
                  fontFamily: 'Poppins, sans-serif',
                  cursor: 'pointer',
                }}
              >
                {eventTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Package */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '600', color: '#2A2A2A' }}>
                Package
              </label>
              <select
                value={formData.package_id}
                onChange={(e) => setFormData({ ...formData, package_id: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #E6E6E6',
                  fontSize: '0.875rem',
                  fontFamily: 'Poppins, sans-serif',
                  cursor: 'pointer',
                }}
              >
                <option value="">No Package</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Slot */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '600', color: '#2A2A2A' }}>
                Time Slot
              </label>
              <select
                value={formData.time_slot}
                onChange={(e) => setFormData({ ...formData, time_slot: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #E6E6E6',
                  fontSize: '0.875rem',
                  fontFamily: 'Poppins, sans-serif',
                  cursor: 'pointer',
                }}
              >
                {timeSlots.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Start/End Times for Short Duration */}
            {formData.time_slot === 'short_duration' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '600', color: '#2A2A2A' }}>
                    Start Time <span style={{ color: '#FF6B6B' }}>*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid #E6E6E6',
                      fontSize: '0.875rem',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '600', color: '#2A2A2A' }}>
                    End Time <span style={{ color: '#FF6B6B' }}>*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid #E6E6E6',
                      fontSize: '0.875rem',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Special Requests */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '600', color: '#2A2A2A' }}>
                Special Requests
              </label>
              <textarea
                value={formData.special_requests}
                onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #E6E6E6',
                  fontSize: '0.875rem',
                  fontFamily: 'Poppins, sans-serif',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Additional Notes */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '600', color: '#2A2A2A' }}>
                Additional Notes
              </label>
              <textarea
                value={formData.additional_notes}
                onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
                rows={2}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #E6E6E6',
                  fontSize: '0.875rem',
                  fontFamily: 'Poppins, sans-serif',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #E6E6E6',
                  background: '#FFFFFF',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createBookingMutation.isPending}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #B6F500, #A4DD00)',
                  color: '#2A2A2A',
                  cursor: createBookingMutation.isPending ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontFamily: 'Poppins, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {createBookingMutation.isPending ? (
                  <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block' }}>
                    <Save size={16} />
                  </motion.div>
                ) : (
                  <Save size={16} />
                )}
                Create Booking
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}