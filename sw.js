const CACHE_NAME = 'reyyz-joki-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './logo.png',
  './manifest.json'
];

// Install: cache all assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS.filter(a => !a.endsWith('.png')));
    }).catch(() => {})
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache, fallback to network
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(response => {
      if (response.ok && e.request.url.startsWith(self.location.origin)) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
      }
      return response;
    })).catch(() => caches.match('./index.html'))
  );
});

// Push notifications
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'REYYZ JOKI', body: 'Ada update untuk kamu!' };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './logo.png',
      badge: './logo.png',
      vibrate: [200, 100, 200],
      data: { url: data.url || './' }
    })
  );
});

// Notification click
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url || './'));
});