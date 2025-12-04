// components/admin-v2/AnalyticsSettingsModule.tsx — Analytics Settings Module
// Single-row update with Realtime sync and Dream Avenue pastel theme

import React, { motion } from 'motion/react';
import { Calendar, Users, Heart, Save, RefreshCw, TrendingUp, AlertCircle, Sparkles, Database, Zap, Globe } from 'lucide-react';
import { useAnalyticsSummary, useUpdateAnalyticsSummary } from '../../src/hooks/useAnalyticsSummary';
import { useAuth } from '../../src/auth/useAuth';
import { toast } from 'sonner@2.0.3';

interface AnimatedNumberProps {
  value: number;
  color: string;
  unit?: string;
}

function AnimatedNumber({ value, color, unit = '' }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    // Animate number transition
    const duration = 800;
    const steps = 30;
    const stepValue = (value - displayValue) / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setDisplayValue(prev => Math.round(prev + stepValue));
      } else {
        setDisplayValue(value);
        clearInterval(interval);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [value]);

  return (
    <motion.span
      key={value}
      initial={{ scale: 1.2, opacity: 0.7 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        fontSize: '2.5rem',
        fontWeight: '700',
        color: color,
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      {displayValue}{unit}
    </motion.span>
  );
}

interface MetricInputCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  onChange: (value: number) => void;
  color: string;
  unit?: string;
  max?: number;
  min?: number;
  isSlider?: boolean;
}

function MetricInputCard({
  icon: Icon,
  label,
  value,
  onChange,
  color,
  unit = '',
  max,
  min = 0,
  isSlider = false,
}: MetricInputCardProps) {
  const [localValue, setLocalValue] = useState(value.toString());
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    const numValue = parseInt(newValue);
    if (!isNaN(numValue) && numValue >= min && (!max || numValue <= max)) {
      onChange(numValue);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseInt(e.target.value);
    onChange(numValue);
  };

  const handleBlur = () => {
    setIsFocused(false);
    const numValue = parseInt(localValue);
    if (isNaN(numValue) || numValue < min || (max && numValue > max)) {
      setLocalValue(value.toString());
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden"
      style={{
        background: '#FAF9F6',
        borderRadius: '20px',
        padding: '2rem',
        border: isFocused ? `2px solid ${color}` : '2px solid rgba(224, 192, 151, 0.3)',
        boxShadow: isFocused
          ? `0 8px 32px ${color}30, 0 0 0 4px ${color}10`
          : '0 4px 16px rgba(224, 192, 151, 0.15)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Icon Circle */}
      <div
        className="mb-4"
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '18px',
          background: `linear-gradient(135deg, ${color}20, ${color}08)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 4px 16px ${color}15`,
        }}
      >
        <Icon size={32} style={{ color }} />
      </div>

      {/* Label */}
      <label
        htmlFor={`metric-${label}`}
        style={{
          display: 'block',
          fontSize: '0.8125rem',
          fontWeight: '700',
          color: '#999999',
          marginBottom: '0.75rem',
          letterSpacing: '1px',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </label>

      {/* Input Field or Slider */}
      {isSlider ? (
        <div className="space-y-4">
          {/* Display Value */}
          <div className="flex items-baseline justify-between">
            <span
              style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: color,
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              {value}
            </span>
            {unit && (
              <span
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#CCCCCC',
                }}
              >
                {unit}
              </span>
            )}
          </div>

          {/* Slider */}
          <div className="relative pt-2">
            <input
              type="range"
              id={`metric-${label}`}
              value={value}
              onChange={handleSliderChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              min={min}
              max={max}
              className="w-full h-3 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${color} 0%, ${color} ${value}%, rgba(224, 192, 151, 0.2) ${value}%, rgba(224, 192, 151, 0.2) 100%)`,
                outline: 'none',
              }}
            />
            <style>{`
              input[type="range"]::-webkit-slider-thumb {
                appearance: none;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: ${color};
                cursor: pointer;
                box-shadow: 0 2px 8px ${color}40;
                transition: all 0.2s ease;
              }
              input[type="range"]::-webkit-slider-thumb:hover {
                transform: scale(1.2);
                box-shadow: 0 4px 16px ${color}60;
              }
              input[type="range"]::-moz-range-thumb {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: ${color};
                cursor: pointer;
                border: none;
                box-shadow: 0 2px 8px ${color}40;
                transition: all 0.2s ease;
              }
              input[type="range"]::-moz-range-thumb:hover {
                transform: scale(1.2);
                box-shadow: 0 4px 16px ${color}60;
              }
            `}</style>
          </div>
        </div>
      ) : (
        <div className="relative">
          <input
            type="number"
            id={`metric-${label}`}
            value={localValue}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            min={min}
            max={max}
            className="w-full outline-none"
            style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: color,
              background: 'transparent',
              border: 'none',
              padding: '0.5rem 0',
              fontFamily: 'Poppins, sans-serif',
            }}
          />
          {unit && (
            <span
              style={{
                position: 'absolute',
                right: '0',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#CCCCCC',
              }}
            >
              {unit}
            </span>
          )}
        </div>
      )}

      {/* Range indicator for non-slider max values */}
      {max && !isSlider && (
        <div className="mt-3">
          <div
            className="w-full h-2 rounded-full overflow-hidden"
            style={{ background: 'rgba(224, 192, 151, 0.15)' }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(value / max) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: `linear-gradient(90deg, ${color}80, ${color})`,
                borderRadius: '9999px',
              }}
            />
          </div>
        </div>
      )}

      {/* Decorative Corner Accent */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100px',
          height: '100px',
          background: `radial-gradient(circle at top right, ${color}12, transparent)`,
          pointerEvents: 'none',
        }}
      />
    </motion.div>
  );
}

