// src/components/ImageZoom/ImageZoom.jsx
import React, { useState, useRef, useEffect } from 'react';
import './imageZoom.css';

/**
 * ImageZoom Component
 * Professional image zoom on hover with smooth animations
 * Similar to high-end e-commerce brands
 */
export default function ImageZoom({ src, alt, className = '' }) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  const handleMouseMove = (e) => {
    if (!imageRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    // Calculate mouse position relative to image
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPosition({ x, y });
  };

  return (
    <div
      ref={containerRef}
      className={`image-zoom-container ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={`image-zoom-img ${isZoomed ? 'zoomed' : ''}`}
        style={{
          transformOrigin: `${position.x}% ${position.y}%`,
        }}
      />
      
      {isZoomed && (
        <div className="zoom-hint">
          <span>حرك الماوس لاستكشاف التفاصيل</span>
        </div>
      )}
    </div>
  );
}