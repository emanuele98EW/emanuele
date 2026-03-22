const CACHE_NAME = 'emanuele-cache-v1';
const urlsToCache = [
  './index.html',
  './css/style.css',
  './js/main.js',
  './js/navbar.js',
  './js/footer.js',
  './assets/logo.png',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response; // Cache hit
        return fetch(event.request).catch(() => {
          // You could return a custom offline fallback here if wanted
        });
      })
  );
});
