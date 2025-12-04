import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';
import { usePackages } from '../src/hooks/usePackages';
import { CardSkeleton } from './SkeletonLoader';
import { useState } from 'react';

export function Packages() {
  const navigate = useNavigate();
  const { data: packages = [], isLoading, error, refetch } = usePackages();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  if (isLoading) {
    return (
      <section id="packages" className="section" style={{ background: 'var(--gray-50)', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ width: '100%' }}>
          <motion.div
            className="section-header"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="section-badge">Packages</div>
            <h2 className="section-title">Curated Event Packages</h2>
            <p className="section-description">
              Choose from our premium packages designed to make your celebration extraordinary
            </p>
          </motion.div>
          <div 
            className="packages-container"
            style={{ 
              overflowX: 'auto',
              overflowY: 'hidden',
              display: 'flex',
              gap: 'clamp(1rem, 3vw, 1.5rem)',
              padding: '1rem 0.5rem',
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none',
            }}
          >
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ minWidth: 'clamp(300px, 85vw, 380px)', width: 'clamp(300px, 85vw, 380px)' }}>
                <CardSkeleton />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="packages" className="section" style={{ background: 'var(--gray-50)' }}>
        <div className="container">
          <div className="text-center">
            <p style={{ color: '#ef4444', marginBottom: 'var(--space-4)' }}>
              Error: {error instanceof Error ? error.message : 'Failed to load packages'}
            </p>
            <button onClick={() => refetch()} className="btn btn-primary">
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="packages" className="section" style={{ background: 'var(--gray-50)', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ width: '100%' }}>
        {/* Section Header */}
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-badge">Packages</div>
          <h2 className="section-title">Curated Event Packages</h2>
          <p className="section-description">
            Choose from our premium packages designed to make your celebration extraordinary
          </p>
        </motion.div>

        {/* Horizontal Scrolling Packages - Netflix Style */}
        <div 
          className="packages-container"
          style={{ 
            overflowX: 'auto',
            overflowY: 'hidden',
            display: 'flex',
            gap: 'clamp(1rem, 3vw, 1.5rem)',
            padding: '1rem 0.5rem 2rem',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            scrollSnapType: 'x mandatory',
            // Hide scrollbar
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <style>{`
            .packages-container::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          {packages.map((pkg, index) => (
            <motion.article
              key={pkg.id}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="package-card"
              style={{
                flex: '0 0 clamp(300px, 85vw, 380px)',
                minWidth: 'clamp(300px, 85vw, 380px)',
                maxWidth: '380px',
                minHeight: '500px',
                scrollSnapAlign: 'start',
                borderRadius: '20px',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                backgroundImage: pkg.image_url 
                  ? `url(${pkg.image_url})` 
                  : 'linear-gradient(135deg, var(--lime-primary), var(--lime-secondary))',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'all 0.4s ease',
                boxShadow: hoveredCard === pkg.id 
                  ? '0 20px 60px rgba(0, 0, 0, 0.4)' 
                  : 'var(--shadow-lg)',
              }}
              onMouseEnter={() => setHoveredCard(pkg.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Dark overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: hoveredCard === pkg.id 
                    ? 'rgba(0, 0, 0, 0.75)' 
                    : 'rgba(0, 0, 0, 0.5)',
                  transition: 'background-color 0.4s ease',
                  zIndex: 1,
                }}
              />

              {/* Package Content */}
              <div 
                className="package-card-content"
                style={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  padding: 'clamp(1.2rem, 4vw, 1.8rem)',
                  position: 'relative',
                  zIndex: 2,
                  overflow: 'hidden',
                  paddingBottom: '5rem', // Space for button
                }}
              >
                <h3 style={{ 
                  marginBottom: 'var(--space-3)',
                  color: 'white',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                }}>
                  {pkg.name}
                </h3>
                <p style={{ 
                  marginBottom: 'var(--space-4)',
                  color: 'rgba(255, 255, 255, 0.95)',
                  textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)',
                  lineHeight: '1.6',
                }}>
                  {pkg.description}
                </p>
                
                {/* Features */}
                {pkg.features && pkg.features.length > 0 && (
                  <ul style={{ 
                    listStyle: 'none', 
                    padding: 0, 
                    margin: 0,
                  }}>
                    {pkg.features.map((feature: string, idx: number) => (
                      <li 
                        key={idx} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          gap: 'var(--space-2)',
                          marginBottom: 'var(--space-2)',
                        }}
                      >
                        <Check 
                          size={16} 
                          style={{ 
                            color: 'var(--lime-primary)', 
                            flexShrink: 0, 
                            marginTop: '2px',
                            filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))',
                          }} 
                        />
                        <span style={{ 
                          fontSize: '0.875rem', 
                          color: 'rgba(255, 255, 255, 0.9)',
                          textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
                        }}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Book Button - Always visible at bottom */}
              <button 
                className="btn btn-primary" 
                style={{ 
                  position: 'absolute',
                  bottom: '1.2rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 'calc(100% - 2.4rem)',
                  zIndex: 3,
                  background: 'var(--lime-primary)',
                  color: '#000',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(182, 245, 0, 0.4)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(-50%) translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(182, 245, 0, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(-50%) translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(182, 245, 0, 0.4)';
                }}
                onClick={() => navigate('/booking')}
              >
                <Sparkles size={18} />
                <span>Book Now</span>
              </button>
            </motion.article>
          ))}
        </div>

        {packages.length === 0 && !isLoading && (
          <div className="text-center" style={{ padding: 'var(--space-12)' }}>
            <p className="text-muted">No packages available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}
