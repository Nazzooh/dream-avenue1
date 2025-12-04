import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Sparkles, ArrowLeft, Calendar as CalendarIcon, ChevronRight, ChevronLeft, Check, Loader2, FileText } from 'lucide-react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { PublicBookingCalendar } from '../components/PublicBookingCalendar';
import { SlotSelectorGrid, SLOT_OPTIONS, SHORT_DURATION_SLOT } from '../components/slot-booking/SlotSelectorGrid';
import { EnhancedBookingForm, BookingFormData } from '../components/EnhancedBookingForm';
import { usePackages } from '../src/hooks/usePackages';
import { useAvailabilityForDate } from '../src/hooks/useCalendar';
import { toast } from 'sonner@2.0.3';
import { createBooking, normalizeTimes } from '../src/api/createBooking';

// Add responsive styles
const responsiveStyles = `
  @media (min-width: 1024px) {
    .booking-split-container {
      grid-template-columns: 1fr 1fr !important;
    }
  }
  
  @media (max-width: 1023px) {
    .booking-split-container {
      grid-template-columns: 1fr !important;
    }
    
    .packages-panel {
      border-right: none !important;
      border-bottom: 2px solid rgba(224, 192, 151, 0.2) !important;
      padding: 2rem 1.5rem !important;
      min-height: auto !important;
    }
    
    .form-panel {
      padding: 2rem 1.5rem !important;
    }
  }
  
  @media (max-width: 768px) {
    .nav-buttons {
      top: 80px !important;
      left: 10px !important;
      gap: 0.5rem !important;
      flex-direction: column !important;
      align-items: flex-start !important;
    }
    
    .nav-buttons button {
      padding: 0.5rem 1rem !important;
      font-size: 0.875rem !important;
    }
    
    .packages-panel {
      padding: 1.5rem 1rem !important;
    }
    
    .form-panel {
      padding: 1.5rem 1rem !important;
    }
    
    .package-carousel {
      gap: 1rem !important;
    }
    
    .calendar-section {
      padding: 2rem 1rem !important;
    }
  }
  
  @media (max-width: 480px) {
    .nav-buttons {
      position: static !important;
      margin: 1rem !important;
      padding-top: 0 !important;
    }
  }
`;

