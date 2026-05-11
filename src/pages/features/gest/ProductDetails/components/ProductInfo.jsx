import { FormattedMessage } from 'react-intl';
import ColorSelector from './ColorSelector';
import SizeSelector from './SizeSelector';
import RatingDisplay from './RatingDisplay';

export default function ProductInfo({
  product,
  reviewStats,
  sizes,
  colors,
  selectedSize,
  selectedColor,
  availableColorsForSelectedSize,
  qty,
  addingToCart,
  addedMsg,
  onSizeChange,
  onColorChange,
  onQtyChange,
  onAddToCart,
  onBuyNow,
  getCurrentStock,
  getStockFromCombination,
  getAvailableColorsForSize,
  getAvailableSizesForColor
}) {
  const currentStock = getCurrentStock();
  const hasSizeVariants = sizes && sizes.length > 0;
  const hasColorVariants = colors && colors.length > 0;

  const price = Number(product.price || 0);
  const salePrice = product.sale_price ? Number(product.sale_price) : null;
  const hasDiscount = Boolean(product.is_discount_active || product.has_discount || (salePrice && price && salePrice < price));
  const discountPercent = hasDiscount
    ? product.discount_percent
      ? Number(product.discount_percent)
      : salePrice
        ? Math.round(((price - salePrice) / price) * 100)
        : null
    : null;

  const displayPrice = salePrice ?? price;

  const isAddToCartDisabled =
    addingToCart || currentStock === 0 || (hasSizeVariants && !selectedSize) || (hasColorVariants && !selectedColor);

  return (
    <aside className="details-column">
      <h1>{product.name}</h1>

      <div className="price-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="price">{displayPrice} EGP</div>

          {hasDiscount && salePrice && <div style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.9rem' }}>{price} EGP</div>}

          {discountPercent && (
            <div
              style={{
                background: '#c8102e',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.85rem',
                padding: '2px 8px',
                letterSpacing: '1px'
              }}
            >
              -{discountPercent}%
            </div>
          )}
        </div>

        {currentStock > 0 ? <div className="stock stock-in">In stock</div> : <div className="stock stock-out">Out of stock</div>}
      </div>

      {reviewStats && <RatingDisplay reviewStats={reviewStats} />}

      {colors.length > 0 && (
        <ColorSelector
          selectedColor={selectedColor}
          colors={colors}
          onColorChange={onColorChange}
          getAvailableSizesForColor={getAvailableSizesForColor}
          product={product}
        />
      )}

      {sizes.length > 0 && selectedColor && (
        <SizeSelector
          sizes={getAvailableSizesForColor(selectedColor.value, product)}
          selectedSize={selectedSize}
          selectedColor={selectedColor}
          onSizeChange={onSizeChange}
          getStockFromCombination={getStockFromCombination}
        />
      )}

      <div className="qty-section">
        <div className="qty">
          <button type="button" onClick={() => onQtyChange(-1)}>
            −
          </button>
          <div className="qty-value">{qty}</div>
          <button type="button" onClick={() => onQtyChange(1)}>
            +
          </button>
        </div>
      </div>

      <div className="cta-buttons">
        <button className="add-to-cart-btn" onClick={onAddToCart} disabled={isAddToCartDisabled} type="button">
          <FormattedMessage id="add-to-cart" defaultMessage="ADD TO CART" />
        </button>
        <button className="buy-now-btn" onClick={onBuyNow} disabled={isAddToCartDisabled} type="button">
          <FormattedMessage id="buy-it-now" defaultMessage="BUY IT NOW" />
        </button>
      </div>

      {addedMsg && <div className="added-msg">{addedMsg}</div>}

      {product.description && (
        <div className="details-accordion">
          <p>{product.description}</p>
        </div>
      )}ش
    </aside>
  );
}
