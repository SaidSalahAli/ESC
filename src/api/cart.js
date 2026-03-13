import axios from 'utils/axios';

// ==============================|| CART API SERVICES ||============================== //

export const cartService = {
  // Get cart
  getCart: async () => {
    const response = await axios.get('/api/cart');
    return response.data;
  },

  // Add to cart
  addToCart: async (productId, quantity = 1, variantId = null) => {
    const response = await axios.post('/api/cart', {
      product_id: productId,
      quantity,
      variant_id: variantId
    });
    return response.data;
  },

  // Update cart item
  updateCartItem: async (cartId, quantity) => {
    const response = await axios.put(`/api/cart/${cartId}`, { quantity });
    return response.data;
  },

  // Remove from cart
  removeFromCart: async (cartId) => {
    const response = await axios.delete(`/api/cart/${cartId}`);
    return response.data;
  },

  // Clear cart
  clearCart: async () => {
    const response = await axios.delete('/api/cart/clear/all');
    return response.data;
  },

  // Get cart count
  getCartCount: async () => {
    const response = await axios.get('/api/cart/count');
    return response.data;
  },

  // Validate cart
  validateCart: async () => {
    const response = await axios.get('/api/cart/validate');
    return response.data;
  }
};

