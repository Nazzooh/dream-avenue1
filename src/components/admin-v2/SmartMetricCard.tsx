// components/admin-v2/SmartMetricCard.tsx
// Enhanced Admin Analytics Dashboard - Smart Metrics Visualization
// Features: Animated progress rings, real-time glow sync, interactive tooltips

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LucideIcon, Info, Zap } from 'lucide-react';

interface SmartMetricCardProps {
  title: string;
  value: number;
  maxValue?: number;
  icon: LucideIcon;
  unit?: string;
  color: string;
  glowColor: string;
  updatedAt?: string;
  updatedBy?: string;
  isUpdating?: boolean;
  showProgressRing?: boolean;
  delay?: number;
}

export function SmartMetricCard({
  title,
  value,
  maxValue = 100,
  icon: Icon,
  unit = '',
  color,
  glowColor,
  updatedAt,
  updatedBy,
  isUpdating = false,
  showProgressRing = false,
  delay = 0,
}: SmartMetricCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasGlowed, setHasGlowed] = useState(false);
  const previousValue = useRef(value);

  // Fade in animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Animated counter
  useEffect(() => {
    const duration = 1500;
    const startTime = performance.now();
    const startValue = displayValue;
    const endValue = value;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out-cubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (endValue - startValue) * easeProgress);
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  // Glow effect when value changes
  useEffect(() => {
    if (previousValue.current !== value && previousValue.current !== 0) {
      setHasGlowed(true);
      const timer = setTimeout(() => setHasGlowed(false), 2000);
      previousValue.current = value;
      return () => clearTimeout(timer);
    }
    previousValue.current = value;
  }, [value]);

  // Calculate progress percentage
  const percentage = showProgressRing ? (value / maxValue) * 100 : 0;
  const circumference = 2 * Math.PI * 70; // radius = 70
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.6, delay: delay / 1000 }}
      className="smart-metric-card"
      style={{
        position: 'relative',
        background: '#FFFFFF',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: hasGlowed 
          ? `0 8px 32px ${glowColor}40, 0 0 60px ${glowColor}30`
          : '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: `2px solid ${hasGlowed ? glowColor : 'transparent'}`,
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (!hasGlowed) {
          e.currentTarget.style.boxShadow = `0 8px 32px ${glowColor}20, 0 0 40px ${glowColor}15`;
          e.currentTarget.style.transform = 'translateY(-4px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!hasGlowed) {
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {/* Gradient Top Border */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${color}, ${glowColor})`,
          opacity: isUpdating ? 1 : 0.6,
          transition: 'opacity 0.3s ease',
        }}
      >
        {isUpdating && (
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '50%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
            }}
            animate={{ x: ['-100%', '300%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </div>

      {/* Real-time update pulse */}
      {hasGlowed && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 1 }}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${glowColor}40, transparent)`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Info tooltip button */}
      {(updatedAt || updatedBy) && (
        <div
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            cursor: 'pointer',
          }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666666',
            }}
          >
            <Info size={16} />
          </motion.div>

          {/* Tooltip */}
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute',
                  top: '40px',
                  right: '0',
                  background: '#2A2A2A',
                  color: '#FFFFFF',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                  zIndex: 100,
                }}
              >
                <div style={{ marginBottom: '4px', opacity: 0.7 }}>Last updated</div>
                <div style={{ fontWeight: '600' }}>{formatDate(updatedAt)}</div>
                {updatedBy && (
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ opacity: 0.7 }}>Updated by</div>
                    <div style={{ fontWeight: '600', marginTop: '2px' }}>{updatedBy}</div>
                  </div>
                )}
                {/* Tooltip arrow */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '12px',
                    width: '12px',
                    height: '12px',
                    background: '#2A2A2A',
                    transform: 'rotate(45deg)',
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div style={{ position: 'relative' }}>
        {/* Icon with gradient background */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: `linear-gradient(135deg, ${color}, ${glowColor})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: `0 8px 24px ${glowColor}30`,
            color: '#FFFFFF',
          }}
        >
          <Icon size={32} strokeWidth={2.5} />
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#666666',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {title}
        </h3>

        {/* Value with animated counter */}
        <div style={{ marginBottom: showProgressRing ? '24px' : '0' }}>
          <motion.div
            key={displayValue}
            initial={{ scale: 1.1, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              fontSize: '3rem',
              fontWeight: '800',
              color: color,
              lineHeight: 1,
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            {displayValue.toLocaleString()}
            <span style={{ fontSize: '2rem', opacity: 0.7 }}>{unit}</span>
          </motion.div>
        </div>

        {/* Progress Ring (for satisfaction percentage) */}
        {showProgressRing && (
          <div style={{ position: 'relative', marginTop: '24px' }}>
            <svg
              width="180"
              height="180"
              viewBox="0 0 180 180"
              style={{
                display: 'block',
                margin: '0 auto',
                transform: 'rotate(-90deg)',
              }}
            >
              {/* Background ring */}
              <circle
                cx="90"
                cy="90"
                r="70"
                fill="none"
                stroke="rgba(0, 0, 0, 0.05)"
                strokeWidth="12"
              />
              
              {/* Progress ring with gradient */}
              <defs>
                <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={color} />
                  <stop offset="100%" stopColor={glowColor} />
                </linearGradient>
              </defs>
              
              <motion.circle
                cx="90"
                cy="90"
                r="70"
                fill="none"
                stroke={`url(#gradient-${title})`}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                style={{
                  filter: `drop-shadow(0 0 12px ${glowColor}60)`,
                }}
              />
            </svg>

            {/* Centered percentage */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}
            >
              <motion.div
                key={percentage}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{
                  fontSize: '2rem',
                  fontWeight: '800',
                  color: color,
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                {Math.round(percentage)}%
              </motion.div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#999999',
                  marginTop: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Excellence
              </div>
            </div>
          </div>
        )}

        {/* Gradient shine overlay on hover */}
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: `linear-gradient(90deg, transparent, ${glowColor}15, transparent)`,
            pointerEvents: 'none',
          }}
          whileHover={{
            left: '100%',
            transition: { duration: 0.6, ease: 'easeInOut' },
          }}
        />
      </div>

      {/* Update indicator */}
      {isUpdating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            color: glowColor,
            fontWeight: '600',
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Zap size={14} />
          </motion.div>
          Updating...
        </motion.div>
      )}
    </motion.div>
  );
}
