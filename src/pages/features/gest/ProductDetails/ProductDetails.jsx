// src/pages/ProductDetails.jsx
import React, { useState } from 'react';

import Main1 from 'assets/So_photos/Card_3.jpg'; // الصورة الكبيرة الرئيسية
import Thumb1 from 'assets/So_photos/Card_3.jpg';
import Thumb2 from 'assets/So_photos/Card_1.jpg';
import Thumb3 from 'assets/So_photos/Card_2.jpg';
import Thumb4 from 'assets/So_photos/Card_4.jpg';

import './productDetails.css';

export default function ProductDetails() {
  const product = {
    id: 'p-001',
    name: 'EnhanceLift™ Seamless Leggings',
    price: 65.0,
    currency: 'USD',
    colors: [
      { id: 'velvet', name: 'Velvet Mocha', swatch: '#5c2b2b', images: [Main1, Thumb1, Thumb2] },
      { id: 'green', name: 'Racing Green', swatch: '#0b6b4a', images: [Thumb3, Thumb4, Thumb1] }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: `High-performance seamless leggings with sculpting panels, breathable fabric and a flattering high waist.
       Designed for movement, comfort and everyday workouts. Machine washable.`
  };

  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[2] || product.sizes[0]); // default M if exists
  const [qty, setQty] = useState(1);
  const [addedMsg, setAddedMsg] = useState('');

  function changeColor(color) {
    setSelectedColor(color);
    setSelectedImageIndex(0);
  }

  function changeSize(e) {
    setSelectedSize(e.target.value);
  }

  function changeQty(delta) {
    setQty((q) => {
      const next = q + delta;
      return next < 1 ? 1 : next;
    });
  }

  function addToCart() {
    const item = {
      id: product.id + '-' + selectedColor.id + '-' + selectedSize,
      productId: product.id,
      name: product.name,
      color: selectedColor.name,
      size: selectedSize,
      price: product.price,
      currency: product.currency,
      quantity: qty,
      image: selectedColor.images[selectedImageIndex] || selectedColor.images[0]
    };

    // حفظ بسيط في localStorage (مناسب للتجربة)
    const raw = localStorage.getItem('esc_cart');
    const cart = raw ? JSON.parse(raw) : [];
    const existsIndex = cart.findIndex((i) => i.id === item.id);
    if (existsIndex >= 0) {
      cart[existsIndex].quantity += item.quantity;
    } else {
      cart.push(item);
    }
    localStorage.setItem('esc_cart', JSON.stringify(cart));

    setAddedMsg('Added to cart');
    setTimeout(() => setAddedMsg(''), 2500);

    console.log('Added to cart:', item);
  }

  return (
    <div className="product-details-page" style={{ padding: '2rem' }}>
      <div
        className="product-details-grid"
        style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', maxWidth: 1200, margin: '0 auto' }}
      >
        {/* Left: Gallery */}
        <div className="gallery">
          <div className="gallery-main" style={{ background: '#f5f5f5', padding: '1rem', borderRadius: 8 }}>
            <img
              src={selectedColor.images[selectedImageIndex]}
              alt={`${product.name} - ${selectedColor.name}`}
              style={{ width: '100%', display: 'block', objectFit: 'cover', borderRadius: 8 }}
            />
          </div>

          <div className="gallery-thumbs" style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
            {selectedColor.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`thumb-btn ${idx === selectedImageIndex ? 'active' : ''}`}
                style={{
                  border: idx === selectedImageIndex ? '2px solid #1976d2' : '1px solid #eee',
                  padding: 0,
                  background: '#fff',
                  borderRadius: 6,
                  overflow: 'hidden',
                  width: 84,
                  height: 84
                }}
                aria-label={`View image ${idx + 1}`}
              >
                <img src={img} alt={`${product.name} thumb ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Details column */}
        <aside className="details-column" style={{ alignSelf: 'start' }}>
          <h1 style={{ margin: '0 0 0.6rem 0' }}>{product.name}</h1>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.6rem' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {product.currency} {product.price.toFixed(2)}
            </div>
            <div style={{ color: '#2e7d32', fontWeight: 700 }}>In stock</div>
          </div>

          {/* Colors */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
              Color: <span style={{ fontWeight: 400 }}>{selectedColor.name}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              {product.colors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => changeColor(c)}
                  className={`color-swatch ${selectedColor.id === c.id ? 'selected' : ''}`}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    border: selectedColor.id === c.id ? '2px solid #1976d2' : '1px solid #ddd',
                    background: c.swatch,
                    cursor: 'pointer'
                  }}
                  aria-label={c.name}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Size</div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {product.sizes.map((s) => (
                <label key={s} style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="size"
                    value={s}
                    checked={selectedSize === s}
                    onChange={() => setSelectedSize(s)}
                    style={{ marginRight: 6 }}
                  />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Quantity + Add to cart */}
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button onClick={() => changeQty(-1)} style={{ padding: '8px 10px' }}>
                −
              </button>
              <div style={{ minWidth: 36, textAlign: 'center' }}>{qty}</div>
              <button onClick={() => changeQty(1)} style={{ padding: '8px 10px' }}>
                +
              </button>
            </div>

            <button
              onClick={addToCart}
              style={{ background: '#111', color: '#fff', padding: '10px 16px', borderRadius: 8, border: 'none', cursor: 'pointer' }}
            >
              Add to cart
            </button>
          </div>

          {addedMsg && <div style={{ color: '#1976d2', marginBottom: '0.6rem' }}>{addedMsg}</div>}

          {/* Description / details accordion simple */}
          <div style={{ marginTop: '1rem' }}>
            <details style={{ marginBottom: '0.6rem' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Product Details</summary>
              <p style={{ marginTop: '0.6rem' }}>{product.description}</p>
            </details>

            <details style={{ marginBottom: '0.6rem' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Material & Care</summary>
              <p style={{ marginTop: '0.6rem' }}>88% nylon, 12% elastane. Machine wash cold, line dry.</p>
            </details>

            <details>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Delivery & Returns</summary>
              <p style={{ marginTop: '0.6rem' }}>Free returns within 30 days. Express shipping available.</p>
            </details>
          </div>
        </aside>
      </div>

      {/* "Complete the look" horizontal area (قابل للتوسيع) */}
      <section style={{ maxWidth: 1200, margin: '2.5rem auto 0', padding: '0 1rem' }}>
        <h3>Complete the look</h3>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', overflowX: 'auto' }}>
          {/* small product cards placeholder */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ width: 160, background: '#fff', borderRadius: 8, padding: 8, boxShadow: '0 4px 8px rgba(0,0,0,0.04)' }}>
              <img src={Thumb1} alt={`suggestion ${i}`} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} />
              <div style={{ fontSize: 13, marginTop: 8 }}>EnhanceLift™ Shorts</div>
              <div style={{ fontWeight: 700, marginTop: 6 }}>{product.currency} 55.00</div>
              <button style={{ marginTop: 8, width: '100%', padding: '6px 8px', borderRadius: 6 }}>Quick add</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
