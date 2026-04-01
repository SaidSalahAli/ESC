import { useState } from 'react';
import { useIntersectionObserver } from 'hooks/useIntersectionObserver';

/**
 * Example component demonstrating Intersection Observer usage
 * Shows fade-in animation when section enters viewport
 */
export default function FadeInSection({ children, className = '' }) {
  const [isVisible, setIsVisible] = useState(false);

  const ref = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '0px',
    onVisible: () => setIsVisible(true),
    onHidden: () => setIsVisible(false)
  });

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.6s ease-in-out',
        transitionProperty: 'opacity, transform'
      }}
    >
      {children}
    </div>
  );
}
