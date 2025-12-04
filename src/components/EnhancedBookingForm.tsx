import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, Mail, Phone, Users, MessageSquare, Calendar as CalendarIcon,
  Check, AlertCircle, Loader2, Sparkles, Info, Briefcase, Droplets, Flame, Trash2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { InlineSpinner } from './LoadingFallback';

interface EnhancedBookingFormProps {
  selectedDate: string;
  selectedSlot: string | null;
  selectedPackageId: string | null;
  selectedPackageName?: string;
  onContinue: (formData: BookingFormData) => void;
  isLoading?: boolean;
}

export interface BookingFormData {
  fullName: string;
  mobile: string;
  guestCount: string;
  message: string;
  packageId: string | null;
  eventType: string;  // Added event type field
}

interface FieldValidation {
  isValid: boolean;
  message: string;
}

export function EnhancedBookingForm({
  selectedDate,
  selectedSlot,
  selectedPackageId,
  selectedPackageName,
  onContinue,
  isLoading = false,
}: EnhancedBookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    fullName: '',
    mobile: '',
    guestCount: '',
    message: '',
    packageId: null,
    eventType: '',  // Initialize event type
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [validations, setValidations] = useState<Record<string, FieldValidation>>({});

  // Real-time validation
  useEffect(() => {
    const newValidations: Record<string, FieldValidation> = {};

    // Full Name validation
    if (touched.fullName) {
      const name = formData.fullName.trim();
      if (!name) {
        newValidations.fullName = { isValid: false, message: 'Name is required' };
      } else if (name.length < 2) {
        newValidations.fullName = { isValid: false, message: 'Name too short' };
      } else if (!/^[a-zA-Z\s]+$/.test(name)) {
        newValidations.fullName = { isValid: false, message: 'Only letters allowed' };
      } else {
        newValidations.fullName = { isValid: true, message: 'Looks good!' };
      }
    }

    // Mobile validation
    if (touched.mobile) {
      const mobile = formData.mobile;
      if (!mobile) {
        newValidations.mobile = { isValid: false, message: 'Mobile number is required' };
      } else if (mobile.length < 10) {
        newValidations.mobile = { isValid: false, message: `${10 - mobile.length} more digits needed` };
      } else if (mobile.length === 10) {
        newValidations.mobile = { isValid: true, message: 'Valid mobile number' };
      } else {
        newValidations.mobile = { isValid: false, message: 'Max 10 digits' };
      }
    }

    // Guest Count validation
    if (touched.guestCount) {
      const count = parseInt(formData.guestCount);
      if (!formData.guestCount) {
        newValidations.guestCount = { isValid: false, message: 'Guest count required' };
      } else if (isNaN(count) || count < 1) {
        newValidations.guestCount = { isValid: false, message: 'Must be at least 1' };
      } else if (count > 1000) {
        newValidations.guestCount = { isValid: false, message: 'Please contact us for large events' };
      } else {
        newValidations.guestCount = { isValid: true, message: `${count} guest${count !== 1 ? 's' : ''}` };
      }
    }

    setValidations(newValidations);
  }, [formData, touched]);

  const handleMobileChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    let cleanDigits = digits.startsWith('91') ? digits.slice(2) : digits;
    cleanDigits = cleanDigits.slice(0, 10);
    setFormData((prev) => ({ ...prev, mobile: cleanDigits }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'mobile') {
      handleMobileChange(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      fullName: true,
      mobile: true,
      guestCount: true,
    });

    // Validate all fields
    const errors: string[] = [];

    if (!selectedPackageId) {
      errors.push('Please select a package first');
    }
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      errors.push('Valid name required');
    }
    if (!formData.mobile || formData.mobile.length !== 10) {
      errors.push('Valid 10-digit mobile number required');
    }
    if (!formData.guestCount || parseInt(formData.guestCount) < 1) {
      errors.push('Valid guest count required');
    }
    if (!formData.eventType) {
      errors.push('Event type is required');
    }

    if (errors.length > 0) {
      toast.error('Please complete all required fields', {
        description: errors.join(' • '),
        duration: 5000,
      });
      return;
    }

    onContinue({ ...formData, packageId: selectedPackageId });
  };

  const getFieldStyle = (field: string) => {
    if (!touched[field]) return {};
    const validation = validations[field];
    if (!validation) return {};

    return {
      borderColor: validation.isValid ? '#10b981' : '#ef4444',
      borderWidth: '2px',
    };
  };

  const getFormattedMobile = () => {
    if (!formData.mobile) return '';
    return `+91 ${formData.mobile}`;
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        padding: '2.5rem',
        border: '1px solid rgba(224, 192, 151, 0.3)',
        boxShadow: '0 12px 48px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <motion.h3
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            fontSize: '1.875rem',
            fontWeight: 700,
            color: '#343A40',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            letterSpacing: '-0.01em',
          }}
        >
          <Sparkles size={28} style={{ color: '#C8D46B' }} />
          Your Details
        </motion.h3>
        <p style={{ color: '#6c757d', fontSize: '0.9375rem', lineHeight: '1.5' }}>
          Fill in your information to continue with the booking
        </p>
        {selectedPackageName && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              marginTop: '1.25rem',
              padding: '1rem 1.25rem',
              background: 'linear-gradient(135deg, rgba(200, 212, 107, 0.15), rgba(224, 192, 151, 0.15))',
              borderRadius: '12px',
              borderLeft: '4px solid #C8D46B',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <Info size={20} style={{ color: '#C8D46B', flexShrink: 0 }} />
            <span style={{ fontSize: '0.9375rem', color: '#343A40' }}>
              Selected Package: <strong>{selectedPackageName}</strong>
            </span>
          </motion.div>
        )}
      </div>

      <div style={{ display: 'grid', gap: '1.75rem' }}>
        {/* Full Name */}
        <FormField
          icon={<User size={20} />}
          label="Full Name"
          required
          value={formData.fullName}
          name="fullName"
          placeholder="Enter your full name"
          onChange={handleInputChange}
          onBlur={() => handleBlur('fullName')}
          style={getFieldStyle('fullName')}
          validation={validations.fullName}
          touched={touched.fullName}
        />

        {/* Mobile Number */}
        <FormField
          icon={<Phone size={20} />}
          label="Mobile Number"
          required
          value={formData.mobile}
          name="mobile"
          placeholder="10-digit mobile number"
          type="tel"
          onChange={handleInputChange}
          onBlur={() => handleBlur('mobile')}
          style={getFieldStyle('mobile')}
          validation={validations.mobile}
          touched={touched.mobile}
          helperText={formData.mobile ? getFormattedMobile() : 'Will be formatted as +91 XXXXXXXXXX'}
        />

        {/* Guest Count */}
        <FormField
          icon={<Users size={20} />}
          label="Number of Guests"
          required
          value={formData.guestCount}
          name="guestCount"
          type="number"
          placeholder="Expected number of guests"
          onChange={handleInputChange}
          onBlur={() => handleBlur('guestCount')}
          style={getFieldStyle('guestCount')}
          validation={validations.guestCount}
          touched={touched.guestCount}
        />

        {/* Event Type */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: '#343A40' }}>
            <Briefcase size={20} style={{ color: '#E0C097' }} />
            Event Type
            <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select
            name="eventType"
            value={formData.eventType}
            onChange={(e) => setFormData((prev) => ({ ...prev, eventType: e.target.value }))}
            required
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              border: '2px solid #E0E0E0',
              borderRadius: '12px',
              fontSize: '0.9375rem',
              fontFamily: 'inherit',
              transition: 'all 0.3s ease',
              background: 'white',
              color: '#343A40',
              cursor: 'pointer',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#C8D46B';
              e.target.style.boxShadow = '0 0 0 4px rgba(200, 212, 107, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#E0E0E0';
              e.target.style.boxShadow = 'none';
            }}
          >
            <option value="">Select Event Type</option>
            <option value="birthday">Birthday</option>
            <option value="get_together">Get Together</option>
            <option value="meeting_conference">Meeting / Conference</option>
            <option value="awareness_class">Awareness Class</option>
            <option value="normal">Wedding/Reception</option>
          </select>
        </div>

        {/* Special Requests */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: '#343A40' }}>
            <MessageSquare size={20} style={{ color: '#E0C097' }} />
            Special Requests
            <span style={{ color: '#6c757d', fontWeight: 400 }}>(Optional)</span>
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Any special requirements or questions?"
            rows={4}
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              border: '2px solid #E0E0E0',
              borderRadius: '12px',
              fontSize: '0.9375rem',
              fontFamily: 'inherit',
              resize: 'vertical',
              transition: 'all 0.3s ease',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#C8D46B';
              e.target.style.boxShadow = '0 0 0 4px rgba(200, 212, 107, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#E0E0E0';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Additional Services Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            padding: '1.75rem',
            background: 'linear-gradient(135deg, rgba(200, 212, 107, 0.08), rgba(224, 192, 151, 0.08))',
            borderRadius: '16px',
            border: '2px solid rgba(200, 212, 107, 0.2)',
          }}
        >
          <h4 style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: '#343A40',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <Sparkles size={20} style={{ color: '#C8D46B' }} />
            Included Services & Policies
          </h4>

          {/* Floor Cleaning - Mandatory */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, rgba(200, 212, 107, 0.15), rgba(224, 192, 151, 0.15))',
            borderRadius: '12px',
            border: '2px solid #C8D46B',
            marginBottom: '1rem',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #C8D46B, #B6F500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Droplets size={22} style={{ color: '#343A40' }} />
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '1rem', color: '#343A40', fontWeight: 700, display: 'block' }}>
                Floor Cleaning Service
              </span>
              <div style={{ fontSize: '0.8125rem', color: '#666', marginTop: '2px' }}>
                Mandatory • Included in all bookings
              </div>
            </div>
            <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#343A40' }}>
              ₹3,000
            </span>
          </div>

          {/* Additional Services Info */}
          <div style={{
            padding: '1rem 1.25rem',
            background: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '12px',
            border: '1px solid rgba(200, 212, 107, 0.2)',
          }}>
            <h5 style={{
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: '#343A40',
              marginBottom: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <Info size={18} style={{ color: '#C8D46B' }} />
              Additional Services & Policies
            </h5>

            {/* Custom bullet points list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Cooking Gas & Garbage */}
              <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'start' }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #C8D46B, #B6F500)',
                  marginTop: '6px',
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: '0.875rem', color: '#343A40', lineHeight: '1.6' }}>
                  <strong style={{ color: '#343A40' }}>Post-Event Services:</strong> Cooking gas and garbage disposal can be added after your event based on actual usage.
                </span>
              </div>

              {/* Eco-Friendly Policy */}
              <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'start' }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #C8D46B, #B6F500)',
                  marginTop: '6px',
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: '0.875rem', color: '#343A40', lineHeight: '1.6' }}>
                  <strong style={{ color: '#343A40' }}>Eco-Friendly Policy:</strong> We strictly prohibit the use of plastic products (glasses, plates, etc.) to maintain our green venue standards.
                </span>
              </div>

              {/* Plate Rental Options */}
              <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'start' }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #C8D46B, #B6F500)',
                  marginTop: '6px',
                  flexShrink: 0,
                }} />
                <div style={{ fontSize: '0.875rem', color: '#343A40', lineHeight: '1.6', flex: 1 }}>
                  <strong style={{ color: '#343A40' }}>Eco-Friendly Plates Available:</strong> We provide sustainable plates for rent:
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    marginTop: '0.5rem',
                    marginLeft: '1rem',
                  }}>
                    <span style={{
                      padding: '0.375rem 0.75rem',
                      background: 'rgba(200, 212, 107, 0.15)',
                      borderRadius: '6px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      border: '1px solid rgba(200, 212, 107, 0.3)',
                      width: 'fit-content',
                    }}>
                      Large • ₹3.50/plate
                    </span>
                    <span style={{
                      padding: '0.375rem 0.75rem',
                      background: 'rgba(200, 212, 107, 0.15)',
                      borderRadius: '6px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      border: '1px solid rgba(200, 212, 107, 0.3)',
                      width: 'fit-content',
                    }}>
                      Small • ₹2.50/plate
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={!isLoading ? { scale: 1.02, y: -2 } : {}}
          whileTap={!isLoading ? { scale: 0.98 } : {}}
          style={{
            width: '100%',
            padding: '1rem',
            background: isLoading 
              ? 'linear-gradient(135deg, #9CA3AF, #6B7280)' 
              : 'linear-gradient(135deg, #B6F500, #C8D46B)',
            color: '#343A40',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1.0625rem',
            fontWeight: 700,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            boxShadow: isLoading ? 'none' : '0 4px 16px rgba(182, 245, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginTop: '0.5rem',
            transition: 'all 0.3s ease',
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>Continue to Date & Slot Selection</span>
              <Check size={20} />
            </>
          )}
        </motion.button>
      </div>
    </motion.form>
  );
}

