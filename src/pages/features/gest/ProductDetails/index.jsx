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
import ReviewsSection from './components/Reviews/ReviewsSection';
import ProductInfo from './components/ProductInfo';
import ProductGallery from './components/ProductGallery';

// ==================== Helper Functions ====================

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

const getAllImages = (product) => {
  if (!product?.images || product.images.length === 0) return [];

  return product.images.map((img) => ({
    id: img.id,
    url: getImageUrl(img.image_url),
    isMain: false,
    color_value: img.color_value || null
  }));
};

// Returns images filtered by color_value from the already-loaded product.images
// Falls back to all images if no color-specific images found
const getImagesByColor = (product, colorValue) => {
  if (!colorValue || !product?.images) return getAllImages(product);

  const filtered = product.images.filter((img) => img.color_value === colorValue);

  const imgs = filtered.map((img) => ({
    id: img.id,
    url: getImageUrl(img.image_url),
    isMain: false,
    color_value: img.color_value || null
  }));

  return imgs.length > 0 ? imgs : getAllImages(product);
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
  const [displayImages, setDisplayImages] = useState([]);
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

      // Use images already embedded in product data — no extra API call needed
      setDisplayImages(getImagesByColor(productData, firstColor.value));
    } else if (productData.variants?.size && productData.variants.size.length > 0) {
      // Fallback: only sizes, no colors
      const firstSize = productData.variants.size[0];
      setSelectedSize(firstSize.value);
      setDisplayImages(getAllImages(productData));
    } else {
      // No variants — show all images
      setDisplayImages(getAllImages(productData));
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

    // When user changes size (secondary), ensure selectedColor is still valid
    if (selectedColor) {
      const combinations = product.variants?.combination || [];
      const matching = combinations.find((c) => c.size_value === sizeValue && c.color_value === selectedColor.value);
      if (!matching) {
        const availableColors = getAvailableColorsForSize(sizeValue, product);
        setSelectedColor(availableColors.length > 0 ? availableColors[0] : null);
      }
    }
  };

  const handleColorChange = (color) => {
    if (!color) return;

    setSelectedColor(color);
    setSelectedImageIndex(0);

    // Filter images from already-loaded product.images by color_value — no API call needed
    setDisplayImages(getImagesByColor(product, color.value));

    // Pick a default size for this color
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
        size_value: variantData.size_value,
        color_value: variantData.color_value,
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

  // Use displayImages if populated, otherwise fall back to all product images
  const allImages = getAllImages(product);
  const mainImages = displayImages.length > 0 ? displayImages : allImages;
  const sizes = product.variants?.size || [];
  const colors = product.variants?.color || [];
  const availableColorsForSelectedSize = selectedSize ? getAvailableColorsForSize(selectedSize, product) : [];

  const productStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} - Premium modest sportswear from ESC Wear`,
    image: mainImages.length > 0 ? mainImages[0].url : `${window.location.origin}/assets/ESC-Icon-Black-Trans.png`,
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
        image={mainImages.length > 0 ? mainImages[0].url : '/assets/ESC-Icon-Black-Trans.png'}
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
              allImages={allImages}
              mainImages={mainImages}
              productName={product.name}
              selectedImageIndex={selectedImageIndex}
              onImageSelect={setSelectedImageIndex}
              selectedColor={selectedColor?.value || ''}
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
