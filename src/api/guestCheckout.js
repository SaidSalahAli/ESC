import axios from 'utils/axios';

// ==============================|| GUEST CHECKOUT API SERVICES ||============================== //

export const guestCheckoutService = {
  // Create guest order
  createGuestOrder: async (guestData) => {
    const response = await axios.post('/api/guest-checkout', guestData);
    return response.data;
  },

  // Get guest order by order number with view token
  getGuestOrder: async (orderNumber, viewToken) => {
    const response = await axios.get(`/api/guest-checkout/orders/${orderNumber}`, {
      params: { view_token: viewToken }
    });
    return response.data;
  },

  // Get shipping governorates (shared with authenticated checkout)
  getShippingGovernorates: async () => {
    const response = await axios.get('/api/shipping-governorates');
    return response.data;
  }
};
