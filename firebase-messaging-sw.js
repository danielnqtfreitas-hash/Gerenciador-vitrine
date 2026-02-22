importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Inicialização com as suas credenciais
firebase.initializeApp({
    apiKey: "AIzaSyAdwsGBTApwOwqr37qCv72gdPRbipsZG0Q", 
    authDomain: "meuestoque-1badc.firebaseapp.com", 
    projectId: "meuestoque-1badc", 
    storageBucket: "meuestoque-1badc.firebasestorage.app", 
    messagingSenderId: "730003067834", 
    appId: "1:730003067834:web:b205f1ea59053345960383" 
});

const messaging = firebase.messaging();

// Este evento captura a mensagem quando o PWA está FECHADO ou em BACKGROUND
messaging.onBackgroundMessage((payload) => {
    console.log('[sw.js] Mensagem recebida em background:', payload);

    // Extração segura dos dados da notificação
    const notificationTitle = payload.notification?.title || "Novo Pedido na Vitrine!";
    const notificationOptions = {
        body: payload.notification?.body || "Aceda ao painel para ver os detalhes.",
        // Usar URL absoluta evita erro de carregamento do ícone no SW
        icon: 'https://vitrineonline.app.br/favicon.png', 
        badge: 'https://vitrineonline.app.br/favicon.png',
        tag: 'novo-pedido-alerta', // Agrupa notificações para não inundar o telemóvel
        renotify: true,
        vibrate: [200, 100, 200],
        data: {
            url: 'https://vitrineonline.app.br/painel' // URL que será aberta ao clicar
        }
    };

    // O comando crucial que faz a notificação "saltar" no ecrã
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Lógica para abrir o site quando o utilizador clica na notificação
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // Fecha o balão da notificação

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Se o painel já estiver aberto, foca nele
            for (let client of windowClients) {
                if (client.url.includes('/painel') && 'focus' in client) {
                    return client.focus();
                }
            }
            // Se não estiver aberto, abre uma nova janela
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});
