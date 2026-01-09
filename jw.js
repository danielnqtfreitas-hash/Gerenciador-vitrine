importScripts('https://www.gstatic.com/firebasejs/11.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.6.1/firebase-messaging-compat.js');

// 1. Inicializa o Firebase dentro do Service Worker
firebase.initializeApp({
    apiKey: "AIzaSyAdwsGBTApwOwqr37qCv72gdPRbipsZG0Q",
    authDomain: "meuestoque-1badc.firebaseapp.com",
    projectId: "meuestoque-1badc",
    messagingSenderId: "730003067834",
    appId: "1:730003067834:web:b205f1ea59053345960383"
});

const messaging = firebase.messaging();

// 2. Listener para mensagens em SEGUNDO PLANO (App Fechado)
messaging.onBackgroundMessage((payload) => {
    console.log('Pedido recebido em segundo plano:', payload);
    const notificationTitle = payload.notification.title || 'Novo Pedido! 🛒';
    const notificationOptions = {
        body: payload.notification.body || 'Abra o painel para conferir.',
        icon: 'https://cdn-icons-png.flaticon.com/512/1162/1162456.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/1162/1162456.png',
        data: { url: './index.html' }
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});

// 3. Cache de arquivos (Mantenha sua lógica atual abaixo)
const CACHE_NAME = 'painel-v1';
const ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(clients.openWindow('./index.html'));
});
