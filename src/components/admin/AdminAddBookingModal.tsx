import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, User, Phone, Mail, Users, Calendar, Clock, 
  Package, FileText, DollarSign, Trash2, Plus, Check, Loader2 
} from 'lucide-react';
import { usePackages } from '../../src/hooks/usePackages';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../../utils/supabase/client';

interface AdminAddBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD format
  onSuccess?: () => void;
}

interface TimeSlotOption {
  value: string;
  label: string;
  startTime: string | null;
  endTime: string | null;
}

const TIME_SLOT_OPTIONS: TimeSlotOption[] = [
  { value: 'morning', label: 'Morning (10:00 - 14:00)', startTime: '10:00', endTime: '14:00' },
  { value: 'evening', label: 'Evening (14:00 - 18:00)', startTime: '14:00', endTime: '18:00' },
  { value: 'night', label: 'Night (18:00 - 22:00)', startTime: '18:00', endTime: '22:00' },
  { value: 'full_day', label: 'Full Day (10:00 - 18:00)', startTime: '10:00', endTime: '18:00' },
  { value: 'short_duration', label: 'Short Duration (4-5 hours)', startTime: '10:00', endTime: '18:00' },
  { value: 'custom', label: 'Custom Times', startTime: null, endTime: null },
];

const EVENT_TYPE_OPTIONS = [
  { value: 'birthday', label: '🎂 Birthday' },
  { value: 'meeting_conference', label: ' Meeting/Conference' },
  { value: 'get_together', label: '🎉 Get Together' },
  { value: 'awareness_class', label: '📚 Awareness Class' },
  { value: 'normal', label: '📅 Normal Event' },
  { value: 'special', label: '✨ Special Event' },
];

const FLOOR_CLEANING_COST = 3000;
const GARBAGE_BAG_COST = 250;
const PLATE_SMALL_COST = 2.5;
const PLATE_LARGE_COST = 3.5;
const COOKING_GAS_COST = 150;

