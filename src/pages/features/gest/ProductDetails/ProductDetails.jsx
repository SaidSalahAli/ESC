// src/pages/ProductDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import { Star1, Star, DocumentText } from 'iconsax-react';

// Services & Hooks
import { productsService } from 'api';
import { cartService } from 'api/cart';
import useAuth from 'hooks/useAuth';
import { openSnackbar } from 'api/snackbar';

// Utils
import { addToGuestCart } from 'utils/guestCart';
import { getImageUrl } from 'utils/imageHelper';

// Components
import SEO from 'components/SEO';

// Styles
import './productDetails.css';
import ImageZoom from '../../../../components/ImageZoom';

// ==================== Helper Functions ====================

const getAllImages = (product) => {
  if (!product) return [];

  const images = [];

  if (product.main_image) {
    images.push({
      url: getImageUrl(product.main_image),
      isMain: true
    });
  }

  if (product.images && Array.isArray(product.images)) {
    product.images.forEach((img) => {
      images.push({
        url: getImageUrl(img.image_url),
        isMain: false
      });
    });
  }

  return images;
};

const getStockFromCombination = (product, sizeValue, colorValue) => {
  if (!product?.variants?.combination) return 0;

  const combination = product.variants.combination.find((combo) => combo.size_value === sizeValue && combo.color_value === colorValue);

  return combination ? parseInt(combination.stock_quantity, 10) : 0;
};

const getAvailableColorsForSize = (sizeValue, product) => {
  if (!sizeValue || !product?.variants?.combination) {
    return product?.variants?.color || [];
  }

  const sizeCombinations = product.variants.combination.filter(
    (combo) => combo.size_value === sizeValue && (parseInt(combo.stock_quantity, 10) || 0) > 0
  );

  const availableColorValues = new Set();
  sizeCombinations.forEach((combo) => {
    if (combo.color_value && combo.color_value.trim() !== '') {
      availableColorValues.add(combo.color_value);
    }
  });

  const allColors = product.variants.color || [];
  return allColors.filter((color) => availableColorValues.has(color.value));
};

// New: get available sizes for a selected color
const getAvailableSizesForColor = (colorValue, product) => {
  if (!colorValue || !product?.variants?.combination) {
    return product?.variants?.size || [];
  }

  const colorCombinations = product.variants.combination.filter(
    (combo) => combo.color_value === colorValue && (parseInt(combo.stock_quantity, 10) || 0) > 0
  );

  const availableSizeValues = new Set();
  colorCombinations.forEach((combo) => {
    if (combo.size_value && combo.size_value.toString().trim() !== '') {
      availableSizeValues.add(combo.size_value);
    }
  });

  const allSizes = product.variants.size || [];
  return allSizes.filter((size) => availableSizeValues.has(size.value));
};

