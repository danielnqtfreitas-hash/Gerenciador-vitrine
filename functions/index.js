const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Use este gatilho genérico para ver o que está acontecendo
exports.detectarPedido = functions.firestore
    .document('stores/{storeId}/orders/{orderId}') // Se o caminho for diferente, mude aqui!
    .onCreate((snap, context) => {
        console.log("🔥 Pedido detectado no caminho:", context.resource.name);
        return null;
    });
