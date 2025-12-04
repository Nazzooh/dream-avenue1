import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Calendar } from 'lucide-react';

// Luxury spin animation keyframes
const spinAnimation = {
  rotate: [0, 360],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'linear',
  },
};

const pulseAnimation = {
  scale: [1, 1.05, 1],
  opacity: [0.7, 1, 0.7],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

const shimmerAnimation = {
  x: [-1000, 1000],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'linear',
  },
};

// Public Website Loading
export const LoadingFallback: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FAF9F6 0%, #F5F7DC 50%, #FCF4E8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Poppins, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background elements */}
      <motion.div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(182, 245, 0, 0.1) 0%, transparent 70%)',
          filter: 'blur(80px)',
          top: '-200px',
          right: '-200px',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(224, 192, 151, 0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
          bottom: '-150px',
          left: '-150px',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Main loading content */}
      <div style={{ textAlign: 'center', zIndex: 10, position: 'relative' }}>
        {/* Outer ring */}
        <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto' }}>
          <motion.div
            animate={spinAnimation}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '3px solid transparent',
              borderTopColor: '#C8D46B',
              borderRightColor: '#E0C097',
            }}
          />

          {/* Middle ring */}
          <motion.div
            animate={{
              rotate: [360, 0],
              transition: {
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              },
            }}
            style={{
              position: 'absolute',
              inset: '10px',
              borderRadius: '50%',
              border: '2px solid transparent',
              borderLeftColor: '#B6F500',
              borderBottomColor: 'rgba(182, 245, 0, 0.3)',
            }}
          />

          {/* Center icon with glass morphism */}
          <motion.div
            animate={pulseAnimation}
            style={{
              position: 'absolute',
              inset: '30px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(182, 245, 0, 0.2), rgba(200, 212, 107, 0.3))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(182, 245, 0, 0.2)',
            }}
          >
            <Calendar size={32} color="#4A5D23" strokeWidth={2.5} />
          </motion.div>

          {/* Sparkle effects */}
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              position: 'absolute',
              top: '0',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            <Sparkles size={16} color="#C8D46B" fill="#C8D46B" />
          </motion.div>

          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear',
              delay: 1,
            }}
            style={{
              position: 'absolute',
              bottom: '0',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            <Sparkles size={12} color="#E0C097" fill="#E0C097" />
          </motion.div>
        </div>

        {/* Brand text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginTop: '32px' }}
        >
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#2A2A2A',
              marginBottom: '8px',
              letterSpacing: '-0.5px',
            }}
          >
            Dream Avenue
          </h2>
          <motion.p
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              fontSize: '0.9375rem',
              color: '#666666',
              fontWeight: 500,
            }}
          >
            Preparing your experience...
          </motion.p>
        </motion.div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '24px' }}>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.2,
              }}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #C8D46B, #B6F500)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Admin Panel Loading
export const AdminLoadingFallback: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FAF9F6 0%, #F5F7DC 30%, #FCF4E8 60%, #FFF5E1 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Poppins, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(200, 212, 107, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200, 212, 107, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          opacity: 0.5,
        }}
      />

      {/* Animated gradient orbs */}
      <motion.div
        style={{
          position: 'absolute',
          width: '800px',
          height: '800px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200, 212, 107, 0.15) 0%, transparent 70%)',
          filter: 'blur(100px)',
          top: '-300px',
          right: '-300px',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        style={{
          position: 'absolute',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(224, 192, 151, 0.2) 0%, transparent 70%)',
          filter: 'blur(100px)',
          bottom: '-250px',
          left: '-250px',
        }}
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Main loading content */}
      <div style={{ textAlign: 'center', zIndex: 10, position: 'relative' }}>
        {/* Glass morphism card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            background: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            borderRadius: '32px',
            padding: '48px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            animate={shimmerAnimation}
            style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
              pointerEvents: 'none',
            }}
          />

          {/* Multi-layered spinner */}
          <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto' }}>
            {/* Outer ring - Gold */}
            <motion.div
              animate={spinAnimation}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '4px solid transparent',
                borderTopColor: '#E0C097',
                borderRightColor: 'rgba(224, 192, 151, 0.3)',
              }}
            />

            {/* Middle ring - Lime */}
            <motion.div
              animate={{
                rotate: [360, 0],
                transition: {
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                },
              }}
              style={{
                position: 'absolute',
                inset: '15px',
                borderRadius: '50%',
                border: '3px solid transparent',
                borderLeftColor: '#C8D46B',
                borderBottomColor: 'rgba(200, 212, 107, 0.3)',
              }}
            />

            {/* Inner ring - Bright lime */}
            <motion.div
              animate={{
                rotate: [0, 360],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                },
              }}
              style={{
                position: 'absolute',
                inset: '30px',
                borderRadius: '50%',
                border: '2px solid transparent',
                borderTopColor: '#B6F500',
                borderRightColor: 'rgba(182, 245, 0, 0.2)',
              }}
            />

            {/* Center icon container */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                position: 'absolute',
                inset: '45px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(182, 245, 0, 0.3), rgba(200, 212, 107, 0.4))',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 40px rgba(182, 245, 0, 0.3)',
              }}
            >
              <Calendar size={36} color="#4A5D23" strokeWidth={2.5} />
            </motion.div>

            {/* Orbiting particles */}
            {[0, 120, 240].map((angle, i) => (
              <motion.div
                key={i}
                animate={{
                  rotate: [angle, angle + 360],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: i * 0.3,
                }}
                style={{
                  position: 'absolute',
                  inset: 0,
                }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.4,
                  }}
                  style={{
                    position: 'absolute',
                    top: '0',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: i === 0 ? '#C8D46B' : i === 1 ? '#E0C097' : '#B6F500',
                    boxShadow: `0 0 20px ${i === 0 ? '#C8D46B' : i === 1 ? '#E0C097' : '#B6F500'}`,
                  }}
                />
              </motion.div>
            ))}
          </div>

          {/* Admin branding */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ marginTop: '40px' }}
          >
            <motion.div
              style={{
                display: 'inline-block',
                padding: '8px 20px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(200, 212, 107, 0.3), rgba(224, 192, 151, 0.3))',
                border: '1px solid rgba(200, 212, 107, 0.4)',
                marginBottom: '16px',
              }}
              animate={{
                boxShadow: [
                  '0 0 20px rgba(200, 212, 107, 0.3)',
                  '0 0 30px rgba(200, 212, 107, 0.5)',
                  '0 0 20px rgba(200, 212, 107, 0.3)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#4A5D23',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                }}
              >
                Admin Portal
              </span>
            </motion.div>

            <h2
              style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                color: '#2A2A2A',
                marginBottom: '12px',
                letterSpacing: '-0.5px',
              }}
            >
              Dream Avenue
            </h2>

            <motion.p
              animate={{
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                fontSize: '0.9375rem',
                color: '#666666',
                fontWeight: 500,
                marginBottom: '24px',
              }}
            >
              Loading Admin Dashboard...
            </motion.p>

            {/* Loading bar */}
            <div
              style={{
                width: '200px',
                height: '4px',
                background: 'rgba(200, 212, 107, 0.2)',
                borderRadius: '10px',
                overflow: 'hidden',
                margin: '0 auto',
              }}
            >
              <motion.div
                animate={{
                  x: [-200, 200],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{
                  width: '100px',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, #C8D46B, transparent)',
                  borderRadius: '10px',
                }}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Status text */}
        <motion.p
          animate={{
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            marginTop: '24px',
            fontSize: '0.875rem',
            color: '#888888',
            fontWeight: 500,
          }}
        >
          Initializing secure connection...
        </motion.p>
      </div>
    </div>
  );
};

