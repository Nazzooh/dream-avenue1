import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Users, Award } from 'lucide-react';
import { useLatestAnalytics } from '../src/hooks/useAnalyticsAppendOnly';
import { SatisfactionRateCard } from './SatisfactionRateCard';

interface SummaryData {
  events_hosted: number;
  guests_served: number;
  client_satisfaction: number;
}

export function Stats() {
  const { data: latestAnalytics, isLoading } = useLatestAnalytics();

  // Animated counter states
  const [eventsCount, setEventsCount] = useState(0);
  const [guestsCount, setGuestsCount] = useState(0);
  const [satisfactionCount, setSatisfactionCount] = useState(0);

  useEffect(() => {
    if (latestAnalytics) {
      // Start counter animations with latest data
      animateCounter(latestAnalytics.events_hosted, setEventsCount, 2000);
      animateCounter(latestAnalytics.guests_served, setGuestsCount, 2500);
      animateCounter(latestAnalytics.client_satisfaction, setSatisfactionCount, 2000);
    }
  }, [latestAnalytics]);

  const animateCounter = (target: number, setter: (val: number) => void, duration: number) => {
    const steps = 60;
    const increment = target / steps;
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setter(Math.min(Math.floor(increment * currentStep), target));
      
      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, duration / steps);
  };

  if (isLoading || !latestAnalytics) {
    return null;
  }

  const stats = [
    {
      icon: Calendar,
      value: `${eventsCount}+`,
      label: 'Events Hosted',
      color: 'var(--lime-primary)',
      delay: 0.1,
    },
    {
      icon: Users,
      value: `${guestsCount.toLocaleString()}+`,
      label: 'Happy Guests',
      color: 'var(--lime-secondary)',
      delay: 0.2,
    },
    {
      icon: Award,
      value: '4.9/5',
      label: 'Average Rating',
      color: 'var(--gold-accent)',
      delay: 0.4,
    },
  ];

  return (
    <section 
      className="section" 
      style={{
        background: 'var(--bg-cream)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Background */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.05,
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              var(--lime-primary),
              var(--lime-primary) 1px,
              transparent 1px,
              transparent 30px
            ),
            repeating-linear-gradient(
              90deg,
              var(--lime-primary),
              var(--lime-primary) 1px,
              transparent 1px,
              transparent 30px
            )
          `,
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-badge">Our Impact</div>
          <h2 className="section-title">Numbers That Tell Our Story</h2>
          <p className="section-description">
            Years of excellence in creating unforgettable moments
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'var(--space-6)',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: stat.delay }}
              style={{
                background: 'var(--white)',
                padding: 'var(--space-8)',
                borderRadius: 'var(--radius-xl)',
                textAlign: 'center',
                boxShadow: 'var(--shadow-md)',
                border: '2px solid transparent',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(182, 245, 0, 0.3)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto var(--space-4)',
                  background: 'linear-gradient(135deg, var(--lime-primary), var(--lime-secondary))',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--dark-text)',
                  boxShadow: 'var(--glow-lime)',
                }}
              >
                <stat.icon size={32} />
              </div>

              {/* Value */}
              <div style={{ 
                fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                color: stat.color,
                marginBottom: 'var(--space-2)',
              }}>
                {stat.value}
              </div>

              {/* Label */}
              <div style={{ 
                fontSize: '1rem',
                color: 'var(--gray-700)',
              }}>
                {stat.label}
              </div>
            </motion.div>
          ))}

          {/* Dedicated Satisfaction Rate Card */}
          <SatisfactionRateCard value={satisfactionCount} delay={0.3} />
        </div>
      </div>

      {/* Decorative Floating Orbs */}
      <motion.div
        style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(182, 245, 0, 0.3) 0%, transparent 70%)',
          filter: 'blur(40px)',
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
          bottom: '10%',
          right: '5%',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(164, 221, 0, 0.3) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
      />
    </section>
  );
}
