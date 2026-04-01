/**
 * Smart API Cache Utility - Phase 2
 *
 * Implements stale-while-revalidate caching for safe, public GET endpoints only.
 *
 * Behavior:
 * 1. Fresh cache exists → return immediately, refresh in background
 * 2. Cache expired → try network, fallback to stale cache if network fails
 * 3. No cache → try network, let error propagate if it fails
 * 4. Never fabricates data, never breaks response shape
 */

const CACHE_KEY_PREFIX = 'escwear-api-cache:';
const IS_DEV = import.meta.env.MODE === 'development';

/**
 * Cache configuration per endpoint (TTL in milliseconds)
 */
const ENDPOINT_CONFIG = {
  '/api/products/featured': { ttl: 5 * 60 * 1000 }, // 5 minutes
  '/api/products/categories': { ttl: 30 * 60 * 1000 }, // 30 minutes
  '/api/products/reviews/recent': { ttl: 5 * 60 * 1000 } // 5 minutes
};

/**
 * Determine if endpoint is cacheable
 */
function isCacheableEndpoint(url) {
  return Object.keys(ENDPOINT_CONFIG).some((pattern) => url.includes(pattern));
}

/**
 * Get config for endpoint
 */
function getEndpointConfig(url) {
  const key = Object.keys(ENDPOINT_CONFIG).find((pattern) => url.includes(pattern));
  return key ? ENDPOINT_CONFIG[key] : null;
}

/**
 * Generate stable cache key from URL and params
 */
function getCacheKey(url, params = {}) {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${JSON.stringify(params[key])}`)
    .join('&');
  return `${CACHE_KEY_PREFIX}${url}${sortedParams ? '?' + sortedParams : ''}`;
}

/**
 * Safely read cache entry
 */
function getFromCache(cacheKey) {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;

    const entry = JSON.parse(cached);

    // Validate cache structure
    if (!entry || typeof entry !== 'object' || !entry.data || typeof entry.cachedAt !== 'number' || typeof entry.ttl !== 'number') {
      if (IS_DEV) console.warn('[API Cache] Invalid cache structure, clearing:', cacheKey);
      localStorage.removeItem(cacheKey);
      return null;
    }

    return entry;
  } catch (e) {
    if (IS_DEV) console.warn('[API Cache] Failed to parse cache:', e.message);
    // Clear corrupted cache
    try {
      localStorage.removeItem(cacheKey);
    } catch {}
    return null;
  }
}

/**
 * Check if cache entry is still fresh (not expired)
 */
function isCacheFresh(entry) {
  if (!entry) return false;
  const age = Date.now() - entry.cachedAt;
  return age < entry.ttl;
}

/**
 * Safely write cache entry
 */
function setInCache(cacheKey, data, ttl) {
  try {
    const entry = { data, cachedAt: Date.now(), ttl };
    localStorage.setItem(cacheKey, JSON.stringify(entry));
    if (IS_DEV) console.log('[API Cache] STORED:', cacheKey.substring(0, 60) + '...');
  } catch (e) {
    if (IS_DEV) console.warn('[API Cache] Failed to write cache (quota?):', e.message);
  }
}

/**
 * Clear specific cache entry
 */
export function clearApiCache(url, params = {}) {
  try {
    const cacheKey = getCacheKey(url, params);
    localStorage.removeItem(cacheKey);
    if (IS_DEV) console.log('[API Cache] CLEARED:', cacheKey.substring(0, 60) + '...');
  } catch (e) {
    if (IS_DEV) console.warn('[API Cache] Failed to clear cache:', e.message);
  }
}

/**
 * Clear all API cache
 */
export function clearAllApiCache() {
  try {
    let count = 0;
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key);
        count++;
      }
    });
    if (IS_DEV) console.log('[API Cache] CLEARED ALL:', count, 'entries');
  } catch (e) {
    if (IS_DEV) console.warn('[API Cache] Failed to clear all:', e.message);
  }
}

/**
 * Main cache wrapper - implements stale-while-revalidate
 *
 * @param {Function} fetchFn - Async function that returns axios response
 * @param {string} url - API endpoint URL
 * @param {Object} params - Query parameters
 * @returns {Promise<any>} - Response data (never wrapped, always original shape)
 */
export async function withApiCache(fetchFn, url, params = {}) {
  // Skip caching for non-cacheable endpoints
  if (!isCacheableEndpoint(url)) {
    const response = await fetchFn();
    return response.data;
  }

  const config = getEndpointConfig(url);
  const cacheKey = getCacheKey(url, params);
  const cachedEntry = getFromCache(cacheKey);
  const isFresh = cachedEntry && isCacheFresh(cachedEntry);

  // === STALE-WHILE-REVALIDATE STRATEGY ===

  // CASE 1: Fresh cache exists → return immediately, refresh in background
  if (isFresh) {
    if (IS_DEV) console.log('[API Cache] HIT (fresh):', cacheKey.substring(0, 50) + '...');

    // Non-blocking background refresh
    fetchFn()
      .then((response) => {
        const data = response.data;
        // Only cache if response has expected structure
        if (data && typeof data === 'object') {
          setInCache(cacheKey, data, config.ttl);
          if (IS_DEV) console.log('[API Cache] REFRESHED:', cacheKey.substring(0, 50) + '...');
        }
      })
      .catch((err) => {
        if (IS_DEV) console.log('[API Cache] Background refresh failed (OK):', err.message);
      });

    return cachedEntry.data;
  }

  // CASE 2: Cache is stale or doesn't exist → try fresh fetch
  try {
    const response = await fetchFn();
    const data = response.data;

    // Cache the response if it's valid
    if (data && typeof data === 'object') {
      setInCache(cacheKey, data, config.ttl);
    }

    if (IS_DEV) console.log('[API Cache] MISS → fetched:', cacheKey.substring(0, 50) + '...');
    return data;
  } catch (error) {
    // CASE 3: Network failed - try stale cache or propagate error
    if (cachedEntry) {
      if (IS_DEV) console.log('[API Cache] STALE (network failed):', cacheKey.substring(0, 50) + '...');
      return cachedEntry.data;
    }

    // No cache exists, must propagate the error
    if (IS_DEV) console.log('[API Cache] ERROR (no cache):', error.message);
    throw error;
  }
}