export default function SmartSlotBookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const packageId = searchParams.get('package');
  const calendarSectionRef = useRef<HTMLDivElement>(null);
  
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(packageId);
  const [showCalendarSection, setShowCalendarSection] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('full_day');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState<BookingFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const { data: packages = [] } = usePackages();
  const selectedPackage = packages.find((p) => p.id === selectedPackageId);

  // Fetch availability for the selected date
  const { data: availability } = useAvailabilityForDate(selectedDate, !!selectedDate);

  const handleFormContinue = (data: BookingFormData) => {
    setFormData(data);
    setShowCalendarSection(true);
    setTimeout(() => {
      calendarSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    // Reset slot selection when date changes
    setSelectedSlot('full_day');
  };

  const handleConfirmBooking = async () => {
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }

    if (!formData) {
      toast.error('Form data missing. Please go back and fill the form.');
      return;
    }

    if (!termsAccepted) {
      toast.error('Please accept the Terms and Conditions to continue');
      return;
    }

    setIsSubmitting(true);

    try {
      // Map event type to special_requests field as required
      const eventTypeText = formData.eventType ? `Event Type: ${formData.eventType}` : '';
      
      // Combine event type with user's message
      let combinedSpecialRequests = eventTypeText;
      if (formData.message) {
        combinedSpecialRequests = eventTypeText ? `${eventTypeText}\n${formData.message}` : formData.message;
      }
      
      // Normalize slot to start/end times
      const { start, end } = normalizeTimes(selectedSlot);
      
      // Create booking using centralized function
      await createBooking({
        full_name: formData.fullName.trim(),
        mobile: formData.mobile,
        booking_date: selectedDate,
        start_time: start,
        end_time: end,
        guest_count: parseInt(formData.guestCount),
        package_id: formData.packageId,
        special_requests: combinedSpecialRequests || null,
        email: null,
        additional_notes: `Smart Slot Booking - ${SLOT_OPTIONS.find(s => s.key === selectedSlot)?.label || selectedSlot}`,
        user_id: null,
      });

      toast.success('Booking created successfully');
      setShowSuccessModal(true);
    } catch (error: any) {
      // Display raw backend error message
      toast.error('Booking Failed', {
        description: error.message || 'Failed to create booking',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate final price for display
  const selectedSlotData = SLOT_OPTIONS.find((s) => s.key === selectedSlot);
  let baseDisplayPrice: number;
  if (selectedSlot === 'short_duration') {
    baseDisplayPrice = 26000;
  } else {
    baseDisplayPrice = selectedPackage ? selectedPackage.price : 0;
  }

  // Calculate services for display (floor cleaning is always included)
  const floorCleaningForDisplay = 3000;

  const displayPrice = baseDisplayPrice + floorCleaningForDisplay;

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6', paddingTop: '80px' }}>
      <Navbar />

      {/* Navigation Buttons */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'fixed',
          top: '100px',
          left: '20px',
          zIndex: 50,
          display: 'flex',
          gap: '1rem',
        }}
        className="nav-buttons"
      >
        <motion.button
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            color: '#343A40',
            border: '2px solid rgba(224, 192, 151, 0.5)',
            borderRadius: '50px',
            fontWeight: 600,
            fontSize: '0.9375rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </motion.button>

        <motion.button
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: 'linear-gradient(135deg, #B6F500, #E0C097)',
            color: '#343A40',
            border: 'none',
            borderRadius: '50px',
            fontWeight: 600,
            fontSize: '0.9375rem',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(182, 245, 0, 0.3)',
          }}
        >
          <Home size={18} />
          <span>Home</span>
        </motion.button>
      </motion.div>

      {/* ========== TOP SECTION: 50/50 SPLIT (90-100vh) ========== */}
      <div
        style={{
          minHeight: '90vh',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 0,
        }}
        className="booking-split-container"
      >
        {/* LEFT PANEL - Packages Carousel */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            position: 'relative',
            padding: '4rem 2.5rem',
            background: 'linear-gradient(135deg, #FAF9F6 0%, #FFFFFF 100%)',
            borderRight: '1px solid rgba(224, 192, 151, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
          className="packages-panel"
        >
          <div style={{ maxWidth: '720px', margin: '0 auto', width: '100%' }}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ textAlign: 'center', marginBottom: '3rem' }}
            >
              <Sparkles size={40} style={{ color: '#B6F500', display: 'inline-block', marginBottom: '1rem' }} />
              <h2
                style={{
                  fontSize: '2.25rem',
                  marginBottom: '0.75rem',
                  background: 'linear-gradient(135deg, #B6F500, #E0C097)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.02em',
                }}
              >
                Select Your Package
              </h2>
              <div
                style={{
                  width: '80px',
                  height: '4px',
                  background: 'linear-gradient(90deg, #B6F500, #E0C097)',
                  margin: '0 auto',
                  borderRadius: '2px',
                }}
              />
            </motion.div>

            {/* Horizontal Scrollable Package Cards */}
            <div
              style={{
                position: 'relative',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem',
                  maxWidth: '800px',
                  margin: '0 auto',
                }}
                className="package-carousel"
              >
                {packages.map((pkg, index) => (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    onClick={() => setSelectedPackageId(pkg.id)}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      width: '100%',
                      cursor: 'pointer',
                      border: selectedPackageId === pkg.id 
                        ? '3px solid #B6F500' 
                        : '2px solid rgba(224, 192, 151, 0.3)',
                      borderRadius: '24px',
                      background: selectedPackageId === pkg.id
                        ? 'linear-gradient(135deg, rgba(182, 245, 0, 0.08), rgba(224, 192, 151, 0.08))'
                        : 'white',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      boxShadow: selectedPackageId === pkg.id
                        ? '0 16px 40px rgba(182, 245, 0, 0.25), 0 0 0 4px rgba(182, 245, 0, 0.1)'
                        : '0 4px 16px rgba(0, 0, 0, 0.08)',
                    }}
                  >
                    {/* Package Image */}
                    <div
                      style={{
                        height: '180px',
                        backgroundImage: `url(${pkg.image_url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                      }}
                    >
                      {selectedPackageId === pkg.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            background: '#B6F500',
                            color: '#343A40',
                            padding: '0.625rem 1.25rem',
                            borderRadius: '50px',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            boxShadow: '0 4px 16px rgba(182, 245, 0, 0.4)',
                          }}
                        >
                          <Check size={16} />
                          Selected
                        </motion.div>
                      )}
                    </div>

                    {/* Package Details */}
                    <div style={{ padding: '1.75rem' }}>
                      <h3
                        style={{
                          fontSize: '1.375rem',
                          marginBottom: '0.75rem',
                          color: '#343A40',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {pkg.name}
                      </h3>
                      
                      <p
                        style={{
                          fontSize: '0.9375rem',
                          color: '#666',
                          marginBottom: '1.25rem',
                          lineHeight: '1.6',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {pkg.description}
                      </p>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: '1rem',
                          borderTop: '1px solid rgba(224, 192, 151, 0.2)',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.875rem',
                            color: '#999',
                          }}
                        >
                          Base Price
                        </span>
                        <span
                          style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #B6F500, #E0C097)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                          }}
                        >
                          ₹{pkg.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {packages.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3rem 1rem',
                  color: '#999',
                }}
              >
                <Sparkles size={48} style={{ color: '#E0C097', marginBottom: '1rem' }} />
                <p>No packages available at the moment.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* RIGHT PANEL - Enhanced Booking Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            position: 'relative',
            padding: '3rem 2rem',
            background: 'linear-gradient(135deg, rgba(250, 249, 246, 0.8), rgba(255, 255, 255, 0.9))',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
          className="form-panel"
        >
          <div style={{ maxWidth: '540px', margin: '0 auto', width: '100%' }}>
            <EnhancedBookingForm
              selectedPackageId={selectedPackageId}
              selectedPackageName={selectedPackage?.name}
              onContinue={handleFormContinue}
              isLoading={isSubmitting}
            />
          </div>
        </motion.div>
      </div>

      {/* ========== BOTTOM SECTION: Calendar + Slots + Message ========== */}
      <AnimatePresence>
        {showCalendarSection && (
          <motion.div
            ref={calendarSectionRef}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.6 }}
            style={{
              padding: '4rem 2rem',
              background: 'linear-gradient(180deg, #FFFFFF, #FAF9F6)',
              borderTop: '2px solid rgba(224, 192, 151, 0.2)',
            }}
            className="calendar-section"
          >
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              {/* Calendar */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                style={{
                  marginBottom: '3rem',
                  textAlign: 'center',
                }}
              >
                <h2
                  style={{
                    fontSize: '2rem',
                    marginBottom: '1rem',
                    background: 'linear-gradient(135deg, #B6F500, #E0C097)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Select Your Date
                </h2>
                <div
                  style={{
                    width: '60px',
                    height: '3px',
                    background: 'linear-gradient(90deg, #B6F500, #E0C097)',
                    margin: '0 auto 2rem',
                    borderRadius: '2px',
                  }}
                />

                <div
                  style={{
                    maxWidth: '600px',
                    margin: '0 auto',
                    background: 'white',
                    borderRadius: '20px',
                    padding: '2rem',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                    border: '2px solid rgba(224, 192, 151, 0.2)',
                  }}
                >
                  <PublicBookingCalendar
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                  />
                </div>
              </motion.div>

              {/* Slot Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{ marginBottom: '3rem' }}
              >
                <h2
                  style={{
                    fontSize: '2rem',
                    marginBottom: '1rem',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #E0C097, #B6F500)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Choose Time Slot
                </h2>
                <div
                  style={{
                    width: '60px',
                    height: '3px',
                    background: 'linear-gradient(90deg, #E0C097, #B6F500)',
                    margin: '0 auto 2rem',
                    borderRadius: '2px',
                  }}
                />

                <SlotSelectorGrid
                  selectedSlot={selectedSlot}
                  onSlotChange={setSelectedSlot}
                  basePrice={selectedPackage?.price || 0}
                />
              </motion.div>



              {/* Price Summary & Confirm Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                style={{
                  maxWidth: '500px',
                  margin: '0 auto',
                  textAlign: 'center',
                }}
              >
                {/* Price Display */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(182, 245, 0, 0.1), rgba(224, 192, 151, 0.1))',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    border: '2px solid rgba(182, 245, 0, 0.3)',
                  }}
                >
                  {/* Price Breakdown - Always show since floor cleaning is mandatory */}
                  <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(200, 212, 107, 0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                      <span>Base Price:</span>
                      <span>₹{baseDisplayPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                      <span>Floor Cleaning (Included):</span>
                      <span>₹3,000</span>
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div style={{ marginBottom: '0.5rem', color: '#666', fontSize: '0.9375rem' }}>
                    Total Amount
                  </div>
                  <div
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #B6F500, #E0C097)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    ₹{displayPrice.toLocaleString('en-IN')}
                  </div>
                  {selectedSlot === 'short_duration' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        marginTop: '0.75rem',
                        padding: '0.5rem 1rem',
                        background: 'rgba(255, 107, 157, 0.1)',
                        borderRadius: '8px',
                        fontSize: '0.8125rem',
                        color: '#343A40',
                      }}
                    >
                      🎉 Special rate for 4-5 hour event
                    </motion.div>
                  )}
                </div>

                {/* Terms and Conditions Checkbox */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  style={{
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    background: termsAccepted 
                      ? 'linear-gradient(135deg, rgba(182, 245, 0, 0.05), rgba(224, 192, 151, 0.05))' 
                      : 'rgba(255, 107, 157, 0.05)',
                    borderRadius: '12px',
                    border: termsAccepted 
                      ? '2px solid rgba(182, 245, 0, 0.3)' 
                      : '2px solid rgba(255, 107, 157, 0.3)',
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      style={{
                        width: '20px',
                        height: '20px',
                        marginTop: '2px',
                        cursor: 'pointer',
                        accentColor: '#B6F500',
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: '0.9375rem', lineHeight: '1.5', color: '#343A40', textAlign: 'left' }}>
                      I have read and agree to the{' '}
                      <Link
                        to="/terms-and-conditions"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#B6F500',
                          textDecoration: 'underline',
                          fontWeight: 600,
                        }}
                      >
                        Hall Rules and Guidelines
                      </Link>
                      {' '}of Dream Avenue Convention Center
                    </span>
                  </label>
                </motion.div>

                {/* Confirm Button */}
                <motion.button
                  onClick={handleConfirmBooking}
                  whileHover={termsAccepted && !isSubmitting ? { scale: 1.03, boxShadow: '0 16px 40px rgba(182, 245, 0, 0.4)' } : {}}
                  whileTap={termsAccepted && !isSubmitting ? { scale: 0.98 } : {}}
                  disabled={isSubmitting || !termsAccepted}
                  style={{
                    width: '100%',
                    padding: '1.5rem 3rem',
                    background: termsAccepted && !isSubmitting
                      ? 'linear-gradient(135deg, #B6F500, #E0C097)'
                      : '#E0E0E0',
                    color: termsAccepted && !isSubmitting ? '#343A40' : '#999',
                    border: 'none',
                    borderRadius: '50px',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    cursor: (isSubmitting || !termsAccepted) ? 'not-allowed' : 'pointer',
                    boxShadow: termsAccepted && !isSubmitting 
                      ? '0 12px 32px rgba(182, 245, 0, 0.35)' 
                      : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.3s ease',
                    opacity: (isSubmitting || !termsAccepted) ? 0.6 : 1,
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          border: '3px solid #343A40',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                        }}
                      />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={24} />
                      Confirm Booking
                    </>
                  )}
                </motion.button>
                
                {!termsAccepted && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      marginTop: '0.75rem',
                      fontSize: '0.8125rem',
                      color: '#FF6B9D',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <FileText size={14} />
                    Please accept the terms and conditions to proceed
                  </motion.p>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
            }}
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'linear-gradient(135deg, rgba(182, 245, 0, 0.95), rgba(224, 192, 151, 0.95))',
                borderRadius: '24px',
                padding: '3rem',
                maxWidth: '500px',
                textAlign: 'center',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                style={{
                  width: '80px',
                  height: '80px',
                  background: '#343A40',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 2rem',
                }}
              >
                <Check size={48} style={{ color: '#B6F500' }} />
              </motion.div>

              <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#343A40' }}>
                Booking Confirmed! 🎉
              </h2>
              <p style={{ fontSize: '1.125rem', marginBottom: '2rem', color: '#343A40', opacity: 0.9 }}>
                Your booking has been successfully submitted. We'll contact you shortly via WhatsApp!
              </p>

              <motion.button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/');
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '1rem 2.5rem',
                  background: '#343A40',
                  color: '#B6F500',
                  border: 'none',
                  borderRadius: '50px',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Back to Home
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />

      {/* Responsive Styles + Animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .package-carousel::-webkit-scrollbar {
          height: 8px;
        }

        .package-carousel::-webkit-scrollbar-track {
          background: rgba(224, 192, 151, 0.1);
          border-radius: 10px;
        }

        .package-carousel::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, #B6F500, #E0C097);
          border-radius: 10px;
        }

        .package-carousel::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(90deg, #E0C097, #B6F500);
        }

        ${responsiveStyles}
      `}</style>
    </div>
  );
}