import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService } from 'api/cart';
import useAuth from 'hooks/useAuth';
import { addToGuestCart } from 'utils/guestCart';
import { openSnackbar } from 'api/snackbar';
import { useIntl } from 'react-intl';
import { getImageUrl, cleanImagePath } from 'utils/imageHelper';
import { Box, Card, Typography } from '@mui/material';

function ProductCard({ item, addToCart }) {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const intl = useIntl();

  const [isHovered, setIsHovered] = useState(false);
  const [hoveredColor, setHoveredColor] = useState(null); // اللون اللي الماوس عليه
  const [selectedColor, setSelectedColor] = useState(null); // اللون المختار بالكليك
  const [addingToCart, setAddingToCart] = useState(false);

  /* ─── بناء قائمة الصور ─── */
  const allImages = useMemo(() => {
    const imgs = [];
    if (item.main_image) {
      imgs.push({ url: getImageUrl(item.main_image), color_value: null });
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

  /* ─── الصور المعروضة بناءً على اللون النشط ─── */
  const activeColor = hoveredColor ?? selectedColor; // hover يكسب على selected

  const displayImages = useMemo(() => {
    if (!activeColor) {
      // بدون لون مختار: main_image + أول صورة إضافية
      const fallback = allImages.length > 0 ? allImages : [{ url: item.image }, { url: item.image }];
      return fallback.length === 1 ? [fallback[0], fallback[0]] : fallback.slice(0, 2);
    }

    // فلتر الصور اللي color_value بتاعها = activeColor
    const colorImgs = allImages.filter((img) => img.color_value === activeColor);

    if (colorImgs.length === 0) {
      // مفيش صور للون ده، ارجع للافتراضي
      return allImages.slice(0, 2);
    }
    if (colorImgs.length === 1) {
      return [colorImgs[0], colorImgs[0]];
    }
    return colorImgs.slice(0, 2);
  }, [activeColor, allImages, item.image]);

  /* ─── قائمة الألوان الفريدة من images ─── */
  const colorList = useMemo(() => {
    const seen = new Set();
    const colors = [];
    allImages.forEach((img) => {
      if (img.color_value && !seen.has(img.color_value)) {
        seen.add(img.color_value);
        colors.push(img.color_value);
      }
    });
    return colors;
  }, [allImages]);

  /* ─── خصم ─── */
  const discountPercent = item.sale_price && item.price ? Math.round(((item.price - item.sale_price) / item.price) * 100) : null;

  /* ─── stock ─── */
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
        setHoveredColor(null); // reset hover color عند مغادرة الكارد
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
      {/* ── Image ── */}
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
        {/* Discount badge */}
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
            {discountPercent}%
          </Box>
        )}

        {/* Out of stock */}
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

        {/* Images — front & back */}
        {displayImages.map((img, i) => (
          <Box
            key={`${activeColor}-${i}`}
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

      {/* ── Body ── */}
      <Box sx={{ pt: 1.25, pb: 1.75, px: 0.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {/* Color Swatches */}
        {colorList.length > 0 && (
          <Box sx={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {colorList.map((colorVal) => (
              <Box
                key={colorVal}
                className="swatch-btn"
                title={colorVal}
                onMouseEnter={() => setHoveredColor(colorVal)}
                onMouseLeave={() => setHoveredColor(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedColor((prev) => (prev === colorVal ? null : colorVal));
                }}
                sx={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  bgcolor: colorVal, // CSS color name مثل "black", "red"
                  outline: selectedColor === colorVal ? '2px solid rgba(0,0,0,0.6)' : '1.5px solid rgba(0,0,0,0.18)',
                  outlineOffset: selectedColor === colorVal ? '1.5px' : '0px',
                  cursor: 'pointer',
                  transition: 'outline 0.15s, outline-offset 0.15s',
                  '&:hover': {
                    outline: '2px solid rgba(0,0,0,0.45)',
                    outlineOffset: '1.5px'
                  }
                }}
              />
            ))}
          </Box>
        )}

        {/* Name */}
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

        {/* Price */}
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          {item.sale_price && (
            <Typography sx={{ fontSize: '0.78rem', color: 'text.disabled', textDecoration: 'line-through' }}>
              EGP {Number(item.price).toLocaleString()}
            </Typography>
          )}
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: 'text.primary' }}>
            EGP {Number(item.sale_price || item.price).toLocaleString()}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}

export default ProductCard;
