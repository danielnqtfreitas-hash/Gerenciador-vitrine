const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Este gatilho é mais abrangente para detectar onde o pedido está caindo
exports.monitorarPedidos = functions.firestore
    .document('{colecao}/{documentoId}')
    .onCreate(async (snap, context) => {
        const path = context.resource.name;
        console.log("🔥 NOVO DOCUMENTO CRIADO!");
        console.log("📍 Caminho absoluto:", path);
        
        // Verifica se o caminho contém 'orders' ou 'pedidos'
        if (path.includes('orders') || path.includes('pedidos')) {
            console.log("✅ Possível pedido detectado neste caminho!");
        }
        return null;
    });
