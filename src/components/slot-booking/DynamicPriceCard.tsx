import { motion, AnimatePresence } from 'motion/react';
import { TrendingDown, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DynamicPriceCardProps {
  basePrice: number;
  discount: number;
  selectedSlot: string;
}

export function DynamicPriceCard({ basePrice, discount, selectedSlot }: DynamicPriceCardProps) {
  const [displayPrice, setDisplayPrice] = useState(basePrice);
  const finalPrice = basePrice; // Always use full price, no discount

  // Animate price change
  useEffect(() => {
    const duration = 500; // ms
    const steps = 30;
    const increment = (finalPrice - displayPrice) / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayPrice(finalPrice);
        clearInterval(timer);
      } else {
        setDisplayPrice((prev) => prev + increment);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [finalPrice]);

  const slotLabels: Record<string, string> = {
    full_day: 'Full Day',
    half_day_morning: 'Half Day (Morning)',
    half_day_evening: 'Half Day (Evening)',
    night: 'Night',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'linear-gradient(135deg, #FAF9F6 0%, #FFF 100%)',
        borderRadius: '20px',
        padding: '2rem',
        border: '3px solid rgba(182, 245, 0, 0.3)',
        boxShadow: '0 8px 32px rgba(182, 245, 0, 0.2)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background glow */}
      <motion.div
        animate={{
          background: [
            'radial-gradient(circle at 0% 0%, #B6F50020, transparent 50%)',
            'radial-gradient(circle at 100% 100%, #E0C09720, transparent 50%)',
            'radial-gradient(circle at 0% 0%, #B6F50020, transparent 50%)',
          ],
        }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Sparkles size={24} style={{ color: '#B6F500' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
            Your Estimated Total
          </h3>
        </div>

        {/* Selected Slot */}
        <div
          style={{
            padding: '1rem',
            background: 'rgba(182, 245, 0, 0.1)',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            border: '2px solid rgba(182, 245, 0, 0.2)',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>
            Selected Time Slot
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#2D2D2D' }}>
            {slotLabels[selectedSlot]}
          </div>
        </div>

        {/* Price Breakdown */}
        <div style={{ marginBottom: '1.5rem' }}>
          {/* Base Price */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.9375rem', color: '#666' }}>Package Price:</span>
            <span style={{ fontSize: '0.9375rem', fontWeight: 500 }}>
              ₹{basePrice.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Divider */}
          <div
            style={{
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #E0E0E0, transparent)',
              margin: '1rem 0',
            }}
          />

          {/* Final Price */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>Total Amount:</span>
            <motion.div
              key={finalPrice}
              initial={{ scale: 1.2, color: '#B6F500' }}
              animate={{ scale: 1, color: '#2D2D2D' }}
              transition={{ duration: 0.3 }}
              style={{
                fontSize: '2rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #B6F500, #E0C097)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              ₹{Math.round(displayPrice).toLocaleString('en-IN')}
            </motion.div>
          </div>
        </div>

        {/* Info Text */}
        <p
          style={{
            fontSize: '0.75rem',
            color: '#999',
            textAlign: 'center',
            marginTop: '1.5rem',
            marginBottom: 0,
          }}
        >
          * Final price will be confirmed after admin review
        </p>
      </div>
    </motion.div>
  );
}