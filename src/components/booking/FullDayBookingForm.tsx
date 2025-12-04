import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, Users, MessageSquare, Package, Calendar, CheckCircle } from 'lucide-react';
import { CalendarView } from './CalendarView';
import { usePackages } from '../../src/hooks/usePackages';
import { toast } from 'sonner@2.0.3';
import { createBooking } from '../../src/api/createBooking';

interface FullDayBookingFormProps {
  onSuccess?: () => void;
}

export function FullDayBookingForm({ onSuccess }: FullDayBookingFormProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    guestCount: '',
    packageId: '',
    specialNotes: '',
  });

  const { data: packages = [] } = usePackages();

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
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      errors.push('Full name is required (minimum 2 characters)');
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Valid email is required');
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
      // Create booking using centralized function
      await createBooking({
        full_name: formData.fullName.trim(),
        mobile: formData.phone,
        booking_date: selectedDate,
        start_time: '10:00', // Full day: 10:00 AM
        end_time: '18:00',   // Full day: 6:00 PM
        guest_count: parseInt(formData.guestCount),
        package_id: formData.packageId || null,
        special_requests: formData.specialNotes || null,
        email: formData.email || null,
        additional_notes: null,
        user_id: null,
      });

      toast.success('Booking created successfully');

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        guestCount: '',
        packageId: '',
        specialNotes: '',
      });
      setSelectedDate('');

      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create booking');
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
        {/* Left: Calendar */}
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              📅 Select Your Date
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#666' }}>
              Choose a date for your full-day event
            </p>
          </div>
          <CalendarView
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />

          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: '1rem',
                padding: '1rem',
                background: 'linear-gradient(135deg, #B6F50020, #E0C09720)',
                borderRadius: '12px',
                border: '2px solid #B6F500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <CheckCircle size={24} style={{ color: '#B6F500', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>
                  Selected Date
                </div>
                <div style={{ fontWeight: 600 }}>
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
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
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  required
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
                  name="specialNotes"
                  value={formData.specialNotes}
                  onChange={handleInputChange}
                  placeholder="Any special requests or requirements..."
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
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
                  background: 'linear-gradient(135deg, #B6F500, #E0C097)',
                  color: '#2D2D2D',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 20px rgba(182, 245, 0, 0.3)',
                  opacity: isSubmitting ? 0.7 : 1,
                  transition: 'all 0.3s ease',
                }}
              >
                {isSubmitting ? 'Submitting...' : '📨 Submit Full Day Booking'}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}