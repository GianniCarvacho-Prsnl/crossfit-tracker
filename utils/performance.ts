/**
 * Performance monitoring and optimization utilities
 */

// Web Vitals tracking
export const reportWebVitals = (metric: any) => {
  if (process.env.NODE_ENV === 'production') {
    // Log to console in development, send to analytics in production
    console.log(metric);
    
    // Example: Send to Google Analytics
    // gtag('event', metric.name, {
    //   value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    //   event_label: metric.id,
    //   non_interaction: true,
    // });
  }
};

// Preload critical resources
export const preloadCriticalResources = () => {
  if (typeof window !== 'undefined') {
    // Preload Supabase client
    import('@/utils/supabase/client');
    
    // Preload critical components
    import('@/components/forms/WorkoutForm');
    import('@/components/lists/RecordsList');
  }
};

// Lazy load non-critical resources
export const lazyLoadResources = () => {
  if (typeof window !== 'undefined') {
    // Load after initial render
    setTimeout(() => {
      import('@/utils/calculations');
      import('@/utils/conversions');
    }, 1000);
  }
};

// Performance observer for monitoring
export const observePerformance = () => {
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    // Observe Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    });
    
    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // Fallback for browsers that don't support LCP
      console.log('LCP observation not supported');
    }

    // Observe First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const fidEntry = entry as any; // Type assertion for FID entry
        if (fidEntry.processingStart) {
          console.log('FID:', fidEntry.processingStart - fidEntry.startTime);
        }
      });
    });

    try {
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // Fallback for browsers that don't support FID
      console.log('FID observation not supported');
    }
  }
};

// Image optimization helper
export const getOptimizedImageProps = (
  src: string,
  alt: string,
  priority: boolean = false
) => ({
  src,
  alt,
  loading: priority ? 'eager' : 'lazy',
  priority,
  quality: 85,
  sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
});

// Bundle size analyzer helper
export const logBundleInfo = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Bundle analysis available with: npm run analyze');
  }
};

// Memory usage monitoring
export const monitorMemoryUsage = () => {
  if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (window.performance as any)) {
    const memory = (window.performance as any).memory;
    console.log('Memory usage:', {
      used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
      total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
      limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
    });
  }
};

// Service Worker registration helper
export const registerServiceWorker = () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};