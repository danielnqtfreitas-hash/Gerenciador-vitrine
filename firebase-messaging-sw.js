// 1. Importação dos SDKs Compat (Essencial para evitar o erro "firebase is not defined")
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// 2. Inicialização com suas credenciais do projeto "meuestoque-1badc"
firebase.initializeApp({
    apiKey: "AIzaSyAdwsGBTApwOwqr37qCv72gdPRbipsZG0Q", 
    authDomain: "meuestoque-1badc.firebaseapp.com", 
    projectId: "meuestoque-1badc", 
    storageBucket: "meuestoque-1badc.firebasestorage.app", 
    messagingSenderId: "730003067834", 
    appId: "1:730003067834:web:b205f1ea59053345960383" 
});

const messaging = firebase.messaging();

// 3. Configuração de Cache (Estratégia PWA)
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

// 4. Tratamento de Mensagens em Segundo Plano (Background)
messaging.onBackgroundMessage((payload) => {
    console.log('[sw.js] Mensagem recebida em background:', payload);

    const notificationTitle = payload.notification?.title || "Novo Pedido!";
    const notificationOptions = {
        body: payload.notification?.body || "Acesse o painel para ver detalhes.",
        icon: 'https://vitrineonline.app.br/favicon.png',
        badge: 'https://vitrineonline.app.br/favicon.png',
        tag: 'novo-pedido', // Agrupa notificações para não floodar o celular
        renotify: true,
        vibrate: [200, 100, 200],
        data: { 
            url: payload.data?.url || '/painel' // URL dinâmica vinda do Firebase
        }
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 5. Ação ao Clicar na Notificação
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const targetUrl = event.notification.data.url;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Se já houver uma aba aberta, foca nela
            for (let client of windowClients) {
                if (client.url.includes(targetUrl) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Caso contrário, abre uma nova aba
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
