// DurationPicker.tsx - Duration-based booking with start/end date and time
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

export interface DurationBookingData {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
}

interface DurationPickerProps {
  value: DurationBookingData;
  onChange: (value: DurationBookingData) => void;
  bookedDates?: string[];
}

export function DurationPicker({ value, onChange, bookedDates = [] }: DurationPickerProps) {
  const [hasOverlap, setHasOverlap] = useState(false);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Check for overlapping dates
  useEffect(() => {
    if (value.startDate && value.endDate) {
      const start = new Date(value.startDate);
      const end = new Date(value.endDate);
      
      let overlap = false;
      const current = new Date(start);
      
      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
        if (bookedDates.includes(dateStr)) {
          overlap = true;
          break;
        }
        current.setDate(current.getDate() + 1);
      }
      
      setHasOverlap(overlap);
    } else {
      setHasOverlap(false);
    }
  }, [value.startDate, value.endDate, bookedDates]);

  const handleChange = (field: keyof DurationBookingData, val: string) => {
    const newValue = { ...value, [field]: val };
    
    // Auto-validate: end date/time should be after start
    if (field === 'startDate' && newValue.endDate && newValue.endDate < val) {
      newValue.endDate = val;
    }
    
    onChange(newValue);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* Start Date/Time */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(182, 245, 0, 0.05), rgba(182, 245, 0, 0.02))',
          borderRadius: '16px',
          padding: '20px',
          border: '2px solid rgba(182, 245, 0, 0.2)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #B6F500, #A4DD00)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Calendar size={16} color="#2A4516" />
          </div>
          <h4
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '1.0625rem',
              fontWeight: '600',
              color: '#1a1a1a',
              margin: 0,
            }}
          >
            Start Date & Time
          </h4>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '8px',
              }}
            >
              Date <span style={{ color: '#E07856' }}>*</span>
            </label>
            <input
              type="date"
              value={value.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              min={today}
              required
              style={{
                width: '100%',
                padding: '12px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.9375rem',
                color: '#1a1a1a',
                background: '#FFFFFF',
                border: '2px solid rgba(182, 245, 0, 0.3)',
                borderRadius: '12px',
                outline: 'none',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#B6F500';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(182, 245, 0, 0.15)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(182, 245, 0, 0.3)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '8px',
              }}
            >
              Time <span style={{ color: '#E07856' }}>*</span>
            </label>
            <input
              type="time"
              value={value.startTime}
              onChange={(e) => handleChange('startTime', e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.9375rem',
                color: '#1a1a1a',
                background: '#FFFFFF',
                border: '2px solid rgba(182, 245, 0, 0.3)',
                borderRadius: '12px',
                outline: 'none',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#B6F500';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(182, 245, 0, 0.15)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(182, 245, 0, 0.3)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>
      </div>

      {/* End Date/Time */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(224, 192, 151, 0.05), rgba(224, 192, 151, 0.02))',
          borderRadius: '16px',
          padding: '20px',
          border: '2px solid rgba(224, 192, 151, 0.3)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #E0C097, #C29A5D)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Clock size={16} color="#FFFFFF" />
          </div>
          <h4
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '1.0625rem',
              fontWeight: '600',
              color: '#1a1a1a',
              margin: 0,
            }}
          >
            End Date & Time
          </h4>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '8px',
              }}
            >
              Date <span style={{ color: '#E07856' }}>*</span>
            </label>
            <input
              type="date"
              value={value.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              min={value.startDate || today}
              required
              style={{
                width: '100%',
                padding: '12px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.9375rem',
                color: '#1a1a1a',
                background: '#FFFFFF',
                border: '2px solid rgba(224, 192, 151, 0.4)',
                borderRadius: '12px',
                outline: 'none',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#C29A5D';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(224, 192, 151, 0.2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(224, 192, 151, 0.4)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '8px',
              }}
            >
              Time <span style={{ color: '#E07856' }}>*</span>
            </label>
            <input
              type="time"
              value={value.endTime}
              onChange={(e) => handleChange('endTime', e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.9375rem',
                color: '#1a1a1a',
                background: '#FFFFFF',
                border: '2px solid rgba(224, 192, 151, 0.4)',
                borderRadius: '12px',
                outline: 'none',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#C29A5D';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(224, 192, 151, 0.2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(224, 192, 151, 0.4)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>
      </div>

      {/* Overlap Warning */}
      <AnimatePresence>
        {hasOverlap && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '16px',
              background: 'rgba(224, 120, 86, 0.1)',
              border: '2px solid rgba(224, 120, 86, 0.3)',
              borderRadius: '12px',
            }}
          >
            <AlertCircle size={20} color="#E07856" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div
                style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  color: '#C5543C',
                  marginBottom: '4px',
                }}
              >
                ⚠️ Selected range includes booked periods
              </div>
              <div
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.8125rem',
                  color: '#856404',
                  lineHeight: '1.5',
                }}
              >
                Some dates in your selected range are already booked. Please choose different dates.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Duration Info */}
      {value.startDate && value.endDate && !hasOverlap && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(182, 245, 0, 0.08), rgba(182, 245, 0, 0.04))',
            border: '2px solid rgba(182, 245, 0, 0.25)',
            borderRadius: '12px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.8125rem',
              color: '#6B7280',
              marginBottom: '4px',
            }}
          >
            Total Duration
          </div>
          <div
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#2A4516',
            }}
          >
            {(() => {
              const start = new Date(value.startDate);
              const end = new Date(value.endDate);
              const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
              return days === 1 ? '1 Day' : `${days} Days`;
            })()}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
