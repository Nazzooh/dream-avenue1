import { motion, useScroll, useTransform } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Calendar, MapPin, Users, ChevronDown, ArrowRight, Award, Star, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';

// Faster animation settings for better performance
const fastTransition = { duration: 0.4, ease: 'easeOut' };

export function Hero() {
  const navigate = useNavigate();
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { scrollY } = useScroll();
  
  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Show floating CTA after scrolling 300px with hysteresis (show at 300px, hide at 150px) with hysteresis (show at 300px, hide at 150px)
  // Show floating CTA after scrolling 5500px with hysteresis (show at 5500px, hide at 2250px)
  useEffect(() => {
    const unsubscribe = scrollY.on('change', (latest) => {
      if (latest > 5500) {
        setShowFloatingCTA(true);
      } else if (latest < 2250) {
        setShowFloatingCTA(false);
      }
    });
    return () => unsubscribe();
  }, [scrollY]);

  // Parallax effects
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section 
      id="home" 
      style={{ 
        position: 'relative', 
        overflow: 'hidden',
        minHeight: isMobile ? 'calc(110vh - 60px)' : '110vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
        padding: isMobile ? '60px 0 40px' : 'clamp(80px, 12vh, 140px) 0 clamp(60px, 10vh, 100px)',
      }}
    >
      {/* YouTube Video Background */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          y: heroY,
          overflow: 'hidden',
        }}
      >
        <iframe
          src="https://www.youtube-nocookie.com/embed/qXgr8igDL84?si=Ed55gP9UjPLfyvg6&autoplay=1&mute=1&controls=0&loop=1&playlist=qXgr8igDL84&playsinline=1&modestbranding=1&rel=0&showinfo=0&disablekb=1"
          title="Dream Avenue Convention Center Background"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            // Both Mobile & Desktop: Height fills screen, width extends (crops sides)
            // Center portion shown, left/right sides cropped automatically
            width: 'auto',
            height: '100%',
            minWidth: 'auto',
            minHeight: '100%',
            aspectRatio: '16 / 9',
            border: 'none',
            pointerEvents: 'none',
          }}
        />
      </motion.div>

      {/* Gradient Overlays for depth */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: isMobile 
            ? `linear-gradient(180deg, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0.75) 100%)`
            : `linear-gradient(180deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.4) 40%, rgba(0, 0, 0, 0.6) 100%)`,
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Premium Pattern Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `
            radial-gradient(circle at 20% 50%, rgba(200, 212, 107, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(224, 192, 151, 0.06) 0%, transparent 50%)
          `,
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* MOBILE LAYOUT */}
      {isMobile && (
        <motion.div 
          style={{ 
            position: 'relative', 
            zIndex: 10,
            width: '100%',
            padding: '0 20px',
            opacity: heroOpacity,
          }}
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '28px',
            alignItems: 'center',
          }}>
            
            {/* Mobile Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...fastTransition, delay: 0.1 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                background: 'linear-gradient(135deg, rgba(200, 212, 107, 0.2) 0%, rgba(224, 192, 151, 0.15) 100%)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(200, 212, 107, 0.4)',
                borderRadius: '50px',
                boxShadow: '0 4px 20px rgba(200, 212, 107, 0.2)',
              }}
            >
              <Award size={14} style={{ color: '#C8D46B' }} />
              <span style={{ 
                fontSize: '0.75rem',
                fontWeight: '700',
                color: '#FAF9F6',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}>
                Premium Venue
              </span>
            </motion.div>

            {/* Mobile Headline Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...fastTransition, delay: 0.2 }}
              style={{
                background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.85) 0%, rgba(20, 20, 20, 0.9) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(200, 212, 107, 0.2)',
                borderRadius: '24px',
                padding: '32px 24px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(200, 212, 107, 0.1)',
                width: '100%',
                textAlign: 'center',
              }}
            >
              <h1 style={{
                fontSize: 'clamp(2rem, 8vw, 2.75rem)',
                fontFamily: 'var(--font-heading)',
                fontWeight: '700',
                lineHeight: '1.15',
                margin: '0 0 16px 0',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF9F6 50%, #E0C097 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.01em',
              }}>
                Where Dreams Meet Avenue
              </h1>
              
              <p style={{
                fontSize: '1rem',
                lineHeight: '1.6',
                color: 'rgba(250, 249, 246, 0.85)',
                margin: '0',
                fontWeight: '400',
              }}>
                Transform your special moments into unforgettable celebrations
              </p>
            </motion.div>

            {/* Mobile CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...fastTransition, delay: 0.3 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                width: '100%',
              }}
            >
              <motion.button
                onClick={() => navigate('/booking')}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '18px 28px',
                  background: 'linear-gradient(135deg, #C8D46B 0%, #B6C55E 100%)',
                  color: '#1A1A1A',
                  border: 'none',
                  borderRadius: '16px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(200, 212, 107, 0.4), 0 0 0 1px rgba(200, 212, 107, 0.5)',
                  width: '100%',
                }}
              >
                <Calendar size={20} />
                <span>Book Your Event</span>
                <ArrowRight size={18} />
              </motion.button>

              <motion.a
                href="#facilities"
                onClick={(e) => handleNavClick(e, '#facilities')}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '18px 28px',
                  background: 'rgba(250, 249, 246, 0.1)',
                  color: '#FAF9F6',
                  border: '2px solid rgba(250, 249, 246, 0.25)',
                  borderRadius: '16px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  textDecoration: 'none',
                  width: '100%',
                }}
              >
                <Users size={20} />
                <span>Explore Venue</span>
              </motion.a>
            </motion.div>

            {/* Mobile Features Grid - 2x2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                width: '100%',
                marginTop: '12px',
              }}
            >
              {[
                { icon: Users, label: '500+', desc: 'Guests' },
                { icon: Award, label: 'Premium', desc: 'Hall' },
                { icon: Star, label: 'Modern', desc: 'Setup' },
                { icon: MapPin, label: 'Prime', desc: 'Location' },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.08 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '20px 12px',
                    background: 'rgba(250, 249, 246, 0.06)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(250, 249, 246, 0.1)',
                    minHeight: '110px',
                  }}
                  whileTap={{
                    scale: 0.95,
                    background: 'rgba(200, 212, 107, 0.12)',
                  }}
                >
                  <feature.icon size={24} style={{ color: '#C8D46B' }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '0.9375rem',
                      fontWeight: '700',
                      color: '#FAF9F6',
                      lineHeight: '1.2',
                    }}>
                      {feature.label}
                    </div>
                    <div style={{
                      fontSize: '0.8125rem',
                      color: 'rgba(250, 249, 246, 0.6)',
                      marginTop: '2px',
                    }}>
                      {feature.desc}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Mobile Contact Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: 'rgba(200, 212, 107, 0.08)',
                border: '1px solid rgba(200, 212, 107, 0.2)',
                borderRadius: '12px',
                marginTop: '8px',
              }}
            >
              <Phone size={16} style={{ color: '#C8D46B' }} />
              <span style={{
                fontSize: '0.875rem',
                color: 'rgba(250, 249, 246, 0.8)',
                fontWeight: '500',
              }}>
                Call us for instant booking
              </span>
            </motion.div>

          </div>
        </motion.div>
      )}

      {/* DESKTOP LAYOUT */}
      {!isMobile && (
        <motion.div 
          style={{ 
            position: 'relative', 
            zIndex: 10,
            width: '100%',
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 clamp(20px, 5vw, 80px)',
            opacity: heroOpacity,
          }}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 'clamp(40px, 8vw, 80px)',
            alignItems: 'center',
          }}>
            
            {/* Main Hero Content */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 'clamp(24px, 4vw, 48px)',
              padding: 'clamp(20px, 4vw, 60px) clamp(16px, 3vw, 40px)',
            }}>
              
              {/* Premium Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...fastTransition, delay: 0.1 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'clamp(10px, 2vw, 16px)',
                  padding: 'clamp(10px, 2vw, 14px) clamp(20px, 4vw, 32px)',
                  background: 'linear-gradient(135deg, rgba(200, 212, 107, 0.15) 0%, rgba(224, 192, 151, 0.1) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(200, 212, 107, 0.3)',
                  borderRadius: '100px',
                  boxShadow: '0 8px 32px rgba(200, 212, 107, 0.15)',
                  marginBottom: 'clamp(8px, 2vw, 16px)',
                }}
              >
                <Award size={18} style={{ color: '#C8D46B' }} />
                <span style={{ 
                  fontSize: 'clamp(0.8125rem, 1.5vw, 0.9375rem)',
                  fontWeight: '600',
                  color: '#FAF9F6',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}>
                  Premium Event Venue
                </span>
                <Sparkles size={18} style={{ color: '#E0C097' }} />
              </motion.div>

              {/* Main Headline */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...fastTransition, delay: 0.2 }}
                style={{
                  maxWidth: '900px',
                  margin: '0 auto',
                  padding: '0 clamp(16px, 3vw, 24px)',
                }}
              >
                <h1 style={{
                  fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: '700',
                  lineHeight: '1.1',
                  margin: '0 0 clamp(20px, 4vw, 32px) 0',
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF9F6 50%, #E0C097 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.02em',
                }}>
                  Where Dreams Meet Avenue
                </h1>
                
                <p style={{
                  fontSize: 'clamp(1.125rem, 2vw, 1.375rem)',
                  lineHeight: '1.7',
                  color: 'rgba(250, 249, 246, 0.9)',
                  maxWidth: '700px',
                  margin: '0 auto',
                  fontWeight: '400',
                  padding: '0 clamp(12px, 2vw, 20px)',
                }}>
                  Transform your special moments into unforgettable celebrations. 
                  A luxury venue crafted for weddings, corporate events, and grand celebrations.
                </p>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...fastTransition, delay: 0.3 }}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'clamp(12px, 2.5vw, 20px)',
                  justifyContent: 'center',
                  marginTop: 'clamp(16px, 3vw, 32px)',
                  padding: '0 clamp(16px, 3vw, 24px)',
                }}
              >
                <motion.button
                  onClick={() => navigate('/booking')}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'clamp(8px, 1.5vw, 14px)',
                    padding: 'clamp(14px, 2.5vw, 20px) clamp(24px, 4vw, 40px)',
                    background: 'linear-gradient(135deg, #C8D46B 0%, #B6C55E 100%)',
                    color: '#1A1A1A',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: 'clamp(0.9375rem, 1.8vw, 1.0625rem)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 12px 40px rgba(200, 212, 107, 0.4), 0 0 0 1px rgba(200, 212, 107, 0.5)',
                    transition: 'all 0.3s ease',
                    minWidth: 'clamp(180px, 20vw, 220px)',
                  }}
                >
                  <Calendar size={22} />
                  <span>Book Your Event</span>
                  <ArrowRight size={20} />
                </motion.button>

                <motion.a
                  href="#facilities"
                  onClick={(e) => handleNavClick(e, '#facilities')}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'clamp(8px, 1.5vw, 14px)',
                    padding: 'clamp(14px, 2.5vw, 20px) clamp(24px, 4vw, 40px)',
                    background: 'rgba(250, 249, 246, 0.08)',
                    color: '#FAF9F6',
                    border: '2px solid rgba(250, 249, 246, 0.2)',
                    borderRadius: '12px',
                    fontSize: 'clamp(0.9375rem, 1.8vw, 1.0625rem)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    minWidth: 'clamp(180px, 20vw, 220px)',
                  }}
                >
                  <Users size={22} />
                  <span>Explore Venue</span>
                </motion.a>
              </motion.div>

              {/* Key Features Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(160px, 20vw, 200px), 1fr))',
                  gap: 'clamp(16px, 3vw, 28px)',
                  marginTop: 'clamp(32px, 6vw, 64px)',
                  padding: 'clamp(24px, 4vw, 40px) clamp(16px, 3vw, 32px)',
                  borderTop: '1px solid rgba(200, 212, 107, 0.2)',
                  width: '100%',
                  maxWidth: '900px',
                }}
              >
                {[
                  { icon: Users, label: '500+ Guests', desc: 'Capacity' },
                  { icon: Award, label: 'Premium Hall', desc: 'Luxury Space' },
                  { icon: Star, label: 'Modern Setup', desc: 'Amenities' },
                  { icon: MapPin, label: 'Prime Location', desc: 'Easy Access' },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 'clamp(8px, 1.5vw, 12px)',
                      padding: 'clamp(16px, 3vw, 24px) clamp(12px, 2vw, 20px)',
                      background: 'rgba(250, 249, 246, 0.05)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '12px',
                      border: '1px solid rgba(250, 249, 246, 0.1)',
                      transition: 'all 0.3s ease',
                      minHeight: 'clamp(120px, 15vw, 140px)',
                    }}
                    whileHover={{
                      background: 'rgba(200, 212, 107, 0.1)',
                      borderColor: 'rgba(200, 212, 107, 0.3)',
                      y: -4,
                    }}
                  >
                    <feature.icon size={28} style={{ color: '#C8D46B', marginBottom: '4px' }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: 'clamp(0.9375rem, 1.8vw, 1.0625rem)',
                        fontWeight: '700',
                        color: '#FAF9F6',
                        marginBottom: 'clamp(2px, 0.5vw, 4px)',
                        lineHeight: '1.3',
                      }}>
                        {feature.label}
                      </div>
                      <div style={{
                        fontSize: 'clamp(0.8125rem, 1.5vw, 0.875rem)',
                        color: 'rgba(250, 249, 246, 0.6)',
                        lineHeight: '1.4',
                      }}>
                        {feature.desc}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

            </div>
          </div>
        </motion.div>
      )}

      {/* Scroll Indicator - Desktop Only */}
      {!isMobile && (
        <motion.a
          href="#facilities"
          onClick={(e) => handleNavClick(e, '#facilities')}
          style={{
            position: 'absolute',
            bottom: 'clamp(32px, 6vw, 60px)',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'clamp(8px, 1.5vw, 12px)',
            color: '#C8D46B',
            zIndex: 20,
            textDecoration: 'none',
            padding: '12px 24px',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          whileHover={{ y: 4 }}
        >
          <span style={{ 
            fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)', 
            letterSpacing: '1px',
            fontWeight: '600',
            textTransform: 'uppercase',
          }}>
            Scroll to explore
          </span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 'clamp(28px, 5vw, 36px)',
              height: 'clamp(28px, 5vw, 36px)',
              border: '2px solid #C8D46B',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronDown size={20} />
          </motion.div>
        </motion.a>
      )}

      {/* Floating Scroll-Triggered CTA Button */}
      <motion.button
        onClick={() => navigate('/booking')}
        initial={{ opacity: 0, y: 100, scale: 0.8 }}
        animate={{ 
          opacity: showFloatingCTA ? 1 : 0,
          y: showFloatingCTA ? 0 : 100,
          scale: showFloatingCTA ? 1 : 0.8,
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          bottom: isMobile ? '16px' : 'clamp(20px, 4vw, 30px)',
          right: isMobile ? '16px' : 'clamp(20px, 4vw, 30px)',
          zIndex: 1000,
          background: 'linear-gradient(135deg, #C8D46B 0%, #B6C55E 100%)',
          color: '#1A1A1A',
          padding: isMobile ? '14px 24px' : 'clamp(14px, 2.5vw, 18px) clamp(24px, 4vw, 32px)',
          borderRadius: '60px',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 12px 48px rgba(200, 212, 107, 0.5), 0 0 0 1px rgba(200, 212, 107, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '8px' : 'clamp(10px, 2vw, 14px)',
          fontWeight: '700',
          fontSize: isMobile ? '0.9375rem' : 'clamp(0.9375rem, 1.8vw, 1.0625rem)',
          pointerEvents: showFloatingCTA ? 'auto' : 'none',
        }}
        whileHover={!isMobile ? {
          scale: 1.08,
          boxShadow: '0 16px 56px rgba(200, 212, 107, 0.6), 0 0 0 2px rgba(200, 212, 107, 0.4)',
        } : {}}
        whileTap={{ scale: 0.96 }}
      >
        <Calendar size={isMobile ? 18 : 22} />
        <span>Book Now</span>
        {!isMobile && (
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowRight size={22} />
          </motion.div>
        )}
      </motion.button>

      {/* Decorative Elements */}
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '10%',
        width: 'clamp(250px, 30vw, 400px)',
        height: 'clamp(250px, 30vw, 400px)',
        background: 'radial-gradient(circle, rgba(200, 212, 107, 0.15) 0%, transparent 70%)',
        filter: 'blur(80px)',
        borderRadius: '50%',
        zIndex: 1,
        pointerEvents: 'none',
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '5%',
        width: 'clamp(200px, 25vw, 350px)',
        height: 'clamp(200px, 25vw, 350px)',
        background: 'radial-gradient(circle, rgba(224, 192, 151, 0.12) 0%, transparent 70%)',
        filter: 'blur(70px)',
        borderRadius: '50%',
        zIndex: 1,
        pointerEvents: 'none',
      }} />
    </section>
  );
}