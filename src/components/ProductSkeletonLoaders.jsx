import { Box, Card, Skeleton, Typography } from '@mui/material';

/**
 * Skeleton loader for product cards
 * Matches ProductCard height and layout
 */
export function ProductCardSkeleton() {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'pulse 1.5s ease-in-out infinite'
      }}
    >
      {/* Image skeleton */}
      <Skeleton
        variant="rectangular"
        sx={{
          paddingTop: '100%',
          position: 'relative',
          width: '100%'
        }}
      />

      {/* Content skeleton */}
      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {/* Title */}
        <Skeleton variant="text" height={24} />
        <Skeleton variant="text" height={20} width="80%" />

        {/* Rating */}
        <Box sx={{ display: 'flex', gap: 1, my: 1 }}>
          <Skeleton variant="circular" width={16} height={16} />
          <Skeleton variant="circular" width={16} height={16} />
          <Skeleton variant="circular" width={16} height={16} />
          <Skeleton variant="circular" width={16} height={16} />
          <Skeleton variant="circular" width={16} height={16} />
        </Box>

        {/* Price */}
        <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
          <Skeleton variant="text" width={60} height={24} />
          <Skeleton variant="text" width={60} height={24} />
        </Box>

        {/* Button */}
        <Skeleton variant="rectangular" height={36} sx={{ mt: 1 }} />
      </Box>
    </Card>
  );
}

/**
 * Grid of product skeleton loaders
 */
export function ProductGridSkeleton({ count = 12 }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(auto-fill, minmax(200px, 1fr))',
          sm: 'repeat(auto-fill, minmax(220px, 1fr))',
          md: 'repeat(auto-fill, minmax(250px, 1fr))'
        },
        gap: 2
      }}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </Box>
  );
}

/**
 * Skeleton for section title
 */
export function SectionTitleSkeleton() {
  return (
    <Box sx={{ mb: 3 }}>
      <Skeleton variant="text" height={32} width="40%" />
      <Skeleton variant="text" height={20} width="60%" sx={{ mt: 1 }} />
    </Box>
  );
}

/**
 * Skeleton for categories list
 */
export function CategoriesSkeletonLoader({ count = 8 }) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        overflowX: 'auto',
        pb: 2
      }}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <Skeleton key={idx} variant="rectangular" width={120} height={100} sx={{ flexShrink: 0 }} />
      ))}
    </Box>
  );
}
