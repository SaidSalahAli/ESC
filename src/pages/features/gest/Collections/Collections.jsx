// src/pages/Collections.jsx
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import ProductCard from 'components/ProductCard';
import { productsService } from 'api';
import useAuth from 'hooks/useAuth';
import { getImageUrl } from 'utils/imageHelper';

import ProfileImg from 'assets/images/homepage/5.jpg';

import Card1 from 'assets/So_photos/Card_1.jpg';
import Card2 from 'assets/So_photos/Card_2.jpg';
import Card3 from 'assets/So_photos/Card_3.jpg';
import Card4 from 'assets/So_photos/Card_4.jpg';
import Card5 from 'assets/So_photos/Card_5.jpg';
import Card6 from 'assets/So_photos/Card_6.jpg';

import {
  Box,
  Container,
  Grid,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  TextField,
  Button,
  Pagination,
  CircularProgress,
  Stack
} from '@mui/material';

const FALLBACK_IMAGES = [Card1, Card2, Card3, Card4, Card5, Card6];
const LIMIT = 20;

export default function Collections() {
  const { isLoggedIn } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    category: 'all',
    minPrice: '',
    maxPrice: '',
    page: 1
  });

  const [totalPages, setTotalPages] = useState(1);

  /* ───────────── Helpers ───────────── */

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => (map[c.id] = c));
    return map;
  }, [categories]);

  const buildParams = () => {
    const params = { page: filters.page, limit: LIMIT };

    if (filters.category !== 'all') {
      const selected = categories.find((c) => c.slug === filters.category);
      if (selected) params.category_id = selected.id;
    }

    if (filters.minPrice) params.min_price = filters.minPrice;
    if (filters.maxPrice) params.max_price = filters.maxPrice;

    return params;
  };

  const normalizeProducts = (data) => {
    const array = data?.products || data?.data || (Array.isArray(data) ? data : []);

    return array.map((product, index) => {
      const category = categoryMap[product.category_id];
      const categoryName = category?.name?.toLowerCase() || 'other';

      const image = product.main_image ? getImageUrl(product.main_image) : FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];

      return {
        id: String(product.id),
        name: product.name,
        name_ar: product.name_ar,
        price: Number(product.price) || 0,
        sale_price: product.sale_price || null,
        image,
        category: categoryName,
        category_id: product.category_id,
        description: product.description || product.description_ar || '',
        slug: product.slug,
        main_image: product.main_image,
        stock_quantity: product.stock_quantity,
        // Include full product data for ProductCard
        images: product.images || [],
        variants: product.variants || { size: [], color: [], combination: [] },
        reviews: product.reviews || { average_rating: 0, total_reviews: 0 }
      };
    });
  };

  /* ───────────── Fetch Categories ───────────── */

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await productsService.getCategories();
        if (res.success) setCategories(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategories();
  }, []);

  /* ───────────── Fetch Products ───────────── */

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await productsService.getProducts(buildParams());

        if (!res.success) {
          throw new Error(res.message || 'Failed to load products');
        }

        setProducts(normalizeProducts(res.data));
        setTotalPages(res.data?.pagination?.pages || 1);
      } catch (err) {
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, categories]);

  /* ───────────── Input Style ───────────── */

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: '#fff',
      borderRadius: 1,
      '&:hover fieldset': { borderColor: '#f0a500' },
      '&.Mui-focused fieldset': {
        borderColor: '#f0a500',
        borderWidth: 2
      }
    }
  };

  /* ═══════════════════════════════════ */

  return (
    <Box sx={{ bgcolor: '#f3f3f3', minHeight: '100vh' }}>
      {/* HERO */}

      <Box
        sx={{
          backgroundImage: `url(${ProfileImg})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          color: '#fff',
          pt: { xs: 8, md: 20 },
          pb: { xs: 6, md: 10 },
          textAlign: 'center'
        }}
      >
        <Typography variant="h3" fontWeight={700} sx={{ fontSize: { xs: '1.8rem', md: '2.6rem' }, mb: 1.5 }}>
          <FormattedMessage id="collections-headline" />
        </Typography>

        <Typography color="rgba(255,255,255,0.8)">
          <FormattedMessage id="collections-copy" />
        </Typography>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* FILTER BAR */}

        <Box
          sx={{
            bgcolor: '#fff',
            border: '1px solid #ddd',
            borderRadius: 1,
            p: 2,
            mb: 3,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'center'
          }}
        >
          <Typography fontWeight={600}>
            <FormattedMessage id="filter-by" />
          </Typography>

          {/* CATEGORY */}

          <FormControl size="small" sx={{ minWidth: 180, ...inputSx }}>
            <InputLabel>
              <FormattedMessage id="category" />
            </InputLabel>

            <Select
              value={filters.category}
              label="Category"
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  category: e.target.value,
                  page: 1
                }))
              }
            >
              <MenuItem value="all">
                <FormattedMessage id="all-categories" />
              </MenuItem>

              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.slug}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* PRICE RANGE */}

          <Stack direction="row" alignItems="center" spacing={1}>
            <TextField
              size="small"
              label={<FormattedMessage id="min-price" />}
              type="number"
              value={filters.minPrice}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  minPrice: e.target.value,
                  page: 1
                }))
              }
              sx={{ width: 110, ...inputSx }}
            />

            <Typography color="text.secondary">–</Typography>

            <TextField
              size="small"
              label={<FormattedMessage id="max-price" />}
              type="number"
              value={filters.maxPrice}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  maxPrice: e.target.value,
                  page: 1
                }))
              }
              sx={{ width: 110, ...inputSx }}
            />
          </Stack>

          {/* CLEAR FILTERS */}

          {(filters.category !== 'all' || filters.minPrice || filters.maxPrice) && (
            <Button
              size="small"
              variant="outlined"
              onClick={() =>
                setFilters({
                  category: 'all',
                  minPrice: '',
                  maxPrice: '',
                  page: 1
                })
              }
            >
              <FormattedMessage id="clear-filters" />
            </Button>
          )}

          {!loading && (
            <Typography sx={{ ml: 'auto' }}>
              {products.length} <FormattedMessage id="products-found" />
            </Typography>
          )}
        </Box>

        {/* LOADING */}

        {loading && (
          <Box display="flex" justifyContent="center" py={10}>
            <CircularProgress sx={{ color: '#f0a500' }} />
          </Box>
        )}

        {/* ERROR */}

        {!loading && error && (
          <Box textAlign="center" py={8}>
            <Typography color="error">{error}</Typography>

            <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
              <FormattedMessage id="try-again" />
            </Button>
          </Box>
        )}

        {/* EMPTY */}

        {!loading && !error && products.length === 0 && (
          <Box textAlign="center" py={10}>
            <Typography variant="h6">
              <FormattedMessage id="no-products" />
            </Typography>

            <Typography color="text.secondary">
              <FormattedMessage id="adjust-filters" />
            </Typography>
          </Box>
        )}

        {/* PRODUCTS */}

        {!loading && !error && products.length > 0 && (
          <Grid container spacing={2}>
            {products.map((p) => (
              <Grid item key={p.id} xs={12} sm={6} md={4} lg={3}>
                <ProductCard item={p} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* PAGINATION */}

        {!loading && products.length > 0 && totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={5}>
            <Pagination
              count={totalPages}
              page={filters.page}
              onChange={(_, value) =>
                setFilters((prev) => ({
                  ...prev,
                  page: value
                }))
              }
            />
          </Box>
        )}
      </Container>
    </Box>
  );
}
