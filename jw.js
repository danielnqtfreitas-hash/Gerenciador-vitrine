const CACHE_NAME = 'painel-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Instalação: Salva os arquivos básicos no cache usando caminhos relativos (./)
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Força o novo Service Worker a assumir o controle imediatamente
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Ativação: Limpa caches antigos se você mudar a versão (CACHE_NAME)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// Estratégia: Tenta buscar na rede primeiro. Se falhar (offline), usa o cache.
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

