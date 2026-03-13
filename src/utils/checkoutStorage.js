// ==============================|| CHECKOUT STORAGE UTILITIES ||============================== //

/**
 * Save checkout form data to localStorage
 */
export function saveCheckoutData(checkoutData) {
  try {
    localStorage.setItem('esc_checkout_data', JSON.stringify(checkoutData));
    return true;
  } catch {
    return false;
  }
}

/**
 * Get checkout form data from localStorage
 */
export function getCheckoutData() {
  try {
    const raw = localStorage.getItem('esc_checkout_data');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Clear checkout form data from localStorage
 */
export function clearCheckoutData() {
  try {
    localStorage.removeItem('esc_checkout_data');
    return true;
  } catch {
    return false;
  }
}

/**
 * Save redirect URL for after login
 */
export function saveRedirectUrl(url) {
  try {
    localStorage.setItem('esc_redirect_after_login', url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get redirect URL from localStorage
 */
export function getRedirectUrl() {
  try {
    const url = localStorage.getItem('esc_redirect_after_login');
    if (!url) return null;
    return url;
  } catch {
    return null;
  }
}

/**
 * Clear redirect URL from localStorage
 */
export function clearRedirectUrl() {
  try {
    localStorage.removeItem('esc_redirect_after_login');
    return true;
  } catch {
    return false;
  }
}
