const CACHE_NAME = 'painel-v1';
const ASSETS = [
  '/',
  '/index.html',
  // Adicione aqui os seus links de CSS/JS se forem locais
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
