const CACHE = 'radio-edas-v1';
const SHELL = [
  '/radioplayer/',
  '/radioplayer/index.html',
  '/radioplayer/manifest.json',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Mono:wght@300;400&display=swap'
];

// Install — cache the app shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — serve shell from cache, everything else (Drive API, MP3s) from network
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Always fetch Google APIs and Drive streams from network
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('googleusercontent.com')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // For everything else, try cache first, fall back to network
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
