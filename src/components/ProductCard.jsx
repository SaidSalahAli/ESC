import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { Star } from 'iconsax-react';
import { getImageUrl } from 'utils/imageHelper';
import { Box, Card, Typography } from '@mui/material';

function ProductCard({ item }) {
  const navigate = useNavigate();
  const intl = useIntl();

  const [isHovered, setIsHovered] = useState(false);
  const [hoveredColor, setHoveredColor] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  const allImages = useMemo(() => {
    const imgs = [];

    if (item.main_image) {
      imgs.push({
        url: getImageUrl(item.main_image),
        color_value: null
      });
    }

    if (item.images?.length) {
      item.images.forEach((img) => {
        if (img.image_url) {
          imgs.push({
            url: getImageUrl(img.image_url),
            color_value: img.color_value || null
          });
        }
      });
    }

    return imgs;
  }, [item]);

  const activeColor = hoveredColor ?? selectedColor;

  const displayImages = useMemo(() => {
    if (!activeColor) {
      const fallback = allImages.length > 0 ? allImages : [{ url: item.image }, { url: item.image }];
      return fallback.length === 1 ? [fallback[0], fallback[0]] : fallback.slice(0, 2);
    }

    const colorImgs = allImages.filter((img) => img.color_value === activeColor);

    if (colorImgs.length === 0) {
      const fallback = allImages.length > 0 ? allImages : [{ url: item.image }, { url: item.image }];
      return fallback.length === 1 ? [fallback[0], fallback[0]] : fallback.slice(0, 2);
    }

    return colorImgs.length === 1 ? [colorImgs[0], colorImgs[0]] : colorImgs.slice(0, 2);
  }, [activeColor, allImages, item.image]);

  const colorList = useMemo(() => {
    const seen = new Set();

    return allImages.reduce((acc, img) => {
      if (img.color_value && !seen.has(img.color_value)) {
        seen.add(img.color_value);
        acc.push({
          value: img.color_value,
          image: img.url
        });
      }

      return acc;
    }, []);
  }, [allImages]);

  const discountPercent =
    item.sale_price && item.price ? Math.round(((Number(item.price) - Number(item.sale_price)) / Number(item.price)) * 100) : null;

  const rating = Number(item?.reviews?.average_rating || 0);
  const totalReviews = Number(item?.reviews?.total_reviews || 0);

  const getCardStock = () => {
    try {
      if (item.variants?.combination?.length > 0) {
        return item.variants.combination.some((c) => (Number(c.stock_quantity) || 0) > 0) ? 1 : 0;
      }

      return Number(item?.stock_quantity ?? 0);
    } catch {
      return Number(item?.stock_quantity ?? 0);
    }
  };

  const cardStock = getCardStock();

  const handleCardClick = (e) => {
    if (e.target.closest('.card-btn') || e.target.closest('.swatch-btn')) return;
    if (item.id) navigate(`/products/${item.id}`);
  };

  return (
    <Card
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoveredColor(null);
      }}
      elevation={0}
      sx={{
        border: 'none',
        borderRadius: 0,
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'transparent'
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '3/4',
          overflow: 'hidden',
          bgcolor: '#c8c8c8',
          flexShrink: 0
        }}
      >
        {discountPercent && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              zIndex: 2,
              bgcolor: '#cc1111',
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 700,
              px: 0.75,
              py: '2px',
              borderRadius: '3px',
              letterSpacing: '0.5px'
            }}
          >
            {discountPercent}% OFF
          </Box>
        )}

        {cardStock === 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 2,
              bgcolor: 'rgba(0,0,0,0.7)',
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 600,
              px: 1,
              py: '3px',
              letterSpacing: '0.5px'
            }}
          >
            Out of stock
          </Box>
        )}

        {displayImages.map((img, i) => (
          <Box
            key={`${activeColor || 'default'}-${img.url}-${i}`}
            component="img"
            src={img.url}
            alt={item.name}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/300x400?text=Product';
            }}
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top',
              opacity: (i === 0) === !isHovered ? 1 : 0,
              transform: (i === 0) === !isHovered ? 'scale(1)' : 'scale(1.04)',
              transition: 'opacity 0.4s ease, transform 0.4s ease'
            }}
          />
        ))}
      </Box>

      <Box sx={{ pt: 1.25, pb: 1.75, px: 0.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {colorList.length > 0 && (
          <Box sx={{ display: 'flex', gap: '7px', flexWrap: 'wrap', alignItems: 'center' }}>
            {colorList.map((color) => (
              <Box
                key={color.value}
                className="swatch-btn"
                title={color.value}
                onMouseEnter={() => setHoveredColor(color.value)}
                onMouseLeave={() => setHoveredColor(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedColor((prev) => (prev === color.value ? null : color.value));
                }}
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  bgcolor: color.value,
                  outline: selectedColor === color.value ? '2px solid #000' : '1px solid #ddd',
                  outlineOffset: selectedColor === color.value ? '2px' : '0px',
                  cursor: 'pointer',
                  transition: '0.2s ease',
                  '&:hover': {
                    outline: '2px solid #000',
                    outlineOffset: '2px'
                  }
                }}
              >
                <Box
                  component="img"
                  src={color.image}
                  alt={color.value}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </Box>
            ))}
          </Box>
        )}

        <Typography
          sx={{
            fontFamily: '"Barlow Condensed", "Roboto Condensed", sans-serif',
            fontSize: '0.78rem',
            fontWeight: 500,
            letterSpacing: '1.1px',
            textTransform: 'uppercase',
            color: 'text.primary',
            lineHeight: 1.3
          }}
        >
          {item.name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: 'text.primary' }}>
            EGP {Number(item.sale_price || item.price).toLocaleString()}
          </Typography>

          {item.sale_price && (
            <Typography sx={{ fontSize: '0.78rem', color: 'text.disabled', textDecoration: 'line-through' }}>
              EGP {Number(item.price).toLocaleString()}
            </Typography>
          )}
        </Box>

        {totalReviews > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size="14"
                variant={star <= Math.round(rating) ? 'Bold' : 'Outline'}
                color={star <= Math.round(rating) ? '#ffc238' : '#d8d8d8'}
              />
            ))}

            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>({totalReviews})</Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
}

export default ProductCard;
