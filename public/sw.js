/*
  ChessTicks Service Worker
  - Adds offline caching and faster subsequent loads
  - Runtime-only caching; no build-time precache step required
*/

const SW_VERSION = 'v1.0.0';
const STATIC_CACHE = `chessticks-static-${SW_VERSION}`;
const RUNTIME_CACHE = `chessticks-runtime-${SW_VERSION}`;

// Assets to warm the cache. Keep this list short and stable.
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icons/android-chrome-192x192.png',
  '/icons/android-chrome-512x512.png',
  '/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

function isSameOrigin(url) {
  try {
    const u = new URL(url, self.location.href);
    return u.origin === self.location.origin;
  } catch {
    return false;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Only handle same-origin requests to avoid opaque responses issues
  if (!isSameOrigin(url.href)) {
    return;
  }

  // Bypass the SW for Next.js data/hmr/debug endpoints
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/_next/image')
  ) {
    // Use cache-first for static chunks and images
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const resp = await fetch(request);
        // Cache successful responses
        if (resp && resp.status === 200) cache.put(request, resp.clone());
        return resp;
      })
    );
    return;
  }

  // Cache-first for app icons and sounds
  if (
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/sounds/')
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const resp = await fetch(request);
        if (resp && resp.status === 200) cache.put(request, resp.clone());
        return resp;
      })
    );
    return;
  }

  // Default: Stale-While-Revalidate for HTML and other same-origin GETs
  event.respondWith(
    caches.open(RUNTIME_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const networkFetch = fetch(request)
        .then((resp) => {
          if (resp && resp.status === 200 && resp.type === 'basic') {
            cache.put(request, resp.clone());
          }
          return resp;
        })
        .catch(() => cached); // fallback to cache on error

      return cached || networkFetch;
    })
  );
});
