// 1. Importação dos SDKs (Versão 11.6.1 para máxima compatibilidade)
importScripts('https://www.gstatic.com/firebasejs/11.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.6.1/firebase-messaging-compat.js');

// 2. Inicialização com as suas credenciais
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
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.png'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});

// 4. Captura de Mensagens em Segundo Plano (Forçando a exibição visual)
messaging.onBackgroundMessage((payload) => {
    console.log('[sw.js] Mensagem recebida em background:', payload);

    // Mapeamento extraído exatamente da estrutura do seu log
    const notificationTitle = payload.notification?.title || "Novo Pedido! 🛍️";
    const notificationBody = payload.notification?.body || "Acesse o painel para ver detalhes.";
    const notificationImage = payload.notification?.image;
    
    const notificationOptions = {
        body: notificationBody,
        image: notificationImage, // Inclui a imagem capturada do seu log
        icon: 'https://vitrineonline.app.br/favicon.png',
        badge: 'https://vitrineonline.app.br/favicon.png',
        tag: 'novo-pedido',
        renotify: true,
        vibrate: [200, 100, 200],
        data: { 
            url: payload.data?.url || '/painel'
        }
    };

    // Força a exibição da notificação visual no SO
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 5. Ação ao Clicar na Notificação
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = event.notification.data?.url || '/painel';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let client of windowClients) {
                if (client.url.includes(targetUrl) && 'focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow(targetUrl);
        })
    );
});
