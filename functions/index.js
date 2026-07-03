exports.notificarNovoPedido = functions.firestore
    .document('stores/{storeId}/orders/{orderId}')
    .onCreate(async (snap, context) => {
        const storeId = context.params.storeId;
        
        // BUSCA O DOCUMENTO
        const docRef = admin.firestore().doc(`stores/${storeId}/config/notifications`);
        const doc = await docRef.get();

        if (!doc.exists) {
            console.log("❌ ERRO: Documento não existe em:", docRef.path);
            return null;
        }

        // Tenta ler fcmTokens (array) ou fcmToken (único) para garantir
        const data = doc.data();
        const tokens = data.fcmTokens || (data.fcmToken ? [data.fcmToken] : null);

        if (!tokens) {
            console.log("❌ ERRO: Nenhum token encontrado no documento.");
            return null;
        }

        console.log(`✅ Disparando para ${tokens.length} tokens.`);

        const message = {
            notification: {
                title: "Novo Pedido! 🛍️",
                body: "Um novo cliente realizou um pedido."
            },
            tokens: tokens 
        };

        try {
            const response = await admin.messaging().sendMulticast(message);
            console.log(`🚀 Sucesso: ${response.successCount} | Erros: ${response.failureCount}`);
        } catch (e) {
            console.error("❌ Erro fatal no envio:", e);
        }
    });
