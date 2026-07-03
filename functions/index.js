const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// REGRA DE OURO: Defina a região para coincidir com a do seu Firestore
exports.notificarNovoPedido = functions.region('southamerica-east1').firestore
    .document('stores/{storeId}/orders/{orderId}')
    .onCreate(async (snap, context) => {
        const pedido = snap.data();
        const storeId = context.params.storeId; 
        const orderId = context.params.orderId;

        console.log(`🔥 Novo pedido detectado! Loja: ${storeId}, Pedido: ${orderId}`);

        try {
            // 1. Busca os tokens da loja específica
            const tokenDoc = await admin.firestore()
                .doc(`stores/${storeId}/config/notifications`)
                .get();

            if (!tokenDoc.exists || !tokenDoc.data().fcmTokens) {
                console.log(`⚠️ Nenhum token registrado para a loja: ${storeId}`);
                return null;
            }

            const tokens = tokenDoc.data().fcmTokens;
            
            // Garantir que tokens seja um array
            const tokenArray = Array.isArray(tokens) ? tokens : [tokens];

            // 2. Monta a mensagem (Apenas Data para controle total via Service Worker)
            const mensagem = {
                data: { 
                    title: "Novo Pedido na Vitrine! 🛍️",
                    body: `Cliente: ${pedido.name || 'Cliente'} | Valor: R$ ${pedido.total || '0'}`,
                    url: `/painel` 
                },
                webpush: {
                    headers: { Urgency: 'high' }
                },
                tokens: tokenArray
            };

            // 3. Dispara para todos os dispositivos
            const response = await admin.messaging().sendMulticast(mensagem);
            console.log(`✅ Notificação disparada para ${storeId}. Sucessos: ${response.successCount}, Falhas: ${response.failureCount}`);
            
            return null;

        } catch (error) {
            console.error('❌ Erro no processamento:', error);
            return null;
        }
    });

// Teste manual de vida
exports.testeDeVida = functions.region('southamerica-east1').https.onRequest((req, res) => {
    res.send("🚀 A Cloud Function está viva e operante no servidor!");
});