// ==================== Main Component ====================

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const intl = useIntl();

  // Product State
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [addedMsg, setAddedMsg] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  // ==================== Effects ====================

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productsService.getById(id);

        if (response.success && response.data) {
          const productData = response.data;
          setProduct(productData);
          initializeDefaultVariants(productData);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    if (product?.id) {
      fetchReviews();
    }
  }, [product?.id, isLoggedIn]);

  // ==================== Variant Initialization ====================

  const initializeDefaultVariants = (productData) => {
    // Color-first flow: choose first available color, then select first size for that color
    if (productData.variants?.color && productData.variants.color.length > 0) {
      const firstColor = productData.variants.color[0];
      setSelectedColor(firstColor);

      // Get sizes available for this color
      const availableSizesForColor = getAvailableSizesForColor(firstColor.value, productData);
      if (availableSizesForColor.length > 0) {
        setSelectedSize(availableSizesForColor[0].value);
      } else {
        setSelectedSize(null);
      }
    } else if (productData.variants?.size && productData.variants.size.length > 0) {
      // Fallback if only sizes exist (no colors)
      const firstSize = productData.variants.size[0];
      setSelectedSize(firstSize.value);
    }
  };

  // ==================== Reviews Handlers ====================

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const response = await productsService.getReviews(product.id);

      if (response.success) {
        setReviews(response.data?.reviews || []);
        setReviewStats(response.data?.statistics || null);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      openSnackbar({
        open: true,
        message: 'Please login to add a review',
        variant: 'alert',
        alert: { color: 'warning' }
      });
      navigate('/login');
      return;
    }

    if (!reviewForm.comment || reviewForm.comment.length < 10) {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'review-comment-min' }),
        variant: 'alert',
        alert: { color: 'error' }
      });
      return;
    }

    try {
      setSubmittingReview(true);
      const response = await productsService.addReview(product.id, {
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment
      });

      if (response.success) {
        openSnackbar({
          open: true,
          message: intl.formatMessage({ id: 'review-submitted' }),
          variant: 'alert',
          alert: { color: 'success' }
        });
        setReviewForm({ rating: 5, title: '', comment: '' });
        setShowReviewForm(false);
        fetchReviews();
      } else {
        throw new Error(response.message || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      openSnackbar({
        open: true,
        message: err.message || intl.formatMessage({ id: 'failed-submit-review' }),
        variant: 'alert',
        alert: { color: 'error' }
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  // ==================== Variant Handlers ====================

  const handleSizeChange = (sizeValue) => {
    if (!sizeValue) return;

    setSelectedSize(sizeValue);
    setSelectedImageIndex(0);

    // When user changes size (secondary), ensure selectedColor still valid
    if (selectedColor) {
      const combinations = product.variants?.combination || [];
      const matching = combinations.find((c) => c.size_value === sizeValue && c.color_value === selectedColor.value);
      if (!matching) {
        // prefer keeping selected color only if some combo exists for that size
        const availableColors = getAvailableColorsForSize(sizeValue, product);
        setSelectedColor(availableColors.length > 0 ? availableColors[0] : null);
      }
    }
  };

  const handleColorChange = (color) => {
    if (!color) return;

    setSelectedColor(color);
    setSelectedImageIndex(0);

    // When color changes, attempt to pick a default size for that color
    const availableSizes = getAvailableSizesForColor(color.value, product);
    if (availableSizes.length > 0) {
      setSelectedSize(availableSizes[0].value);
    } else {
      setSelectedSize(null);
      openSnackbar({
        open: true,
        message: 'لا توجد أحجام متاحة لهذا اللون حالياً',
        variant: 'alert',
        alert: { color: 'warning' }
      });
    }
  };

  const handleQtyChange = (delta) => {
    setQty((q) => {
      const next = q + delta;
      const currentStock = getCurrentStock();
      return next < 1 ? 1 : next > currentStock ? currentStock : next;
    });
  };

  // ==================== Cart Handlers ====================

  const handleAddToCart = async () => {
    if (!product || addingToCart) return;

    const hasSizeVariants = product.variants?.size && product.variants.size.length > 0;
    const hasColorVariants = product.variants?.color && product.variants.color.length > 0;

    // Validate selections
    if (hasSizeVariants && !selectedSize) {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'please-select-size' }) || 'Please select a size',
        variant: 'alert',
        alert: { color: 'error' }
      });
      return;
    }

    if (hasColorVariants && !selectedColor) {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'please-select-color' }) || 'Please select a color',
        variant: 'alert',
        alert: { color: 'error' }
      });
      return;
    }

    const currentStock = getCurrentStock();

    if (currentStock === 0) {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'out-of-stock-combination' }) || 'This combination is out of stock',
        variant: 'alert',
        alert: { color: 'error' }
      });
      return;
    }

    if (qty > currentStock) {
      openSnackbar({
        open: true,
        message: `${intl.formatMessage({ id: 'quantity-exceeds-stock' }) || 'Quantity exceeds available stock'} (${currentStock})`,
        variant: 'alert',
        alert: { color: 'error' }
      });
      return;
    }

    const { variantId, variantData } = findVariantId(hasSizeVariants, hasColorVariants);

    if ((hasSizeVariants || hasColorVariants) && !variantId) {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'please-select-variant' }) || 'Please select size and color',
        variant: 'alert',
        alert: { color: 'error' }
      });
      return;
    }

    if (!isLoggedIn) {
      await addToGuestCartHandler(variantId, variantData);
    } else {
      await addToLoggedInCartHandler(variantId);
    }
  };

  const findVariantId = (hasSizeVariants, hasColorVariants) => {
    let variantId = null;
    let variantData = {
      size_value: null,
      color_value: null
    };

    const combinations = product.variants?.combination || [];

    // New: prefer color primary then size
    if (selectedColor && selectedSize && hasSizeVariants && hasColorVariants) {
      const combinationVariant = combinations.find(
        (combo) => combo.size_value === selectedSize && combo.color_value === selectedColor.value
      );

      if (combinationVariant) {
        variantId = combinationVariant.id;
        variantData.size_value = selectedSize;
        variantData.color_value = selectedColor.value;
      } else {
        openSnackbar({
          open: true,
          message: intl.formatMessage({ id: 'combination-not-available' }) || 'This size and color combination is not available',
          variant: 'alert',
          alert: { color: 'error' }
        });
        return { variantId: null, variantData };
      }
    } else if (selectedColor && hasColorVariants && !hasSizeVariants) {
      const sizeVariant = combinations.find((combo) => combo.size_value === selectedSize);

      if (sizeVariant) {
        variantId = sizeVariant.id;
        variantData.size_value = selectedSize;
      } else {
        // fallback: try find a combo that matches the selected color only
        const comboForColor = combinations.find((c) => c.color_value === selectedColor.value);
        if (comboForColor) {
          variantId = comboForColor.id;
          variantData.color_value = selectedColor.value;
        }
      }
    } else if (selectedSize && hasSizeVariants && !hasColorVariants) {
      const colorCombo = combinations.find((combo) => combo.size_value === selectedSize);
      if (colorCombo) {
        variantId = colorCombo.id;
        variantData.size_value = selectedSize;
      }
    }

    return { variantId, variantData };
  };

  const addToGuestCartHandler = async (variantId, variantData) => {
    try {
      setAddingToCart(true);

      addToGuestCart(product.id, qty, variantId, {
        name: product.name,
        price: product.price,
        sale_price: product.sale_price,
        main_image: product.main_image,
        size_value: variantData.size_value,
        color_value: variantData.color_value,
        // Color / Size format (color is primary)
        variant_name:
          variantData.color_value && variantData.size_value
            ? `${variantData.color_value} / ${variantData.size_value}`
            : variantData.color_value || variantData.size_value || null
      });

      setQty(1);
      setAddedMsg(intl.formatMessage({ id: 'added-to-cart' }));

      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'item-added-cart' }),
        variant: 'alert',
        alert: { color: 'success' }
      });

      setTimeout(() => setAddedMsg(''), 2500);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Error adding to guest cart:', err);
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'failed-add-cart' }),
        variant: 'alert',
        alert: { color: 'error' }
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const addToLoggedInCartHandler = async (variantId) => {
    try {
      setAddingToCart(true);

      const response = await cartService.addToCart(product.id, qty, variantId);

      if (response.success) {
        setQty(1);
        setAddedMsg(intl.formatMessage({ id: 'added-to-cart' }));

        openSnackbar({
          open: true,
          message: intl.formatMessage({ id: 'item-added-success' }),
          variant: 'alert',
          alert: { color: 'success' }
        });

        setTimeout(() => setAddedMsg(''), 2500);
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        throw new Error(response.message || 'Failed to add to cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      openSnackbar({
        open: true,
        message: err.message || intl.formatMessage({ id: 'failed-add-cart' }),
        variant: 'alert',
        alert: { color: 'error' }
      });
    } finally {
      setAddingToCart(false);
    }
  };

  // ==================== Computed Values ====================

  const getCurrentStock = () => {
    const combinations = product?.variants?.combination || [];
    const hasCombinations = combinations.length > 0;

    if (hasCombinations) {
      const hasSizeVariants = product.variants?.size && product.variants.size.length > 0;
      const hasColorVariants = product.variants?.color && product.variants.color.length > 0;

      if (selectedSize && selectedColor) {
        return getStockFromCombination(product, selectedSize, selectedColor.value);
      }

      if (selectedColor && !hasSizeVariants) {
        // sum stock for all combos matching color
        const sum = combinations.reduce((acc, c) => {
          if (c.color_value === selectedColor.value) return acc + (parseInt(c.stock_quantity, 10) || 0);
          return acc;
        }, 0);
        return sum;
      }

      if (selectedSize && !hasColorVariants) {
        const sum = combinations.reduce((acc, c) => {
          if (c.size_value === selectedSize) return acc + (parseInt(c.stock_quantity, 10) || 0);
          return acc;
        }, 0);
        return sum;
      }

      return 0;
    }

    return parseInt(product?.stock_quantity, 10) || 0;
  };

  // ==================== Render Helpers ====================

  if (loading) {
    return (
      <div className="product-details-page center">
        <p>Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-details-page center">
        <p className="error-text">{error || 'Product not found'}</p>
        <button className="back-btn" onClick={() => navigate('/collections')}>
          Back to Collections
        </button>
      </div>
    );
  }

  const images = getAllImages(product);
  const sizes = product.variants?.size || [];
  const colors = product.variants?.color || [];
  const availableColorsForSelectedSize = selectedSize ? getAvailableColorsForSize(selectedSize, product) : [];

  const productStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} - Premium modest sportswear from ESC Wear`,
    image: images.length > 0 ? images[0].url : `${window.location.origin}/assets/ESC-Icon-Black-Trans.png`,
    brand: {
      '@type': 'Brand',
      name: 'ESC Wear'
    },
    offers: {
      '@type': 'Offer',
      url: `${window.location.origin}/products/${product.id}`,
      priceCurrency: product.currency || 'EGP',
      price: product.sale_price || product.price,
      availability: product.stock_quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition'
    },
    aggregateRating: reviewStats
      ? {
          '@type': 'AggregateRating',
          ratingValue: reviewStats.average_rating || 0,
          reviewCount: reviewStats.total_reviews || 0,
          bestRating: 5,
          worstRating: 1
        }
      : undefined,
    sku: product.sku || `ESC-${product.id}`,
    category: product.category?.name || 'Sportswear'
  };

  // ==================== Render ====================

  return (
    <>
      <SEO
        title={`${product.name} | ESC Wear - Premium Modest Sportswear`}
        description={
          product.description ||
          `${product.name} - Premium modest sportswear from ESC Wear. High-quality athletic wear designed for comfort and style.`
        }
        keywords={`${product.name}, modest sportswear, athletic wear, ESC Wear, ${product.category?.name || 'sportswear'}`}
        image={images.length > 0 ? images[0].url : '/assets/ESC-Icon-Black-Trans.png'}
        url={`${window.location.origin}/products/${product.id}`}
        type="product"
        structuredData={productStructuredData}
        canonical={`${window.location.origin}/products/${product.id}`}
      />

      <div className="product-details-page">
        <div className="container">
          {/* Breadcrumb */}
          <div className="product-breadcrumb text-muted">
            <span>Home</span> / <span>Products</span> / <span className="current">{product.name}</span>
          </div>

          <div className="product-details-grid">
            {/* Gallery Section */}
            <ProductGallery
              images={images}
              productName={product.name}
              selectedImageIndex={selectedImageIndex}
              onImageSelect={setSelectedImageIndex}
            />

            {/* Details Section */}
            <ProductInfo
              product={product}
              reviewStats={reviewStats}
              sizes={sizes}
              colors={colors}
              selectedSize={selectedSize}
              selectedColor={selectedColor}
              availableColorsForSelectedSize={availableColorsForSelectedSize}
              qty={qty}
              addingToCart={addingToCart}
              addedMsg={addedMsg}
              onSizeChange={handleSizeChange}
              onColorChange={handleColorChange}
              onQtyChange={handleQtyChange}
              onAddToCart={handleAddToCart}
              getCurrentStock={getCurrentStock}
              getStockFromCombination={(size, color) => getStockFromCombination(product, size, color)}
              getAvailableColorsForSize={(size) => getAvailableColorsForSize(size, product)}
              getAvailableSizesForColor={(color) => getAvailableSizesForColor(color, product)}
            />
          </div>

          {/* Reviews Section */}
          <ReviewsSection
            reviews={reviews}
            reviewStats={reviewStats}
            loadingReviews={loadingReviews}
            isLoggedIn={isLoggedIn}
            showReviewForm={showReviewForm}
            reviewForm={reviewForm}
            submittingReview={submittingReview}
            onShowReviewForm={setShowReviewForm}
            onReviewFormChange={setReviewForm}
            onSubmitReview={handleSubmitReview}
          />
        </div>
      </div>
    </>
  );
}

// ==================== Sub Components ====================

function ProductGallery({ images, productName, selectedImageIndex, onImageSelect }) {
  return (
    <div className="gallery">
      <div className="gallery-layout">
        {images.length > 1 && (
          <div className="gallery-thumbs vertical">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => onImageSelect(idx)}
                className={`thumb-btn ${idx === selectedImageIndex ? 'active' : ''}`}
                aria-label={`View image ${idx + 1}`}
              >
                <img src={img.url} alt={`${productName} thumb ${idx + 1}`} />
              </button>
            ))}
          </div>
        )}

        <div className="gallery-main">
          {images.length > 0 ? (
            <ImageZoom src={images[selectedImageIndex]?.url || images[0]?.url} alt={productName} />
          ) : (
            <div className="no-image">No image available</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductInfo({
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
        {currentStock > 0 ? <div className="stock stock-in">In stock </div> : <div className="stock stock-out">Out of stock</div>}
      </div>

      {reviewStats && <RatingDisplay reviewStats={reviewStats} />}

      {/* Color Selection (primary - show all available colors first) */}
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

      {/* Size Selection (secondary - show only sizes for selected color) */}
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

      {/* Product Details */}
      {product.description && (
        <div className="details-accordion">
          <p>{product.description}</p>
        </div>
      )}
    </aside>
  );
}

function RatingDisplay({ reviewStats }) {
  return (
    <div className="rating-row">
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size="18"
            variant={star <= Math.round(reviewStats.average_rating || 0) ? 'Bold' : 'Outline'}
            color={star <= Math.round(reviewStats.average_rating || 0) ? '#ffc107' : '#ddd'}
          />
        ))}
      </div>
      <span className="rating-text">
        {parseFloat(reviewStats.average_rating || 0).toFixed(1)} • {reviewStats.total_reviews || 0}{' '}
        {reviewStats.total_reviews === 1 ? <FormattedMessage id="review" /> : <FormattedMessage id="reviews" />}
      </span>
    </div>
  );
}

function SizeSelector({ sizes, selectedSize, selectedColor, onSizeChange, getStockFromCombination }) {
  if (!selectedColor) {
    return null;
  }

  return (
    <div className="block" style={{ marginBottom: '1.5rem' }}>
      <div className="block-label">
        <FormattedMessage id="size" /> <span className="required">*</span>
        {selectedSize && <span style={{ fontWeight: 400, marginLeft: '0.5rem', color: '#666' }}>{selectedSize}</span>}
      </div>

      {sizes.length === 0 ? (
        <div style={{ color: '#ff9800', fontSize: '0.9rem', padding: '0.5rem', backgroundColor: '#fff3e0', borderRadius: '4px' }}>
          <FormattedMessage id="no-sizes-available" />
           
        </div>
      ) : (
        <div className="sizes-row">
          {sizes.map((size) => {
            const isSelected = selectedSize === size.value;
            const stockCount = getStockFromCombination(size.value, selectedColor.value);
            const isAvailable = stockCount > 0;

            return (
              <button
                key={size.id}
                onClick={() => isAvailable && onSizeChange(size.value)}
                className={`size-option ${isSelected ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}`}
                title={`${size.value}${isAvailable ? ` - ${stockCount} متوفر` : ' - غير متوفر'}`}
                disabled={!isAvailable}
                style={{
                  padding: '0.6rem 1.2rem',
                  borderRadius: '6px',
                  border: isSelected ? '2px solid #1976d2' : '1px solid #ccc',
                  backgroundColor: isSelected ? '#e3f2fd' : '#fff',
                  cursor: isAvailable ? 'pointer' : 'not-allowed',
                  opacity: isAvailable ? 1 : 0.5,
                  fontWeight: isSelected ? 600 : 400,
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{size.value}</span>
                {!isAvailable && <span style={{ fontSize: '0.75rem', marginLeft: '4px', color: '#999' }}>(غير متوفر)</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ColorSelector({ selectedColor, colors, onColorChange, getAvailableSizesForColor, getStockFromCombination, product }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ fontWeight: 600, marginBottom: '0.8rem' }}>
        <FormattedMessage id="color" /> <span style={{ color: '#d32f2f' }}>*</span>:
        {selectedColor && <span style={{ fontWeight: 400, marginLeft: '0.5rem', color: '#666' }}>{selectedColor.value}</span>}
      </div>

      {colors.length === 0 ? (
        <div style={{ color: '#f44336', fontSize: '0.9rem', padding: '0.5rem' }}>لا توجد ألوان متاحة</div>
      ) : (
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {colors.map((color) => {
            const bg = color?.hex || color?.value || '#000000';
            const isSelected = selectedColor?.id === color.id;

            // Check if this color has any available sizes
            const availableSizes = getAvailableSizesForColor(color.value, product);
            const hasStock = availableSizes.length > 0;

            return (
              <button
                key={color.id}
                onClick={() => onColorChange(color)}
                className={`color-pill ${isSelected ? 'selected' : ''} ${!hasStock ? 'out-of-stock' : ''}`}
                aria-label={color.value}
                title={`${color.value}${hasStock ? ` - ${availableSizes.length} أحجام متاحة` : ' - غير متوفر'}`}
                disabled={!hasStock}
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: '20px',
                  border: isSelected ? '2px solid #1976d2' : '1px solid #ccc',
                  backgroundColor: isSelected ? '#e3f2fd' : '#fff',
                  cursor: hasStock ? 'pointer' : 'not-allowed',
                  opacity: hasStock ? 1 : 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: bg,
                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
                    border: isSelected ? '2px solid #1976d2' : 'none'
                  }}
                />
                <span style={{ fontSize: '0.95rem' }}>{color.value}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ReviewsSection({
  reviews,
  reviewStats,
  loadingReviews,
  isLoggedIn,
  showReviewForm,
  reviewForm,
  submittingReview,
  onShowReviewForm,
  onReviewFormChange,
  onSubmitReview
}) {
  const intl = useIntl();

  return (
    <div className="product-reviews">
      <div className="product-reviews-inner">
        <h2 className="reviews-title">
          <Star1 size="24" />
          <FormattedMessage id="reviews-ratings" />
        </h2>

        {reviewStats && (
          <div className="reviews-summary">
            <div className="summary-score">
              <div className="score-value">{parseFloat(reviewStats.average_rating || 0).toFixed(1)}</div>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size="20"
                    variant={star <= Math.round(reviewStats.average_rating || 0) ? 'Bold' : 'Outline'}
                    color={star <= Math.round(reviewStats.average_rating || 0) ? '#ffc107' : '#ddd'}
                  />
                ))}
              </div>
              <div className="summary-text">
                {reviewStats.total_reviews || 0}{' '}
                {reviewStats.total_reviews === 1 ? <FormattedMessage id="review" /> : <FormattedMessage id="reviews" />}
              </div>
            </div>
          </div>
        )}

        {isLoggedIn && (
          <div className="add-review-block">
            {!showReviewForm ? (
              <button className="write-review-btn" onClick={() => onShowReviewForm(true)}>
                <DocumentText size="20" />
                <FormattedMessage id="write-a-review" />
              </button>
            ) : (
              <ReviewForm
                reviewForm={reviewForm}
                submittingReview={submittingReview}
                onReviewFormChange={onReviewFormChange}
                onSubmitReview={onSubmitReview}
                onCancel={() => {
                  onShowReviewForm(false);
                  onReviewFormChange({ rating: 5, title: '', comment: '' });
                }}
              />
            )}
          </div>
        )}

        {loadingReviews ? (
          <div className="center padding">
            <FormattedMessage id="loading-reviews" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="center padding text-muted">
            <p>
              <FormattedMessage id="no-reviews-yet" />
            </p>
          </div>
        ) : (
          <ReviewsList reviews={reviews} />
        )}
      </div>
    </div>
  );
}

function ReviewForm({ reviewForm, submittingReview, onReviewFormChange, onSubmitReview, onCancel }) {
  const intl = useIntl();

  return (
    <form className="review-form" onSubmit={onSubmitReview}>
      <h3>
        <FormattedMessage id="write-your-review" />
      </h3>

      <div className="form-group">
        <label>
          <FormattedMessage id="rating" /> *
        </label>
        <div className="rating-input">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" onClick={() => onReviewFormChange({ ...reviewForm, rating: star })}>
              <Star
                size="32"
                variant={star <= reviewForm.rating ? 'Bold' : 'Outline'}
                color={star <= reviewForm.rating ? '#ffc107' : '#ddd'}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>
          <FormattedMessage id="title-optional" />
        </label>
        <input
          type="text"
          value={reviewForm.title}
          onChange={(e) => onReviewFormChange({ ...reviewForm, title: e.target.value })}
          placeholder={intl.formatMessage({ id: 'review-title' })}
        />
      </div>

      <div className="form-group">
        <label>
          <FormattedMessage id="comment" /> *
        </label>
        <textarea
          rows={5}
          required
          minLength={10}
          value={reviewForm.comment}
          onChange={(e) => onReviewFormChange({ ...reviewForm, comment: e.target.value })}
          placeholder={intl.formatMessage({ id: 'write-review-here' })}
        />
      </div>

      <div className="form-actions">
        <button type="submit" disabled={submittingReview} className="submit-review-btn">
          {submittingReview ? <FormattedMessage id="submitting" /> : <FormattedMessage id="submit-review" />}
        </button>
        <button type="button" className="cancel-review-btn" onClick={onCancel}>
          <FormattedMessage id="cancel" />
        </button>
      </div>
    </form>
  );
}

function ReviewsList({ reviews }) {
  return (
    <div className="reviews-list">
      {reviews.map((review) => (
        <div className="review-card" key={review.id}>
          <div className="review-header">
            <div>
              <div className="review-name">
                {review.first_name} {review.last_name}
              </div>
              <div className="stars small">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size="16"
                    variant={star <= review.rating ? 'Bold' : 'Outline'}
                    color={star <= review.rating ? '#ffc107' : '#ddd'}
                  />
                ))}
              </div>
            </div>
            <div className="review-date">{new Date(review.created_at).toLocaleDateString()}</div>
          </div>

          {review.title && <h4 className="review-title">{review.title}</h4>}
          <p className="review-comment">{review.comment}</p>

          {review.is_verified_purchase && (
            <div className="verified-pill">
              ✓ <FormattedMessage id="verified-purchase" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
