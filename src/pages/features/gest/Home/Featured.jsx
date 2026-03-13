import { useEffect, useMemo, useState } from 'react';
import { Box, Container, Typography, CircularProgress } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import ProductCard from 'components/ProductCard';
import { productsService } from 'api';
import { cartService } from 'api/cart';
import useAuth from 'hooks/useAuth';
import { addToGuestCart } from 'utils/guestCart';
import { openSnackbar } from 'api/snackbar';
import { getImageUrl } from 'utils/imageHelper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import so1 from 'assets/So_photos/so1.jpg';
import so2 from 'assets/So_photos/so2.jpg';
import so3 from 'assets/So_photos/So3.jpg';
import so4 from 'assets/So_photos/So4.jpg';

const FALLBACK_IMAGES = [so1, so2, so3, so4];

export default function Featured() {
  const { isLoggedIn } = useAuth();
  const intl = useIntl();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ===============================
      Category Map
  =============================== */

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((cat) => {
      map[cat.id] = cat.name;
    });
    return map;
  }, [categories]);

  /* ===============================
      Fetch Data
  =============================== */

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsRes, reviewsRes, categoriesRes] = await Promise.all([
        productsService.getFeatured(12),
        productsService.getRecentReviews(100),
        productsService.getCategories()
      ]);

      if (!productsRes.success) throw new Error('Failed to load products');

      const productsArray =
        productsRes.data?.products || productsRes.data?.data || (Array.isArray(productsRes.data) ? productsRes.data : []);

      const reviewsMap = buildReviewsMap(reviewsRes);

      const transformed = productsArray.map((product, index) => ({
        id: String(product.id),
        name: product.name,
        name_ar: product.name_ar,
        category: categoryMap[product.category_id] || product.category || 'Other',
        price: Number(product.price) || 0,
        image: product.main_image ? getImageUrl(product.main_image) : FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
        description: product.description || product.short_description || product.description_ar || '',
        slug: product.slug,
        is_featured: product.is_featured,
        reviews: getReviewStats(product.id, reviewsMap)
      }));

      setCategories(categoriesRes.success ? categoriesRes.data || [] : []);
      setProducts(transformed);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
      Reviews Logic
  =============================== */

  const buildReviewsMap = (response) => {
    if (!response.success || !Array.isArray(response.data)) return {};

    return response.data.reduce((acc, review) => {
      const pid = review.product_id;
      if (!acc[pid]) acc[pid] = { sum: 0, count: 0 };
      acc[pid].sum += Number(review.rating || 0);
      acc[pid].count += 1;
      return acc;
    }, {});
  };

  const getReviewStats = (productId, reviewsMap) => {
    const stats = reviewsMap[productId];
    return stats?.count
      ? {
          average_rating: stats.sum / stats.count,
          total_reviews: stats.count
        }
      : { average_rating: 0, total_reviews: 0 };
  };

  /* ===============================
      Cart Logic
  =============================== */

  const handleAddToCart = async (item) => {
    try {
      if (isLoggedIn) {
        await cartService.addToCart(item.id, 1, null);
      } else {
        await addToGuestCart(item.id, 1, null, {
          name: item.name,
          category: item.category,
          price: item.price,
          main_image: item.image
        });
      }

      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'item-added-cart' }),
        variant: 'alert',
        alert: { color: 'success' }
      });

      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: err.message || 'failed-add-cart' }),
        variant: 'alert',
        alert: { color: 'error' }
      });
    }
  };

  /* ===============================
      Render
  =============================== */

  return (
    <Box component="section" sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="xl">
        {/* Title */}
        <Typography
          variant="h2"
          textAlign="center"
          fontWeight={700}
          sx={{
            mb: { xs: 4, md: 6 },
            fontSize: {
              xs: '1.8rem',
              sm: '2.2rem',
              md: '2.6rem'
            }
          }}
        >
          <FormattedMessage id="featured-collections" />
        </Typography>

        {/* Loading */}
        {loading && (
          <Box textAlign="center" py={6}>
            <CircularProgress />
            <Typography mt={2}>
              <FormattedMessage id="loading-products" />
            </Typography>
          </Box>
        )}

        {/* Swiper */}
        {!loading && !error && (
          <Box
            sx={{
              position: 'relative',

              '& .swiper-pagination': {
                position: 'static !important',
                left: 0,
                width: '100%',
                textAlign: 'center'
              },

              '& .swiper-pagination-bullet': {
                width: 8,
                height: 8,
                backgroundColor: '#90A4AE', // ← لون النقطة العادية
                opacity: 1,
                mx: '4px',
                transition: 'all .3s ease'
              },

              '& .swiper-pagination-bullet-active': {
                width: 28,
                height: 8,
                borderRadius: '6px',
                backgroundColor: '#FF6B35' // ← لون النقطة النشطة، غيّره براحتك
              },

              '& .swiper-slide': {
                height: 'auto',
                display: 'flex'
              }
            }}
          >
            <Swiper
              modules={[Pagination, Navigation, Autoplay]}
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
              {products.map((item) => (
                <SwiperSlide key={item.id}>
                  {/* ✅ CARD HEIGHT CONTROL */}
                  <Box sx={{ width: '100%', height: '100%' }}>
                    <ProductCard
                      item={item}
                      addToCart={() => handleAddToCart(item)}
                      sx={{
                        height: '100%',

                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    />
                  </Box>
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>
        )}

        {/* Error */}
        {!loading && error && (
          <Typography color="error" textAlign="center">
            {error}
          </Typography>
        )}
      </Container>
    </Box>
  );
}
