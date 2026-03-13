import axios from 'utils/axios';

// ==============================|| NEWSLETTER API SERVICES ||============================== //

export const newsletterService = {
  // Subscribe to newsletter (public)
  subscribe: async (email) => {
    const response = await axios.post('/api/newsletter/subscribe', { email });
    return response.data;
  },

  // Unsubscribe from newsletter (public)
  unsubscribe: async (email) => {
    const response = await axios.post('/api/newsletter/unsubscribe', { email });
    return response.data;
  },

  // Get all subscribers (admin only)
  getAllSubscribers: async (params = {}) => {
    const response = await axios.get('/api/admin/newsletter', { params });
    return response.data;
  },

  // Get subscriber by ID (admin only)
  getSubscriberById: async (id) => {
    const response = await axios.get(`/api/admin/newsletter/${id}`);
    return response.data;
  },

  // Delete subscriber (admin only)
  deleteSubscriber: async (id) => {
    const response = await axios.delete(`/api/admin/newsletter/${id}`);
    return response.data;
  },

  // Export subscribers to CSV (admin only)
  exportCSV: async (params = {}) => {
    const response = await axios.post('/api/admin/newsletter/export-csv', params, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Export subscribers to Excel (admin only)
  exportExcel: async (params = {}) => {
    const response = await axios.post('/api/admin/newsletter/export-excel', params, {
      responseType: 'blob'
    });
    return response.data;
  }
};
