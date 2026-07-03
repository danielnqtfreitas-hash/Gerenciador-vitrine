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

// 3. Cache PWA
const CACHE_NAME = 'vitrine-pro-cache-v2';
self.addEventListener('install', (event) => self.skipWaiting());

// 4. Captura de Mensagens em Background (Push de Sistema)
messaging.onBackgroundMessage((payload) => {
    console.log('[sw.js] Mensagem recebida em Background:', payload);

    const title = payload.data?.title || payload.notification?.title || "Novo Pedido! 🛍️";
    const body = payload.data?.body || payload.notification?.body || "Acesse o painel para ver detalhes.";
    const url = payload.data?.url || '/painel';

    const options = {
        body: body,
        icon: 'https://vitrineonline.app.br/favicon.png',
        badge: 'https://vitrineonline.app.br/favicon.png',
        tag: 'novo-pedido',
        renotify: true,
        requireInteraction: true, // Força a notificação a ficar na tela até ser clicada
        data: { url: url }
    };

    return self.registration.showNotification(title, options);
});

// 5. Ação ao Clicar
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data.url;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let client of windowClients) {
                if (client.url.includes(url) && 'focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow(url);
        })
    );
});