export function AnalyticsSettingsModule() {
  const { data: currentSummary, isLoading, error } = useAnalyticsSummary();
  const updateMutation = useUpdateAnalyticsSummary();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    events_hosted: 0,
    guests_served: 0,
    client_satisfaction: 100,
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccessGlow, setShowSuccessGlow] = useState(false);
  const [saveError, setSaveError] = useState(false);

  // Update form when data is loaded
  useEffect(() => {
    if (currentSummary) {
      setFormData({
        events_hosted: currentSummary.events_hosted || 0,
        guests_served: currentSummary.guests_served || 0,
        client_satisfaction: currentSummary.client_satisfaction || 100,
      });
    }
  }, [currentSummary]);

  // Detect changes
  useEffect(() => {
    if (!currentSummary) return;
    
    const changed =
      formData.events_hosted !== currentSummary.events_hosted ||
      formData.guests_served !== currentSummary.guests_served ||
      formData.client_satisfaction !== currentSummary.client_satisfaction;
    
    setHasChanges(changed);
  }, [formData, currentSummary]);

  const handleSave = async () => {
    try {
      setSaveError(false);
      
      // Update using single-row upsert
      await updateMutation.mutateAsync(formData);

      // Show success glow animation
      setShowSuccessGlow(true);
      setTimeout(() => setShowSuccessGlow(false), 3000);

      toast.success('Changes Saved Successfully! ✅', {
        description: 'Your public website has been updated',
        duration: 3000,
      });
      
      setHasChanges(false);
    } catch (err: any) {
      console.error('Update error:', err);
      setSaveError(true);
      
      // Trigger shake animation
      setTimeout(() => setSaveError(false), 600);
      
      toast.error(err.message || 'Failed to update analytics', {
        description: 'Please check your permissions and try again',
      });
    }
  };

  const handleReset = () => {
    if (currentSummary) {
      setFormData({
        events_hosted: currentSummary.events_hosted || 0,
        guests_served: currentSummary.guests_served || 0,
        client_satisfaction: currentSummary.client_satisfaction || 100,
      });
      setHasChanges(false);
      toast.info('Changes discarded');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-t-transparent rounded-full"
          style={{ borderColor: '#E0C097', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="p-6 rounded-2xl text-center"
        style={{ background: '#FEF2F2', border: '2px solid #FCA5A5' }}
      >
        <AlertCircle size={48} style={{ color: '#DC2626', margin: '0 auto 1rem' }} />
        <h3 style={{ color: '#991B1B', fontWeight: '600', marginBottom: '0.5rem' }}>
          Error Loading Analytics
        </h3>
        <p style={{ color: '#7F1D1D', fontSize: '0.875rem' }}>
          {error instanceof Error ? error.message : 'Failed to load analytics data'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #E0C097, #C9A77D)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(224, 192, 151, 0.3)',
            }}
          >
            <TrendingUp size={24} style={{ color: '#FFFFFF' }} />
          </div>
          <div>
            <h2
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '1.875rem',
                fontWeight: '700',
                color: '#2A2A2A',
                margin: 0,
              }}
            >
              Analytics Settings
            </h2>
            <p style={{ color: '#666666', fontSize: '0.9375rem', margin: 0 }}>
              Update the statistics displayed on your public website
            </p>
          </div>
        </div>
      </div>

      {/* Visual Sync Flow Pipeline */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8 p-6 rounded-2xl overflow-hidden relative"
        style={{
          background: 'linear-gradient(135deg, rgba(182, 245, 0, 0.08), rgba(224, 192, 151, 0.08))',
          border: '1px dashed rgba(224, 192, 151, 0.4)',
        }}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Admin Node */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <motion.div
              animate={hasChanges ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #E0C097, #C9A77D)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(224, 192, 151, 0.3)',
              }}
            >
              <Calendar size={28} style={{ color: '#FFFFFF' }} />
            </motion.div>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#666666', textAlign: 'center' }}>
              Admin Dashboard
            </span>
          </div>

          {/* Arrow 1 */}
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="flex-shrink-0"
          >
            <Zap size={20} style={{ color: '#B6F500' }} />
          </motion.div>

          {/* Supabase Node */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <motion.div
              animate={updateMutation.isPending ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: updateMutation.isPending ? Infinity : 0, ease: 'linear' }}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #B6F500, #98CD00)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(182, 245, 0, 0.3)',
              }}
            >
              <Database size={28} style={{ color: '#FFFFFF' }} />
            </motion.div>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#666666', textAlign: 'center' }}>
              Supabase DB
            </span>
          </div>

          {/* Arrow 2 */}
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            className="flex-shrink-0"
          >
            <Zap size={20} style={{ color: '#B6F500' }} />
          </motion.div>

          {/* Public Website Node */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <motion.div
              animate={showSuccessGlow ? { 
                scale: [1, 1.15, 1],
                boxShadow: [
                  '0 4px 16px rgba(182, 245, 0, 0.3)',
                  '0 8px 32px rgba(182, 245, 0, 0.6)',
                  '0 4px 16px rgba(182, 245, 0, 0.3)'
                ]
              } : {}}
              transition={{ duration: 0.6 }}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F4A261, #E76F51)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(244, 162, 97, 0.3)',
              }}
            >
              <Globe size={28} style={{ color: '#FFFFFF' }} />
            </motion.div>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#666666', textAlign: 'center' }}>
              Public Website
            </span>
          </div>
        </div>

        {/* Flowing particles effect */}
        <motion.div
          animate={{ x: ['0%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(182, 245, 0, 0.6), transparent)',
            filter: 'blur(4px)',
            pointerEvents: 'none',
          }}
        />
      </motion.div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricInputCard
          icon={Calendar}
          label="Events Hosted"
          value={formData.events_hosted}
          onChange={(val) => setFormData({ ...formData, events_hosted: val })}
          color="#E0C097"
          unit="+"
        />

        <MetricInputCard
          icon={Users}
          label="Guests Served"
          value={formData.guests_served}
          onChange={(val) => setFormData({ ...formData, guests_served: val })}
          color="#B6F500"
          unit="+"
        />

        <MetricInputCard
          icon={Heart}
          label="Client Satisfaction"
          value={formData.client_satisfaction}
          onChange={(val) => setFormData({ ...formData, client_satisfaction: val })}
          color="#F4A261"
          unit="%"
          max={100}
          min={0}
          isSlider={true}
        />
      </div>

      {/* Success Glow Notification */}
      <AnimatePresence>
        {showSuccessGlow && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="mb-6 p-6 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(182, 245, 0, 0.12), rgba(224, 192, 151, 0.12))',
              border: '2px solid rgba(182, 245, 0, 0.4)',
              boxShadow: '0 8px 32px rgba(182, 245, 0, 0.3), 0 0 60px rgba(224, 192, 151, 0.2)',
            }}
          >
            <div className="flex items-center gap-4">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #B6F500, #98CD00)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(182, 245, 0, 0.4)',
                }}
              >
                <Sparkles size={28} style={{ color: '#FFFFFF' }} />
              </motion.div>
              <div>
                <h3
                  style={{
                    fontWeight: '700',
                    color: '#2A2A2A',
                    marginBottom: '4px',
                    fontSize: '1.125rem',
                  }}
                >
                  Changes Saved Successfully ✅
                </h3>
                <p style={{ color: '#666666', fontSize: '0.875rem', margin: 0 }}>
                  Your public website is now showing the updated statistics
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metadata Info Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-6 p-6 rounded-2xl"
        style={{
          background: '#FAF9F6',
          border: '1px solid rgba(224, 192, 151, 0.25)',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label style={{ 
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: '700',
              color: '#999999',
              marginBottom: '0.5rem',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}>
              Updated By
            </label>
            <div className="flex items-center gap-2">
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #E0C097, #C9A77D)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  color: '#FFFFFF',
                }}
              >
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span style={{ fontWeight: '600', color: '#2A2A2A' }}>
                {user?.email || currentSummary?.updated_by || 'dream-avenue'}
              </span>
            </div>
          </div>

          <div>
            <label style={{ 
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: '700',
              color: '#999999',
              marginBottom: '0.5rem',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}>
              Last Updated
            </label>
            <span style={{ fontWeight: '600', color: '#2A2A2A' }}>
              {currentSummary?.updated_at 
                ? new Date(currentSummary.updated_at).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                : 'Never'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={saveError ? {
              opacity: 1,
              y: 0,
              x: [-5, 5, -5, 5, 0]
            } : {
              opacity: 1,
              y: 0
            }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: saveError ? 0.1 : 0.3 }}
            className="sticky bottom-6 z-10 mb-8"
          >
            <div
              className="flex items-center justify-between p-6 rounded-2xl"
              style={{
                background: '#FAF9F6',
                border: saveError ? '2px solid rgba(239, 68, 68, 0.5)' : '2px solid rgba(182, 245, 0, 0.3)',
                boxShadow: saveError 
                  ? '0 12px 40px rgba(239, 68, 68, 0.25)'
                  : '0 12px 40px rgba(182, 245, 0, 0.25)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(182, 245, 0, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AlertCircle size={24} style={{ color: '#B6F500' }} />
                </div>
                <div>
                  <p
                    style={{
                      fontWeight: '700',
                      color: '#2A2A2A',
                      marginBottom: '2px',
                    }}
                  >
                    You have unsaved changes
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#666666', margin: 0 }}>
                    Save to update the public website
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleReset}
                  disabled={updateMutation.isPending}
                  className="px-6 py-3 rounded-xl transition-all"
                  style={{
                    background: 'rgba(224, 192, 151, 0.15)',
                    color: '#E0C097',
                    fontWeight: '700',
                    border: '1px solid rgba(224, 192, 151, 0.3)',
                    cursor: updateMutation.isPending ? 'not-allowed' : 'pointer',
                    opacity: updateMutation.isPending ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!updateMutation.isPending) {
                      e.currentTarget.style.background = 'rgba(224, 192, 151, 0.25)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(224, 192, 151, 0.15)';
                  }}
                >
                  <RefreshCw size={18} style={{ display: 'inline', marginRight: '8px' }} />
                  Reset
                </button>

                <motion.button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  whileTap={{ scale: 0.95 }}
                  animate={updateMutation.isPending ? {
                    boxShadow: [
                      '0 4px 16px rgba(182, 245, 0, 0.3)',
                      '0 8px 32px rgba(182, 245, 0, 0.5)',
                      '0 4px 16px rgba(182, 245, 0, 0.3)',
                    ]
                  } : {}}
                  transition={{ duration: 1, repeat: updateMutation.isPending ? Infinity : 0 }}
                  className="px-6 py-3 rounded-xl transition-all flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #B6F500 0%, #98CD00 100%)',
                    color: '#1A1A1A',
                    fontWeight: '700',
                    border: 'none',
                    cursor: updateMutation.isPending ? 'not-allowed' : 'pointer',
                    opacity: updateMutation.isPending ? 0.6 : 1,
                    boxShadow: '0 4px 16px rgba(182, 245, 0, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    if (!updateMutation.isPending) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(182, 245, 0, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(182, 245, 0, 0.3)';
                  }}
                >
                  {updateMutation.isPending ? (
                    <>
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-6 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(224, 192, 151, 0.08), rgba(182, 245, 0, 0.05))',
          border: '1px solid rgba(224, 192, 151, 0.3)',
        }}
      >
        <div className="flex items-start gap-4">
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(224, 192, 151, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <TrendingUp size={20} style={{ color: '#E0C097' }} />
          </motion.div>
          <div>
            <h4
              style={{
                fontWeight: '700',
                color: '#2A2A2A',
                marginBottom: '0.5rem',
                fontSize: '1rem',
              }}
            >
              🔄 Real-Time Sync Flow
            </h4>
            <p style={{ color: '#666666', fontSize: '0.875rem', lineHeight: '1.6', margin: 0 }}>
              Changes are synced instantly to your public website using <strong>Supabase Realtime</strong>. 
              Updates to the single analytics record (ID: <code style={{ 
                background: 'rgba(224, 192, 151, 0.15)', 
                padding: '2px 6px', 
                borderRadius: '4px',
                fontSize: '0.8125rem',
                fontFamily: 'monospace'
              }}>c67f70c1...</code>) trigger automatic cache revalidation across all connected clients. 
              The flow pipeline above shows the data journey: <strong>Admin → Supabase → Public Site</strong>.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                background: 'rgba(182, 245, 0, 0.12)',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#98CD00',
              }}>
                <Zap size={12} />
                Instant Updates
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                background: 'rgba(224, 192, 151, 0.12)',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#E0C097',
              }}>
                <Database size={12} />
                Single Source
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}