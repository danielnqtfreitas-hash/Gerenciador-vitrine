const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.notificarNovoPedido = functions.firestore
    .document('stores/{storeId}/orders/{orderId}')
    .onCreate(async (snap, context) => {
        const novoPedido = snap.data();
        const storeId = context.params.storeId;

        try {
            const docRef = admin.firestore().doc(`stores/${storeId}/config/notifications`);
            const tokenDoc = await docRef.get();

            // Verifica existência da lista
            if (!tokenDoc.exists || !tokenDoc.data().fcmTokens || tokenDoc.data().fcmTokens.length === 0) {
                console.log(`⚠️ Nenhum token encontrado para a loja: ${storeId}`);
                return null;
            }

            const tokens = tokenDoc.data().fcmTokens;
            console.log(`🔍 Disparando para ${tokens.length} dispositivos.`);

            const clienteNome = novoPedido.name || novoPedido.customer?.name || "Cliente";
            const totalPedido = novoPedido.total || 0;
            
            const tituloPush = 'Novo Pedido na Vitrine! 🎉';
            const corpoPush = `${clienteNome} fez um pedido de R$ ${totalPedido}`;

            const mensagemMulticast = {
                notification: {
                    title: tituloPush,
                    body: corpoPush,
                },
                data: { 
                    url: `/painel` // Simplificado: o Service Worker usará isso para navegação
                },
                android: {
                    priority: 'high',
                    notification: { 
                        clickAction: 'FLUTTER_NOTIFICATION_CLICK',
                        channelId: 'fcm_default_channel' 
                    }
                },
                webpush: {
                    headers: { Urgency: 'high' }
                },
                tokens: tokens 
            };

            const response = await admin.messaging().sendMulticast(mensagemMulticast);
            
            console.log(`✅ Disparo concluído. Sucessos: ${response.successCount}, Falhas: ${response.failureCount}`);
            
            // Opcional: Se houver falhas, você poderia implementar uma lógica aqui para 
            // comparar response.responses e remover tokens inválidos (que retornam erro 'messaging/registration-token-not-registered')
            
            return response;

        } catch (error) {
            console.error('❌ Erro fatal no processamento:', error);
            return null;
        }
    });
