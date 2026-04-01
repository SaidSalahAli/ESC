/**
 * ESC Wear Service Worker - Phase 1
 *
 * Purpose: Cache static assets (images, js, css, fonts) only
 *
 * Behavior:
 * - Caches GET requests for static assets
 * - Ignores all /api/ requests
 * - Ignores cross-origin requests
 * - Returns cached version only if fresh fetch fails
 * - Allows failures to propagate naturally
 */

const CACHE_NAME = 'escwear-v1-static';

const STATIC_ASSET_PATTERNS = [/\.js$/, /\.css$/, /\.(png|jpg|jpeg|gif|webp|svg)$/, /\.(woff|woff2|ttf|otf|eot)$/];

/**
 * Determine if URL is a static asset worth caching
 */
function isStaticAsset(url) {
  try {
    const pathname = new URL(url).pathname;
    return STATIC_ASSET_PATTERNS.some((pattern) => pattern.test(pathname));
  } catch {
    return false;
  }
}

/**
 * Determine if request should be handled by Service Worker
 */
function shouldCache(request) {
  // Only cache GET requests
  if (request.method !== 'GET') {
    return false;
  }

  const url = request.url;

  // Never cache API requests
  if (url.includes('/api/')) {
    return false;
  }

  // Only cache same-origin requests
  try {
    const requestUrl = new URL(url);
    const currentUrl = new URL(self.location.href);
    if (requestUrl.origin !== currentUrl.origin) {
      return false;
    }
  } catch {
    return false;
  }

  // Only cache static assets
  return isStaticAsset(url);
}

/**
 * Install event - create cache
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

/**
 * Activate event - cleanup old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

/**
 * Fetch event - cache-first strategy for static assets
 */
self.addEventListener('fetch', (event) => {
  // Only handle cacheable requests
  if (!shouldCache(event.request)) {
    return;
  }

  event.respondWith(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        // Try to fetch from network first
        return fetch(event.request)
          .then((response) => {
            // Cache successful responses
            if (response && response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => {
            // If network fails, try cache
            return cache.match(event.request).then((cachedResponse) => {
              if (cachedResponse) {
                console.log('[Service Worker] Serving from cache:', event.request.url);
                return cachedResponse;
              }
              // If no cache exists, let the error propagate
              throw new Error(`Failed to fetch ${event.request.url}`);
            });
          });
      })
      .catch((error) => {
        console.error('[Service Worker] Fetch failed:', error.message);
        throw error;
      })
  );
});