interface FormFieldProps {
  icon: React.ReactNode;
  label: string;
  required: boolean;
  value: string;
  name: string;
  type?: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  style?: React.CSSProperties;
  validation?: FieldValidation;
  touched?: boolean;
  helperText?: string;
}

function FormField({
  icon,
  label,
  required,
  value,
  name,
  type = 'text',
  placeholder,
  onChange,
  onBlur,
  style = {},
  validation,
  touched,
  helperText,
}: FormFieldProps) {
  const showValidation = touched && validation;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: '#343A40' }}>
        <span style={{ color: '#E0C097' }}>{icon}</span>
        {label}
        {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>

      <div style={{ position: 'relative' }}>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '0.875rem 1rem',
            paddingRight: showValidation ? '3rem' : '1rem',
            border: '2px solid #E0E0E0',
            borderRadius: '12px',
            fontSize: '0.9375rem',
            transition: 'all 0.3s ease',
            ...style,
          }}
          onFocus={(e) => {
            if (!style.borderColor) {
              e.target.style.borderColor = '#C8D46B';
              e.target.style.boxShadow = '0 0 0 4px rgba(200, 212, 107, 0.1)';
            }
          }}
          onBlur={(e) => {
            onBlur();
            if (!style.borderColor) {
              e.target.style.borderColor = '#E0E0E0';
              e.target.style.boxShadow = 'none';
            }
          }}
        />

        {/* Validation Icon */}
        <AnimatePresence>
          {showValidation && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              {validation.isValid ? (
                <Check size={20} style={{ color: '#10b981' }} />
              ) : (
                <AlertCircle size={20} style={{ color: '#ef4444' }} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Validation Message / Helper Text */}
      <AnimatePresence mode="wait">
        {showValidation && validation.message && (
          <motion.p
            key={validation.message}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              marginTop: '0.5rem',
              fontSize: '0.8125rem',
              color: validation.isValid ? '#10b981' : '#ef4444',
              fontWeight: 500,
            }}
          >
            {validation.message}
          </motion.p>
        )}
        {!showValidation && helperText && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              marginTop: '0.5rem',
              fontSize: '0.8125rem',
              color: '#6c757d',
            }}
          >
            {helperText}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Add spin animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);