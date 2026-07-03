exports.notificarNovoPedido = functions.firestore
    .document('stores/{storeId}/orders/{orderId}') // <-- O gatilho que você usa
    .onCreate(async (snap, context) => {
        const data = snap.data();
        const caminho = context.resource.name; // Pega o caminho completo do documento
        
        console.log("🔥 GATILHO DISPARADO!");
        console.log("📍 Caminho detectado:", caminho);
        console.log("📦 Dados do pedido:", JSON.stringify(data));
        
        return null;
    });
