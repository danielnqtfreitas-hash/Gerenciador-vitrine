const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.notificarNovoPedido = functions.firestore
    .document('stores/{storeId}/orders/{orderId}')
    .onCreate(async (snap, context) => {
        const novoPedido = snap.data();
        const storeId = context.params.storeId;

        try {
            // 1. Busca o documento contendo a LISTA de tokens (fcmTokens)
            const tokenDoc = await admin.firestore()
                .doc(`stores/${storeId}/config/notifications`)
                .get();

            if (!tokenDoc.exists || !tokenDoc.data().fcmTokens || tokenDoc.data().fcmTokens.length === 0) {
                console.log(`⚠️ Nenhum token encontrado na lista fcmTokens para a loja: ${storeId}`);
                return null;
            }

            const tokens = tokenDoc.data().fcmTokens; // Agora é um Array
            console.log(`🔍 Disparando para ${tokens.length} dispositivos.`);

            const clienteNome = novoPedido.name || novoPedido.customer?.name || "Cliente";
            const totalPedido = novoPedido.total || 0;
            
            const tituloPush = 'Novo Pedido na Vitrine! 🎉';
            const corpoPush = `${clienteNome} fez um pedido de R$ ${totalPedido}`;

            // 2. Estrutura de mensagem para envio em lote (Multicast)
            const mensagemMulticast = {
                notification: {
                    title: tituloPush,
                    body: corpoPush,
                },
                data: { 
                    title: tituloPush,
                    body: corpoPush,
                    url: `/painel` 
                },
                android: {
                    priority: 'high',
                    notification: { clickAction: 'FLUTTER_NOTIFICATION_CLICK' }
                },
                webpush: {
                    headers: { Urgency: 'high' }
                },
                tokens: tokens // Envia para o array completo
            };

            // 3. Usa sendMulticast para disparar para todos simultaneamente
            const response = await admin.messaging().sendMulticast(mensagemMulticast);
            
            console.log(`✅ Notificação disparada. Sucessos: ${response.successCount}, Falhas: ${response.failureCount}`);
            
            // DICA: Se houver tokens inválidos (failureCount > 0), você pode limpá-los aqui
            return response;

        } catch (error) {
            console.error('❌ Erro fatal no processamento:', error);
            return null;
        }
    });
