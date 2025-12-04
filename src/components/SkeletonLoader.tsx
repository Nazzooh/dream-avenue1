import { motion } from 'motion/react';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export function Skeleton({ 
  width = '100%', 
  height = '20px', 
  borderRadius = 'var(--radius-md)',
  className = '' 
}: SkeletonProps) {
  return (
    <motion.div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, rgba(200, 212, 107, 0.1) 0%, rgba(224, 192, 151, 0.15) 50%, rgba(200, 212, 107, 0.1) 100%)',
        backgroundSize: '200% 100%',
        position: 'relative',
        overflow: 'hidden',
      }}
      animate={{
        backgroundPosition: ['0% 0%', '100% 0%'],
      }}
      transition={{
        duration: 1.8,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {/* Shimmer overlay */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
        }}
        animate={{
          left: ['100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
      />
    </motion.div>
  );
}

// Card Skeleton for Packages, Facilities, etc.
export function CardSkeleton() {
  return (
    <div className="card">
      <Skeleton height="200px" borderRadius="var(--radius-lg)" />
      <div style={{ marginTop: 'var(--space-6)' }}>
        <Skeleton width="60%" height="24px" />
        <div style={{ marginTop: 'var(--space-3)' }}>
          <Skeleton width="100%" height="16px" />
          <div style={{ marginTop: 'var(--space-2)' }}>
            <Skeleton width="90%" height="16px" />
          </div>
        </div>
        <div style={{ marginTop: 'var(--space-6)' }}>
          <Skeleton width="40%" height="14px" />
          <div style={{ marginTop: 'var(--space-2)' }}>
            <Skeleton width="45%" height="14px" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Gallery Image Skeleton
export function GalleryImageSkeleton() {
  return (
    <Skeleton 
      height="300px" 
      borderRadius="var(--radius-xl)"
    />
  );
}

// Testimonial Skeleton
export function TestimonialSkeleton() {
  return (
    <div className="card">
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <Skeleton width="48px" height="48px" borderRadius="50%" />
        <div style={{ flex: 1 }}>
          <Skeleton width="120px" height="18px" />
          <div style={{ marginTop: 'var(--space-2)' }}>
            <Skeleton width="80px" height="14px" />
          </div>
        </div>
      </div>
      <Skeleton width="100%" height="16px" />
      <div style={{ marginTop: 'var(--space-2)' }}>
        <Skeleton width="95%" height="16px" />
      </div>
      <div style={{ marginTop: 'var(--space-2)' }}>
        <Skeleton width="85%" height="16px" />
      </div>
    </div>
  );
}

// Event Card Skeleton
export function EventSkeleton() {
  return (
    <div className="card">
      <Skeleton width="100px" height="28px" borderRadius="var(--radius-full)" />
      <div style={{ marginTop: 'var(--space-4)' }}>
        <Skeleton width="70%" height="24px" />
        <div style={{ marginTop: 'var(--space-4)' }}>
          <Skeleton width="100%" height="16px" />
          <div style={{ marginTop: 'var(--space-2)' }}>
            <Skeleton width="80%" height="16px" />
          </div>
          <div style={{ marginTop: 'var(--space-2)' }}>
            <Skeleton width="60%" height="16px" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Facility Icon Skeleton
export function FacilitySkeleton() {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <Skeleton 
        width="64px" 
        height="64px" 
        borderRadius="50%" 
        style={{ margin: '0 auto var(--space-4)' }}
      />
      <Skeleton width="60%" height="20px" style={{ margin: '0 auto var(--space-3)' }} />
      <Skeleton width="100%" height="16px" />
      <div style={{ marginTop: 'var(--space-2)' }}>
        <Skeleton width="90%" height="16px" style={{ margin: '0 auto' }} />
      </div>
    </div>
  );
}

// Table Row Skeleton for Admin
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} style={{ padding: 'var(--space-4)' }}>
          <Skeleton height="16px" />
        </td>
      ))}
    </tr>
  );
}