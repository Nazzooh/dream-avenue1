// CalendarLegend.tsx - Visual legend for calendar availability states
import { motion } from 'motion/react';

interface LegendItemProps {
  color: string;
  label: string;
  description: string;
  delay?: number;
}

function LegendItem({ color, label, description, delay = 0 }: LegendItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <motion.div
        whileHover={{ scale: 1.15 }}
        style={{
          width: '28px',
          height: '28px',
          background: color,
          borderRadius: '8px',
          border: '2px solid rgba(182, 245, 0, 0.2)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#2a2a2a',
            marginBottom: '2px',
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.75rem',
            color: '#666666',
            lineHeight: '1.4',
          }}
        >
          {description}
        </div>
      </div>
    </motion.div>
  );
}

export function CalendarLegend() {
  const legendItems = [
    {
      color: 'rgba(182, 245, 0, 0.15)',
      label: 'Available',
      description: 'All time slots are free',
    },
    {
      color: '#FFD97D40',
      label: 'Partially Booked',
      description: 'Some slots are taken',
    },
    {
      color: '#FF6B6B30',
      label: 'Fully Booked',
      description: 'No slots available',
    },
    {
      color: '#FFF3C9',
      label: 'Reserved Duration',
      description: 'Selected for duration booking',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      style={{
        background: 'linear-gradient(135deg, rgba(182, 245, 0, 0.04), rgba(224, 192, 151, 0.04))',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(182, 245, 0, 0.15)',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            width: '4px',
            height: '20px',
            background: 'linear-gradient(180deg, #B6F500, #A4DD00)',
            borderRadius: '2px',
          }}
        />
        <h4
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '1.0625rem',
            fontWeight: '600',
            color: '#2a2a2a',
            margin: 0,
          }}
        >
          Legend
        </h4>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
        }}
      >
        {legendItems.map((item, index) => (
          <LegendItem
            key={item.label}
            color={item.color}
            label={item.label}
            description={item.description}
            delay={0.1 * index}
          />
        ))}
      </div>
    </motion.div>
  );
}
