importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');
importScripts('./firebase-messaging-sw.js');

// CONFIGURAÇÃO DO FIREBASE (Sincronize com o seu index.html)
const firebaseConfig = {
    apiKey: "AIzaSyAdwsGBTApwOwqr37qCv72gdPRbipsZG0Q", 
    authDomain: "meuestoque-1badc.firebaseapp.com", 
    projectId: "meuestoque-1badc", 
    storageBucket: "meuestoque-1badc.firebasestorage.app", 
    messagingSenderId: "730003067834", 
    appId: "1:730003067834:web:b205f1ea59053345960383" 
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

const CACHE_NAME = 'vitrine-pro-cache-v2';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json'
];

// Instalação e Cache
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Ativação e limpeza de cache antigo
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
});

// Estratégia de Fetch (Network First com Fallback para Cache)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});

// Notificações em Segundo Plano
messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification.title || "Novo Pedido!";
    const notificationOptions = {
        body: payload.notification.body || "Você recebeu um novo pedido.",
        icon: 'https://cdn-icons-png.flaticon.com/512/1162/1162456.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/1162/1162456.png',
        vibrate: [200, 100, 200],
        tag: 'novo-pedido',
        renotify: true,
        data: {
            url: '/'
        }
    };
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Clique na Notificação
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === '/' && 'focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow('/');
        })
    );
});
