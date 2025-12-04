import { motion } from 'motion/react';
import { Package, CheckCircle } from 'lucide-react';

interface PackageSummaryCardProps {
  packageData: {
    id: string;
    name: string;
    image_url?: string;
    price: number;
    description?: string;
  };
}

export function PackageSummaryCard({ packageData }: PackageSummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '2px solid rgba(182, 245, 0, 0.2)',
        position: 'sticky',
        top: '2rem',
      }}
    >
      {/* Package Image */}
      {packageData.image_url && (
        <div
          style={{
            width: '100%',
            height: '200px',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '1.5rem',
            border: '2px solid rgba(224, 192, 151, 0.3)',
          }}
        >
          <img
            src={packageData.image_url}
            alt={packageData.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      )}

      {/* Package Icon & Title */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #B6F500, #E0C097)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Package size={24} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Selected Package
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0, color: '#2D2D2D' }}>
              {packageData.name}
            </h2>
          </div>
        </div>

        {packageData.description && (
          <p style={{ fontSize: '0.875rem', color: '#666', lineHeight: '1.6', margin: 0 }}>
            {packageData.description}
          </p>
        )}
      </div>

      {/* Base Price */}
      <div
        style={{
          padding: '1.5rem',
          background: 'linear-gradient(135deg, #B6F50010, #E0C09710)',
          borderRadius: '12px',
          border: '2px solid rgba(182, 245, 0, 0.2)',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
          Base Price (Full Day)
        </div>
        <div
          style={{
            fontSize: '2rem',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #B6F500, #E0C097)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          ₹{packageData.price.toLocaleString('en-IN')}
        </div>
      </div>

      {/* Info Box */}
      <div
        style={{
          padding: '1rem',
          background: 'rgba(182, 245, 0, 0.05)',
          borderRadius: '12px',
          border: '1px solid rgba(182, 245, 0, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <CheckCircle size={20} style={{ color: '#B6F500', flexShrink: 0, marginTop: '0.125rem' }} />
          <div>
            <p style={{ fontSize: '0.875rem', color: '#666', margin: 0, lineHeight: '1.6' }}>
              Select a time slot below to adjust your booking price automatically based on duration.
            </p>
          </div>
        </div>
      </div>

      {/* Package Features (if available) */}
      <div style={{ marginTop: '1.5rem' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: '#2D2D2D' }}>
          Package Includes:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            'Full venue access',
            'Audio/Visual equipment',
            'Dedicated event coordinator',
            'Customizable decorations',
          ].map((feature, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#666' }}>
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#E0C097',
                  flexShrink: 0,
                }}
              />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
