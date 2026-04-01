/**
 * Performance Optimization for SEO
 * Core Web Vitals & Page Speed
 */

// 1. Lazy Load Images
export const lazyLoadImage = (imageSrc, placeholder) => {
  if ('IntersectionObserver' in window) {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  }
};

// 2. Dynamic Import for Code Splitting
export const dynamicImport = (componentPath) => {
  return React.lazy(() => import(componentPath));
};

// 3. Web Font Optimization
export const optimizeWebFonts = () => {
  // Add font-display: swap to prevent FOIT/FOUT
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
};

// 4. Image Optimization Helper
export const getOptimizedImageUrl = (url, width = 400) => {
  // Use a CDN with image optimization (e.g., Cloudinary, imgix)
  // Replace with your actual image optimization service
  if (!url) return '';

  const params = new URLSearchParams({
    w: width,
    f: 'auto', // auto format (WebP if supported)
    q: 'auto' // auto quality
  });

  return `${url}?${params.toString()}`;
};

// 5. Critical CSS Inline
export const getMetaTags = () => {
  return {
    preloadCritical: [
      { rel: 'preload', as: 'style', href: '/critical.css' },
      { rel: 'preload', as: 'font', href: '/fonts/main.woff2', crossOrigin: 'anonymous' }
    ]
  };
};

// 6. Debounce Function for Events
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 7. Performance Monitoring
export const trackWebVitals = (onPerfEntry) => {
  const reportWebVitals = (metric) => {
    if (onPerfEntry && typeof onPerfEntry === 'function') {
      onPerfEntry(metric);
    }

    // Send to analytics
    if (window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.value),
        event_category: 'Web Vitals',
        event_label: metric.id,
        non_interaction: true
      });
    }
  };

  // Measure Largest Contentful Paint (LCP)
  try {
    const lcp = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      reportWebVitals({
        name: 'LCP',
        value: lastEntry.renderTime || lastEntry.loadTime,
        id: `lcp-${Date.now()}`
      });
    });
    lcp.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    console.error('LCP measurement failed:', e);
  }

  // Measure First Input Delay (FID)
  try {
    const fid = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        reportWebVitals({
          name: 'FID',
          value: entry.processingDuration,
          id: `fid-${Date.now()}`
        });
      });
    });
    fid.observe({ entryTypes: ['first-input'] });
  } catch (e) {
    console.error('FID measurement failed:', e);
  }

  // Measure Cumulative Layout Shift (CLS)
  try {
    const cls = new PerformanceObserver((list) => {
      let clsValue = 0;
      list.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          reportWebVitals({
            name: 'CLS',
            value: clsValue,
            id: `cls-${Date.now()}`
          });
        }
      });
    });
    cls.observe({ entryTypes: ['layout-shift'] });
  } catch (e) {
    console.error('CLS measurement failed:', e);
  }
};

// 8. React Performance Optimization
export const withCodeSplitting = (Component) => {
  return React.lazy(() => import(/* webpackChunkName: "component" */ Component));
};

// 9. Cache Strategy
export const setCacheHeaders = {
  // Use in your server config (e.g., Next.js or Express)
  statics: 'max-age=31536000, immutable', // 1 year
  html: 'max-age=3600, must-revalidate', // 1 hour
  api: 'max-age=300' // 5 minutes
};

export default {
  lazyLoadImage,
  dynamicImport,
  optimizeWebFonts,
  getOptimizedImageUrl,
  debounce,
  trackWebVitals
};
