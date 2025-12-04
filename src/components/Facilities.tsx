import { motion } from 'motion/react';
import { 
  Sparkles, 
  Building2, 
  Trees, 
  Sunset, 
  UtensilsCrossed,
  Car,
  Music,
  Wind,
  Utensils
} from 'lucide-react';
import { useFacilities } from '../src/hooks/useFacilities';
import { FacilitySkeleton } from './SkeletonLoader';

const iconMap: Record<string, any> = {
  'banquet': Building2,
  'garden': Trees,
  'terrace': Sunset,
  'catering': UtensilsCrossed,
  'parking': Car,
  'music': Music,
  'ac': Wind,
  'dining': Utensils,
};

const getIcon = (iconName?: string) => {
  if (!iconName) return Sparkles;
  const Icon = iconMap[iconName.toLowerCase()] || Sparkles;
  return Icon;
};

export function Facilities() {
  const { data: facilities, isLoading, error } = useFacilities();

  // Log for debugging - Now using direct Supabase queries (fast & reliable)
  console.log('🏢 Facilities Component:', { 
    count: facilities?.length || 0,
    isLoading, 
    hasError: !!error 
  });

  return (
    <div>
      <section id="facilities" className="section" style={{ background: 'var(--white)' }}>
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="section-badge">Facilities</div>
            <h2 className="section-title">World-Class Amenities</h2>
            <p className="section-description">
              Everything you need to create an unforgettable event experience
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-3 p-[5px]">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <FacilitySkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p style={{ color: 'var(--error)', marginBottom: '8px' }}>
                Failed to load facilities. Please try again later.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Error: {error instanceof Error ? error.message : 'Unknown error'}
              </p>
              {/* Debug info */}
              <details style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <summary style={{ cursor: 'pointer' }}>Debug Info</summary>
                <pre style={{ textAlign: 'left', background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginTop: '8px' }}>
                  {JSON.stringify({ error: error?.toString() }, null, 2)}
                </pre>
              </details>
            </div>
          ) : !facilities || facilities.length === 0 ? (
            <div className="text-center py-12">
              <p style={{ color: 'var(--text-muted)' }}>
                No facilities available at this time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3">
              {facilities.map((facility, index) => {
                const Icon = getIcon(facility.icon);
                const imageUrl = facility.image_url || facility.image;
                return (
                  <motion.div
                    key={facility.id}
                    className="facility-card"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {imageUrl ? (
                      <div 
                        style={{
                          width: '100%',
                          height: '200px',
                          borderRadius: 'var(--radius-lg)',
                          marginBottom: 'var(--space-4)',
                          backgroundImage: `url(${imageUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          boxShadow: 'var(--shadow-md)',
                        }}
                        role="img"
                        aria-label={`${facility.title} image`}
                      />
                    ) : (
                      <div className="facility-icon" style={{ background: 'var(--gradient-radial-soft)' }}>
                        <Icon size={28} style={{ color: 'var(--primary)' }} />
                      </div>
                    )}
                    <h3>{facility.title}</h3>
                    <p>{facility.description}</p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}