import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, Users, MessageSquare, Package, Calendar, Clock, CheckCircle } from 'lucide-react';
import { CalendarView } from './CalendarView';
import { TimeSlotSelector, TimeSlot } from './TimeSlotSelector';
import { usePackages } from '../../src/hooks/usePackages';
import { toast } from 'sonner@2.0.3';
import { buildPublicBookingPayload } from '../../src/lib/api/bookings';
import { supabase } from '../../utils/supabase/client';

interface DurationBookingFormProps {
  onSuccess?: () => void;
}

export function DurationBookingForm({ onSuccess }: DurationBookingFormProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot>();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    guestCount: '',
    packageId: '',
    specialRequests: '', // renamed from specialNotes to match backend
  });

  const { data: packages = [] } = usePackages();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const errors: string[] = [];

    if (!selectedDate) {
      errors.push('Please select a booking date');
    }
    if (!selectedTimeSlot) {
      errors.push('Please select a time slot');
    }
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      errors.push('Full name is required (minimum 2 characters)');
    }
    if (!formData.phone || formData.phone.trim().length < 10) {
      errors.push('Valid phone number is required (minimum 10 digits)');
    }
    if (!formData.guestCount || parseInt(formData.guestCount) < 1) {
      errors.push('Guest count is required (minimum 1 guest)');
    }

    if (errors.length > 0) {
      toast.error('Please complete all required fields:', {
        description: errors.join(', '),
        duration: 5000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Build normalized payload using centralized function
      const payload = buildPublicBookingPayload({
        full_name: formData.fullName,
        mobile: formData.phone,
        booking_date: selectedDate,
        time_slot: selectedTimeSlot,  // Will be converted to start/end times
        guest_count: parseInt(formData.guestCount),
        package_id: formData.packageId || null,
        special_requests: formData.specialRequests || null,
        email: formData.email || null,
        additional_notes: `Duration Booking - ${selectedTimeSlot} slot`,
      });

      console.log('Create booking payload', payload);

      const { data, error } = await supabase.from('bookings').insert([payload]).select().single();

      if (error) {
        throw error;
      }

      toast.success('Duration Booking Submitted!', {
        description: 'We will contact you shortly to confirm your booking.',
      });

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        guestCount: '',
        packageId: '',
        specialRequests: '',
      });
      setSelectedDate('');
      setSelectedTimeSlot(undefined);

      onSuccess?.();
    } catch (error: any) {
      console.error('Booking error:', error);
      // Display raw backend error message
      toast.error('Booking Failed', {
        description: error.message || 'Failed to create booking. Please try again.',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1rem',
    borderRadius: '10px',
    border: '2px solid #E0E0E0',
    fontSize: '0.9375rem',
    transition: 'all 0.3s ease',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#2D2D2D',
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
        }}
      >
        {/* Left: Calendar & Time Slots */}
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              📅 Select Date & Time
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#666' }}>
              Choose a date and specific time slot for your event
            </p>
          </div>

          {/* Calendar */}
          <CalendarView
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />

          {/* Time Slot Selector */}
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: '1.5rem' }}
            >
              <div style={{ marginBottom: '1rem' }}>
                <Clock size={20} style={{ display: 'inline', marginRight: '0.5rem', color: '#E0C097' }} />
                <span style={{ fontWeight: 600 }}>Select Time Slot</span>
              </div>
              <TimeSlotSelector
                selectedSlot={selectedTimeSlot}
                onSelect={setSelectedTimeSlot}
              />
            </motion.div>
          )}

          {/* Selection Summary */}
          {selectedDate && selectedTimeSlot && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: '1rem',
                padding: '1rem',
                background: 'linear-gradient(135deg, #E0C09720, #B6F50020)',
                borderRadius: '12px',
                border: '2px solid #E0C097',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <CheckCircle size={24} style={{ color: '#E0C097', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>
                    Booking Summary
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666', marginLeft: '2.25rem' }}>
                {selectedTimeSlot.charAt(0).toUpperCase() + selectedTimeSlot.slice(1)} Slot
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: Form */}
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              👤 Your Details
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#666' }}>
              Fill in your information to complete the booking
            </p>
          </div>

          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Full Name */}
              <div>
                <label style={labelStyle}>
                  <User size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                  style={inputStyle}
                />
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>
                  <Mail size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  style={inputStyle}
                />
              </div>

              {/* Phone */}
              <div>
                <label style={labelStyle}>
                  <Phone size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 XXXXX XXXXX"
                  required
                  style={inputStyle}
                />
              </div>

              {/* Guest Count */}
              <div>
                <label style={labelStyle}>
                  <Users size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Number of Guests *
                </label>
                <input
                  type="number"
                  name="guestCount"
                  value={formData.guestCount}
                  onChange={handleInputChange}
                  placeholder="Enter number of guests"
                  min="1"
                  required
                  style={inputStyle}
                />
              </div>

              {/* Package Selection */}
              <div>
                <label style={labelStyle}>
                  <Package size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Select Package (Optional)
                </label>
                <select
                  name="packageId"
                  value={formData.packageId}
                  onChange={handleInputChange}
                  style={inputStyle}
                >
                  <option value="">No package selected</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Special Notes */}
              <div>
                <label style={labelStyle}>
                  <MessageSquare size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Special Requirements (Optional)
                </label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  placeholder="Any special requests or requirements..."
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
                <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>
                  Note: Event type will be set by admin after review
                </p>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #E0C097, #B6F500)',
                  color: '#2D2D2D',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 20px rgba(224, 192, 151, 0.3)',
                  opacity: isSubmitting ? 0.7 : 1,
                  transition: 'all 0.3s ease',
                }}
              >
                {isSubmitting ? 'Submitting...' : '📨 Submit Duration Booking'}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}