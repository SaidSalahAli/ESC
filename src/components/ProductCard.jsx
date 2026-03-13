import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsService } from 'api';
import { cartService } from 'api/cart';
import useAuth from 'hooks/useAuth';
import { addToGuestCart } from 'utils/guestCart';
import { openSnackbar } from 'api/snackbar';
import { FormattedMessage, useIntl } from 'react-intl';
import { getImageUrl, cleanImagePath } from 'utils/imageHelper';
import { Box, Card, Typography, Rating } from '@mui/material';

function ProductCard({ item, addToCart, onQuickView }) {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const intl = useIntl();

  const [productDetails, setProductDetails] = useState(null);
  const [images, setImages] = useState([]);
  const [hoveredImageIndex, setHoveredImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch product details with variants and images
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!item?.id) return;

      try {
        setLoadingDetails(true);
        const response = await productsService.getById(item.id);

        if (response.success && response.data) {
          const product = response.data;
          setProductDetails(product);

          const productImages = [];
          if (product.main_image) {
            productImages.push(getImageUrl(product.main_image));
          }
          if (product.images && Array.isArray(product.images)) {
            product.images.forEach((img) => {
              if (img.image_url) {
                productImages.push(getImageUrl(img.image_url));
              }
            });
          }
          if (productImages.length === 1) {
            productImages.push(productImages[0]);
          }
          setImages(productImages.length > 0 ? productImages : [item.image, item.image]);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setImages([item.image, item.image]);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchProductDetails();
  }, [item?.id]);

  const handleCardClick = (e) => {
    if (e.target.closest('.size-btn') || e.target.closest('.card-btn')) return;
    if (item.id) navigate(`/products/${item.id}`);
  };

  const handleAddToCartWithVariant = async (variantId, sizeValue) => {
    if (addingToCart) return;
    setAddingToCart(true);

    try {
      let variantName = 'Size';
      if (productDetails && productDetails.variants) {
        const hasSize = productDetails.variants.size && productDetails.variants.size.length > 0;
        const hasColor = productDetails.variants.color && productDetails.variants.color.length > 0;
        if (hasColor && !hasSize) variantName = 'Color';
        else if (hasSize && hasColor) variantName = 'Color / Size';
      }

      if (!isLoggedIn) {
        addToGuestCart(item.id, 1, variantId, {
          name: item.name,
          price: item.price,
          sale_price: item.sale_price || null,
          main_image: images[0] ? cleanImagePath(images[0]) : null,
          variant_name: variantName,
          variant_value: sizeValue
        });
        openSnackbar({ open: true, message: intl.formatMessage({ id: 'item-added-cart' }), variant: 'alert', alert: { color: 'success' } });
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        const response = await cartService.addToCart(item.id, 1, variantId);
        if (response.success) {
          openSnackbar({
            open: true,
            message: intl.formatMessage({ id: 'item-added-success' }),
            variant: 'alert',
            alert: { color: 'success' }
          });
          window.dispatchEvent(new Event('cartUpdated'));
        } else {
          throw new Error(response.message || 'Failed to add to cart');
        }
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

  const displayImages = images.length > 0 ? images : [item.image, item.image];

  const getCardStock = () => {
    try {
      if (
        productDetails &&
        productDetails.variants &&
        Array.isArray(productDetails.variants.combination) &&
        productDetails.variants.combination.length > 0
      ) {
        const anyInStock = productDetails.variants.combination.some((c) => (Number(c.stock_quantity) || 0) > 0);
        return anyInStock ? 1 : 0;
      }
      return Number(productDetails?.stock_quantity ?? item.stock_quantity ?? 0);
    } catch (err) {
      return Number(item.stock_quantity ?? 0);
    }
  };

  const cardStock = getCardStock();

  return (
    <Card
      onClick={handleCardClick}
      onMouseEnter={() => {
        setIsHovered(true);
        setHoveredImageIndex(1);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoveredImageIndex(0);
      }}
      elevation={0}
      sx={{
        border: '1px solid rgba(11, 18, 19, 0.06)',
        // borderRadius: 2,
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'transform 0.22s ease, box-shadow 0.22s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)'
        }
      }}
    >
      {/* ── Image Container ── */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'relative',
          width: '100%',
          height: { xs: 350, md: 340 },
          flexShrink: 0,
          overflow: 'hidden',
          background: 'radial-gradient(circle at top, #0b5751 0%, #0b1213 60%)'
        }}
      >
        {/* Image Wrapper */}
        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
          {displayImages.map((img, index) => (
            <Box
              key={index}
              component="img"
              src={img}
              alt={item.name}
              onError={(e) => {
                e.currentTarget.src = item.image || 'https://via.placeholder.com/300x300?text=Product';
              }}
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'top',
                opacity: index === hoveredImageIndex ? 1 : 0,
                transform: index === hoveredImageIndex ? 'scale(1)' : 'scale(1.03)',
                transition: 'opacity 0.4s ease, transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
          ))}

          {/* Stock - only show after details are loaded to avoid false "Out of stock" on slow connections */}
          {!loadingDetails && cardStock === 0 && (
            <Typography
              sx={{
                position: 'absolute',
                margin: '10px',
                fontSize: '0.85rem',
                backgroundColor: 'red',
                display: 'flex',
                px: 1.5,
                color: 'white',
                mt: 0.25
              }}
            >
              Out of stock
            </Typography>
          )}
        </Box>
      </Box>

      {/* ── Content ── */}
      <Box
        sx={{
          p: { xs: '0.8rem 0.9rem 1rem', md: '0.9rem 1.1rem 1.25rem' },
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          flex: '1 1 auto'
        }}
      >
        {/* Name */}
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: { xs: '0.95rem', md: '0.98rem' },
            lineHeight: 1.4,
            color: 'text.primary'
          }}
        >
          {item.name}
        </Typography>

        {/* Category tag */}
        <Box
          component="span"
          sx={{
            display: 'inline-block',
            alignSelf: 'flex-start',
            // px: 1,
            py: '2px',
            // borderRadius: '999px',
            fontSize: '0.7rem',
            fontWeight: 500,
            // bgcolor: 'rgba(74, 175, 163, 0.08)',
            color: '#0b5751'
          }}
        >
          {item.category}
        </Box>

        {/* Rating */}
        {item.reviews?.total_reviews > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Rating value={item.reviews?.average_rating} readOnly size="small" precision={0.5} />
            <Typography variant="caption" color="text.secondary">
              ({item.reviews.total_reviews})
            </Typography>
          </Box>
        )}

        {/* Price */}
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 0.25 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1rem', md: '1.05rem' },
              color: '#c0392b'
            }}
          >
            {item.sale_price || item.price} EGP
          </Typography>
          {item.sale_price && item.price && (
            <Typography
              sx={{
                fontSize: '0.85rem',
                color: 'text.disabled',
                textDecoration: 'line-through'
              }}
            >
              {item.price} EGP
            </Typography>
          )}
        </Box>
      </Box>
    </Card>
  );
}

export default ProductCard;
