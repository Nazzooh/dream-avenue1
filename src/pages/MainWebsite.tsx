import { motion } from 'framer-motion';
import React, { Suspense, lazy } from 'react';
import { SEOHead } from '../components/SEOHead';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { Stats } from '../components/Stats';

// Lazy load below-the-fold sections for faster initial load
const Packages = lazy(() => import('../components/Packages').then(m => ({ default: m.Packages })));
const Facilities = lazy(() => import('../components/Facilities').then(m => ({ default: m.Facilities })));
const Gallery = lazy(() => import('../components/Gallery').then(m => ({ default: m.Gallery })));
const Events = lazy(() => import('../components/Events').then(m => ({ default: m.Events })));
const FAQ = lazy(() => import('../components/FAQ').then(m => ({ default: m.FAQ })));
const Location = lazy(() => import('../components/Location').then(m => ({ default: m.Location })));
const Footer = lazy(() => import('../components/Footer').then(m => ({ default: m.Footer })));

// Lightweight loading placeholder for sections
const SectionLoader = () => (
  <div className="w-full py-20 flex justify-center">
    <motion.div 
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className="w-8 h-8 border-3 border-[#C8D46B] border-t-transparent rounded-full" 
    />
  </div>
);

export function MainWebsite() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-cream)' }}>
      {/* SEO Meta Tags */}
      <SEOHead />
      
      {/* Critical above-the-fold content - load immediately */}
      <Navbar />
      <Hero />
      <Stats />
      
      {/* Below-the-fold content - lazy load as user scrolls */}
      <Suspense fallback={<SectionLoader />}>
        <Packages />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <Facilities />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <Gallery />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <Events />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <FAQ />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <Location />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <Footer />
      </Suspense>
    </div>
  );
}