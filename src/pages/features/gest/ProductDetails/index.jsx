// src/pages/ProductDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';

import { productsService } from 'api';
import { cartService } from 'api/cart';
import useAuth from 'hooks/useAuth';
import { openSnackbar } from 'api/snackbar';

import { addToGuestCart } from 'utils/guestCart';
import { getImageUrl } from 'utils/imageHelper';

import SEO from 'components/SEO';
import ProductCard from 'components/ProductCard';

import './productDetails.css';
import ReviewsSection from './components/Reviews/ReviewsSection';
import ProductInfo from './components/ProductInfo';
import ProductGallery from './components/ProductGallery';

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

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const intl = useIntl();

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

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

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

    if (id) fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product?.id) {
      fetchReviews();
      fetchRelatedProducts(product.id);
    }
  }, [product?.id, isLoggedIn]);

  const initializeDefaultVariants = (productData) => {
    if (productData.variants?.color?.length > 0) {
      const firstColor = productData.variants.color[0];
      setSelectedColor(firstColor);

      const availableSizesForColor = getAvailableSizesForColor(firstColor.value, productData);
      setSelectedSize(availableSizesForColor.length > 0 ? availableSizesForColor[0].value : null);

      setDisplayImages(getImagesByColor(productData, firstColor.value));
    } else if (productData.variants?.size?.length > 0) {
      const firstSize = productData.variants.size[0];
      setSelectedSize(firstSize.value);
      setDisplayImages(getAllImages(productData));
    } else {
      setDisplayImages(getAllImages(productData));
    }

    setSelectedImageIndex(0);
  };

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

  const fetchRelatedProducts = async (productId) => {
    try {
      setLoadingRelated(true);

      const response = await productsService.getRelated(productId);

      if (response.success) {
        const data = Array.isArray(response.data) ? response.data : response.data?.products || [];
        setRelatedProducts(data.filter((item) => String(item.id) !== String(productId)));
      }
    } catch (err) {
      console.error('Error fetching related products:', err);
      setRelatedProducts([]);
    } finally {
      setLoadingRelated(false);
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

  const handleSizeChange = (sizeValue) => {
    if (!sizeValue) return;

    setSelectedSize(sizeValue);
    setSelectedImageIndex(0);

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
    setDisplayImages(getImagesByColor(product, color.value));

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

  const handleThumbnailSelect = (img) => {
    if (!img || !product) return;

    const currentMainImages = displayImages.length > 0 ? displayImages : getAllImages(product);

    if (img.color_value) {
      const colors = product.variants?.color || [];
      const targetColor = colors.find((color) => color.value === img.color_value || color.color_value === img.color_value);

      if (targetColor) {
        setSelectedColor(targetColor);

        const colorImages = getImagesByColor(product, img.color_value);
        setDisplayImages(colorImages);

        const targetIndex = colorImages.findIndex((image) => image.url === img.url);
        setSelectedImageIndex(targetIndex !== -1 ? targetIndex : 0);

        const availableSizes = getAvailableSizesForColor(targetColor.value, product);
        setSelectedSize(availableSizes.length > 0 ? availableSizes[0].value : null);

        return;
      }
    }

    const mainIndex = currentMainImages.findIndex((image) => image.url === img.url);
    setSelectedImageIndex(mainIndex !== -1 ? mainIndex : 0);
  };

  const handleQtyChange = (delta) => {
    setQty((q) => {
      const next = q + delta;
      const currentStock = getCurrentStock();
      return next < 1 ? 1 : next > currentStock ? currentStock : next;
    });
  };

  const handleAddToCart = async () => {
    return await validateAndAddToCart();
  };

  const handleBuyNow = async () => {
    const success = await validateAndAddToCart();

    if (success) {
      navigate('/checkout');
    }
  };

  const validateAndAddToCart = async () => {
    if (!product || addingToCart) return false;

    const hasSizeVariants = product.variants?.size?.length > 0;
    const hasColorVariants = product.variants?.color?.length > 0;

    if (hasSizeVariants && !selectedSize) {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'please-select-size' }) || 'Please select a size',
        variant: 'alert',
        alert: { color: 'error' }
      });
      return false;
    }

    if (hasColorVariants && !selectedColor) {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'please-select-color' }) || 'Please select a color',
        variant: 'alert',
        alert: { color: 'error' }
      });
      return false;
    }

    const currentStock = getCurrentStock();

    if (currentStock === 0) {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'out-of-stock-combination' }) || 'This combination is out of stock',
        variant: 'alert',
        alert: { color: 'error' }
      });
      return false;
    }

    if (qty > currentStock) {
      openSnackbar({
        open: true,
        message: `${intl.formatMessage({ id: 'quantity-exceeds-stock' }) || 'Quantity exceeds available stock'} (${currentStock})`,
        variant: 'alert',
        alert: { color: 'error' }
      });
      return false;
    }

    const { variantId, variantData } = findVariantId(hasSizeVariants, hasColorVariants);

    if ((hasSizeVariants || hasColorVariants) && !variantId) {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'please-select-variant' }) || 'Please select size and color',
        variant: 'alert',
        alert: { color: 'error' }
      });
      return false;
    }

    if (!isLoggedIn) {
      return await addToGuestCartHandler(variantId, variantData);
    }

    return await addToLoggedInCartHandler(variantId);
  };

  const findVariantId = (hasSizeVariants, hasColorVariants) => {
    let variantId = null;
    const variantData = {
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
      }
    } else if (selectedColor && hasColorVariants && !hasSizeVariants) {
      const comboForColor = combinations.find((c) => c.color_value === selectedColor.value);

      if (comboForColor) {
        variantId = comboForColor.id;
        variantData.color_value = selectedColor.value;
      }
    } else if (selectedSize && hasSizeVariants && !hasColorVariants) {
      const comboForSize = combinations.find((combo) => combo.size_value === selectedSize);

      if (comboForSize) {
        variantId = comboForSize.id;
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
        main_image: product.main_image || null,
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

      return true;
    } catch (err) {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'failed-add-cart' }),
        variant: 'alert',
        alert: { color: 'error' }
      });

      return false;
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

        return true;
      }

      throw new Error(response.message || 'Failed to add to cart');
    } catch (err) {
      openSnackbar({
        open: true,
        message: err.message || intl.formatMessage({ id: 'failed-add-cart' }),
        variant: 'alert',
        alert: { color: 'error' }
      });

      return false;
    } finally {
      setAddingToCart(false);
    }
  };

  const getCurrentStock = () => {
    const combinations = product?.variants?.combination || [];

    if (combinations.length > 0) {
      const hasSizeVariants = product.variants?.size?.length > 0;
      const hasColorVariants = product.variants?.color?.length > 0;

      if (selectedSize && selectedColor) {
        return getStockFromCombination(product, selectedSize, selectedColor.value);
      }

      if (selectedColor && !hasSizeVariants) {
        return combinations.reduce((acc, c) => {
          if (c.color_value === selectedColor.value) return acc + (parseInt(c.stock_quantity, 10) || 0);
          return acc;
        }, 0);
      }

      if (selectedSize && !hasColorVariants) {
        return combinations.reduce((acc, c) => {
          if (c.size_value === selectedSize) return acc + (parseInt(c.stock_quantity, 10) || 0);
          return acc;
        }, 0);
      }

      return 0;
    }

    return parseInt(product?.stock_quantity, 10) || 0;
  };

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
          <div className="product-breadcrumb text-muted">
            <span>Home</span> / <span>Products</span> / <span className="current">{product.name}</span>
          </div>

          <div className="product-details-grid">
            <ProductGallery
              allImages={allImages}
              mainImages={mainImages}
              productName={product.name}
              selectedImageIndex={selectedImageIndex}
              onImageSelect={setSelectedImageIndex}
              onThumbnailSelect={handleThumbnailSelect}
              selectedColor={selectedColor?.value || ''}
            />

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
              onBuyNow={handleBuyNow}
              getCurrentStock={getCurrentStock}
              getStockFromCombination={(size, color) => getStockFromCombination(product, size, color)}
              getAvailableColorsForSize={(size) => getAvailableColorsForSize(size, product)}
              getAvailableSizesForColor={(color) => getAvailableSizesForColor(color, product)}
            />
          </div>

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

          {relatedProducts.length > 0 && (
            <section className="you-may-like-section">
              <h2 className="you-may-like-title">YOU MAY ALSO LIKE</h2>

              <div className="you-may-like-grid">
                {relatedProducts.slice(0, 4).map((item) => (
                  <ProductCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          {loadingRelated && <div className="you-may-like-loading">Loading related products...</div>}
        </div>
      </div>
    </>
  );
}
