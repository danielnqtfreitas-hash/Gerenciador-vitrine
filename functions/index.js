const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.notificarNovoPedido = functions.firestore
    .document('stores/{storeId}/orders/{orderId}')
    .onCreate(async (snap, context) => {
        const novoPedido = snap.data();
        const pedidoId = context.params.orderId;
        const storeId = context.params.storeId;

        try {
            // 1. Busca o token exatamente na subcoleção de configurações daquela loja específica
            const tokenDoc = await admin.firestore()
                .collection('stores')
                .doc(storeId)
                .collection('config')
                .doc('notifications')
                .get();

            // Se o documento de notificações não existir, encerra
            if (!tokenDoc.exists) {
                console.log(`⚠️ Nenhum documento de notificação encontrado para a loja: ${storeId}`);
                return null;
            }

            // 2. Pega a propriedade fcmToken que o painel salvou
            const token = tokenDoc.data().fcmToken;
            if (!token) {
                console.log(`⚠️ Campo fcmToken vazio para a loja: ${storeId}`);
                return null;
            }

            // Trata os dados do pedido baseando-se na estrutura do seu banco
            const clienteNome = novoPedido.customer?.name || novoPedido.nomeCliente || "Cliente";
            const totalPedido = novoPedido.total || 0;
            const tituloPush = 'Novo Pedido na Vitrine! 🎉';
            const corpoPush = `${clienteNome} fez um pedido de R$ ${totalPedido}`;

            // 🌟 PAYLOAD BLINDADO: Envia tanto em notification quanto em data com alta prioridade
            const mensagem = {
                token: token,
                notification: {
                    title: tituloPush,
                    body: corpoPush,
                },
                data: { 
                    title: tituloPush,
                    body: corpoPush,
                    url: `/painel` 
                },
                // Configurações específicas para acordar dispositivos Android/Xiaomi dormindo
                android: {
                    priority: 'high',
                    notification: {
                        clickAction: 'FLUTTER_NOTIFICATION_CLICK',
                        status: 'done'
                    }
                },
                webpush: {
                    headers: {
                        Urgency: 'high'
                    }
                }
            };

            console.log(`🚀 Despachando notificação FCM de alta prioridade para a loja ${storeId}...`);
            const response = await admin.messaging().send(mensagem);
            console.log('✅ Notificação enviada com sucesso:', response);
            return response;

        } catch (error) {
            console.error('❌ Erro ao processar gatilho de notificação:', error);
            return null;
        }
    });
