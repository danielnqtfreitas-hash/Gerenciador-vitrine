importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// CONFIGURAÇÃO DO FIREBASE (Use as mesmas chaves do seu index.html)
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// --- LÓGICA DO PWA (CACHE) ---
const CACHE_NAME = 'shopwave-cache-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    // Adicione outros arquivos essenciais aqui
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

// --- LÓGICA DE NOTIFICAÇÕES (BACKGROUND) ---
messaging.onBackgroundMessage((payload) => {
    console.log('Mensagem em segundo plano recebida:', payload);

    const notificationTitle = payload.notification.title || "Novo Pedido!";
    const notificationOptions = {
        body: payload.notification.body || "Você tem uma nova atualização na loja.",
        icon: '/icon-192x192.png', // Certifique-se que o caminho do ícone está correto
        badge: '/icon-192x192.png',
        vibrate: [200, 100, 200],
        data: {
            url: self.location.origin
        }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Ao clicar na notificação, abre o app
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});
