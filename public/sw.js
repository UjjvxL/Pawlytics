/* Pawlytics PWA Offline Service Worker */

const CACHE_NAME = 'pawlytics-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell assets');
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Navigations are network-first. Hashed Vite assets are cache-first.
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and cross-origin analytics/supabase calls
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  const isNavigation = event.request.mode === 'navigate';
  event.respondWith(
    (isNavigation ? fetch(event.request) : caches.match(event.request).then((cached) => cached || fetch(event.request)))
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (isNavigation) {
            return caches.match('/index.html');
          }
        });
      })
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'pawlytics-report-sync') {
    event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => clients.forEach((client) => client.postMessage({ type: 'SYNC_REPORTS' }))));
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/notifications';
  event.waitUntil(self.clients.openWindow(url));
});
