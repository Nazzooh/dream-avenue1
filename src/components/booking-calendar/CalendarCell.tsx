// CalendarCell.tsx - Individual calendar day cell with availability states
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export type CellStatus = 'available' | 'partially-booked' | 'fully-booked' | null;

interface CalendarCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  isDisabled: boolean;
  status: CellStatus;
  bookedSlots?: number;
  totalSlots?: number;
  onClick: () => void;
}

export function CalendarCell({
  date,
  isCurrentMonth,
  isToday,
  isPast,
  isDisabled,
  status,
  bookedSlots = 0,
  totalSlots = 3,
  onClick,
}: CalendarCellProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const day = date.getDate();

  // Determine cell styling based on state
  const getCellStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      aspectRatio: '1',
      borderRadius: '12px',
      fontFamily: 'Poppins, sans-serif',
      fontWeight: '600',
      fontSize: '0.9375rem',
      transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      position: 'relative',
      userSelect: 'none',
    };

    // Disabled or out of range
    if (!isCurrentMonth || isPast || isDisabled) {
      return {
        ...baseStyles,
        color: '#CCCCCC',
        background: '#F5F5F0',
        opacity: 0.4,
        cursor: 'not-allowed',
        pointerEvents: 'none',
      };
    }

    // Available state
    if (status === 'available') {
      return {
        ...baseStyles,
        background: 'rgba(182, 245, 0, 0.15)',
        color: '#2A4516',
        border: isToday ? '2px solid #E0C097' : '1px solid rgba(164, 221, 0, 0.3)',
        boxShadow: isToday 
          ? '0 0 16px rgba(224, 192, 151, 0.4), 0 2px 8px rgba(182, 245, 0, 0.1)'
          : '0 2px 8px rgba(182, 245, 0, 0.1)',
      };
    }

    // Partially booked state
    if (status === 'partially-booked') {
      return {
        ...baseStyles,
        background: '#FFD97D40',
        color: '#856404',
        border: isToday ? '2px solid #E0C097' : '1px solid rgba(245, 200, 66, 0.5)',
        boxShadow: isToday
          ? '0 0 16px rgba(224, 192, 151, 0.4), 0 2px 8px rgba(255, 217, 125, 0.2)'
          : '0 2px 8px rgba(255, 217, 125, 0.2)',
      };
    }

    // Fully booked state
    if (status === 'fully-booked') {
      return {
        ...baseStyles,
        background: '#FF6B6B30',
        color: '#721c24',
        border: isToday ? '2px solid #E0C097' : '1px solid rgba(255, 107, 107, 0.4)',
        boxShadow: isToday
          ? '0 0 16px rgba(224, 192, 151, 0.4), 0 2px 8px rgba(255, 107, 107, 0.15)'
          : '0 2px 8px rgba(255, 107, 107, 0.15)',
        cursor: 'not-allowed',
      };
    }

    // Default state
    return {
      ...baseStyles,
      color: '#666666',
      background: '#FAFAF7',
      border: isToday ? '2px solid #E0C097' : '1px solid #E6E6E6',
      boxShadow: isToday ? '0 0 16px rgba(224, 192, 151, 0.4)' : 'none',
    };
  };

  // Get hover animation
  const getHoverStyles = () => {
    if (!isCurrentMonth || isPast || isDisabled || status === 'fully-booked') {
      return {};
    }

    if (status === 'available') {
      return {
        scale: 1.05,
        boxShadow: '0 4px 16px rgba(182, 245, 0, 0.25)',
      };
    }

    if (status === 'partially-booked') {
      return {
        scale: 1.05,
        boxShadow: '0 4px 16px rgba(255, 217, 125, 0.3)',
      };
    }

    return {
      scale: 1.02,
    };
  };

  // Get tooltip text
  const getTooltipText = (): string => {
    if (isPast) return 'Past date';
    if (isDisabled) return 'Date not available';
    
    if (status === 'available') {
      return 'Available — All slots free';
    }
    
    if (status === 'partially-booked') {
      return `Partially booked (${bookedSlots}/${totalSlots} slots taken)`;
    }
    
    if (status === 'fully-booked') {
      return 'Fully booked';
    }
    
    return 'Check availability';
  };

  // Render progress indicator for partially booked
  const renderProgressIndicator = () => {
    if (status !== 'partially-booked' || !bookedSlots || !totalSlots) return null;

    const percentage = (bookedSlots / totalSlots) * 100;
    const radius = 6;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <svg
        width="16"
        height="16"
        style={{
          position: 'absolute',
          bottom: '4px',
          right: '4px',
        }}
      >
        <circle
          cx="8"
          cy="8"
          r={radius}
          fill="none"
          stroke="rgba(245, 200, 66, 0.3)"
          strokeWidth="2"
        />
        <motion.circle
          cx="8"
          cy="8"
          r={radius}
          fill="none"
          stroke="#F5C842"
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 8 8)"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      </svg>
    );
  };

  // Render status indicator dot
  const renderStatusDot = () => {
    if (status === 'available') {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.4 }}
          style={{
            position: 'absolute',
            bottom: '6px',
            right: '6px',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#B6F500',
            boxShadow: '0 0 8px rgba(182, 245, 0, 0.6)',
          }}
        />
      );
    }

    if (status === 'fully-booked') {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.4 }}
          style={{
            position: 'absolute',
            bottom: '6px',
            right: '6px',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#FF6B6B',
          }}
        />
      );
    }

    return null;
  };

  const handleClick = () => {
    if (!isPast && !isDisabled && status !== 'fully-booked' && isCurrentMonth) {
      onClick();
    }
  };

  return (
    <div style={{ position: 'relative' }} aria-label={`${date.toDateString()} - ${getTooltipText()}`}>
      <motion.button
        style={getCellStyles()}
        whileHover={getHoverStyles()}
        whileTap={
          !isPast && !isDisabled && status !== 'fully-booked' && isCurrentMonth
            ? { scale: 0.95 }
            : {}
        }
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        disabled={isPast || isDisabled || status === 'fully-booked' || !isCurrentMonth}
        aria-disabled={isPast || isDisabled || status === 'fully-booked' || !isCurrentMonth}
      >
        {day}
        {renderStatusDot()}
        {renderProgressIndicator()}
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && isCurrentMonth && (
          <motion.div
            role="tooltip"
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: '-48px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#2A2A2A',
              color: '#FFFFFF',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              zIndex: 50,
              pointerEvents: 'none',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
            }}
          >
            {getTooltipText()}
            <div
              style={{
                position: 'absolute',
                bottom: '-4px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: '5px solid #2A2A2A',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
