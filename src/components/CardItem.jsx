import React from 'react';

export default function CardItem({ item, onChangeQty, onRemove }) {
  const handleDecrease = () => {
    if (item.quantity > 1) onChangeQty(item.id, item.quantity - 1);
  };

  const handleIncrease = () => {
    onChangeQty(item.id, item.quantity + 1);
  };

  const priceNumber = parseFloat(item.price || 0) || 0;

  return (
    <div
      className="cart-item"
      style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        marginBottom: '1rem',
        padding: '0.8rem 0',
        borderBottom: '1px solid #eee'
      }}
    >
      <div className="cart-item-image" style={{ width: 100, height: 100, flex: '0 0 100px', borderRadius: 8, overflow: 'hidden' }}>
        <img
          src={item.image || 'https://via.placeholder.com/300x300?text=Product'}
          alt={item.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/300x300?text=Product';
          }}
        />
      </div>

      <div className="cart-item-info" style={{ flex: 1 }}>
        <h4 style={{ margin: 0, fontSize: '1rem' }}>{item.name}</h4>

        {/* meta: category + variants */}
        <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#666' }}>
          {item.category_name && <span>{item.category_name} · </span>}

          {item.variant_name ? (
            <span>{item.variant_name}</span>
          ) : (
            <>
              {item.size && <span>Size: {item.size}</span>}
              {item.size && item.color && <span> · </span>}
              {item.color && <span>Color: {item.color}</span>}
            </>
          )}
        </p>

        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>EGP {priceNumber.toLocaleString()}</p>
      </div>

      <div
        className="cart-item-actions"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.5rem',
          minWidth: 120
        }}
      >
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <button
            onClick={handleDecrease}
            aria-label="decrease"
            style={{
              padding: '6px 8px',
              borderRadius: 4,
              border: '1px solid #ddd',
              background: '#f8f9fa',
              cursor: 'pointer'
            }}
          >
            −
          </button>
          <div style={{ minWidth: 28, textAlign: 'center' }}>{item.quantity}</div>
          <button
            onClick={handleIncrease}
            aria-label="increase"
            style={{
              padding: '6px 8px',
              borderRadius: 4,
              border: '1px solid #ddd',
              background: '#f8f9fa',
              cursor: 'pointer'
            }}
          >
            +
          </button>
        </div>
        <button
          onClick={() => onRemove(item.id)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#dc3545',
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
