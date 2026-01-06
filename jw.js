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

// Listener de Notificações Push (Acorda o celular)
self.addEventListener('push', (event) => {
    let data = { title: 'Novo Pedido! 🛒', body: 'Abra o painel para conferir.' };
    
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: './https://cdn-icons-png.flaticon.com/512/1162/1162456.png', // Ícone do app
        badge: './https://cdn-icons-png.flaticon.com/512/1162/1162456.png',
        vibrate: [200, 100, 200, 100, 200, 100, 400], // Vibração padrão iFood
        data: { url: './index.html' },
        tag: 'novo-pedido', // Evita empilhar várias notificações iguais
        renotify: true
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Clique na notificação abre o Painel
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});


