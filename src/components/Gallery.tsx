import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { useGalleryItems } from '../src/hooks/useGallery';
import { GalleryImageSkeleton } from './SkeletonLoader';

export function Gallery() {
  const { data: galleryImages = [], isLoading, error, refetch } = useGalleryItems();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  if (isLoading) {
    return (
      <section id="gallery" className="section" style={{ background: 'var(--white)' }}>
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="section-badge">Gallery</div>
            <h2 className="section-title">Moments We've Created</h2>
            <p className="section-description">
              A glimpse into the beautiful events and celebrations we've hosted
            </p>
          </motion.div>
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 'var(--space-6)',
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <GalleryImageSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="gallery" className="section" style={{ background: 'var(--white)' }}>
        <div className="container">
          <div className="text-center">
            <p style={{ color: '#ef4444', marginBottom: 'var(--space-4)' }}>
              Error: {error instanceof Error ? error.message : 'Failed to load gallery'}
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
    <section id="gallery" className="section" style={{ background: 'var(--white)' }}>
      <div className="container">
        {/* Section Header */}
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-badge">Gallery</div>
          <h2 className="section-title">Moments We've Created</h2>
          <p className="section-description">
            A glimpse into the beautiful events and celebrations we've hosted
          </p>
        </motion.div>

        {/* Gallery Grid */}
        {galleryImages.length > 0 ? (
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 'var(--space-6)',
            }}
          >
            {galleryImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                onClick={() => openLightbox(index)}
                style={{
                  cursor: 'pointer',
                  position: 'relative',
                  height: '300px',
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
              >
                <ImageWithFallback
                  src={image.image_url}
                  alt={image.title || 'Gallery image'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                {image.title && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: 'var(--space-4)',
                      background: 'linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent)',
                      color: 'white',
                    }}
                  >
                    <h4 style={{ color: 'white', margin: 0 }}>{image.title}</h4>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center" style={{ padding: 'var(--space-12)' }}>
            <ImageIcon size={48} style={{ color: 'var(--gray-400)', margin: '0 auto var(--space-4)' }} />
            <p className="text-muted">No gallery images available at the moment.</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && galleryImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.95)',
              zIndex: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-6)',
            }}
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              style={{
                position: 'absolute',
                top: 'var(--space-6)',
                right: 'var(--space-6)',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              <X size={24} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              style={{
                position: 'absolute',
                left: 'var(--space-6)',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              style={{
                position: 'absolute',
                right: 'var(--space-6)',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              <ChevronRight size={24} />
            </button>

            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                position: 'relative',
              }}
            >
              <img
                src={galleryImages[currentImageIndex].image_url}
                alt={galleryImages[currentImageIndex].title || 'Gallery image'}
                style={{
                  maxWidth: '100%',
                  maxHeight: '90vh',
                  objectFit: 'contain',
                }}
              />
              {galleryImages[currentImageIndex].title && (
                <div
                  style={{
                    marginTop: 'var(--space-4)',
                    textAlign: 'center',
                    color: 'white',
                  }}
                >
                  <h3 style={{ color: 'white' }}>{galleryImages[currentImageIndex].title}</h3>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}