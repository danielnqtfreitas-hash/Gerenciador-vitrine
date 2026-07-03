// 1. Importação dos SDKs (Versão 11.6.1)
importScripts('https://www.gstatic.com/firebasejs/11.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.6.1/firebase-messaging-compat.js');

// 2. Inicialização
firebase.initializeApp({
    apiKey: "AIzaSyAdwsGBTApwOwqr37qCv72gdPRbipsZG0Q", 
    authDomain: "meuestoque-1badc.firebaseapp.com", 
    projectId: "meuestoque-1badc", 
    storageBucket: "meuestoque-1badc.firebasestorage.app", 
    messagingSenderId: "730003067834", 
    appId: "1:730003067834:web:b205f1ea59053345960383" 
});

const messaging = firebase.messaging();

// 3. Estratégia de Cache PWA
const CACHE_NAME = 'vitrine-pro-cache-v2';
const ASSETS_TO_CACHE = ['/', '/index.html', '/manifest.json', '/favicon.png'];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)));
});

self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

// 4. Captura de Mensagens em Segundo Plano
messaging.onBackgroundMessage((payload) => {
    console.log('[sw.js] Mensagem recebida em background:', payload);

    // Agora buscamos diretamente do 'data', já que o backend foi alterado
    const data = payload.data || {};
    const title = data.title || "Novo Pedido! 🛍️";
    const body = data.body || "Clique para ver o pedido.";
    const url = data.url || '/painel';

    const options = {
        body: body,
        icon: 'https://vitrineonline.app.br/favicon.png',
        badge: 'https://vitrineonline.app.br/favicon.png',
        tag: 'novo-pedido',
        renotify: true,
        vibrate: [200, 100, 200],
        data: { url: url } // Passamos a URL aqui para o evento de click usar
    };

    return self.registration.showNotification(title, options);
});

// 5. Ação ao Clicar na Notificação
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    // A URL vem do objeto 'data' definido nas 'options' acima
    const targetUrl = event.notification.data?.url || '/painel';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Tenta focar em uma aba já aberta
            for (let client of windowClients) {
                if (client.url.includes(targetUrl) && 'focus' in client) return client.focus();
            }
            // Senão, abre uma nova aba
            if (clients.openWindow) return clients.openWindow(targetUrl);
        })
    );
});
