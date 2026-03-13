/**
 * Helper function to get full image URL
 * Uses environment variable for API URL or falls back to relative path
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // If imagePath is already a full URL, return it
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Get API base URL from environment or use relative path
  const apiBaseUrl = import.meta.env.VITE_APP_API_URL || '';

  // Remove leading slash from imagePath if it exists
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;

  // If we have an API base URL, use it
  if (apiBaseUrl) {
    // Remove trailing slash from apiBaseUrl if it exists
    const cleanBaseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
    return `${cleanBaseUrl}/${cleanPath}`;
  }

  // Fallback to relative path (works for same-domain hosting)
  return `/${cleanPath}`;
};

/**
 * Remove localhost URL prefix from image path
 */
export const cleanImagePath = (imagePath) => {
  if (!imagePath) return null;

  // Remove localhost URLs
  return imagePath
    .replace(/^https?:\/\/localhost[^\/]*\/ESC_Wear\/backend\/public/, '')
    .replace(/^https?:\/\/[^\/]*\/backend\/public/, '')
    .replace(/^\/backend\/public/, '');
};
