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
            // 1. CORRIGIDO: Busca o token exatamente na subcoleção de configurações daquela loja específica
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

            // 2. CORRIGIDO: Pega a propriedade fcmToken que o painel salvou
            const token = tokenDoc.data().fcmToken;
            if (!token) {
                console.log(`⚠️ Campo fcmToken vazio para a loja: ${storeId}`);
                return null;
            }

            // Trata os dados do pedido baseando-se na estrutura do seu banco
            const clienteNome = novoPedido.customer?.name || novoPedido.nomeCliente || "Cliente";
            const totalPedido = novoPedido.total || 0;

            const mensagem = {
                notification: {
                    title: 'Novo Pedido na Vitrine! 🎉',
                    body: `${clienteNome} fez um pedido de R$ ${totalPedido},00`,
                },
                // Passa os dados dinâmicos para o Service Worker saber para onde redirecionar no clique
                data: { 
                    url: `/painel` 
                },
                token: token
            };

            console.log(`🚀 Despachando notificação FCM para a loja ${storeId}...`);
            const response = await admin.messaging().send(mensagem);
            console.log('✅ Notificação enviada com sucesso:', response);
            return response;

        } catch (error) {
            console.error('❌ Erro ao processar gatilho de notificação:', error);
            return null;
        }
    });
