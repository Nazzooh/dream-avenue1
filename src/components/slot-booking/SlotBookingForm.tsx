import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, Users, MessageSquare, Calendar as CalendarIcon, Send } from 'lucide-react';
import { CalendarView } from '../booking/CalendarView';
import { SlotSelectorGrid, SLOT_OPTIONS } from './SlotSelectorGrid';
import { DynamicPriceCard } from './DynamicPriceCard';
import { useCreateBooking } from '../../src/hooks/useBookings';
import { toast } from 'sonner@2.0.3';
import { buildBookingPayload } from '../../src/utils/bookingPayload';

interface SlotBookingFormProps {
  packageData: {
    id: string;
    name: string;
    price: number;
  };
  onSuccess?: () => void;
}

export function SlotBookingForm({ packageData, onSuccess }: SlotBookingFormProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('full_day');
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    guestCount: '',
    specialRequests: '', // renamed from message to match backend
  });

  const createMutation = useCreateBooking();

  // Get selected slot details
  const selectedSlotData = SLOT_OPTIONS.find((s) => s.key === selectedSlot);

  // Handle mobile number - auto-add +91
  const handleMobileChange = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // If starts with 91, remove it (we'll add +91 ourselves)
    let cleanDigits = digits.startsWith('91') ? digits.slice(2) : digits;
    
    // Limit to 10 digits
    cleanDigits = cleanDigits.slice(0, 10);
    
    setFormData((prev) => ({ ...prev, mobile: cleanDigits }));
  };

  const getFormattedMobile = () => {
    if (!formData.mobile) return '';
    return `+91 ${formData.mobile}`;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'mobile') {
      handleMobileChange(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
    if (!formData.mobile || formData.mobile.length !== 10) {
      errors.push('Valid 10-digit mobile number is required');
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Please enter a valid email or leave it blank');
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

    try {
      // Use utility to build payload with proper validation
      const payload = buildBookingPayload({
        full_name: formData.fullName,
        mobile: getFormattedMobile(),
        booking_date: selectedDate,
        slot: selectedSlot, // Will be converted to start_time/end_time
        guest_count: parseInt(formData.guestCount),
        package_id: packageData.id,
        special_requests: formData.specialRequests || undefined,
        additional_notes: `Slot Booking - ${selectedSlotData?.label}${formData.email ? ` - Email: ${formData.email}` : ''}`,
      });

      await createMutation.mutateAsync(payload);

      toast.success('Booking Request Submitted!', {
        description: `We'll contact you at ${getFormattedMobile()} to confirm your ${selectedSlotData?.label} booking.`,
        duration: 5000,
      });

      // Reset form
      setFormData({
        fullName: '',
        mobile: '',
        email: '',
        guestCount: '',
        specialRequests: '',
      });
      setSelectedDate('');
      setSelectedSlot('full_day');

      onSuccess?.();
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error.message || 'Failed to create booking. Please try again.');
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
    <>
      <style>{`
        /* Responsive centering for calendar and price card */
        @media (max-width: 768px) {
          .calendar-centered-container,
          .price-card-centered-container {
            padding: 0 !important;
          }
          
          .calendar-centered-container > div,
          .price-card-centered-container > div {
            max-width: 100% !important;
          }
        }
        
        @media (min-width: 769px) {
          .calendar-centered-container,
          .price-card-centered-container {
            padding: 0 1rem;
          }
        }
      `}</style>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Personal Details */}
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            }}
          >
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              Your Details
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
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

            {/* Mobile Number */}
            <div>
              <label style={labelStyle}>
                <Phone size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Mobile Number *
              </label>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '0.9375rem',
                    color: '#666',
                    pointerEvents: 'none',
                  }}
                >
                  +91
                </div>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="XXXXX XXXXX"
                  required
                  maxLength={10}
                  style={{ ...inputStyle, paddingLeft: '3.5rem' }}
                />
              </div>
              <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>
                10-digit mobile number
              </div>
            </div>

            {/* Email (Optional) */}
            <div>
              <label style={labelStyle}>
                <Mail size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Email (Optional)
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

            {/* Guest Count */}
            <div>
              <label style={labelStyle}>
                <Users size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Expected Guest Count *
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
          </div>
        </div>

        {/* Date Picker */}
        <div
          className="calendar-centered-container"
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <div style={{ width: '100%', maxWidth: '600px' }}>
            <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                <CalendarIcon size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Select Your Date
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>
                Choose an available date for your event
              </p>
            </div>
            <CalendarView selectedDate={selectedDate} onDateSelect={setSelectedDate} />
          </div>
        </div>

        {/* Time Slot Selector */}
        <div>
          <SlotSelectorGrid
            selectedSlot={selectedSlot}
            onSlotChange={setSelectedSlot}
            basePrice={packageData.price}
          />
        </div>

        {/* Dynamic Price Summary */}
        <div
          className="price-card-centered-container"
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <div style={{ width: '100%', maxWidth: '600px' }}>
            <DynamicPriceCard
              basePrice={packageData.price}
              discount={selectedSlotData?.discount || 0}
              selectedSlot={selectedSlot}
            />
          </div>
        </div>

        {/* Message/Notes */}
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          }}
        >
          <label style={labelStyle}>
            <MessageSquare size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Special Requirements / Notes (Optional)
          </label>
          <textarea
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleInputChange}
            placeholder="Any special requests, dietary requirements, or additional information..."
            rows={4}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={createMutation.isPending}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%',
            padding: '1.25rem',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #B6F500, #E0C097)',
            color: '#2D2D2D',
            fontWeight: 600,
            fontSize: '1.125rem',
            cursor: createMutation.isPending ? 'not-allowed' : 'pointer',
            boxShadow: '0 8px 24px rgba(182, 245, 0, 0.4)',
            opacity: createMutation.isPending ? 0.7 : 1,
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
          }}
        >
          {createMutation.isPending ? (
            'Submitting...'
          ) : (
            <>
              <Send size={20} />
              Confirm Booking Request
            </>
          )}
        </motion.button>
      </div>
    </form>
    </>
  );
}