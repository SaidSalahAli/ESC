/**
 * Cache Testing Utilities - For debugging Phase 2
 *
 * Usage in browser console:
 * import { testCaching } from 'utils/cacheTest.js'
 * testCaching()
 */

import { clearApiCache, clearAllApiCache } from './apiCache';

export function testCaching() {
  console.log('%c=== Phase 2 Caching Test ===', 'font-size: 16px; font-weight: bold; color: #4CAF50;');

  const testEndpoints = ['/api/products/featured', '/api/products/categories', '/api/products/reviews/recent'];

  console.log('Cacheable endpoints:');
  testEndpoints.forEach((endpoint) => {
    console.log(`  ✓ ${endpoint}`);
  });

  console.log('\nCache Storage Usage:');
  const keys = Object.keys(localStorage);
  const cacheKeys = keys.filter((k) => k.startsWith('escwear-api-cache:'));

  if (cacheKeys.length === 0) {
    console.log('  No cached items yet');
  } else {
    let totalSize = 0;
    cacheKeys.forEach((key) => {
      const size = localStorage.getItem(key).length;
      totalSize += size;
      const ttl = JSON.parse(localStorage.getItem(key)).ttl;
      console.log(`  ${key}: ${(size / 1024).toFixed(2)} KB (TTL: ${ttl / 1000 / 60}m)`);
    });
    console.log(`\nTotal cache size: ${(totalSize / 1024).toFixed(2)} KB`);
  }

  console.log('\nAvailable commands:');
  console.log('  clearApiCache(url, params) - Clear specific cache');
  console.log('  clearAllApiCache() - Clear all API cache');

  return {
    getCacheKeys: () => keys.filter((k) => k.startsWith('escwear-api-cache:')),
    clearOne: clearApiCache,
    clearAll: clearAllApiCache
  };
}

export function logCacheHit(url) {
  console.log(`%c[Cache] HIT: ${url}`, 'color: #4CAF50; font-weight: bold;');
}

export function logCacheMiss(url) {
  console.log(`%c[Cache] MISS: ${url}`, 'color: #FF9800; font-weight: bold;');
}

export function logCacheError(url, error) {
  console.log(`%c[Cache] ERROR on ${url}: ${error.message}`, 'color: #F44336; font-weight: bold;');
}
