import axios from 'utils/axios';
import { withApiCache } from 'utils/apiCache';

/**
 * Cached Products Service - Phase 2
 *
 * Wraps specific safe product endpoints with smart caching.
 * Implements stale-while-revalidate for improved performance.
 *
 * Cached endpoints:
 * - /api/products/featured
 * - /api/products/categories
 * - /api/products/reviews/recent
 *
 * Non-cached endpoints remain untouched and use the original service.
 */

export const cachedProductsService = {
  /**
   * Get featured products with caching
   * TTL: 5 minutes
   * Strategy: stale-while-revalidate
   */
  getFeatured: async (limit = 8) => {
    const params = { limit };
    return withApiCache(() => axios.get('/api/products/featured', { params }), '/api/products/featured', params);
  },

  /**
   * Get categories with caching
   * TTL: 30 minutes
   * Strategy: stale-while-revalidate
   */
  getCategories: async () => {
    return withApiCache(() => axios.get('/api/products/categories'), '/api/products/categories', {});
  },

  /**
   * Get recent reviews with caching
   * TTL: 5 minutes
   * Strategy: stale-while-revalidate
   */
  getRecentReviews: async (limit = 6) => {
    const params = { limit };
    return withApiCache(() => axios.get('/api/products/reviews/recent', { params }), '/api/products/reviews/recent', params);
  },

  /**
   * All other product methods pass through without caching
   * These remain safe and uncached:
   * - getProducts (may have personalization or filtering)
   * - getTopSelling (may have personalization)
   * - getBySlug (specific product, caching handled differently if needed)
   * - getById (specific product, user-dependent)
   * - getByBarcode (specific lookup)
   * - getByCategory (may have sorting/personalization)
   * - getRelated (user/session dependent)
   * - getReviews (specific product, may be user-dependent)
   * - checkStock (time-sensitive)
   * - addReview (mutation, not cached)
   */
  getProducts: async (params = {}) => {
    const response = await axios.get('/api/products', { params });
    return response.data;
  },

  getTopSelling: async (limit = 8) => {
    const response = await axios.get('/api/products/top-selling', {
      params: { limit }
    });
    return response.data;
  },

  getBySlug: async (slug) => {
    const response = await axios.get(`/api/products/slug/${slug}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`/api/products/${id}`);
    return response.data;
  },

  getByBarcode: async (barcode) => {
    const response = await axios.get(`/api/products/barcode/${barcode}`);
    return response.data;
  },

  getByCategory: async (categorySlug, params = {}) => {
    const response = await axios.get(`/api/products/category/${categorySlug}`, { params });
    return response.data;
  },

  getRelated: async (productId) => {
    const response = await axios.get(`/api/products/${productId}/related`);
    return response.data;
  },

  getReviews: async (productId) => {
    const response = await axios.get(`/api/products/${productId}/reviews`);
    return response.data;
  },

  checkStock: async (productId) => {
    const response = await axios.get(`/api/products/${productId}/stock`);
    return response.data;
  },

  addReview: async (productId, reviewData) => {
    const response = await axios.post(`/api/products/${productId}/reviews`, reviewData);
    return response.data;
  }
};
