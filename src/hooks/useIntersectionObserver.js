import { useEffect, useRef } from 'react';

/**
 * Hook for detecting when an element enters the viewport
 * Useful for triggering animations, lazy rendering, or analytics
 *
 * @param {Object} options - Observer options
 * @param {number} options.threshold - Visibility threshold (0-1), default 0.1
 * @param {string} options.rootMargin - Margin around root element, default '0px'
 * @param {Function} options.onVisible - Callback when element becomes visible
 * @param {Function} options.onHidden - Callback when element leaves viewport
 * @returns {React.RefObject} - Ref to attach to the observed element
 */
export function useIntersectionObserver({ threshold = 0.1, rootMargin = '0px', onVisible = () => {}, onHidden = () => {} } = {}) {
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onVisible(entry);
          } else {
            onHidden(entry);
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
      observer.disconnect();
    };
  }, [threshold, rootMargin, onVisible, onHidden]);

  return elementRef;
}