export function AdminAddBookingModal({ isOpen, onClose, selectedDate, onSuccess }: AdminAddBookingModalProps) {
  const { data: packages = [] } = usePackages();
  
  // Customer Info
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [guestCount, setGuestCount] = useState<number>(50);
  
  // Event Info
  const [eventType, setEventType] = useState('normal');
  const [specialRequests, setSpecialRequests] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  // Package Selection
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  
  // Time Selection
  const [timeSlot, setTimeSlot] = useState<string>('full_day');
  const [startTime, setStartTime] = useState<string>('10:00');
  const [endTime, setEndTime] = useState<string>('18:00');
  
  // Pricing
  const [garbageBags, setGarbageBags] = useState<number>(0);
  const [platesSmall, setPlatesSmall] = useState<number>(0);
  const [platesLarge, setPlatesLarge] = useState<number>(0);
  const [cookingGasQty, setCookingGasQty] = useState<number>(0);
  const [adminPriceAdjustment, setAdminPriceAdjustment] = useState<number>(0);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill times when slot changes
  useEffect(() => {
    const slot = TIME_SLOT_OPTIONS.find(s => s.value === timeSlot);
    if (slot && slot.startTime && slot.endTime) {
      setStartTime(slot.startTime);
      setEndTime(slot.endTime);
    }
  }, [timeSlot]);

  // Calculate pricing
  const selectedPackage = packages.find(p => p.id === selectedPackageId);
  const basePrice = selectedPackage?.price || 0;
  
  const garbageCost = garbageBags * GARBAGE_BAG_COST;
  const platesCost = (platesSmall * PLATE_SMALL_COST) + (platesLarge * PLATE_LARGE_COST);
  const cookingGasCost = cookingGasQty * COOKING_GAS_COST;
  const extraServicesTotal = garbageCost + platesCost + cookingGasCost;
  
  const finalPrice = basePrice + FLOOR_CLEANING_COST + extraServicesTotal + adminPriceAdjustment;

  const handleSubmit = async () => {
    // Validation
    if (!fullName.trim()) {
      toast.error('Please enter customer name');
      return;
    }
    if (!mobile.trim()) {
      toast.error('Please enter mobile number');
      return;
    }
    if (!selectedPackageId) {
      toast.error('Please select a package');
      return;
    }
    if (guestCount < 1) {
      toast.error('Guest count must be at least 1');
      return;
    }
    
    // Time validation for custom slot
    if (timeSlot === 'custom') {
      if (!startTime || !endTime) {
        toast.error('Please enter both start and end times');
        return;
      }
      if (startTime >= endTime) {
        toast.error('Start time must be before end time');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Get current admin session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Build payload with proper scalar values
      const payload = {
        p_booking_date: selectedDate,
        p_full_name: fullName.trim(),
        p_mobile: mobile.trim(),
        p_email: email.trim() || null,
        p_event_type: eventType,
        p_guest_count: guestCount,
        p_package_id: selectedPackageId,
        p_time_slot: timeSlot === 'custom' ? 'short_duration' : timeSlot, // Map 'custom' to 'short_duration'
        // Send scalar time values (null for non-short_duration, or actual time strings)
        p_start_time: (timeSlot === 'short_duration' || timeSlot === 'custom') ? startTime : null,
        p_end_time: (timeSlot === 'short_duration' || timeSlot === 'custom') ? endTime : null,
        p_special_requests: specialRequests.trim() || null,
        p_additional_notes: additionalNotes.trim() || null,
        p_garbage_bags: garbageBags,
        p_plates_small: platesSmall,
        p_plates_large: platesLarge,
        p_cooking_gas_qty: cookingGasQty,
        p_admin_price_adjustment: adminPriceAdjustment,
        p_admin_id: session.user.id,
      };

      console.log('📤 FINAL ADMIN CREATE BOOKING RPC PAYLOAD:', payload);

      const { data, error } = await supabase.rpc('admin_create_booking', payload);

      if (error) {
        console.error('❌ RPC Error:', error);
        throw new Error(error.message);
      }

      console.log('✅ Booking created:', data);

      toast.success('Booking created successfully', {
        description: `Booking for ${fullName} on ${selectedDate}`,
      });

      // Reset form
      setFullName('');
      setMobile('');
      setEmail('');
      setGuestCount(50);
      setEventType('normal');
      setSpecialRequests('');
      setAdditionalNotes('');
      setSelectedPackageId('');
      setTimeSlot('full_day');
      setStartTime('10:00');
      setEndTime('18:00');
      setGarbageBags(0);
      setPlatesSmall(0);
      setPlatesLarge(0);
      setCookingGasQty(0);
      setAdminPriceAdjustment(0);

      onClose();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('❌ Create booking error:', error);
      toast.error('Failed to create booking', {
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'calc(100% - 2rem)',
              maxWidth: '900px',
              maxHeight: '90vh',
              background: '#FFFFFF',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              zIndex: 9999,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '1.5rem 2rem',
                background: 'linear-gradient(135deg, #C8D46B, #E0C097)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#2A2A2A', margin: 0 }}>
                  Add New Booking
                </h2>
                <p style={{ fontSize: '0.875rem', color: '#4A4A4A', margin: '0.25rem 0 0' }}>
                  Create booking for {new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.9)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Content - Scrollable */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '2rem' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Customer Info */}
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#2A2A2A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={18} style={{ color: '#C8D46B' }} />
                      Customer Information
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#4A4A4A', marginBottom: '0.5rem' }}>
                          Full Name <span style={{ color: '#FF6B6B' }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter customer name"
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #E0E0E0',
                            borderRadius: '8px',
                            fontSize: '0.9375rem',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#4A4A4A', marginBottom: '0.5rem' }}>
                          Mobile <span style={{ color: '#FF6B6B' }}>*</span>
                        </label>
                        <input
                          type="tel"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="Enter mobile number"
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #E0E0E0',
                            borderRadius: '8px',
                            fontSize: '0.9375rem',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#4A4A4A', marginBottom: '0.5rem' }}>
                          Email (Optional)
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter email address"
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #E0E0E0',
                            borderRadius: '8px',
                            fontSize: '0.9375rem',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#4A4A4A', marginBottom: '0.5rem' }}>
                          Guest Count <span style={{ color: '#FF6B6B' }}>*</span>
                        </label>
                        <input
                          type="number"
                          value={guestCount}
                          onChange={(e) => setGuestCount(parseInt(e.target.value) || 0)}
                          min="1"
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #E0E0E0',
                            borderRadius: '8px',
                            fontSize: '0.9375rem',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Event Info */}
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#2A2A2A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={18} style={{ color: '#E0C097' }} />
                      Event Details
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#4A4A4A', marginBottom: '0.5rem' }}>
                          Event Type
                        </label>
                        <select
                          value={eventType}
                          onChange={(e) => setEventType(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #E0E0E0',
                            borderRadius: '8px',
                            fontSize: '0.9375rem',
                            cursor: 'pointer',
                          }}
                        >
                          {EVENT_TYPE_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#4A4A4A', marginBottom: '0.5rem' }}>
                          Special Requests
                        </label>
                        <textarea
                          value={specialRequests}
                          onChange={(e) => setSpecialRequests(e.target.value)}
                          placeholder="Any special requests from customer..."
                          rows={3}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #E0E0E0',
                            borderRadius: '8px',
                            fontSize: '0.9375rem',
                            resize: 'vertical',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#4A4A4A', marginBottom: '0.5rem' }}>
                          Admin Notes
                        </label>
                        <textarea
                          value={additionalNotes}
                          onChange={(e) => setAdditionalNotes(e.target.value)}
                          placeholder="Internal notes (not visible to customer)..."
                          rows={3}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #E0E0E0',
                            borderRadius: '8px',
                            fontSize: '0.9375rem',
                            resize: 'vertical',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Package Selection */}
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#2A2A2A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Package size={18} style={{ color: '#C8D46B' }} />
                      Package Selection
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {packages.map(pkg => (
                        <motion.div
                          key={pkg.id}
                          onClick={() => setSelectedPackageId(pkg.id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          style={{
                            padding: '1rem',
                            border: selectedPackageId === pkg.id ? '2px solid #C8D46B' : '2px solid #E0E0E0',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: selectedPackageId === pkg.id ? 'rgba(200, 212, 107, 0.1)' : 'white',
                            position: 'relative',
                          }}
                        >
                          {selectedPackageId === pkg.id && (
                            <div
                              style={{
                                position: 'absolute',
                                top: '0.5rem',
                                right: '0.5rem',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: '#C8D46B',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Check size={16} color="white" />
                            </div>
                          )}
                          <div style={{ fontWeight: 600, color: '#2A2A2A', marginBottom: '0.25rem' }}>
                            {pkg.name}
                          </div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#C8D46B' }}>
                            ₹{pkg.price.toLocaleString('en-IN')}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#2A2A2A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={18} style={{ color: '#E0C097' }} />
                      Time Selection
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#4A4A4A', marginBottom: '0.5rem' }}>
                          Time Slot
                        </label>
                        <select
                          value={timeSlot}
                          onChange={(e) => setTimeSlot(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #E0E0E0',
                            borderRadius: '8px',
                            fontSize: '0.9375rem',
                            cursor: 'pointer',
                          }}
                        >
                          {TIME_SLOT_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#4A4A4A', marginBottom: '0.5rem' }}>
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            disabled={timeSlot !== 'custom' && timeSlot !== 'short_duration'}
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              border: '2px solid #E0E0E0',
                              borderRadius: '8px',
                              fontSize: '0.9375rem',
                              opacity: (timeSlot !== 'custom' && timeSlot !== 'short_duration') ? 0.6 : 1,
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#4A4A4A', marginBottom: '0.5rem' }}>
                            End Time
                          </label>
                          <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            disabled={timeSlot !== 'custom' && timeSlot !== 'short_duration'}
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              border: '2px solid #E0E0E0',
                              borderRadius: '8px',
                              fontSize: '0.9375rem',
                              opacity: (timeSlot !== 'custom' && timeSlot !== 'short_duration') ? 0.6 : 1,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Section */}
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#2A2A2A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <DollarSign size={18} style={{ color: '#C8D46B' }} />
                      Extra Services & Pricing
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {/* Extra Services */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#4A4A4A', marginBottom: '0.5rem' }}>
                            Garbage Bags
                          </label>
                          <input
                            type="number"
                            value={garbageBags}
                            onChange={(e) => setGarbageBags(parseInt(e.target.value) || 0)}
                            min="0"
                            style={{
                              width: '100%',
                              padding: '0.625rem',
                              border: '2px solid #E0E0E0',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#4A4A4A', marginBottom: '0.5rem' }}>
                            Plates (Small)
                          </label>
                          <input
                            type="number"
                            value={platesSmall}
                            onChange={(e) => setPlatesSmall(parseInt(e.target.value) || 0)}
                            min="0"
                            style={{
                              width: '100%',
                              padding: '0.625rem',
                              border: '2px solid #E0E0E0',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#4A4A4A', marginBottom: '0.5rem' }}>
                            Plates (Large)
                          </label>
                          <input
                            type="number"
                            value={platesLarge}
                            onChange={(e) => setPlatesLarge(parseInt(e.target.value) || 0)}
                            min="0"
                            style={{
                              width: '100%',
                              padding: '0.625rem',
                              border: '2px solid #E0E0E0',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#4A4A4A', marginBottom: '0.5rem' }}>
                            Cooking Gas (Qty)
                          </label>
                          <input
                            type="number"
                            value={cookingGasQty}
                            onChange={(e) => setCookingGasQty(parseInt(e.target.value) || 0)}
                            min="0"
                            style={{
                              width: '100%',
                              padding: '0.625rem',
                              border: '2px solid #E0E0E0',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                            }}
                          />
                        </div>
                      </div>

                      {/* Price Adjustment */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#4A4A4A', marginBottom: '0.5rem' }}>
                          Admin Price Adjustment (₹)
                        </label>
                        <input
                          type="number"
                          value={adminPriceAdjustment}
                          onChange={(e) => setAdminPriceAdjustment(parseInt(e.target.value) || 0)}
                          placeholder="Enter adjustment amount"
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #E0E0E0',
                            borderRadius: '8px',
                            fontSize: '0.9375rem',
                          }}
                        />
                      </div>

                      {/* Price Breakdown */}
                      <div
                        style={{
                          background: 'linear-gradient(135deg, rgba(200, 212, 107, 0.1), rgba(224, 192, 151, 0.1))',
                          padding: '1rem',
                          borderRadius: '8px',
                          border: '2px solid rgba(200, 212, 107, 0.3)',
                        }}
                      >
                        <div style={{ fontSize: '0.875rem', color: '#4A4A4A', marginBottom: '0.75rem' }}>
                          Price Breakdown
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#666' }}>Base Price:</span>
                            <span style={{ fontWeight: 600 }}>₹{basePrice.toLocaleString('en-IN')}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#666' }}>Floor Cleaning:</span>
                            <span style={{ fontWeight: 600 }}>₹{FLOOR_CLEANING_COST.toLocaleString('en-IN')}</span>
                          </div>
                          {extraServicesTotal > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#666' }}>Extra Services:</span>
                              <span style={{ fontWeight: 600 }}>₹{extraServicesTotal.toLocaleString('en-IN')}</span>
                            </div>
                          )}
                          {adminPriceAdjustment !== 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#666' }}>Adjustment:</span>
                              <span style={{ fontWeight: 600, color: adminPriceAdjustment > 0 ? '#4CAF50' : '#F44336' }}>
                                {adminPriceAdjustment > 0 ? '+' : ''}₹{adminPriceAdjustment.toLocaleString('en-IN')}
                              </span>
                            </div>
                          )}
                          <div style={{ borderTop: '1px solid rgba(0, 0, 0, 0.1)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                              <span style={{ fontWeight: 700, color: '#2A2A2A' }}>Total:</span>
                              <span style={{ fontWeight: 700, color: '#C8D46B', fontSize: '1.25rem' }}>
                                ₹{finalPrice.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Actions */}
            <div
              style={{
                padding: '1.5rem 2rem',
                borderTop: '1px solid #E0E0E0',
                background: '#FAF9F6',
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end',
              }}
            >
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: '2px solid #E0E0E0',
                  background: 'white',
                  color: '#2A2A2A',
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.6 : 1,
                }}
              >
                Cancel
              </motion.button>

              <motion.button
                onClick={handleSubmit}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                style={{
                  padding: '0.75rem 2rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #C8D46B, #E0C097)',
                  color: '#2A2A2A',
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: isSubmitting ? 0.6 : 1,
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Create Booking
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}