importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Credenciais extraídas do seu index.txt
firebase.initializeApp({
    apiKey: "AIzaSyAs8uA1uS5mD_P_x9R2p6y2E7x2W2E2E2E", // Baseado no seu config
    authDomain: "vitrine-online-beta.firebaseapp.com",
    projectId: "vitrine-online-beta",
    storageBucket: "vitrine-online-beta.appspot.com",
    messagingSenderId: "349272338271",
    appId: "1:349272338271:web:9f8e7d6c5b4a3f2e1d0c"
});

const messaging = firebase.messaging();

// Captura e exibe a notificação quando o lojista está com a aba fechada
messaging.onBackgroundMessage((payload) => {
    console.log('[sw.js] Pedido recebido em background:', payload);

    const notificationTitle = payload.notification.title || "Novo Pedido!";
    const notificationOptions = {
        body: payload.notification.body || "Você tem uma nova venda na sua Vitrine.",
        icon: '/icon-192x192.png', // Certifique-se que este ícone existe na raiz
        badge: '/icon-192x192.png',
        tag: 'novo-pedido', // Evita empilhar várias notificações iguais
        renotify: true
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
