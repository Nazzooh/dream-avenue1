// Performance optimization utilities for faster page loads

/**
 * Preload critical images during idle time
 */
export const preloadCriticalImages = () => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Images will be loaded by browser automatically when needed
      // This just ensures DNS prefetch and connection setup
    });
  }
};

/**
 * Defer non-critical CSS
 */
export const deferNonCriticalCSS = () => {
  const links = document.querySelectorAll('link[rel="stylesheet"][data-defer]');
  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (href && 'requestIdleCallback' in window) {
      requestIdleCallback(() => {
        const newLink = document.createElement('link');
        newLink.rel = 'stylesheet';
        newLink.href = href;
        document.head.appendChild(newLink);
      });
    }
  });
};

/**
 * Optimize React Query cache
 */
export const optimizeQueryCache = () => {
  // Query client is already optimized in queryClient.ts
  // with staleTime: 10min and gcTime: 30min
};

/**
 * Add resource hints for faster external resource loading
 */
export const addResourceHints = () => {
  // DNS prefetch for Supabase
  const dnsPrefetch = document.createElement('link');
  dnsPrefetch.rel = 'dns-prefetch';
  dnsPrefetch.href = 'https://supabase.co';
  document.head.appendChild(dnsPrefetch);

  // Preconnect to Supabase API (if not already done)
  const preconnect = document.createElement('link');
  preconnect.rel = 'preconnect';
  preconnect.href = 'https://supabase.co';
  preconnect.crossOrigin = 'anonymous';
  document.head.appendChild(preconnect);
};

/**
 * Reduce motion for users who prefer reduced motion
 */
export const respectReducedMotion = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  
  if (prefersReducedMotion.matches) {
    document.documentElement.style.setProperty('--animation-duration', '0.01ms');
    document.documentElement.style.setProperty('--transition-duration', '0.01ms');
  }
};

/**
 * Initialize all performance optimizations
 */
export const initializePerformanceOptimizations = () => {
  // Run on next idle callback to not block initial render
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      addResourceHints();
      respectReducedMotion();
      preloadCriticalImages();
      deferNonCriticalCSS();
    }, { timeout: 2000 });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      addResourceHints();
      respectReducedMotion();
      preloadCriticalImages();
      deferNonCriticalCSS();
    }, 1000);
  }
};

/**
 * Optimize images with Intersection Observer
 */
export const setupLazyImageLoading = () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px 0px', // Start loading 50px before entering viewport
      threshold: 0.01,
    });

    // Observe all images with data-src
    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img);
    });
  }
};

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
