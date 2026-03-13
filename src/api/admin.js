import axios from 'utils/axios';

// ==============================|| ADMIN API SERVICES ||============================== //

export const adminService = {
  // Dashboard
  getDashboard: async () => {
    const response = await axios.get('/api/admin/dashboard');
    return response.data;
  },

  // Sales Report
  getSalesReport: async (startDate, endDate) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await axios.get('/api/admin/sales-report', { params });
    return response.data;
  },

  // Customers
  getCustomers: async (page = 1, limit = 20) => {
    const response = await axios.get('/api/admin/customers', {
      params: { page, limit }
    });
    return response.data;
  },

  // Orders
  getOrders: async (params = {}) => {
    const response = await axios.get('/api/admin/orders', { params });
    return response.data;
  },

  getOrderDetails: async (orderId) => {
    const response = await axios.get(`/api/admin/orders/${orderId}`);
    return response.data;
  },

  updateOrderStatus: async (orderId, statusData) => {
    const response = await axios.put(`/api/admin/orders/${orderId}/status`, statusData);
    return response.data;
  },

  scanBarcode: async (orderId, barcode) => {
    const response = await axios.post(`/api/admin/orders/${orderId}/scan`, { barcode });
    return response.data;
  },

  getFulfillmentStatus: async (orderId) => {
    const response = await axios.get(`/api/admin/orders/${orderId}/fulfillment`);
    return response.data;
  },

  // Products
  getProducts: async (page = 1, limit = 20) => {
    const response = await axios.get('/api/admin/products', {
      params: { page, limit }
    });
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await axios.post('/api/admin/products', productData);
    return response.data;
  },

  updateProduct: async (productId, productData) => {
    // Use POST for FormData (PUT doesn't work well with FormData in PHP)
    const response = await axios.post(`/api/admin/products/${productId}/update`, productData);
    return response.data;
  },

  deleteProduct: async (productId) => {
    const response = await axios.delete(`/api/admin/products/${productId}`);
    return response.data;
  },

  // Reviews
  getPendingReviews: async (page = 1, limit = 20) => {
    const response = await axios.get('/api/admin/reviews/pending', {
      params: { page, limit }
    });
    return response.data;
  },

  approveReview: async (reviewId) => {
    const response = await axios.post(`/api/admin/reviews/${reviewId}/approve`);
    return response.data;
  },

  rejectReview: async (reviewId) => {
    const response = await axios.post(`/api/admin/reviews/${reviewId}/reject`);
    return response.data;
  },

  // Payment
  refundPayment: async (orderId, amount = null) => {
    const response = await axios.post(`/api/admin/payment/${orderId}/refund`, { amount });
    return response.data;
  },

  // Return order item to stock
  returnOrderItemToStock: async (orderId, data) => {
    const response = await axios.post(`/api/admin/orders/${orderId}/return-to-stock`, data);
    return response.data;
  },

  // Get order returns
  getOrderReturns: async (orderId) => {
    const response = await axios.get(`/api/orders/${orderId}/returns`);
    return response.data;
  },

  // Create order return
  createOrderReturn: async (orderId, returnData) => {
    const response = await axios.post(`/api/orders/${orderId}/returns`, returnData);
    return response.data;
  },

  // Categories
  getCategories: async (page = 1, limit = 20) => {
    const response = await axios.get('/api/admin/categories', {
      params: { page, limit }
    });
    return response.data;
  },

  getCategoriesList: async () => {
    const response = await axios.get('/api/admin/categories/list');
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await axios.post('/api/admin/categories', categoryData);
    return response.data;
  },

  updateCategory: async (categoryId, categoryData) => {
    const response = await axios.put(`/api/admin/categories/${categoryId}`, categoryData);
    return response.data;
  },

  deleteCategory: async (categoryId) => {
    const response = await axios.delete(`/api/admin/categories/${categoryId}`);
    return response.data;
  },

  // Product Variants
  getProductVariants: async (productId) => {
    const response = await axios.get(`/api/admin/products/${productId}/variants`);
    return response.data;
  },

  addProductVariant: async (productId, variantData) => {
    const response = await axios.post(`/api/admin/products/${productId}/variants`, variantData);
    return response.data;
  },

  deleteProductVariant: async (productId, variantId) => {
    const response = await axios.delete(`/api/admin/products/${productId}/variants/${variantId}`);
    return response.data;
  },

  // Product Images
  getProductImages: async (productId) => {
    const response = await axios.get(`/api/admin/products/${productId}/images`);
    return response.data;
  },

  deleteProductImage: async (productId, imageId) => {
    const response = await axios.delete(`/api/admin/products/${productId}/images/${imageId}`);
    return response.data;
  }
};

