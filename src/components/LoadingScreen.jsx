import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import logoAnimation from 'assets/logo.json';
import ESC from 'assets/ESC-White-Trans-Vertical.png';
import './LoadingScreen.css';

function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const handleLoad = () => {
      setTimeout(() => {
        setIsAnimating(true);

        setTimeout(() => {
          setIsVisible(false);
        }, 800);
      }, 2500);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`animation-screen ${isAnimating ? 'fade-out' : ''}`}>
      <div className="logo-container">
        <Lottie animationData={logoAnimation} loop={true} style={{ width: 200 }} />
      </div>
    </div>
  );
}

export default LoadingScreen;
