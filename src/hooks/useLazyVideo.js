import { useRef, useEffect, useState } from 'react';

/**
 * Hook for lazy loading video using Intersection Observer
 * Prevents blocking initial render by deferring video load
 *
 * @param {Object} options - Configuration
 * @param {number} options.threshold - Visibility threshold (0-1), default 0.1
 * @param {string} options.rootMargin - Margin around viewport, default '50px'
 * @returns {Object} - { videoRef, isVisible }
 */
export function useLazyVideo(options = {}) {
  const { threshold = 0.1, rootMargin = '50px' } = options;
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;

    // Create intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Once visible, we can stop observing
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(videoRef.current);

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  return { videoRef, isVisible };
}
