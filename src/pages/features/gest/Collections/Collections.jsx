import { useEffect, useMemo, useState, useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

import ProductCard from 'components/ProductCard';
import { productsService } from 'api';
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
  Select,
  FormControl,
  Button,
  Pagination,
  CircularProgress,
  Stack,
  Slider,
  Checkbox,
  FormControlLabel,
  Divider,
  Collapse,
  IconButton,
  MenuItem,
  InputLabel
} from '@mui/material';

import TuneIcon from '@mui/icons-material/Tune';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const FALLBACK_IMAGES = [Card1, Card2, Card3, Card4, Card5, Card6];
const LIMIT = 20;
const DEFAULT_MAX_PRICE = 5000;

const SORT_OPTIONS = [
  { value: 'created_at_DESC', label: 'Newest' },
  { value: 'created_at_ASC', label: 'Oldest' },
  { value: 'price_ASC', label: 'Price: Low to High' },
  { value: 'price_DESC', label: 'Price: High to Low' },
  { value: 'name_ASC', label: 'Name: A-Z' },
  { value: 'name_DESC', label: 'Name: Z-A' }
];

export default function Collections() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allProductsMeta, setAllProductsMeta] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState(null);

  const [priceRangeMax, setPriceRangeMax] = useState(DEFAULT_MAX_PRICE);

  const [filters, setFilters] = useState({
    category: 'all',
    minPrice: 0,
    maxPrice: DEFAULT_MAX_PRICE,
    page: 1,
    sort: 'created_at_DESC'
  });

  const [sliderValue, setSliderValue] = useState([0, DEFAULT_MAX_PRICE]);
  const [totalPages, setTotalPages] = useState(1);

  const [openSections, setOpenSections] = useState({
    price: true,
    category: true
  });

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }, [categories]);

  const parseSortValue = (sortValue) => {
    const value = String(sortValue || 'created_at_DESC');
    const lastUnderscoreIndex = value.lastIndexOf('_');

    if (lastUnderscoreIndex === -1) {
      return {
        sort: 'created_at',
        order: 'DESC'
      };
    }

    const sort = value.slice(0, lastUnderscoreIndex) || 'created_at';
    const order = value.slice(lastUnderscoreIndex + 1) || 'DESC';

    return { sort, order };
  };

  const normalizeProducts = useCallback(
    (data) => {
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
          images: product.images || [],
          variants: product.variants || { size: [], color: [], combination: [] },
          reviews: product.reviews || { average_rating: 0, total_reviews: 0 }
        };
      });
    },
    [categoryMap]
  );

  const buildParams = useCallback(() => {
    const { sort, order } = parseSortValue(filters.sort);

    const params = {
      page: filters.page,
      limit: LIMIT,
      min_price: filters.minPrice,
      max_price: filters.maxPrice,
      sort,
      order
    };

    if (filters.category !== 'all') {
      const selected = categories.find((c) => c.slug === filters.category);
      if (selected) {
        params.category_id = selected.id;
      }
    }

    return params;
  }, [filters, categories]);

  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const res = await productsService.getCategories();

      if (res?.success) {
        setCategories(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const fetchAllProductsMeta = useCallback(async () => {
    try {
      const res = await productsService.getProducts({
        page: 1,
        limit: 1000
      });

      if (res?.success) {
        const sourceProducts = res?.data?.products || [];
        setAllProductsMeta(sourceProducts);

        const prices = sourceProducts.map((p) => Number(p.price) || 0).filter((p) => p > 0);

        const highestPrice = prices.length ? Math.max(...prices) : DEFAULT_MAX_PRICE;
        const normalizedMax = Math.max(DEFAULT_MAX_PRICE, Math.ceil(highestPrice / 100) * 100);

        setPriceRangeMax(normalizedMax);

        setFilters((prev) => {
          const nextMax = prev.maxPrice === DEFAULT_MAX_PRICE || prev.maxPrice > normalizedMax ? normalizedMax : prev.maxPrice;

          return {
            ...prev,
            maxPrice: nextMax
          };
        });

        setSliderValue((prev) => {
          const nextMin = prev[0] < 0 ? 0 : prev[0];
          const nextMax = prev[1] === DEFAULT_MAX_PRICE || prev[1] > normalizedMax ? normalizedMax : prev[1];
          return [nextMin, nextMax];
        });
      } else {
        setPriceRangeMax(DEFAULT_MAX_PRICE);
        setSliderValue([0, DEFAULT_MAX_PRICE]);
      }
    } catch (err) {
      console.error('Failed to fetch product meta:', err);
      setPriceRangeMax(DEFAULT_MAX_PRICE);
      setSliderValue([0, DEFAULT_MAX_PRICE]);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchAllProductsMeta();
  }, [fetchCategories, fetchAllProductsMeta]);

  useEffect(() => {
    setSliderValue([filters.minPrice, filters.maxPrice]);
  }, [filters.minPrice, filters.maxPrice]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await productsService.getProducts(buildParams());

        if (!res?.success) {
          throw new Error(res?.message || 'Failed to load products');
        }

        const normalized = normalizeProducts(res.data);

        setProducts(normalized);
        setTotalPages(res?.data?.pagination?.pages || 1);
      } catch (err) {
        setError(err.message || 'Failed to load products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (!categoriesLoading) {
      fetchProducts();
    }
  }, [filters, categoriesLoading, buildParams, normalizeProducts]);

  const handleChangePage = (_, newPage) => setFilters((prev) => ({ ...prev, page: newPage }));

  const toggleSection = (key) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const clearFilters = () => {
    const resetValues = [0, priceRangeMax];
    setSliderValue(resetValues);
    setFilters({
      category: 'all',
      minPrice: 0,
      maxPrice: priceRangeMax,
      page: 1,
      sort: 'created_at_DESC'
    });
  };

  const sidebarSectionHeader = (label, key) => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2
      }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: '1.05rem' }}>{label}</Typography>

      <IconButton
        size="small"
        onClick={() => toggleSection(key)}
        sx={{
          bgcolor: '#111',
          color: '#fff',
          width: 28,
          height: 28,
          '&:hover': { bgcolor: '#222' }
        }}
      >
        {openSections[key] ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
      </IconButton>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh' }}>
      <Box
        sx={{
          backgroundImage: `url(${ProfileImg})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          color: '#fff',
          pt: { xs: 8, md: 16 },
          pb: { xs: 6, md: 8 },
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.32)'
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" fontWeight={700} sx={{ fontSize: { xs: '1.8rem', md: '2.6rem' }, mb: 1.5 }}>
            <FormattedMessage id="collections-headline" />
          </Typography>

          <Typography color="rgba(255,255,255,0.86)">
            <FormattedMessage id="collections-copy" />
          </Typography>
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={3} lg={2.5}>
            <Box
              sx={{
                position: { md: 'sticky' },
                top: { md: 100 },
                pr: { md: 1 }
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 3
                }}
              >
                <TuneIcon sx={{ fontSize: 20 }} />
                <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>Filters</Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                {sidebarSectionHeader('Price', 'price')}

                <Collapse in={openSections.price}>
                  <Box sx={{ px: 1 }}>
                    <Slider
                      value={sliderValue}
                      min={0}
                      max={priceRangeMax}
                      step={50}
                      onChange={(_, value) => {
                        if (!Array.isArray(value)) return;
                        setSliderValue(value);
                      }}
                      onChangeCommitted={(_, value) => {
                        if (!Array.isArray(value)) return;

                        setFilters((prev) => ({
                          ...prev,
                          minPrice: value[0],
                          maxPrice: value[1],
                          page: 1
                        }));
                      }}
                      sx={{
                        color: '#111',
                        '& .MuiSlider-thumb': {
                          width: 14,
                          height: 14,
                          bgcolor: '#111'
                        }
                      }}
                    />

                    <Stack direction="row" spacing={2} mt={2}>
                      <Box
                        sx={{
                          flex: 1,
                          border: '1px solid #e2e2e2',
                          borderRadius: 2,
                          px: 2,
                          py: 1.5,
                          textAlign: 'center',
                          color: '#8b8f98'
                        }}
                      >
                        {sliderValue[0]}
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          color: '#8b8f98'
                        }}
                      >
                        to
                      </Box>

                      <Box
                        sx={{
                          flex: 1,
                          border: '1px solid #e2e2e2',
                          borderRadius: 2,
                          px: 2,
                          py: 1.5,
                          textAlign: 'center',
                          color: '#8b8f98'
                        }}
                      >
                        {sliderValue[1]}
                      </Box>
                    </Stack>
                  </Box>
                </Collapse>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ mb: 3 }}>
                {sidebarSectionHeader('Product type', 'category')}

                <Collapse in={openSections.category}>
                  <Stack spacing={1}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={filters.category === 'all'}
                          onChange={() =>
                            setFilters((prev) => ({
                              ...prev,
                              category: 'all',
                              page: 1
                            }))
                          }
                          sx={{ color: '#cfcfcf' }}
                        />
                      }
                      label="All"
                    />

                    {categories.map((cat) => (
                      <FormControlLabel
                        key={cat.id}
                        control={
                          <Checkbox
                            checked={filters.category === cat.slug}
                            onChange={() =>
                              setFilters((prev) => ({
                                ...prev,
                                category: cat.slug,
                                page: 1
                              }))
                            }
                            sx={{ color: '#cfcfcf' }}
                          />
                        }
                        label={cat.name}
                      />
                    ))}
                  </Stack>
                </Collapse>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Button
                fullWidth
                variant="outlined"
                onClick={clearFilters}
                sx={{
                  mt: 2,
                  borderColor: '#111',
                  color: '#111',
                  borderRadius: 0,
                  py: 1.2,
                  '&:hover': {
                    borderColor: '#111',
                    bgcolor: '#111',
                    color: '#fff'
                  }
                }}
              >
                <FormattedMessage id="clear-filters" defaultMessage="Clear Filters" />
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={9} lg={9.5}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', md: 'center' },
                mb: 3,
                gap: 2,
                flexWrap: 'wrap'
              }}
            >
              <Typography sx={{ color: '#444', fontWeight: 500 }}>{!loading ? `${products.length} products` : 'Loading...'}</Typography>

              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel id="sort-label">Sort by</InputLabel>
                <Select
                  labelId="sort-label"
                  label="Sort by"
                  value={filters.sort}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      sort: e.target.value,
                      page: 1
                    }))
                  }
                >
                  {SORT_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {loading && (
              <Box display="flex" justifyContent="center" py={10}>
                <CircularProgress sx={{ color: '#111' }} />
              </Box>
            )}

            {!loading && error && (
              <Box textAlign="center" py={8}>
                <Typography color="error">{error}</Typography>

                <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
                  <FormattedMessage id="try-again" defaultMessage="Try Again" />
                </Button>
              </Box>
            )}

            {!loading && !error && products.length === 0 && (
              <Box textAlign="center" py={10}>
                <Typography variant="h6">
                  <FormattedMessage id="no-products" defaultMessage="No products found" />
                </Typography>

                <Typography color="text.secondary">
                  <FormattedMessage id="adjust-filters" defaultMessage="Try adjusting your filters to find what you're looking for." />
                </Typography>
              </Box>
            )}

            {!loading && !error && products.length > 0 && (
              <Grid container spacing={3}>
                {products.map((p) => (
                  <Grid item key={p.id} xs={12} sm={6} lg={4}>
                    <ProductCard item={p} />
                  </Grid>
                ))}
              </Grid>
            )}

            {!loading && products.length > 0 && totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={5}>
                <Pagination count={totalPages} page={filters.page} onChange={handleChangePage} />
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
