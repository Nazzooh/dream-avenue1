import { motion } from 'motion/react';
import { Heart } from 'lucide-react';

interface SatisfactionRateCardProps {
  value: number; // 0-100
  delay?: number;
}

export function SatisfactionRateCard({ value, delay = 0 }: SatisfactionRateCardProps) {
  // Progress ring calculations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      style={{
        background: '#FAF9F6',
        padding: 'var(--space-8)',
        borderRadius: '20px',
        textAlign: 'center',
        boxShadow: '0 2px 12px rgba(200, 212, 107, 0.25)',
        border: '2px solid transparent',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      whileHover={{
        borderColor: 'rgba(200, 212, 107, 0.4)',
        boxShadow: '0 4px 20px rgba(200, 212, 107, 0.35)',
        y: -4,
      }}
    >
      {/* Subtle gradient glow background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(200, 212, 107, 0.08) 0%, rgba(224, 192, 151, 0.08) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content container */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Heart Icon with glow */}
        <motion.div
          className="satisfaction-icon"
          style={{
            width: '48px',
            height: '48px',
            margin: '0 auto var(--space-6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#C8D46B',
            filter: 'drop-shadow(0 0 12px rgba(182, 245, 0, 0.25))',
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: delay + 0.2 }}
          whileHover={{
            scale: 1.1,
            filter: 'drop-shadow(0 0 16px rgba(182, 245, 0, 0.4))',
          }}
        >
          <Heart size={48} strokeWidth={1.5} />
        </motion.div>

        {/* Circular Progress Ring with centered percentage */}
        <motion.div
          className="satisfaction-ring"
          style={{
            position: 'relative',
            width: '140px',
            height: '140px',
            margin: '0 auto var(--space-6)',
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: delay + 0.3 }}
        >
          <svg
            width="140"
            height="140"
            viewBox="0 0 120 120"
            style={{
              transform: 'rotate(-90deg)',
            }}
          >
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="rgba(200, 212, 107, 0.15)"
              strokeWidth="8"
            />
            {/* Progress circle with animation */}
            <motion.circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="url(#satisfactionGradientUnique)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              whileInView={{ strokeDashoffset }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: delay + 0.5 }}
              style={{
                filter: 'drop-shadow(0 0 8px rgba(200, 212, 107, 0.5))',
              }}
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="satisfactionGradientUnique" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C8D46B" />
                <stop offset="50%" stopColor="#B6F500" />
                <stop offset="100%" stopColor="#E0C097" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Centered percentage text with counter animation */}
          <motion.div
            className="satisfaction-percentage"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#1A1A1A',
              letterSpacing: '-0.02em',
              textShadow: '0 2px 8px rgba(200, 212, 107, 0.2)',
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: delay + 0.8 }}
          >
            {value}%
          </motion.div>
        </motion.div>

        {/* Label */}
        <motion.div
          style={{
            fontSize: '1rem',
            color: '#333A40',
            fontWeight: '500',
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: delay + 0.4 }}
        >
          Satisfaction Rate
        </motion.div>
      </div>

      {/* Hover pulse effect on the ring */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          border: '2px solid rgba(200, 212, 107, 0)',
          pointerEvents: 'none',
        }}
        whileHover={{
          border: '2px solid rgba(200, 212, 107, 0.3)',
          scale: 1.05,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}
