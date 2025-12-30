/**
 * @fileoverview Service Worker - Offline-First Caching
 * @description PWA service worker with cache-first strategy for static assets
 * @version 1.0.1
 */

/* ==========================================================================
   Cache Configuration
   ========================================================================== */

const CACHE_NAME = 'life-reset-v1.0.1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/firebase-config.js',
  '/manifest.webmanifest',
  // CSS
  '/css/variables.css',
  '/css/base.css',
  '/css/layout.css',
  '/css/components.css',
  '/css/auth.css',
  '/css/dashboard.css',
  '/css/tracker.css',
  '/css/journal.css',
  '/css/analytics.css',
  '/css/gamification.css',
  '/css/goals.css',
  '/css/settings.css',
  // JS
  '/js/app-state.js',
  '/js/auth.js',
  '/js/ui.js',
  '/js/gamification.js',
  '/js/tasks.js',
  '/js/mood-journal.js',
  '/js/analytics.js',
  '/js/goals.js',
  '/js/habits.js',
  '/js/settings.js',
  '/js/data-loader.js',
  '/js/dashboard.js'
];

// External CDN resources to cache
const CDN_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        // Cache local assets
        const localPromise = cache.addAll(STATIC_ASSETS).catch(err => {
          console.warn('[SW] Some static assets failed to cache:', err);
        });
        // Cache CDN assets (may fail if offline during install)
        const cdnPromise = Promise.all(
          CDN_ASSETS.map(url => 
            cache.add(url).catch(err => console.warn('[SW] CDN asset failed:', url))
          )
        );
        return Promise.all([localPromise, cdnPromise]);
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
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

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip Firebase/Firestore API calls (let them handle their own caching)
  if (url.hostname.includes('firestore.googleapis.com') ||
      url.hostname.includes('firebase') ||
      url.hostname.includes('googleapis.com')) {
    return;
  }

  // For navigation requests (HTML pages), use network-first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the new version
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(request).then((cached) => {
            return cached || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // For static assets, use cache-first strategy
  event.respondWith(
    caches.match(request)
      .then((cached) => {
        if (cached) {
          // Return cached version, but also update cache in background
          fetch(request).then((response) => {
            if (response && response.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, response);
              });
            }
          }).catch(() => {});
          return cached;
        }

        // Not in cache, fetch from network
        return fetch(request)
          .then((response) => {
            // Cache successful responses
            if (response && response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch((error) => {
            console.warn('[SW] Fetch failed:', request.url, error);
            // Return offline fallback for certain file types
            if (request.destination === 'image') {
              return new Response('', { status: 404 });
            }
            throw error;
          });
      })
  );
});

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      console.log('[SW] Cache cleared');
    });
  }
});

// Background sync for offline data (if supported)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    console.log('[SW] Background sync triggered');
    // Firestore handles its own sync, but we can notify the app
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: 'SYNC_COMPLETE' });
      });
    });
  }
});
