import { useEffect, useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface AnimatedMetricCardProps {
  title: string;
  subtitle: string;
  value: number | string;
  icon: LucideIcon;
  emoji?: string;
  showPercentage?: boolean;
  animateCountUp?: boolean;
  delay?: number;
}

export function AnimatedMetricCard({
  title,
  subtitle,
  value,
  icon: Icon,
  emoji,
  showPercentage = false,
  animateCountUp = true,
  delay = 0,
}: AnimatedMetricCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const numericValue = typeof value === 'number' ? value : parseInt(value.toString().replace(/[^0-9]/g, '')) || 0;

  useEffect(() => {
    // Trigger fade-in animation
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!animateCountUp || typeof value !== 'number') {
      setDisplayValue(numericValue);
      return;
    }

    let startTime: number | null = null;
    const duration = 1500; // 1.5 seconds
    const startValue = 0;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (numericValue - startValue) * easeOutQuart);
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const animationDelay = setTimeout(() => {
      requestAnimationFrame(animate);
    }, delay + 200);

    return () => clearTimeout(animationDelay);
  }, [value, animateCountUp, numericValue, delay]);

  return (
    <div 
      className={`metric-card-animated ${isVisible ? 'visible' : ''}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
      }}
    >
      {/* Lime Gradient Top Border */}
      <div className="metric-card-top-border" />

      {/* Card Content */}
      <div className="metric-card-content">
        {/* Icon with Gradient Background */}
        <div className="metric-card-icon-wrapper">
          <Icon size={28} className="metric-card-icon" />
        </div>

        {/* Title */}
        <h3 className="metric-card-title">{title}</h3>

        {/* Value with Animation */}
        <div className="metric-card-value">
          {animateCountUp && typeof value === 'number' ? (
            <>
              {displayValue.toLocaleString()}
              {showPercentage && '%'}
              {emoji && <span className="metric-card-emoji">{emoji}</span>}
            </>
          ) : (
            <>
              {value}
              {emoji && <span className="metric-card-emoji">{emoji}</span>}
            </>
          )}
        </div>

        {/* Circular Progress for Satisfaction */}
        {showPercentage && typeof value === 'number' && (
          <div className="metric-card-progress-ring">
            <svg width="120" height="120" viewBox="0 0 120 120">
              {/* Background Circle */}
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="8"
              />
              {/* Progress Circle with Lime Glow */}
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="url(#limeGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52}`}
                strokeDashoffset={`${2 * Math.PI * 52 * (1 - displayValue / 100)}`}
                transform="rotate(-90 60 60)"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(182, 245, 0, 0.6))',
                  transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
              {/* Gradient Definition */}
              <defs>
                <linearGradient id="limeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#B6F500" />
                  <stop offset="100%" stopColor="#A4DD00" />
                </linearGradient>
              </defs>
            </svg>
            <div className="metric-card-progress-text">
              {displayValue}%
            </div>
          </div>
        )}

        {/* Subtitle */}
        <p className="metric-card-subtitle">{subtitle}</p>
      </div>
    </div>
  );
}
