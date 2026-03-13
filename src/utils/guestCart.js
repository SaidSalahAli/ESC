// ==============================|| GUEST CART UTILITIES ||============================== //

/**
 * Generate or get guest ID
 */
export function getGuestId() {
  let guestId = localStorage.getItem('esc_guest_id');
  if (!guestId) {
    guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('esc_guest_id', guestId);
  }
  return guestId;
}

/**
 * Get guest cart from localStorage
 */
export function getGuestCart() {
  try {
    const guestId = getGuestId();
    const cartKey = `esc_guest_cart_${guestId}`;
    const raw = localStorage.getItem(cartKey);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Save guest cart to localStorage
 */
export function saveGuestCart(cart) {
  try {
    const guestId = getGuestId();
    const cartKey = `esc_guest_cart_${guestId}`;
    localStorage.setItem(cartKey, JSON.stringify(cart));
    return true;
  } catch {
    return false;
  }
}

/**
 * Add item to guest cart
 */
export function addToGuestCart(productId, quantity = 1, variantId = null, productData = {}) {
  const cart = getGuestCart();
  // Use variant_id in key to differentiate between different variants of same product
  const itemKey = variantId ? `${productId}_${variantId}` : `${productId}_default`;
  
  const existingIndex = cart.findIndex(item => {
    // Check if same product with same variant
    if (item.product_id === productId) {
      // If both have variant_id, they must match
      if (variantId && item.variant_id) {
        return item.variant_id === variantId;
      }
      // If both don't have variant_id, they're the same
      if (!variantId && !item.variant_id) {
        return true;
      }
      // One has variant, one doesn't - they're different
      return false;
    }
    return false;
  });
  
  if (existingIndex >= 0) {
    // Item already exists - update quantity (add to existing)
    const currentQty = cart[existingIndex].quantity || 0;
    cart[existingIndex].quantity = currentQty + quantity;
    
    // Update product data if provided (in case it changed)
    if (productData.name) cart[existingIndex].product_name = productData.name;
    if (productData.price) cart[existingIndex].product_price = productData.price;
    if (productData.sale_price !== undefined) cart[existingIndex].sale_price = productData.sale_price;
    if (productData.main_image) cart[existingIndex].main_image = productData.main_image;
    if (productData.variant_name) cart[existingIndex].variant_name = productData.variant_name;
    if (productData.size_value) cart[existingIndex].size_value = productData.size_value;
    if (productData.color_value) cart[existingIndex].color_value = productData.color_value;
  } else {
    // New item - add to cart
    cart.push({
      key: itemKey,
      product_id: productId,
      variant_id: variantId,
      quantity: quantity,
      // Store product data for display
      product_name: productData.name || '',
      product_price: productData.price || 0,
      sale_price: productData.sale_price || null,
      main_image: productData.main_image || null,
      variant_name: productData.variant_name || null,
      variant_value: productData.variant_value || null,
      size_value: productData.size_value || null,
      color_value: productData.color_value || null,
      added_at: new Date().toISOString()
    });
  }
  
  saveGuestCart(cart);
  return cart;
}

/**
 * Update guest cart item quantity
 */
export function updateGuestCartItem(itemKey, quantity) {
  const cart = getGuestCart();
  const itemIndex = cart.findIndex(item => item.key === itemKey);
  
  if (itemIndex >= 0) {
    if (quantity <= 0) {
      cart.splice(itemIndex, 1);
    } else {
      cart[itemIndex].quantity = quantity;
    }
    saveGuestCart(cart);
  }
  
  return cart;
}

/**
 * Remove item from guest cart
 */
export function removeFromGuestCart(itemKey) {
  const cart = getGuestCart();
  const filteredCart = cart.filter(item => item.key !== itemKey);
  saveGuestCart(filteredCart);
  return filteredCart;
}

/**
 * Clear guest cart
 */
export function clearGuestCart() {
  const guestId = getGuestId();
  const cartKey = `esc_guest_cart_${guestId}`;
  localStorage.removeItem(cartKey);
}

/**
 * Get guest cart count
 */
export function getGuestCartCount() {
  const cart = getGuestCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Merge guest cart with user cart after login
 */
export async function mergeGuestCartWithUserCart(cartService) {
  const guestCart = getGuestCart();
  
  if (guestCart.length === 0) {
    return;
  }
  
  try {
    // Add each item from guest cart to user cart
    for (const item of guestCart) {
      await cartService.addToCart(
        item.product_id,
        item.quantity,
        item.variant_id
      );
    }
    
    // Clear guest cart after merging
    clearGuestCart();
  } catch (err) {
    console.error('Error merging guest cart:', err);
  }
}

