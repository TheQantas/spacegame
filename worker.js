const PRECACHE = 'spacegame-cache-v1';
const RUNTIME = 'runtime';

const PRECACHE_URLS = [
  '/spacegame/index.html',
  '/spacegame/styles.css',
  '/spacegame/script.js',
  '/spacegame/favicon.png',
  '/spacegame/ship3.png',
  '/spacegame/ship3boost.png',
  '/spacegame/meteors/meteor1.png',
  '/spacegame/meteors/meteor2.png',
  '/spacegame/meteors/meteor3.png',
  '/spacegame/meteors/meteor4.png',
  '/spacegame/meteors/meteor5.png',
  '/spacegame/meteors/meteor6.png',
  '/spacegame/meteors/meteor7.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return caches.open(RUNTIME).then(cache => {
          return fetch(event.request).then(response => {
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});
