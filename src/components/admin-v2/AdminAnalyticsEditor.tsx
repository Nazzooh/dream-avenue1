// components/admin-v2/AdminAnalyticsEditor.tsx — Append-Only Analytics Editor
// Creates new snapshots instead of updating existing rows

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Users, Heart, Save, TrendingUp, AlertCircle, 
  Sparkles, Database, History, Clock, User as UserIcon, Trash2
} from 'lucide-react';
import { 
  useLatestAnalytics, 
  useAnalyticsHistory, 
  useInsertAnalyticsSnapshot 
} from '../../src/hooks/useAnalyticsAppendOnly';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

interface MetricInputProps {
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

function MetricInput({
  icon: Icon,
  label,
  value,
  onChange,
  color,
  unit = '',
  max,
  min = 0,
  isSlider = false,
}: MetricInputProps) {
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
      className="relative overflow-hidden p-6 rounded-2xl"
      style={{
        background: 'white',
        border: isFocused ? `2px solid ${color}` : '2px solid #E8E5DB',
        boxShadow: isFocused
          ? `0 8px 24px ${color}30`
          : '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Icon */}
      <div
        className="mb-4 flex items-center justify-center"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: `${color}20`,
        }}
      >
        <Icon size={28} style={{ color }} />
      </div>

      {/* Label */}
      <label
        htmlFor={`metric-${label}`}
        className="block text-xs uppercase tracking-wider mb-3"
        style={{ color: '#999' }}
      >
        {label}
      </label>

      {/* Input */}
      {isSlider ? (
        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <span className="text-4xl" style={{ color, fontFamily: 'Poppins, sans-serif' }}>
              {value}
            </span>
            {unit && (
              <span className="text-2xl" style={{ color: '#CCC' }}>
                {unit}
              </span>
            )}
          </div>

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
              background: `linear-gradient(to right, ${color} 0%, ${color} ${value}%, #E8E5DB ${value}%, #E8E5DB 100%)`,
            }}
          />
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
            className="w-full outline-none text-4xl border-none bg-transparent p-0"
            style={{
              color,
              fontFamily: 'Poppins, sans-serif',
            }}
          />
          {unit && (
            <span
              className="absolute right-0 top-1/2 -translate-y-1/2 text-2xl"
              style={{ color: '#CCC' }}
            >
              {unit}
            </span>
          )}
        </div>
      )}

      {/* Progress Bar for max values */}
      {max && !isSlider && (
        <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: '#E8E5DB' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(value / max) * 100}%` }}
            transition={{ duration: 0.5 }}
            className="h-full rounded-full"
            style={{ background: color }}
          />
        </div>
      )}
    </motion.div>
  );
}

export function AdminAnalyticsEditor() {
  const { data: latestAnalytics, isLoading } = useLatestAnalytics();
  const { data: history = [] } = useAnalyticsHistory(3);
  const insertMutation = useInsertAnalyticsSnapshot();

  const [formData, setFormData] = useState({
    events_hosted: 0,
    guests_served: 0,
    client_satisfaction: 100,
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupMessage, setCleanupMessage] = useState('');

  // Update form when latest data is loaded
  useEffect(() => {
    if (latestAnalytics) {
      setFormData({
        events_hosted: latestAnalytics.events_hosted,
        guests_served: latestAnalytics.guests_served,
        client_satisfaction: latestAnalytics.client_satisfaction,
      });
    }
  }, [latestAnalytics]);

  // Detect changes
  useEffect(() => {
    if (!latestAnalytics) {
      setHasChanges(true); // First entry
      return;
    }

    const changed =
      formData.events_hosted !== latestAnalytics.events_hosted ||
      formData.guests_served !== latestAnalytics.guests_served ||
      formData.client_satisfaction !== latestAnalytics.client_satisfaction;

    setHasChanges(changed);
  }, [formData, latestAnalytics]);

  const handleSaveSnapshot = async () => {
    try {
      await insertMutation.mutateAsync({
        updates: formData,
        updatedBy: 'dream-avenue',
      });

      toast.success(
        <div>
          <strong>✅ Analytics updated — new snapshot created</strong>
          <p style={{ fontSize: '0.875rem', marginTop: '4px', opacity: 0.9 }}>
            Public website updated with latest statistics
          </p>
        </div>,
        { duration: 4000 }
      );

      setHasChanges(false);
    } catch (error: any) {
      console.error('Insert error:', error);
      toast.error(error.message || 'Failed to save analytics snapshot', {
        description: 'Please try again',
      });
    }
  };

  const handleReset = () => {
    if (latestAnalytics) {
      setFormData({
        events_hosted: latestAnalytics.events_hosted,
        guests_served: latestAnalytics.guests_served,
        client_satisfaction: latestAnalytics.client_satisfaction,
      });
      setHasChanges(false);
      toast.info('Changes discarded');
    }
  };

  const handleCleanup = async () => {
    setCleanupLoading(true);
    setCleanupMessage('');

    try {
      // Call Supabase RPC function to safely clean analytics_summary
      const { error } = await supabase.rpc('safe_cleanup_analytics');

      if (error) {
        console.error('Cleanup failed:', error);
        setCleanupMessage(`❌ Cleanup failed: ${error.message}`);
        toast.error('Cleanup failed', {
          description: error.message,
        });
      } else {
        setCleanupMessage('✅ Cleanup complete. Only latest records remain.');
        toast.success('Analytics cleanup complete', {
          description: 'Old records have been removed successfully',
        });
      }
    } catch (err: any) {
      console.error('Cleanup error:', err);
      setCleanupMessage(`❌ Cleanup failed: ${err.message || 'Unknown error'}`);
      toast.error('Cleanup failed', {
        description: err.message || 'An unexpected error occurred',
      });
    }

    setCleanupLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-t-transparent rounded-full"
          style={{ borderColor: '#C8D46B', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #C8D46B, #B5C55A)',
              boxShadow: '0 4px 12px rgba(200, 212, 107, 0.3)',
            }}
          >
            <TrendingUp size={28} style={{ color: 'white' }} />
          </div>
          <div>
            <h2 className="text-3xl mb-1" style={{ color: '#2A2A2A', fontFamily: 'Poppins, sans-serif' }}>
              Analytics Editor
            </h2>
            <p style={{ color: '#666' }}>
              Create new analytics snapshots (append-only)
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div
          className="p-4 rounded-xl flex items-start gap-3"
          style={{ background: 'linear-gradient(135deg, rgba(200, 212, 107, 0.1), rgba(181, 197, 90, 0.05))', border: '1px solid #C8D46B40' }}
        >
          <Database size={20} style={{ color: '#C8D46B', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p className="text-sm" style={{ color: '#2A2A2A' }}>
              <strong>Append-Only Mode:</strong> Each save creates a new record. Previous data is preserved for audit history.
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricInput
          icon={Calendar}
          label="Events Hosted"
          value={formData.events_hosted}
          onChange={(val) => setFormData({ ...formData, events_hosted: val })}
          color="#E0C097"
          unit="+"
        />

        <MetricInput
          icon={Users}
          label="Guests Served"
          value={formData.guests_served}
          onChange={(val) => setFormData({ ...formData, guests_served: val })}
          color="#C8D46B"
          unit="+"
        />

        <MetricInput
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

      {/* Action Buttons */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-8 p-6 rounded-2xl"
            style={{
              background: 'white',
              border: '2px solid #C8D46B',
              boxShadow: '0 8px 24px rgba(200, 212, 107, 0.2)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(200, 212, 107, 0.2)' }}
                >
                  <AlertCircle size={24} style={{ color: '#C8D46B' }} />
                </div>
                <div>
                  <p style={{ color: '#2A2A2A' }}>
                    <strong>Ready to save new snapshot</strong>
                  </p>
                  <p className="text-sm" style={{ color: '#666' }}>
                    This will create a new record and update the public website
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  disabled={insertMutation.isPending}
                  className="px-6 py-3 rounded-xl transition-all duration-200"
                  style={{
                    background: 'white',
                    border: '2px solid #E8E5DB',
                    color: '#666',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSnapshot}
                  disabled={insertMutation.isPending}
                  className="px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #C8D46B, #B5C55A)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(200, 212, 107, 0.3)',
                  }}
                >
                  <Save size={20} />
                  {insertMutation.isPending ? 'Saving...' : 'Save New Snapshot'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Section */}
      {history.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <History size={20} style={{ color: '#999' }} />
            <h3 className="text-lg" style={{ color: '#2A2A2A' }}>
              Recent Snapshots
            </h3>
          </div>

          <div className="space-y-3">
            {history.map((snapshot, index) => (
              <motion.div
                key={snapshot.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl"
                style={{
                  background: index === 0 ? 'linear-gradient(135deg, rgba(200, 212, 107, 0.1), rgba(181, 197, 90, 0.05))' : '#F5F3EE',
                  border: index === 0 ? '2px solid #C8D46B40' : '1px solid #E8E5DB',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {index === 0 && (
                      <Sparkles size={20} style={{ color: '#C8D46B' }} />
                    )}
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <div className="text-xs mb-1" style={{ color: '#999' }}>Events</div>
                        <div className="text-lg" style={{ color: '#E0C097' }}>
                          {snapshot.events_hosted}+
                        </div>
                      </div>
                      <div>
                        <div className="text-xs mb-1" style={{ color: '#999' }}>Guests</div>
                        <div className="text-lg" style={{ color: '#C8D46B' }}>
                          {snapshot.guests_served}+
                        </div>
                      </div>
                      <div>
                        <div className="text-xs mb-1" style={{ color: '#999' }}>Satisfaction</div>
                        <div className="text-lg" style={{ color: '#F4A261' }}>
                          {snapshot.client_satisfaction}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm" style={{ color: '#999' }}>
                    <div className="flex items-center gap-2">
                      <UserIcon size={14} />
                      {snapshot.updated_by || 'N/A'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      {snapshot.updated_at
                        ? new Date(snapshot.updated_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Cleanup Section */}
      <div className="mt-12 pt-8" style={{ borderTop: '2px solid #E8E5DB' }}>
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Trash2 size={20} style={{ color: '#E0C097' }} />
            <h3 className="text-lg" style={{ color: '#2A2A2A' }}>
              Database Maintenance
            </h3>
          </div>
          <p className="text-sm" style={{ color: '#666' }}>
            Remove old analytics snapshots to keep your database clean and performant
          </p>
        </div>

        <div
          className="p-6 rounded-2xl"
          style={{
            background: 'white',
            border: '2px solid #E8E5DB',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p style={{ color: '#2A2A2A', marginBottom: '0.5rem' }}>
                <strong>Clean Up Old Records</strong>
              </p>
              <p className="text-sm" style={{ color: '#666' }}>
                This will keep only the latest snapshot and remove all historical records
              </p>
            </div>
            
            <button
              onClick={handleCleanup}
              disabled={cleanupLoading}
              className="px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2"
              style={{
                background: cleanupLoading 
                  ? '#CCCCCC' 
                  : 'linear-gradient(135deg, #E0C097, #C29A5D)',
                color: 'white',
                border: 'none',
                boxShadow: cleanupLoading 
                  ? 'none' 
                  : '0 4px 12px rgba(224, 192, 151, 0.3)',
                cursor: cleanupLoading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!cleanupLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(224, 192, 151, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!cleanupLoading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(224, 192, 151, 0.3)';
                }
              }}
            >
              <Trash2 size={20} />
              {cleanupLoading ? 'Cleaning...' : '🧹 Clean Up Old Records'}
            </button>
          </div>

          {/* Cleanup Message */}
          {cleanupMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 rounded-xl"
              style={{
                background: cleanupMessage.startsWith('✅') 
                  ? 'linear-gradient(135deg, rgba(200, 212, 107, 0.1), rgba(181, 197, 90, 0.05))' 
                  : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
                border: cleanupMessage.startsWith('✅') 
                  ? '1px solid #C8D46B40' 
                  : '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <p
                className="text-sm"
                style={{
                  color: cleanupMessage.startsWith('✅') ? '#2A2A2A' : '#DC2626',
                }}
              >
                {cleanupMessage}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}