/**
 * @fileoverview Service Worker - Enhanced Offline-First Caching
 * @description PWA service worker with improved caching strategies
 * @version 2.1.0
 */

/* ==========================================================================
   Cache Configuration
   ========================================================================== */

const CACHE_VERSION = '2.1.0';
const STATIC_CACHE = `life-reset-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE = `life-reset-dynamic-v${CACHE_VERSION}`;
const IMAGE_CACHE = `life-reset-images-v${CACHE_VERSION}`;

// Max items in dynamic cache
const MAX_DYNAMIC_ITEMS = 50;

const STATIC_ASSETS = [
  './',
  './index.html',
  './firebase-config.js',
  './manifest.webmanifest',
  // CSS
  './css/variables.css',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './css/auth.css',
  './css/dashboard.css',
  './css/tracker.css',
  './css/journal.css',
  './css/analytics.css',
  './css/gamification.css',
  './css/gamification-v2.css',
  './css/goals.css',
  './css/settings.css',
  './css/habits.css',
  './css/mobile.css',
  './css/futuristic.css',
  // Legacy JS
  './js/app-state.js',
  './js/offline-manager.js',
  './js/auth.js',
  './js/ui.js',
  './js/gamification.js',
  './js/tasks.js',
  './js/mood-journal.js',
  './js/analytics.js',
  './js/goals.js',
  './js/habits.js',
  './js/settings.js',
  './js/data-loader.js',
  './js/dashboard.js',
  // New Modular JS
  './app/shared/utils/date.utils.js',
  './app/shared/utils/sanitize.utils.js',
  './app/shared/utils/debounce.utils.js',
  './app/shared/components/toast.js',
  './app/shared/components/modal.js',
  './app/shared/components/onboarding.js',
  './app/features/tasks/tasks.data.js',
  './app/features/tasks/tasks.logic.js',
  './app/features/tasks/tasks.ui.js',
  './app/features/tasks/tasks.events.js',
  './app/features/mood/mood.data.js',
  './app/features/mood/mood.logic.js',
  './app/features/mood/mood.ui.js',
  './app/features/mood/mood.events.js',
  './app/features/journal/journal.data.js',
  './app/features/journal/journal.logic.js',
  './app/features/journal/journal.ui.js',
  './app/features/journal/journal.events.js',
  './app/features/analytics/analytics.data.js',
  './app/features/analytics/analytics.charts.js',
  './app/features/analytics/analytics.ui.js',
  './app/features/analytics/analytics.events.js',
  './app/features/settings/settings.data.js',
  './app/features/settings/settings.ui.js',
  './app/features/settings/settings.events.js',
  './app/features/gamification/gamification.data.js',
  './app/features/gamification/gamification.ui.js',
  './app/features/gamification/gamification.events.js'
];

// External CDN resources to cache
const CDN_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Helper: Limit cache size
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    return trimCache(cacheName, maxItems);
  }
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v2.1.0...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        // Cache local assets (don't fail install if some fail)
        return Promise.all(
          STATIC_ASSETS.map(url => 
            cache.add(url).catch(err => {
              console.warn('[SW] Failed to cache:', url);
            })
          )
        );
      })
      .then(() => {
        // Cache CDN assets separately
        return caches.open(DYNAMIC_CACHE).then(cache => {
          return Promise.all(
            CDN_ASSETS.map(url => 
              cache.add(url).catch(err => console.warn('[SW] CDN failed:', url))
            )
          );
        });
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker v2.1.0...');
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE];
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => !currentCaches.includes(name))
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - smart caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip non-http(s) requests (chrome-extension://, etc.)
  if (!url.protocol.startsWith('http')) return;

  // Skip Firebase/Firestore API calls
  if (url.hostname.includes('firestore.googleapis.com') ||
      url.hostname.includes('firebase') ||
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('identitytoolkit')) {
    return;
  }

  // Strategy: Network-first for HTML navigation
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Strategy: Cache-first for static assets
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Strategy: Cache-first for images with separate cache
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // Strategy: Stale-while-revalidate for everything else
  event.respondWith(staleWhileRevalidate(request));
});

// Check if path is a static asset
function isStaticAsset(pathname) {
  return pathname.endsWith('.js') || 
         pathname.endsWith('.css') || 
         pathname.endsWith('.woff2') ||
         pathname.endsWith('.webmanifest');
}

// Network-first strategy
async function networkFirst(request) {
  // Safety check: only cache http(s) requests
  const url = new URL(request.url);
  if (!url.protocol.startsWith('http')) {
    return fetch(request);
  }

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || caches.match('./index.html');
  }
}

// Cache-first strategy
async function cacheFirst(request, cacheName) {
  // Safety check: only cache http(s) requests
  const url = new URL(request.url);
  if (!url.protocol.startsWith('http')) {
    return fetch(request);
  }

  const cached = await caches.match(request);
  if (cached) {
    // Update cache in background
    fetch(request).then(response => {
      if (response && response.status === 200) {
        caches.open(cacheName).then(cache => {
          cache.put(request, response);
        });
      }
    }).catch(() => {});
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.warn('[SW] Fetch failed:', request.url);
    return new Response('', { status: 404 });
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  // Safety check: only cache http(s) requests
  const url = new URL(request.url);
  if (!url.protocol.startsWith('http')) {
    return fetch(request);
  }

  const cached = await caches.match(request);
  
  const fetchPromise = fetch(request).then(async response => {
    if (response && response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
      await trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_ITEMS);
    }
    return response;
  }).catch(() => cached);
  
  return cached || fetchPromise;
}

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    Promise.all([
      caches.delete(STATIC_CACHE),
      caches.delete(DYNAMIC_CACHE),
      caches.delete(IMAGE_CACHE)
    ]).then(() => {
      console.log('[SW] All caches cleared');
      event.source.postMessage({ type: 'CACHE_CLEARED' });
    });
  }
  if (event.data && event.data.type === 'GET_VERSION') {
    event.source.postMessage({ type: 'VERSION', version: CACHE_VERSION });
  }
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SYNC_TRIGGERED' });
        });
      })
    );
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'Time to check your tasks!',
    icon: './icons/icon-192.png',
    badge: './icons/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      url: data.url || './'
    },
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Life Reset', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'dismiss') return;
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url || '/');
      }
    })
  );
});

console.log('[SW] Service Worker v2.1.0 loaded');