// Inline Calendar Loading Component (for use within calendar components)
export const CalendarLoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const dimensions = size === 'sm' ? 60 : size === 'md' ? 100 : 140;
  const iconSize = size === 'sm' ? 20 : size === 'md' ? 28 : 36;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      <div style={{ position: 'relative', width: `${dimensions}px`, height: `${dimensions}px` }}>
        <motion.div
          animate={spinAnimation}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: '#C8D46B',
            borderRightColor: 'rgba(200, 212, 107, 0.3)',
          }}
        />

        <motion.div
          animate={{
            rotate: [360, 0],
            transition: {
              duration: 2.5,
              repeat: Infinity,
              ease: 'linear',
            },
          }}
          style={{
            position: 'absolute',
            inset: '8px',
            borderRadius: '50%',
            border: '2px solid transparent',
            borderLeftColor: '#B6F500',
            borderBottomColor: 'rgba(182, 245, 0, 0.3)',
          }}
        />

        <motion.div
          animate={pulseAnimation}
          style={{
            position: 'absolute',
            inset: size === 'sm' ? '16px' : size === 'md' ? '22px' : '30px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(182, 245, 0, 0.15), rgba(200, 212, 107, 0.25))',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(182, 245, 0, 0.2)',
          }}
        >
          <Calendar size={iconSize} color="#4A5D23" strokeWidth={2.5} />
        </motion.div>
      </div>

      <motion.p
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          marginTop: '20px',
          fontSize: size === 'sm' ? '0.8125rem' : '0.875rem',
          color: '#666666',
          fontWeight: 500,
        }}
      >
        Loading calendar...
      </motion.p>
    </div>
  );
};

// Inline spinner for buttons/small areas
export const InlineSpinner: React.FC<{ color?: string; size?: number }> = ({
  color = '#C8D46B',
  size = 20,
}) => {
  return (
    <motion.div
      animate={{
        rotate: [0, 360],
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        border: `2px solid transparent`,
        borderTopColor: color,
        borderRightColor: `${color}40`,
        borderRadius: '50%',
      }}
    />
  );
};
