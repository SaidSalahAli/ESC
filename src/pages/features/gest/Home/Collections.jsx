// src/components/Collections.jsx

import React from 'react';
import ProductCard from 'components/ProductCard';

import so1 from 'assets/So_photos/so1.jpg';
import so2 from 'assets/So_photos/so2.jpg';
import so3 from 'assets/So_photos/So3.jpg';
import so4 from 'assets/So_photos/So4.jpg';

function Collections() {
  const addToCart = (item) => {
    console.log("Added to cart:", item);
  };

  const products = [
    {
      id: '1',
      name: 'Gym Ready Set',
      price: 1800,
      image: so1,
      size: 'M',
      color: 'Black',
      description: 'Perfect for your workout sessions. Comfortable and modest.',
    },
    {
      id: '2',
      name: 'Sports Hijab',
      price: 2000,
      image: so2,
      size: 'One Size',
      color: 'Navy',
      description: 'Stay cool and covered during your workouts.',
    },
    {
      id: '3',
      name: 'Modest Athleisure Set',
      price: 2100,
      image: so3,
      size: 'L',
      color: 'Gray',
      description: 'Stylish and comfortable for everyday activities.',
    },
    {
      id: '4',
      name: 'Premium Training Set',
      price: 2300,
      image: so4,
      size: 'M',
      color: 'Black',
      description: 'Elite performance wear for serious athletes.',
    },
  ];

  return (
    <section className="collections-section">
      <h2 className="section-title">Featured Collections</h2>

      <div className="collections-grid">
        {products.map((item) => (
          <ProductCard key={item.id} item={item} addToCart={addToCart} />
        ))}
      </div>
    </section>
  );
}

export default Collections;
