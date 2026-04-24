import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Box, Container, Typography, CircularProgress, Avatar, Stack } from '@mui/material';
import { Star } from 'iconsax-react';
import { productsService } from 'api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

export default function ReviewsSection() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecentReviews();
  }, []);

  const fetchRecentReviews = async () => {
    try {
      setLoading(true);
      const response = await productsService.getRecentReviews(6);

      if (response.success) {
        setReviews(response.data || []);
      } else {
        setError('Failed to load reviews');
      }
    } catch (err) {
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (slug) => {
    if (slug) navigate(`/products/${slug}`);
  };

  /* ================= Loading ================= */

  if (loading) {
    return (
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={700} textAlign="center" mb={4}>
            <FormattedMessage id="customer-reviews" />
          </Typography>

          <Box textAlign="center" py={6}>
            <CircularProgress />
          </Box>
        </Container>
      </Box>
    );
  }

  if (error || reviews.length === 0) return null;

  /* ================= Render ================= */

  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="xl">
        {/* ===== Title ===== */}

        <Typography
          variant="h2"
          textAlign="center"
          fontWeight={700}
          sx={{
            fontSize: {
              xs: '1.8rem',
              sm: '2.2rem',
              md: '2.6rem'
            }
          }}
        >
          <FormattedMessage id="customer-reviews" defaultMessage={'Customer Reviews'} />
        </Typography>
        {/* ===== Swiper Wrapper ===== */}
        <Box
          sx={{
            position: 'relative',
            pb: 6,
            '& .swiper-pagination': {
              position: 'static !important',
              mt: 3
            },

            '& .swiper-pagination-bullet': {
              width: 8,
              height: 8,
              bgcolor: 'grey.400',
              opacity: 1,
              mx: '4px',
              transition: 'all .3s ease'
            },

            '& .swiper-pagination-bullet-active': {
              width: 28,
              height: 8,
              borderRadius: '6px',
              bgcolor: 'primary.main'
            },

            '& .swiper-slide': {
              height: 'auto',
              display: 'flex'
            }
          }}
        >
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={24}
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            breakpoints={{
              0: { slidesPerView: 1.1 },
              600: { slidesPerView: 1.5 },
              900: { slidesPerView: 2.2 },
              1200: { slidesPerView: 3 },
              1536: { slidesPerView: 4 }
            }}
          >
            {reviews.map((review) => (
              <SwiperSlide key={review.id}>
                <ReviewCard review={review} onClick={() => handleProductClick(review.product_slug)} />
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      </Container>
    </Box>
  );
}

/* ================= Review Card ================= */

function ReviewCard({ review, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        width: '100%',
        bgcolor: '#fff',
        border: '1px solid',

        borderRadius: 0,
        p: 3,
        boxShadow: 0,
        cursor: 'pointer',
        transition: 'all .25s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      {/* ⭐ Stars */}
      <Stack direction="row" spacing={0.5} mb={1}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size="18"
            variant={star <= review.rating ? 'Bold' : 'Outline'}
            color={star <= review.rating ? '#FFC107' : '#E0E0E0'}
          />
        ))}
      </Stack>

      {/* 💬 Comment */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {review.comment?.length > 150 ? `${review.comment.substring(0, 150)}...` : review.comment}
      </Typography>

      {/* 👤 User */}
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ bgcolor: 'primary.main' }}>{review.first_name?.[0] || 'U'}</Avatar>

        <Box>
          <Typography fontWeight={600} fontSize={14}>
            {review.first_name} {review.last_name}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {new Date(review.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
