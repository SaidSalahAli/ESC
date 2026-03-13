import axios from 'utils/axios';

// ==============================|| ORDERS API SERVICES ||============================== //

export const ordersService = {
  // Get my orders
  getMyOrders: async (page = 1, limit = 10) => {
    const response = await axios.get('/api/orders', {
      params: { page, limit }
    });
    return response.data;
  },

  // Create order
  createOrder: async (orderData) => {
    const response = await axios.post('/api/orders', orderData);
    return response.data;
  },

  // Get order details
  getOrderDetails: async (orderId, viewToken = null) => {
    const config = {};
    if (viewToken) {
      config.params = { view_token: viewToken };
    }
    const response = await axios.get(`/api/orders/${orderId}`, config);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    const response = await axios.post(`/api/orders/${orderId}/cancel`);
    return response.data;
  },

  // Track order
  trackOrder: async (orderNumber) => {
    const response = await axios.get(`/api/orders/track/${orderNumber}`);
    return response.data;
  },

  // Get order by ID (alias for getOrderDetails)
  getOrder: async (orderId) => {
    const response = await axios.get(`/api/orders/${orderId}`);
    return response.data;
  },

  // Scan order barcode
  scanOrderBarcode: async (barcode) => {
    const response = await axios.post('/api/orders/scan-barcode', { barcode });
    return response.data;
  },

  // Get shipping cost
  getShippingCost: async () => {
    const response = await axios.get('/api/settings/shipping-cost');
    return response.data;
  },

  // Get shipping governorates
  getShippingGovernorates: async () => {
    const response = await axios.get('/api/shipping-governorates');
    return response.data;
  },

  // Get invoice PDF URL
  getInvoicePdfUrl: (orderId, viewToken = null) => {
    const baseURL = axios.defaults.baseURL || window.location.origin;
    let url = `${baseURL}/api/orders/${orderId}/invoice-pdf`;
    if (viewToken) {
      url += `?view_token=${encodeURIComponent(viewToken)}`;
    }
    return url;
  },

  // Download invoice PDF
  downloadInvoicePdf: async (orderId, language = 'en') => {
    try {
      const response = await axios.get(`/api/orders/${orderId}/invoice-pdf`, {
        params: {
          lang: language,
          download: '1'
        },
        responseType: 'blob'
      });

      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_${orderId}_${language}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Failed to download invoice:', error);
      throw error;
    }
  }
};
