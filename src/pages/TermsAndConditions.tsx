import { motion } from 'motion/react';
import { ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import termsImage1 from 'figma:asset/fc2506f550c6d919223dabea349d993424eba7ac.png';
import termsImage2 from 'figma:asset/faebd163188685a7655f5105047bc98e08cb5968.png';

export default function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }}>
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          background: 'linear-gradient(135deg, #B6F500 0%, #E0C097 100%)',
          padding: '1.5rem 2rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <motion.button
            onClick={() => navigate(-1)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.75rem', color: '#2D2D2D', margin: 0 }}>
              Hall Rules and Guidelines
            </h1>
            <p style={{ margin: '0.25rem 0 0', color: '#4A4A4A', fontSize: '0.9375rem' }}>
              Dream Avenue Convention Center
            </p>
          </div>
          <motion.button
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '0.625rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              fontWeight: 600,
              color: '#2D2D2D',
            }}
          >
            <Home size={18} />
            Home
          </motion.button>
        </div>
      </motion.div>

      {/* Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Introduction */}
          <div style={{ padding: '2rem', borderBottom: '2px solid #E0C097' }}>
            <p style={{ fontSize: '1rem', lineHeight: '1.7', color: '#4A4A4A', margin: 0 }}>
              When planning an event at our auditorium, please ensure that you adhere to the following
              rules and guidelines to ensure a smooth and successful experience.
            </p>
          </div>

          {/* Terms Image 1 - Hall Rules and Guidelines */}
          <div style={{ width: '100%', background: '#FAF9F6' }}>
            <ImageWithFallback
              src={termsImage1}
              alt="Dream Avenue Hall Rules and Guidelines - Part 1"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          </div>

          {/* Terms Image 2 - Additional Rules */}
          <div style={{ width: '100%', background: '#FAF9F6' }}>
            <ImageWithFallback
              src={termsImage2}
              alt="Dream Avenue Hall Rules and Guidelines - Part 2"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          </div>

          {/* Footer Note */}
          <div
            style={{
              padding: '2rem',
              background: 'linear-gradient(135deg, #FAF9F6 0%, #FFFFFF 100%)',
              borderTop: '2px solid #E0C097',
            }}
          >
            <p
              style={{
                fontSize: '0.9375rem',
                lineHeight: '1.7',
                color: '#4A4A4A',
                margin: 0,
                fontStyle: 'italic',
                textAlign: 'center',
              }}
            >
              These rules are designed to ensure the safety and satisfaction of all guests and participants.
              We appreciate your cooperation and wish you a successful event!
            </p>
            <div
              style={{
                marginTop: '1.5rem',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                color: '#666',
                fontSize: '0.875rem',
              }}
            >
              <span>📞</span>
              <span>Mobile: 8606206096, 8606206002</span>
            </div>
            <div
              style={{
                marginTop: '0.5rem',
                textAlign: 'center',
                color: '#666',
                fontSize: '0.875rem',
              }}
            >
              📍 Near Punchiri Bus stop, Karuvanthiruthy Peroke
            </div>
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ marginTop: '2rem', textAlign: 'center' }}
        >
          <motion.button
            onClick={() => navigate(-1)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: 'linear-gradient(135deg, #B6F500, #E0C097)',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: 600,
              color: '#2D2D2D',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(182, 245, 0, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <ArrowLeft size={20} />
            Back to Booking
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
