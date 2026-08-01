const CACHE_NAME = 'africatech21-v1';
const urlsToCache = [
  '/africa-tech21/',
  '/africa-tech21/index.html',
  '/africa-tech21/dashboard.html',
  '/africa-tech21/style.css' // Si vous avez un fichier CSS global
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
      .then(response => response || fetch(event.request))
  );
});
