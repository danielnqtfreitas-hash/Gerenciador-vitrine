importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyAdwsGBTApwOwqr37qCv72gdPRbipsZG0Q", 
    authDomain: "meuestoque-1badc.firebaseapp.com", 
    projectId: "meuestoque-1badc", 
    storageBucket: "meuestoque-1badc.firebasestorage.app", 
    messagingSenderId: "730003067834", 
    appId: "1:730003067834:web:b205f1ea59053345960383" 
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[sw.js] Pedido recebido em background:', payload);

    const notificationTitle = payload.notification.title || "Novo Pedido!";
    const notificationOptions = {
        body: payload.notification.body || "Você tem uma nova venda na sua Vitrine.",
        icon: '/favicon.png', // Verifique o nome do seu arquivo de ícone
        badge: '/favicon.png',
        tag: 'novo-pedido',
        renotify: true,
        data: {
            url: '/painel' // URL para abrir ao clicar
        }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
