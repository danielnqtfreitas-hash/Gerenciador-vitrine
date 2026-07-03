const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.notificarNovoPedido = functions.firestore
    .document('stores/{storeId}/orders/{orderId}')
    .onCreate(async (snap, context) => {
        const pedido = snap.data();
        const storeId = context.params.storeId; // Captura o nome da loja (dandan, etc)
        const orderId = context.params.orderId; // Captura o ID do pedido

        console.log(`🔥 Novo pedido detectado! Loja: ${storeId}, Pedido: ${orderId}`);

        try {
            // 1. Busca os tokens da loja específica no banco
            const tokenDoc = await admin.firestore()
                .doc(`stores/${storeId}/config/notifications`)
                .get();

            if (!tokenDoc.exists || !tokenDoc.data().fcmTokens) {
                console.log(`⚠️ Nenhum token registrado para a loja: ${storeId}`);
                return null;
            }

            const tokens = tokenDoc.data().fcmTokens;
            
            // 2. Monta a mensagem
            const mensagem = {
                notification: {
                    title: "Novo Pedido na Vitrine! 🛍️",
                    body: `Cliente: ${pedido.name || 'Cliente'} | Valor: R$ ${pedido.total || '0'}`
                },
                data: { 
                    url: `/painel` 
                },
                android: {
                    priority: 'high',
                    notification: {
                        channelId: 'fcm_default_channel',
                        clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                    }
                },
                webpush: {
                    headers: { Urgency: 'high' }
                },
                tokens: tokens
            };

            // 3. Dispara para todos os dispositivos desta loja
            const response = await admin.messaging().sendMulticast(mensagem);
            console.log(`✅ Notificação disparada para ${storeId}. Sucessos: ${response.successCount}`);
            
            return null;

        } catch (error) {
            console.error('❌ Erro no processamento:', error);
            return null;
        }
    });

// Teste manual de vida (chame esta URL no seu navegador)
exports.testeDeVida = functions.https.onRequest((req, res) => {
    res.send("🚀 A Cloud Function está viva e operante no servidor!");
});
