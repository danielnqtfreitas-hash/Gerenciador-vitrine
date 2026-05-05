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
            const userDoc = await admin.firestore().collection('users').doc(storeId).get();
            if (!userDoc.exists) return null;

            const token = userDoc.data().fcmToken;
            if (!token) return null;

            const clienteNome = novoPedido.customer?.name || "Cliente";
            const totalPedido = novoPedido.total || 0;

            const mensagem = {
                notification: {
                    title: 'Novo Pedido na Vitrine! 🎉',
                    body: `${clienteNome} fez um pedido de R$ ${totalPedido},00`,
                },
                data: { url: '/painel/pedidos' },
                token: token
            };

            return admin.messaging().send(mensagem);
        } catch (error) {
            console.error('Erro:', error);
            return null;
        }
    });
