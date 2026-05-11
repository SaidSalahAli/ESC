import React, { useContext, useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import logoAnimation from 'assets/logo.json';
import JWTContext from 'contexts/JWTContext';

/**
 * LoadingScreen Component
 *
 * Shows initialization screen while auth context is initializing
 * Fades out smoothly once isInitialized = true
 * Uses auth context as single source of truth for app readiness
 */
function LoadingScreen() {
  const { isInitialized } = useContext(JWTContext);
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Only proceed to fade out once initialization is complete
    if (!isInitialized) return;

    // Trigger fade out animation when initialization completes
    setFadeOut(true);

    // Remove component from DOM after animation completes
    // Matching the CSS transition duration (1s)
    const timer = setTimeout(() => {
      setVisible(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isInitialized]);

  // Don't render if not visible
  if (!visible) return null;

  return (
    <div className={`animation-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="logo-container">
        <Lottie animationData={logoAnimation} loop autoplay style={{ width: 160, height: 160 }} />
      </div>
    </div>
  );
}

export default LoadingScreen;
