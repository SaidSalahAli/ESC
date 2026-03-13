import axios from 'utils/axios';

// ==============================|| PAYMENT API SERVICES ||============================== //

export const paymentService = {
  // Initialize payment for an order
  initializePayment: async (orderId) => {
    const response = await axios.post(`/api/payment/initialize/${orderId}`);
    return response.data;
  },

  // Process payment with card details
  processPayment: async (paymentData) => {
    const response = await axios.post(`/api/payment/process`, paymentData);
    return response.data;
  },

  // Get payment status
  getPaymentStatus: async (orderId) => {
    const response = await axios.get(`/api/payment/status/${orderId}`);
    return response.data;
  }
};
