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
  getCurrentStock,
  getStockFromCombination,
  getAvailableColorsForSize,
  getAvailableSizesForColor
}) {
  const currentStock = getCurrentStock();

  return (
    <aside className="details-column">
      <h1>{product.name}</h1>

      <div className="price-row">
        <div className="price">{product.price} EGP</div>
        {currentStock > 0 ? <div className="stock stock-in">In stock</div> : <div className="stock stock-out">Out of stock</div>}
      </div>

      {reviewStats && <RatingDisplay reviewStats={reviewStats} />}

      {/* Color Selection (primary — show all available colors) */}
      {colors.length > 0 && (
        <ColorSelector
          selectedColor={selectedColor}
          colors={colors}
          onColorChange={onColorChange}
          getAvailableSizesForColor={getAvailableSizesForColor}
          getStockFromCombination={getStockFromCombination}
          product={product}
        />
      )}

      {/* Size Selection (secondary — only sizes valid for selected color) */}
      {sizes.length > 0 && selectedColor && (
        <SizeSelector
          sizes={getAvailableSizesForColor(selectedColor.value, product)}
          selectedSize={selectedSize}
          selectedColor={selectedColor}
          onSizeChange={onSizeChange}
          getStockFromCombination={getStockFromCombination}
        />
      )}

      {/* Quantity */}
      <div className="qty-cta">
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

      {/* Add to Cart Button */}
      <button
        className="buy-now-btn"
        onClick={onAddToCart}
        disabled={addingToCart || currentStock === 0 || (sizes.length > 0 && !selectedSize) || (colors.length > 0 && !selectedColor)}
      >
        <FormattedMessage id="add-to-cart" defaultMessage="BUY IT NOW" />
      </button>

      {addedMsg && <div className="added-msg">{addedMsg}</div>}

      {/* Product Description */}
      {product.description && (
        <div className="details-accordion">
          <p>{product.description}</p>
        </div>
      )}
    </aside>
  );
}
