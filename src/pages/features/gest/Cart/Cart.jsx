import React, { useEffect, useState } from 'react';
import CardItem from 'components/CardItem';

import './card.css';

const TAX_RATE = 0.1; // 10%

// helper: load cart from localStorage
function loadCart() {
  try {
    const raw = localStorage.getItem('esc_cart');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export default function Cart() {
  const [cart, setCart] = useState(() => loadCart());
  const [promo, setPromo] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [notif, setNotif] = useState('');

  // persist cart
  useEffect(() => {
    localStorage.setItem('esc_cart', JSON.stringify(cart));
  }, [cart]);

  // calculate subtotal, tax, total
  const subtotal = cart.reduce((s, i) => s + Number(i.price) * Number(i.quantity), 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxed = (subtotal - discountAmount) * TAX_RATE;
  const total = subtotal - discountAmount + taxed;

  function changeQty(id, qty) {
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
  }

  function removeItem(id) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  function applyPromoCode() {
    const code = (promo || '').trim().toUpperCase();
    if (code === 'ESC10') {
      setDiscountPercent(10);
      setNotif('10% discount applied!');
      setTimeout(() => setNotif(''), 3000);
    } else if (!code) {
      setNotif('Enter a promo code');
      setTimeout(() => setNotif(''), 2500);
    } else {
      setDiscountPercent(0);
      setNotif('Invalid promo code');
      setTimeout(() => setNotif(''), 2500);
    }
  }

  function clearCart() {
    setCart([]);
  }

  function proceedToCheckout() {
    // placeholder: هنا تحط منطق الـ checkout (redirect أو API)
    alert(`Proceeding to checkout — total EGP ${Math.round(total)}`);
  }

  // quick demo: if cart empty, show sample products CTA to populate (useful أثناء التطوير)
  function addSampleProducts() {
    const samples = [
      { id: '1', name: 'Gym Ready Set', price: 3750, image: '/assets/So_photos/Card_1.jpg', size: 'M', color: 'Black', quantity: 1 },
      { id: '2', name: 'Sports Hijab', price: 1800, image: '/assets/So_photos/Card_2.jpg', size: 'One Size', color: 'Navy', quantity: 1 }
    ];
    setCart(samples);
  }

  return (
    <div className="cart-page" style={{ padding: '2rem' }}>
      <div className="cart-container" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1>Shopping Cart</h1>

        <div className="cart-content" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', marginTop: '1rem' }}>
          <div className="cart-items">
            {cart.length === 0 ? (
              <div style={{ padding: '2rem', background: '#f8f9fa', borderRadius: 8 }}>
                <p>Your cart is empty.</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={addSampleProducts} style={{ padding: '8px 12px' }}>
                    Add sample items
                  </button>
                </div>
              </div>
            ) : (
              cart.map((item) => <CardItem key={item.id} item={item} onChangeQty={changeQty} onRemove={removeItem} />)
            )}
          </div>

          <aside
            className="cart-summary"
            style={{ background: '#fff', borderRadius: 8, padding: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}
          >
            <h2>Order Summary</h2>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <span>Subtotal</span>
              <span>EGP {Math.round(subtotal).toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <span>Discount</span>
              <span>- EGP {Math.round(discountAmount).toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <span>Tax (10%)</span>
              <span>EGP {Math.round(taxed).toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontWeight: 700 }}>
              <span>Total</span>
              <span>EGP {Math.round(total).toLocaleString()}</span>
            </div>

            <div className="promo-code" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Enter promo code"
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                style={{ flex: 1, padding: '8px', borderRadius: 6, border: '1px solid #ddd' }}
              />
              <button onClick={applyPromoCode} style={{ padding: '8px 12px' }}>
                Apply
              </button>
            </div>

            {notif && <div style={{ marginTop: '0.8rem', padding: '8px', background: '#f0f7ff', borderRadius: 6 }}>{notif}</div>}

            <button
              className="checkout-btn"
              onClick={proceedToCheckout}
              style={{
                width: '100%',
                marginTop: '1rem',
                padding: '10px 12px',
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer'
              }}
            >
              Proceed to Checkout
            </button>

            <button
              onClick={clearCart}
              style={{
                width: '100%',
                marginTop: '0.6rem',
                padding: '8px 12px',
                background: 'transparent',
                color: '#333',
                border: '1px solid #eee',
                borderRadius: 6
              }}
            >
              Clear Cart
            </button>

            <div className="secure-checkout" style={{ marginTop: '1rem', textAlign: 'center', color: '#777' }}>
              <small>Secure Checkout</small>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
