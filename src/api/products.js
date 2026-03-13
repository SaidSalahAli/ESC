import axios from 'utils/axios';

// ==============================|| PRODUCTS API SERVICES ||============================== //

export const productsService = {
  // Get all products
  getProducts: async (params = {}) => {
    const response = await axios.get('/api/products', { params });
    return response.data;
  },

  // Get featured products
  getFeatured: async (limit = 8) => {
    const response = await axios.get('/api/products/featured', {
      params: { limit }
    });
    return response.data;
  },

  // Get top selling products
  getTopSelling: async (limit = 8) => {
    const response = await axios.get('/api/products/top-selling', {
      params: { limit }
    });
    return response.data;
  },

  // Get product by slug
  getBySlug: async (slug) => {
    const response = await axios.get(`/api/products/slug/${slug}`);
    return response.data;
  },

  // Get product by ID
  getById: async (id) => {
    const response = await axios.get(`/api/products/${id}`);
    return response.data;
  },

  // Get product by barcode
  getByBarcode: async (barcode) => {
    const response = await axios.get(`/api/products/barcode/${barcode}`);
    return response.data;
  },

  // Get categories (public)
  getCategories: async () => {
    const response = await axios.get('/api/products/categories');
    return response.data;
  },

  // Get products by category
  getByCategory: async (categorySlug, params = {}) => {
    const response = await axios.get(`/api/products/category/${categorySlug}`, { params });
    return response.data;
  },

  // Get related products
  getRelated: async (productId) => {
    const response = await axios.get(`/api/products/${productId}/related`);
    return response.data;
  },

  // Get product reviews
  getReviews: async (productId) => {
    const response = await axios.get(`/api/products/${productId}/reviews`);
    return response.data;
  },

  // Get recent reviews (for homepage)
  getRecentReviews: async (limit = 6) => {
    const response = await axios.get('/api/products/reviews/recent', {
      params: { limit }
    });
    return response.data;
  },

  // Check product stock
  checkStock: async (productId) => {
    const response = await axios.get(`/api/products/${productId}/stock`);
    return response.data;
  },

  // Add review (requires authentication)
  addReview: async (productId, reviewData) => {
    const response = await axios.post(`/api/products/${productId}/reviews`, reviewData);
    return response.data;
  }
};
